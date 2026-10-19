// design-loop · figma_export_variables.js
// 在 use_figma 執行（唯讀，不需要切 page）。整段貼入。
// use_figma 回傳超過約 20KB 會被截斷，所以用精簡格式、分批：
//   c    [{ n: collection 名, m: [mode 名…] }]
//   v    [[變數名, collection 索引, 型別, codeSyntax.WEB 或 null, [各 mode 解析值…]]]
//        色值 #rrggbbaa；alias 追到底（同 collection 用同一個 mode，跨 collection 用對方預設 mode）
//   next 還有下一批時的 offset（CONFIG.offset 改成它再跑一次；可以同時發多個批次），沒有就是 null
// 每批回傳存成 _design-loop/measure/figma_vars_<批>.json，再跑 token_diff.py --figma figma_vars_*.json

const CONFIG = { offset: 0, limit: 120 };

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const colById = new Map(cols.map(c => [c.id, c]));
const colIndex = new Map(cols.map((c, i) => [c.id, i]));
const varById = new Map(vars.map(v => [v.id, v]));
const hex = c => '#' + [c.r, c.g, c.b, 'a' in c ? c.a : 1]
  .map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');

async function getVar(id) {
  if (!varById.has(id)) varById.set(id, await figma.variables.getVariableByIdAsync(id));
  return varById.get(id);
}

async function getCol(id) {
  if (!colById.has(id)) colById.set(id, await figma.variables.getVariableCollectionByIdAsync(id));
  return colById.get(id);
}

async function resolve(value, colId, modeId, depth) {
  if (value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS') {
    if (depth > 10) return 'unresolved:' + value.id;
    const t = await getVar(value.id);
    if (!t) return 'unresolved:' + value.id;
    let tMode = modeId;
    if (t.variableCollectionId !== colId) {
      const tCol = await getCol(t.variableCollectionId);
      tMode = tCol ? tCol.defaultModeId : Object.keys(t.valuesByMode)[0];
    }
    if (!(tMode in t.valuesByMode)) tMode = Object.keys(t.valuesByMode)[0];
    return resolve(t.valuesByMode[tMode], t.variableCollectionId, tMode, depth + 1);
  }
  if (value && typeof value === 'object' && 'r' in value) return hex(value);
  if (typeof value === 'number') return Math.round(value * 100) / 100;
  return value;
}

const batch = vars.slice(CONFIG.offset, CONFIG.offset + CONFIG.limit);
const v = [];
for (const x of batch) {
  const col = colById.get(x.variableCollectionId);
  const vals = [];
  for (const m of col.modes) vals.push(await resolve(x.valuesByMode[m.modeId], col.id, m.modeId, 0));
  v.push([x.name, colIndex.get(col.id), x.resolvedType, (x.codeSyntax && x.codeSyntax.WEB) || null, vals]);
}
const end = CONFIG.offset + batch.length;

return {
  exported: new Date().toISOString(),
  total: vars.length,
  next: end < vars.length ? end : null,
  c: cols.map(c => ({ n: c.name, m: c.modes.map(m => m.name) })),
  v,
};
