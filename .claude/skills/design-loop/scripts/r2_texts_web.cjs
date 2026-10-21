#!/usr/bin/env node
// design-loop · r2_texts_web.cjs（0.4.0）
// S7 R2：量網站每個文字區塊的位置，給 r2_text_match.py 對 Figma 設計稿。
// 用法：
//   node r2_texts_web.cjs <網址或 html 檔> <輸出.json> [--width 390] [--height 844] [--mobile]
//       [--root 選擇器] [--static ?static] [--wait 毫秒]
// 產出：{"url", "width", "H", "texts": [[文字前 24 字, x, y, 行數], ...]}
// ▸ 文字區塊＝最近的非 inline 祖先；區塊內 inline 子層（<a>、<strong>）的字併在一起，對應 Figma 的一個 TEXT
// ▸ y＝第一行「行框頂」：Range rect 頂 −（line-height − rect 高）／2（Figma 文字框頂＝行框頂）
// ▸ 行數＝Range rects 的不同行頂數
// ▸ --mobile：isMobile＋hasTouch（pointer:coarse 的尺寸才會出現）；只量 DOM、不截長圖，vh 不會被改掉
// ▸ 原點：--root 的左上角（預設頁面原點，含捲動）；display:none、visibility:hidden、sr-only（1px）、移出畫面上方的不量
// ▸ 量之前不捲動：scroll-spy、sticky 這類狀態停在第一狀態（capture-gotchas）
// ▸ 頁面用 http 伺服（python3 -m http.server）；html 檔路徑會轉成 file://，有 fetch 的頁面可能量不到資料
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { execSync } = require('child_process');

function loadPlaywright() {
  try { return require('playwright'); } catch (_) { /* 改找全域 */ }
  const g = execSync('npm root -g').toString().trim();
  return require(path.join(g, 'playwright'));
}

function parseArgs(argv) {
  const pos = [];
  const opt = { mobile: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--mobile') opt.mobile = true;
    else if (a.startsWith('--')) opt[a.slice(2)] = argv[++i];
    else pos.push(a);
  }
  return { pos, opt };
}

function collect(rootSel) {
  const root = rootSel ? document.querySelector(rootSel) : null;
  const o = root ? root.getBoundingClientRect() : { x: -window.scrollX, y: -window.scrollY };
  const groups = new Map();
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const p = n.parentElement;
    if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(p.tagName)) continue;
    if (p.checkVisibility && !p.checkVisibility({ checkVisibilityCSS: true })) continue;
    let b = p;
    while (b.parentElement && getComputedStyle(b).display.startsWith('inline') && b !== root) b = b.parentElement;
    if (root && !root.contains(b)) continue;
    if (!groups.has(b)) groups.set(b, []);
    groups.get(b).push(n);
  }
  const out = [];
  const tiny = el => { for (let e = el; e && e !== document.body; e = e.parentElement) { const r = e.getBoundingClientRect(); if (r.width <= 1 || r.height <= 1) return true; } return false; };
  for (const [b, nodes] of groups) {
    if (tiny(nodes[0].parentElement)) continue;  // sr-only（1px＋clip）
    const rects = [];
    for (const n of nodes) {
      const r = document.createRange();
      r.selectNodeContents(n);
      for (const rc of r.getClientRects()) if (rc.width > 0 && rc.height > 0) rects.push(rc);
    }
    if (!rects.length) continue;
    rects.sort((a, c) => a.top - c.top || a.left - c.left);
    const tops = [];
    for (const rc of rects) if (!tops.length || rc.top > tops[tops.length - 1] + rc.height / 2) tops.push(rc.top);
    const cs = getComputedStyle(b);
    const fs = parseFloat(cs.fontSize);
    const lh = cs.lineHeight === 'normal' ? fs * 1.2 : parseFloat(cs.lineHeight);
    const first = rects[0];
    if (rects[rects.length - 1].bottom - o.y < 0) continue;  // 移出畫面上方的 skip link
    const x = Math.min(...rects.map(rc => rc.left));
    const text = nodes.map(n => n.nodeValue).join('').replace(/\s+/g, ' ').trim().slice(0, 24);
    out.push([text, +(x - o.x).toFixed(1), +(first.top - (lh - first.height) / 2 - o.y).toFixed(1), tops.length]);
  }
  return { H: Math.round(root ? root.getBoundingClientRect().height : document.documentElement.scrollHeight), texts: out };
}

(async () => {
  const { pos, opt } = parseArgs(process.argv.slice(2));
  const [src, out] = pos;
  if (!src || !out) {
    console.error('用法：node r2_texts_web.cjs <網址或 html 檔> <輸出.json> [--width 390] [--height 844] [--mobile] [--root 選擇器] [--static ?static] [--wait 毫秒]');
    process.exit(2);
  }
  const width = +(opt.width || 390);
  const height = +(opt.height || 844);
  const url = (/^https?:|^file:/.test(src) ? src : pathToFileURL(path.resolve(src)).href) + (opt.static || '');
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: opt.mobile, hasTouch: opt.mobile });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (opt.wait) await page.waitForTimeout(+opt.wait);
  const res = await page.evaluate(collect, opt.root || null);
  await browser.close();
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ url, width, H: res.H, texts: res.texts }));
  console.log(`${path.basename(out)}：${width}×${height}${opt.mobile ? '（mobile）' : ''}，頁高 ${res.H}，文字區塊 ${res.texts.length}`);
})();
