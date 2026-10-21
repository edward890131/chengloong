// 用法：node shoot.cjs <寬> <輸出前綴> [query]
const path = require('path'); const fs = require('fs');
const { execSync } = require('child_process');
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
(async () => {
  const [w, out, q] = [+process.argv[2], process.argv[3], process.argv[4] || '?static'];
  const mobile = w <= 640;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: w, height: mobile ? 812 : 900 }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8101/index.html' + q, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const el = await page.$('.cl-hero');
  await el.screenshot({ path: out + '_html.png' });
  const attr = mobile ? 'figmaS' : 'figma';
  const rects = await page.evaluate((attr) => {
    const o = document.querySelector('.cl-hero').getBoundingClientRect();
    const sel = attr === 'figmaS' ? '[data-figma-s]' : '[data-figma]';
    return [...document.querySelector('.cl-hero').parentNode.querySelectorAll('.cl-hero, .cl-hero ' + sel)].filter(e => e.dataset[attr]).map(e => { const b = e.getBoundingClientRect(); return { id: e.dataset[attr], x: +(b.x - o.x).toFixed(2), y: +(b.y - o.y).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) }; }).filter(r => r.w > 0);
  }, attr);
  fs.writeFileSync(out + '_rects.json', JSON.stringify(rects, null, 1));
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log(out, 'rects', rects.length, 'scrollWidth', sw);
  await browser.close();
})();
