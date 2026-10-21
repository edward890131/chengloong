// design-loop · figma_pages.js（0.6.0）
// 在 use_figma 執行。改 CONFIG 後整段貼入。規則見 core/figma-pages.md。
// mode 'check'（預設，唯讀）：檢查 page 結構與正式稿，列問題
// mode 'apply'：補建缺的 page、分隔線、功能 Section，照結構排順序；不刪、不改名任何既有 page 或 frame
// 回傳 pages：照 manifest.figma.pages 格式的 page id，apply 後寫回 manifest
// ▸ 已有同名 page 就沿用它的 id，不重複建
// ▸ 舊格式（pages.design 是字串）：只檢查那一個設計稿 page，不建功能 page
// ▸ 每次呼叫最多切一次 page（figma-use）：本腳本只讀各 page 的子節點、不切 page；Section 用 page.appendChild 建
const CONFIG = {
  mode: 'check',                    // 'check'｜'apply'
  // 從 manifest.figma.pages 貼過來；design 可以是 {代碼: {name, id}}（新格式）或字串（舊格式）
  pages: {
    guideline: '',
    wireframe: '',
    captures: '',
    design: { A: { name: 'A 登入註冊', id: '' } },
    adjust: '',
  },
  useWireframe: false,              // 有本檔 wireframe frame 才 true（figma-pages §3）
  names: { guideline: 'Guideline', wireframe: 'Wireframe', captures: 'HTML 擷取', adjust: '調整區' },
  dividers: { ref: '--- 參考 ---', design: '--- 正式稿 ---', work: '--- 工作區 ---' },
  appliedSection: '已套用',
  // registry.pages[] 裡 status 不是 removed 的：[代碼, design_node]；用來檢查正式稿上有沒有沒登記的 frame
  screens: [['A-01', '']],
  maxList: 40,
};

const APPLY = CONFIG.mode === 'apply';
const legacy = typeof CONFIG.pages.design === 'string';
const pagesById = new Map(figma.root.children.map(p => [p.id, p]));
const pageByName = name => figma.root.children.find(p => p.name === name);
const isDivider = p => p.name.startsWith('---');
const out = { toCreate: [], order: [], missing: [], renamed: [], created: [], strayFrames: [], misplaced: [], appliedNotMoved: [], noSection: [], freePages: [] };
const pages = JSON.parse(JSON.stringify(CONFIG.pages));

// 找或建一個 page；id 找不到時退回用名稱找；都沒有時 apply 才建
function resolve(role, id, name) {
  let p = id ? pagesById.get(id) : null;
  if (id && !p) out.missing.push({ role, id, name });
  if (p && p.name !== name) out.renamed.push({ role, id: p.id, manifest: name, figma: p.name });
  if (!p) p = pageByName(name) || null;
  if (!p && APPLY) {
    p = figma.createPage();
    p.name = name;
    out.created.push({ role, name, id: p.id });
  } else if (!p) {
    out.toCreate.push({ role, name });
  }
  return p;
}

// ── 1. 解析每個 page ──
const order = [];
const role = {};
const add = (key, p) => { if (p) { order.push(p); role[p.id] = key; } };
const div = n => resolve('divider', '', n);

const guideline = resolve('guideline', pages.guideline, CONFIG.names.guideline);
add('guideline', guideline);
add('divider', div(CONFIG.dividers.ref));
let wireframe = null;
if (CONFIG.useWireframe || pages.wireframe) {
  wireframe = resolve('wireframe', pages.wireframe, CONFIG.names.wireframe);
  add('wireframe', wireframe);
}
const captures = resolve('captures', pages.captures, CONFIG.names.captures);
add('captures', captures);
add('divider', div(CONFIG.dividers.design));
const featurePages = {};
if (legacy) {
  const p = pages.design ? pagesById.get(pages.design) : null;
  if (pages.design && !p) out.missing.push({ role: 'design', id: pages.design, name: '設計稿' });
  if (p) { featurePages['*'] = p; add('design', p); }
} else {
  for (const [code, d] of Object.entries(pages.design)) {
    const p = resolve('design:' + code, d.id, d.name);
    if (p) { featurePages[code] = p; add('design:' + code, p); }
  }
}
add('divider', div(CONFIG.dividers.work));
const adjust = resolve('adjust', pages.adjust, CONFIG.names.adjust);
add('adjust', adjust);

// manifest 回寫用的 id
if (guideline) pages.guideline = guideline.id;
if (wireframe) pages.wireframe = wireframe.id;
if (captures) pages.captures = captures.id;
if (adjust) pages.adjust = adjust.id;
if (!legacy) for (const code of Object.keys(pages.design)) if (featurePages[code]) pages.design[code].id = featurePages[code].id;

// ── 2. 排順序：結構內的 page 依序排前面，其他（自由 page、來源 page）留在後面 ──
if (APPLY) {
  order.forEach((p, i) => { if (figma.root.children.indexOf(p) !== i) figma.root.insertChild(i, p); });
} else {
  const idx = order.map(p => figma.root.children.indexOf(p));
  if (idx.some((v, i) => i > 0 && v < idx[i - 1])) out.order.push({ now: figma.root.children.map(p => p.name), expected: order.map(p => p.name) });
}
const load = async p => { if (p && typeof p.loadAsync === 'function') await p.loadAsync(); };
const known = new Set(order.map(p => p.id));
for (const p of figma.root.children) if (!known.has(p.id) && !isDivider(p)) out.freePages.push({ id: p.id, name: p.name });

// ── 3. Section：HTML 擷取／Wireframe 依功能、調整區要有「已套用」──
const sectionNames = legacy ? [] : Object.values(pages.design).map(d => d.name);
async function ensureSections(page, names) {
  if (!page) return;
  await load(page);
  const have = new Set(page.children.filter(n => n.type === 'SECTION').map(n => n.name));
  let y = Math.max(0, ...page.children.map(n => n.y + n.height)) + 200;
  for (const name of names) {
    if (have.has(name)) continue;
    if (!APPLY) { out.noSection.push({ page: page.name, section: name }); continue; }
    const s = figma.createSection();
    s.name = name;
    page.appendChild(s);
    s.x = 0;
    s.y = y;
    s.resizeWithoutConstraints(1600, 1000);
    y += 1200;
    out.created.push({ role: 'section', name: page.name + ' › ' + name, id: s.id });
  }
}
await ensureSections(captures, sectionNames);
if (wireframe) await ensureSections(wireframe, sectionNames);
await ensureSections(adjust, [CONFIG.appliedSection]);

// ── 4. 正式稿：只放 registry 登記過的 frame，且放在對應功能 page ──
const topFrames = page => {
  const list = [];
  for (const n of page.children) {
    if (n.type === 'SECTION') { for (const c of n.children) if (c.type === 'FRAME' || c.type === 'COMPONENT' || c.type === 'INSTANCE') list.push(c); }
    else if (n.type === 'FRAME') list.push(n);
  }
  return list;
};
const registered = new Map(CONFIG.screens.filter(s => s[1]).map(([code, id]) => [id, code]));
for (const [code, p] of Object.entries(featurePages)) {
  await load(p);
  for (const f of topFrames(p)) {
    const c = registered.get(f.id);
    if (!c) { out.strayFrames.push({ page: p.name, id: f.id, name: f.name }); continue; }
    const feature = c.split('-')[0];
    if (!legacy && feature !== code) out.misplaced.push({ code: c, id: f.id, onPage: p.name, shouldBe: (pages.design[feature] || {}).name || feature });
  }
}

// ── 5. 調整區：名稱標了已套用、卻不在「已套用」Section 裡 ──
if (adjust) {
  for (const n of adjust.children) {
    const items = n.type === 'SECTION' ? (n.name === CONFIG.appliedSection ? [] : n.children) : [n];
    for (const f of items) if (/已套用/.test(f.name)) out.appliedNotMoved.push({ id: f.id, name: f.name });
  }
}

const pack = arr => ({ count: arr.length, items: arr.slice(0, CONFIG.maxList) });
const result = { mode: CONFIG.mode, legacy, pages };
for (const k of Object.keys(out)) result[k] = pack(out[k]);
// ok：結構齊全、順序正確、正式稿與調整區沒有待處理項目（renamed 只需更新 manifest 名稱，不算錯）
result.ok = ['toCreate', 'order', 'missing', 'strayFrames', 'misplaced', 'appliedNotMoved', 'noSection'].every(k => out[k].length === 0);
return result;
