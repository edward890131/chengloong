// 用法：node shoot.cjs <outdir> [static|motion]
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const out = process.argv[2];
const mode = process.argv[3] || 'static';
const widths = (process.argv[4] || '1440,1920,820,768,375').split(',').map(Number);
const fs = require('fs');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch();
  for (const w of widths) {
    const mobile = w <= 640;
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    const p = await ctx.newPage();
    const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push(String(e)));
    await p.goto('http://localhost:8121/index.html' + (mode === 'static' ? '?static' : ''), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(mode === 'static' ? 300 : 3000);
    const el = await p.$('.cl-hero');
    await el.screenshot({ path: `${out}/${w}_${mode}.png` });
    const info = await p.evaluate(() => ({
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      nums: [...document.querySelectorAll('.cl-hero__metric-num')].map(n => n.textContent),
    }));
    console.log(w, mode, JSON.stringify(info), errs.length ? 'ERR ' + errs.join(' | ') : 'no-console-error');
    await ctx.close();
  }
  await b.close();
})();
