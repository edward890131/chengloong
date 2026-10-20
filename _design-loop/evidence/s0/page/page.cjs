const pw = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const out = process.argv[2];
(async () => {
  const b = await pw.chromium.launch();
  const res = {};
  for (const [w, mobile] of [[1440,false],[1280,false],[1024,false],[768,false],[375,true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
    await p.goto('http://localhost:8200/index.html?static', { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    const info = await p.evaluate(() => {
      const page = document.querySelector('.cl-page');
      const secs = [...page.children].filter(e => e.tagName !== 'SCRIPT').map(e => ({ cls: e.className.split(' ')[0], top: +e.getBoundingClientRect().top.toFixed(2) + scrollY, h: +e.getBoundingClientRect().height.toFixed(2) }));
      return { pageH: page.getBoundingClientRect().height, sw: document.documentElement.scrollWidth, secs };
    });
    info.errs = errs;
    res[w] = info;
    if (w === 1440 || w === 375) {
      await p.setViewportSize({ width: w, height: Math.ceil(info.pageH) });
      await p.waitForTimeout(500);
      await p.screenshot({ path: `${out}/html_${w}.png` });
    }
    await ctx.close();
  }
  console.log(JSON.stringify(res, null, 1));
  await b.close();
})();
