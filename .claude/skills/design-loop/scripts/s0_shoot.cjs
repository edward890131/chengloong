#!/usr/bin/env node
// design-loop · s0_shoot.cjs
// S0 驗收第一步：HTML 截圖＋每個 [data-figma] 元素的位置（相對畫面根節點），給 s0_compare.py 比對。
// 用法：
//   node s0_shoot.cjs <html檔> <輸出前綴> [--width 375] [--height 812] [--root .xx-screen] [--full]
//       [--manifest _design-loop/manifest.json] [--static ?static]
// 產出：<前綴>_html.png、<前綴>_rects.json（[{id, x, y, w, h}]，id＝data-figma 的值＝Figma node id）
// ▸ HTML 每個要驗的節點加 data-figma="<Figma node id>"；位置以畫面根節點左上角為原點（對應 Figma frame 原點）
// ▸ 預設值從 manifest 讀：寬高＝viewports[0]、網址參數＝static_param、--root 沒給時試 .<prefix>-screen，
//   找不到就用 [data-screen]，再找不到用頁面原點。manifest 沒給時從 html 檔的目錄往上找 _design-loop/manifest.json
// ▸ 長頁有 sticky／fixed 元素時不要 --full（fullPage 會把 sticky 畫錯位置），改成把 --height 設成頁高
// ▸ playwright：先找專案本地安裝，找不到用全域（npm root -g）
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
  const opt = { full: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--full') opt.full = true;
    else if (a.startsWith('--')) opt[a.slice(2)] = argv[++i];
    else pos.push(a);
  }
  return { pos, opt };
}

function findManifest(start) {
  let dir = path.resolve(start);
  for (;;) {
    const p = path.join(dir, '_design-loop', 'manifest.json');
    if (fs.existsSync(p)) return p;
    const up = path.dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

(async () => {
  const { pos, opt } = parseArgs(process.argv.slice(2));
  const [file, out] = pos;
  if (!file || !out) {
    console.error('用法：node s0_shoot.cjs <html檔> <輸出前綴> [--width N] [--height N] [--root 選擇器] [--full] [--manifest 路徑] [--static 參數]');
    process.exit(2);
  }
  const mPath = opt.manifest || findManifest(path.dirname(file));
  const manifest = mPath ? JSON.parse(fs.readFileSync(mPath, 'utf8')) : {};
  const vp = (manifest.viewports || [])[0] || { width: 375, height: 812 };
  const width = +(opt.width || vp.width);
  const height = +(opt.height || vp.height);
  const staticParam = opt.static !== undefined ? opt.static : (manifest.static_param ?? '?static');
  const roots = opt.root ? [opt.root] : [manifest.prefix ? `.${manifest.prefix}-screen` : null, '[data-screen]'].filter(Boolean);

  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve(file)).href + staticParam, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out + '_html.png', fullPage: opt.full });
  const res = await page.evaluate((sels) => {
    let root = null;
    let used = '（頁面原點）';
    for (const s of sels) {
      root = document.querySelector(s);
      if (root) { used = s; break; }
    }
    const o = root ? root.getBoundingClientRect() : { x: -window.scrollX, y: -window.scrollY };
    const rects = [...document.querySelectorAll('[data-figma]')].map(el => {
      const b = el.getBoundingClientRect();
      return { id: el.dataset.figma, x: +(b.x - o.x).toFixed(2), y: +(b.y - o.y).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
    });
    return { used, rects };
  }, roots);
  fs.writeFileSync(out + '_rects.json', JSON.stringify(res.rects, null, 1));
  await browser.close();
  console.log(`${path.basename(out)}：${width}×${height}，原點 ${res.used}，data-figma ${res.rects.length} 個`);
  if (!res.rects.length) console.log('提醒：頁面沒有 [data-figma] 節點，s0_compare 只會做像素比對');
})();
