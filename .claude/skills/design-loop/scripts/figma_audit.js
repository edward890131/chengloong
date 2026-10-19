// design-loop · figma_audit.js
// 在 use_figma 執行（唯讀）。改 CONFIG 後整段貼入。一次掃一個 page（figma-use：每次呼叫最多切一次 page）。
// 回傳：
//   decimals       小數：x／y（旋轉的節點略過）、寬高、padding、gap、min／max、圓角、字級、px 行高、px 字距
//   unboundPaints  可見的純色 fill／stroke 沒綁變數、也沒套樣式
//   unstyledText   文字（任一段）沒套文字樣式
//   localText      不在 instance／元件內的文字（設計稿上的散字，R3 要逐筆說得出理由）
//   overrideDrift  instance（含巢狀子層）的版面欄位覆寫值和母版不同：對齊、itemSpacing、padding 四邊、
//                  layoutSizingHorizontal／Vertical。instance 根節點的 sizing 是放進頁面時的決定，不比
//                  （像素比對抓不到「對齊被寫成 MIN」這類回歸；S4 回補後、S7 R3 必掃；母版內刻意的覆寫也會列出，要說得出理由）
//   rootSizingDrift instance 根節點某軸是 FIXED、母版同軸是 HUG／FILL（0.4.0）：clone／resize 過的 instance 會停在 FIXED，
//                  畫面一樣，內容變長或容器變寬才出錯。頁面刻意固定寬的要說得出理由
//   staleOverrides instance.overrides 裡的非內容欄位（fills、strokes、effects…），值和母版對應節點相同（0.4.0）：
//                  切變體後常殘留，截圖看不出來，但母版改色時不會跟 → 對該巢狀 instance resetOverrides() 或清掉該欄位
// 例外判斷用 instance 的「母版名稱」，不看圖層名稱（instance 常被改名，例：XX/Icon/Caret Down 改叫 caret）。
// 線寬不列入小數（圖示線寬 1.5 是規格）。
// icon 內部用 RECTANGLE 做的方點（寬高都 ≤ rectDotMax）和 VECTOR 一樣不算小數，另計 exceptedRectDots；
// 較大的 RECTANGLE（底板、外框）照常檢查。方點的顏色綁定照常檢查。
// 驗收：S3 用 componentsOnly: true 掃 Guideline page；S4、S5 掃設計稿 page 或 rootIds。

const CONFIG = {
  pageId: 'PAGE_ID',            // 要掃的 page id
  rootIds: [],                  // 只掃這些節點（空＝整個 page）
  componentsOnly: false,        // true＝只掃元件母版（COMPONENT_SET 與不在 set 裡的 COMPONENT）
  exceptVectorsIn: ['/Icon/'],  // 母版名稱符合的元件／instance，內部 VECTOR 類圖層不算小數（regex 字串）
  exceptRectDots: true,         // 上面例外範圍內的小 RECTANGLE（方點）也不算小數
  rectDotMax: 8,                // 方點判定：寬、高都 ≤ 這個值
  overrideDrift: true,          // 掃 instance 版面欄位覆寫值≠母版值
  overrideFields: ['primaryAxisAlignItems', 'counterAxisAlignItems', 'itemSpacing',
    'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
    'layoutSizingHorizontal', 'layoutSizingVertical'],
  rootSizing: true,             // 掃 instance 根節點 FIXED vs 母版 HUG／FILL
  staleOverrides: true,         // 掃「值和母版相同」的非內容覆寫
  staleFields: ['fills', 'strokes', 'effects', 'opacity', 'strokeWeight', 'cornerRadius', 'fillStyleId', 'strokeStyleId', 'effectStyleId'],
  maxList: 40,                  // 每類最多列幾筆
};

const page = await figma.getNodeByIdAsync(CONFIG.pageId);
if (!page || page.type !== 'PAGE') throw new Error('pageId 不是 page：' + CONFIG.pageId);
await figma.setCurrentPageAsync(page);

let roots = [page];
if (CONFIG.rootIds.length) {
  roots = [];
  for (const id of CONFIG.rootIds) {
    const n = await figma.getNodeByIdAsync(id);
    if (n) roots.push(n);
  }
}
if (CONFIG.componentsOnly) {
  const isMaster = x => x.type === 'COMPONENT_SET' || (x.type === 'COMPONENT' && x.parent.type !== 'COMPONENT_SET');
  const picked = [];
  for (const r of roots) {
    if (isMaster(r)) { picked.push(r); continue; }
    if ('findAllWithCriteria' in r) {
      for (const n of r.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })) if (isMaster(n)) picked.push(n);
    }
  }
  roots = picked;
}

const except = CONFIG.exceptVectorsIn.map(s => new RegExp(s));
const VECTORISH = new Set(['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'LINE', 'ELLIPSE']);
const isDec = v => typeof v === 'number' && Math.abs(v - Math.round(v)) > 0.01;
const r2 = v => Math.round(v * 100) / 100;
const out = { decimals: [], unboundPaints: [], unstyledText: [], localText: [], overrideDrift: [], rootSizingDrift: [], staleOverrides: [] };
const seen = new Set();
let scanned = 0;
let exceptedVectors = 0;
let exceptedRectDots = 0;
let driftUnresolved = 0;
const isRectDot = n => CONFIG.exceptRectDots && n.type === 'RECTANGLE' &&
  n.width <= CONFIG.rectDotMax && n.height <= CONFIG.rectDotMax;

const label = n => (n.parent && n.parent.type !== 'PAGE' ? n.parent.name + ' › ' : '') + n.name;
function dec(n, prop, v) {
  if (!isDec(v)) return;
  const k = n.id + '|' + prop;
  if (seen.has(k)) return;
  seen.add(k);
  out.decimals.push({ id: n.id, name: label(n), prop, value: r2(v) });
}
const unboundSolid = paints => Array.isArray(paints) &&
  paints.some(p => p.type === 'SOLID' && p.visible !== false && !(p.boundVariables && p.boundVariables.color));
const hasStyle = (n, key) => key in n && typeof n[key] === 'string' && n[key] !== '';
const isOwner = n => n.type === 'INSTANCE' || n.type === 'COMPONENT' || n.type === 'COMPONENT_SET';

async function ownerName(n) {
  let c = n;
  if (n.type === 'INSTANCE') {
    c = await n.getMainComponentAsync();
    if (!c) return n.name;
  }
  return c.type === 'COMPONENT' && c.parent && c.parent.type === 'COMPONENT_SET' ? c.parent.name : c.name;
}

// ── overrideDrift ──
// instance 子層 id 是 I<外層 instance>;<母版內節點>[;…]：去掉第一段就是「上一層定義」裡對應節點的 id
// （剩一段＝母版內的節點；剩多段＝母版內某個巢狀 instance 的子層，前面補 I）
const SIZING = new Set(['layoutSizingHorizontal', 'layoutSizingVertical']);
const AUTO_ONLY = new Set(['primaryAxisAlignItems', 'counterAxisAlignItems', 'itemSpacing',
  'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']);
const defCache = new Map();
async function definitionOf(n) {
  if (defCache.has(n.id)) return defCache.get(n.id);
  let d = null;
  if (n.id.startsWith('I') && n.id.includes(';')) {
    const rest = n.id.slice(1).split(';').slice(1);
    d = await figma.getNodeByIdAsync(rest.length === 1 ? rest[0] : 'I' + rest.join(';'));
  } else if (n.type === 'INSTANCE') {
    d = await n.getMainComponentAsync();
  }
  defCache.set(n.id, d);
  return d;
}
async function checkDrift(n) {
  const sub = n.id.startsWith('I') && n.id.includes(';');
  if (!sub && n.type !== 'INSTANCE') return;
  const d = await definitionOf(n);
  if (!d) { driftUnresolved++; return; }
  const auto = 'layoutMode' in n && n.layoutMode !== 'NONE' && 'layoutMode' in d && d.layoutMode !== 'NONE';
  for (const k of CONFIG.overrideFields) {
    if (!(k in n) || !(k in d)) continue;
    if (AUTO_ONLY.has(k) && !auto) continue;
    if (SIZING.has(k) && !sub) continue;  // instance 根節點的 sizing 由放置的頁面決定
    const a = n[k];
    const b = d[k];
    if (a === figma.mixed || b === figma.mixed) continue;
    const same = typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 0.01 : a === b;
    if (!same) out.overrideDrift.push({ id: n.id, name: label(n), prop: k, value: typeof a === 'number' ? r2(a) : a,
      master: typeof b === 'number' ? r2(b) : b });
  }
}

// ── rootSizingDrift／staleOverrides（instance 根節點）──
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
async function checkRoot(n) {
  if (n.type !== 'INSTANCE' || (n.id.startsWith('I') && n.id.includes(';'))) return;
  const m = await n.getMainComponentAsync();
  if (!m) { driftUnresolved++; return; }
  if (CONFIG.rootSizing) {
    for (const k of SIZING) {
      if (!(k in n) || !(k in m)) continue;
      if (n[k] === 'FIXED' && m[k] !== 'FIXED') out.rootSizingDrift.push({ id: n.id, name: label(n), prop: k, value: n[k], master: m[k] });
    }
  }
  if (CONFIG.staleOverrides && Array.isArray(n.overrides)) {
    for (const o of n.overrides) {
      const fields = o.overriddenFields.filter(f => CONFIG.staleFields.includes(f));
      if (!fields.length) continue;
      const node = o.id === n.id ? n : await figma.getNodeByIdAsync(o.id);
      if (!node) continue;
      const d = node === n ? m : await definitionOf(node);
      if (!d) { driftUnresolved++; continue; }
      for (const f of fields) {
        if (!(f in node) || !(f in d) || node[f] === figma.mixed || d[f] === figma.mixed) continue;
        if (same(node[f], d[f])) out.staleOverrides.push({ id: node.id, name: label(node), prop: f, instance: n.id });
      }
    }
  }
}

function checkText(n, inOwner) {
  if (!inOwner) out.localText.push({ id: n.id, name: label(n), text: n.characters.slice(0, 24) });
  const segs = n.getStyledTextSegments(['fontSize', 'lineHeight', 'letterSpacing', 'textStyleId', 'fills', 'fillStyleId']);
  let unstyled = false;
  let unbound = false;
  for (const s of segs) {
    dec(n, 'fontSize', s.fontSize);
    if (s.lineHeight && s.lineHeight.unit === 'PIXELS') dec(n, 'lineHeight', s.lineHeight.value);
    if (s.letterSpacing && s.letterSpacing.unit === 'PIXELS') dec(n, 'letterSpacing', s.letterSpacing.value);
    if (!s.textStyleId) unstyled = true;
    if (!s.fillStyleId && unboundSolid(s.fills)) unbound = true;
  }
  if (unstyled) out.unstyledText.push({ id: n.id, name: label(n), text: n.characters.slice(0, 24) });
  if (unbound) out.unboundPaints.push({ id: n.id, name: label(n), key: 'fills(text)' });
}

async function walk(n, inOwner, exceptV) {
  scanned++;
  if (isOwner(n)) {
    inOwner = true;
    if (!exceptV && except.some(re => re.test(n.name))) exceptV = true;
    if (!exceptV) {
      const nm = await ownerName(n);
      if (except.some(re => re.test(nm))) exceptV = true;
    }
  }
  if (n.type !== 'PAGE') {
    if (exceptV && VECTORISH.has(n.type)) {
      exceptedVectors++;
    } else if (exceptV && isRectDot(n)) {
      exceptedRectDots++;
    } else {
      if (!('rotation' in n) || Math.abs(n.rotation) < 0.01) { dec(n, 'x', n.x); dec(n, 'y', n.y); }
      dec(n, 'width', n.width);
      dec(n, 'height', n.height);
      for (const k of ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing',
        'counterAxisSpacing', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight']) {
        if (k in n) dec(n, k, n[k]);
      }
      if ('cornerRadius' in n) {
        if (n.cornerRadius === figma.mixed) {
          for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) dec(n, k, n[k]);
        } else {
          dec(n, 'cornerRadius', n.cornerRadius);
        }
      }
    }
    if (n.type === 'TEXT') {
      checkText(n, inOwner);
    } else if ('fills' in n && n.fills !== figma.mixed && !hasStyle(n, 'fillStyleId') && unboundSolid(n.fills)) {
      out.unboundPaints.push({ id: n.id, name: label(n), key: 'fills' });
    }
    if ('strokes' in n && !hasStyle(n, 'strokeStyleId') && unboundSolid(n.strokes)) {
      out.unboundPaints.push({ id: n.id, name: label(n), key: 'strokes' });
    }
    if (CONFIG.overrideDrift) await checkDrift(n);
    if (CONFIG.rootSizing || CONFIG.staleOverrides) await checkRoot(n);
  }
  if ('children' in n) for (const c of n.children) await walk(c, inOwner, exceptV);
}

for (const r of roots) {
  let inOwner = false;
  let exceptV = false;
  for (let p = r.parent; p && p.type !== 'PAGE' && p.type !== 'DOCUMENT'; p = p.parent) {
    if (isOwner(p)) {
      inOwner = true;
      if (except.some(re => re.test(p.name))) exceptV = true;
    }
  }
  await walk(r, inOwner, exceptV);
}

const pack = arr => ({ count: arr.length, items: arr.slice(0, CONFIG.maxList) });
return {
  page: page.name,
  roots: roots.length,
  scanned,
  exceptedVectors,
  exceptedRectDots,
  driftUnresolved,              // 找不到母版對應節點（例：外部元件庫）而沒比的節點數
  decimals: pack(out.decimals),
  unboundPaints: pack(out.unboundPaints),
  unstyledText: pack(out.unstyledText),
  localText: pack(out.localText),
  overrideDrift: pack(out.overrideDrift),
  rootSizingDrift: pack(out.rootSizingDrift),
  staleOverrides: pack(out.staleOverrides),
};
