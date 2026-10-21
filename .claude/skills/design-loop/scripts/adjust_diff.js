// design-loop · adjust_diff.js（0.6.0）
// 在 use_figma 執行（唯讀）。改 CONFIG 後整段貼入。
// 用途：調整區副本 ↔ 正式稿逐節點比對（core/figma-pages.md §5），列出設計師改了什麼，AI 照清單寫回。
// 回傳（每類 { count, items }，items 最多 maxList 筆）：
//   text       文字內容不同（text：正式稿 → 副本）
//   textStyle  文字樣式、字級、字型不同
//   component  instance 換了母版或變體、component property 值不同
//   detached   正式稿是 instance，副本變成一般圖層（被 detach）
//   unbound    正式稿綁變數或套樣式的顏色，副本變成寫死值（附 hex）——寫回時要對回 token，不可照抄
//   paint      顏色、描邊、效果、透明度、圓角其他不同
//   layout     位置（相對各自頂層 frame）或尺寸差超過 tol，auto-layout 方向、間距、內距、對齊不同
//   visible    顯示／隱藏不同
//   added      副本多出來的圖層
//   removed    副本刪掉的圖層
// ▸ 配對方式：同一條「圖層名稱路徑」（同名兄弟加序號）。改了圖層名稱會變成一筆 removed＋一筆 added，
//   看 removed／added 有沒有成對的同類型圖層判斷是不是改名
// ▸ 位置用 absoluteBoundingBox 減各自頂層 frame 的原點，所以副本放在調整區哪裡都不影響
// ▸ 回傳超過約 20KB 會截斷（figma-gotchas）：先看 counts，某類太多再調 only／maxList 分批取
const CONFIG = {
  copyId: 'COPY_FRAME_ID',          // 調整區副本 frame
  originalId: 'ORIGINAL_FRAME_ID',  // 正式稿 frame（registry.pages[].design_node）
  tol: 1,                           // 位置、尺寸容許差（px）
  only: [],                         // 只回傳這幾類（空＝全部），例 ['text', 'unbound']
  maxList: 40,
};

const copy = await figma.getNodeByIdAsync(CONFIG.copyId);
const orig = await figma.getNodeByIdAsync(CONFIG.originalId);
if (!copy || !('children' in copy)) throw new Error('copyId 不是 frame：' + CONFIG.copyId);
if (!orig || !('children' in orig)) throw new Error('originalId 不是 frame：' + CONFIG.originalId);
for (const n of [copy, orig]) {  // 兩個 frame 通常在不同 page，先載入
  let p = n;
  while (p && p.type !== 'PAGE') p = p.parent;
  if (p && typeof p.loadAsync === 'function') await p.loadAsync();
}

const r2 = v => Math.round(v * 100) / 100;
const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const MIXED = typeof figma.mixed === 'undefined' ? Symbol('mixed') : figma.mixed;
const val = v => (v === MIXED ? 'mixed' : v);

// 名稱路徑 → 節點；同名兄弟依出現順序加 #n
function index(root) {
  const map = new Map();
  const walk = (n, key) => {
    map.set(key, n);
    if (!('children' in n)) return;
    const count = {};
    for (const c of n.children) {
      const i = count[c.name] = (count[c.name] || 0) + 1;
      walk(c, key + '/' + c.name + (i > 1 ? '#' + i : ''));
    }
  };
  walk(root, '');
  return map;
}

const box = (n, root) => {
  const b = n.absoluteBoundingBox;
  const o = root.absoluteBoundingBox;
  if (!b || !o) return null;
  return { x: b.x - o.x, y: b.y - o.y, w: b.width, h: b.height };
};

// 一個 paint 的比對指紋：綁定的變數 id／樣式 id 優先，沒有才看值
function paintSig(n, key, styleKey) {
  if (styleKey && typeof n[styleKey] === 'string' && n[styleKey]) return { bound: 'style:' + n[styleKey] };
  const paints = n[key];
  if (paints === MIXED) return { raw: 'mixed' };
  if (!Array.isArray(paints) || !paints.length) return { raw: 'none' };
  const vis = paints.filter(p => p.visible !== false);
  if (!vis.length) return { raw: 'none' };
  const p = vis[0];
  if (p.boundVariables && p.boundVariables.color) return { bound: 'var:' + p.boundVariables.color.id };
  if (p.type === 'SOLID') return { raw: hex(p.color) + (p.opacity !== undefined && p.opacity < 1 ? ' ' + Math.round(p.opacity * 100) + '%' : '') };
  return { raw: p.type };
}
const sigStr = s => s.bound || s.raw;

async function mainName(n) {
  const m = await n.getMainComponentAsync();
  if (!m) return null;
  return m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name + ' / ' + m.name : m.name;
}

const out = { text: [], textStyle: [], component: [], detached: [], unbound: [], paint: [], layout: [], visible: [], added: [], removed: [] };
const where = key => key || '(頂層 frame)';

const A = index(orig);
const B = index(copy);
let compared = 0;

for (const [key, a] of A) {
  const b = B.get(key);
  if (!b) {
    // 祖先已經列為 removed 就不重複列子層
    const parent = key.slice(0, key.lastIndexOf('/'));
    if (key && B.has(parent)) out.removed.push({ path: key, type: a.type, id: a.id });
    continue;
  }
  compared++;
  const at = where(key);

  if (a.type === 'INSTANCE' && b.type !== 'INSTANCE') {
    out.detached.push({ path: at, was: await mainName(a), now: b.type, copyId: b.id });
  } else if (a.type === 'INSTANCE' && b.type === 'INSTANCE') {
    const ma = await mainName(a);
    const mb = await mainName(b);
    if (ma !== mb) out.component.push({ path: at, prop: 'main', from: ma, to: mb, copyId: b.id });
    const pa = a.componentProperties || {};
    const pb = b.componentProperties || {};
    for (const k of new Set([...Object.keys(pa), ...Object.keys(pb)])) {
      const va = pa[k] ? pa[k].value : undefined;
      const vb = pb[k] ? pb[k].value : undefined;
      if (va !== vb) out.component.push({ path: at, prop: k, from: va, to: vb, copyId: b.id });
    }
  } else if (a.type !== b.type) {
    out.removed.push({ path: at, type: a.type, id: a.id });
    out.added.push({ path: at, type: b.type, id: b.id });
    continue;
  }

  if (a.visible !== b.visible) out.visible.push({ path: at, from: a.visible, to: b.visible, copyId: b.id });

  if (a.type === 'TEXT' && b.type === 'TEXT') {
    if (a.characters !== b.characters) out.text.push({ path: at, from: a.characters.slice(0, 80), to: b.characters.slice(0, 80), copyId: b.id });
    for (const k of ['textStyleId', 'fontSize', 'fontName', 'lineHeight', 'letterSpacing', 'textAlignHorizontal']) {
      if (!(k in a) || !(k in b)) continue;
      const va = JSON.stringify(val(a[k]));
      const vb = JSON.stringify(val(b[k]));
      if (va !== vb) out.textStyle.push({ path: at, prop: k, from: JSON.parse(va), to: JSON.parse(vb), copyId: b.id });
    }
  }

  for (const [k, sk] of [['fills', 'fillStyleId'], ['strokes', 'strokeStyleId']]) {
    if (!(k in a) || !(k in b)) continue;
    const sa = paintSig(a, k, sk);
    const sb = paintSig(b, k, sk);
    if (sigStr(sa) === sigStr(sb)) continue;
    if (sa.bound && !sb.bound) out.unbound.push({ path: at, prop: k, was: sa.bound, now: sb.raw, copyId: b.id });
    else out.paint.push({ path: at, prop: k, from: sigStr(sa), to: sigStr(sb), copyId: b.id });
  }
  for (const k of ['effectStyleId', 'opacity', 'cornerRadius', 'strokeWeight']) {
    if (!(k in a) || !(k in b)) continue;
    const va = val(a[k]);
    const vb = val(b[k]);
    const same = typeof va === 'number' && typeof vb === 'number' ? Math.abs(va - vb) < 0.01 : va === vb;
    if (!same) out.paint.push({ path: at, prop: k, from: typeof va === 'number' ? r2(va) : va, to: typeof vb === 'number' ? r2(vb) : vb, copyId: b.id });
  }

  const ba = box(a, orig);
  const bb = box(b, copy);
  if (ba && bb) {
    const moved = ['x', 'y', 'w', 'h'].filter(k => Math.abs(ba[k] - bb[k]) > CONFIG.tol);
    if (moved.length) out.layout.push({ path: at, changed: moved.map(k => `${k} ${r2(ba[k])}→${r2(bb[k])}`).join('，'), copyId: b.id });
  }
  for (const k of ['layoutMode', 'itemSpacing', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
    'primaryAxisAlignItems', 'counterAxisAlignItems', 'layoutSizingHorizontal', 'layoutSizingVertical']) {
    if (!(k in a) || !(k in b)) continue;
    if (a[k] !== b[k]) out.layout.push({ path: at, changed: `${k} ${val(a[k])}→${val(b[k])}`, copyId: b.id });
  }
}

for (const [key, b] of B) {
  if (A.has(key)) continue;
  const parent = key.slice(0, key.lastIndexOf('/'));
  if (A.has(parent)) out.added.push({ path: key, type: b.type, id: b.id, text: b.type === 'TEXT' ? b.characters.slice(0, 40) : undefined });
}

const counts = {};
const result = {};
for (const k of Object.keys(out)) {
  counts[k] = out[k].length;
  if (!CONFIG.only.length || CONFIG.only.includes(k)) result[k] = out[k].slice(0, CONFIG.maxList);
}
return {
  copy: copy.name,
  original: orig.name,
  compared,
  counts,
  ...result,
};
