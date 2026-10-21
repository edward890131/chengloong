// design-loop · r2_texts_figma.js（0.4.0）
// 在 use_figma 執行（唯讀）。改 CONFIG 後整段貼入；回傳存成 figma.json 給 r2_text_match.py。
// 回傳：{"frame", "W", "H", "total", "texts": [[文字前 24 字, x, y, 行數], ...]}
// ▸ x／y＝文字框相對頁面 frame 左上角（absoluteBoundingBox 相減）；Figma 文字框頂＝行框頂
// ▸ 行數＝round(文字框高 ÷ 行高)；行高 AUTO 以字級 ×1.2 估（和網站 normal 同一套近似）
// ▸ 隱藏的（自身或祖先 visible=false）不量；figma.skipInvisibleInstanceChildren 維持預設 true
// ▸ 回傳超過約 20KB 會截斷（figma-gotchas）：文字多的長頁用 offset／limit 分批，total 是全部筆數
const CONFIG = {
  frameId: 'FRAME_ID',   // 設計稿頁面 frame
  offset: 0,
  limit: 300,
};

const frame = await figma.getNodeByIdAsync(CONFIG.frameId);
if (!frame || !('findAllWithCriteria' in frame)) throw new Error('frameId 不是 frame：' + CONFIG.frameId);
let pg = frame;
while (pg.type !== 'PAGE') pg = pg.parent;
await figma.setCurrentPageAsync(pg);

const o = frame.absoluteBoundingBox;
const visible = n => { for (let p = n; p && p !== frame; p = p.parent) if (p.visible === false) return false; return true; };
const lineH = n => {
  let fs = n.fontSize;
  let lh = n.lineHeight;
  if (fs === figma.mixed || lh === figma.mixed) {
    const s = n.getStyledTextSegments(['fontSize', 'lineHeight'])[0];
    fs = s.fontSize;
    lh = s.lineHeight;
  }
  if (lh.unit === 'PIXELS') return lh.value;
  if (lh.unit === 'PERCENT') return fs * lh.value / 100;
  return fs * 1.2;
};

const all = frame.findAllWithCriteria({ types: ['TEXT'] }).filter(visible);
const texts = [];
for (const n of all.slice(CONFIG.offset, CONFIG.offset + CONFIG.limit)) {
  const b = n.absoluteBoundingBox;
  if (!b || !n.characters.trim()) continue;
  const lines = Math.max(1, Math.round(b.height / lineH(n)));
  texts.push([n.characters.replace(/\s+/g, ' ').trim().slice(0, 24), Math.round(b.x - o.x), Math.round(b.y - o.y), lines]);
}
return { frame: frame.name, W: Math.round(o.width), H: Math.round(o.height), total: all.length, texts };
