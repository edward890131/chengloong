// node shoot.cjs <outdir> <mode static|motion> <WxH,...>
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [out, mode, sizes] = process.argv.slice(2);
const fs = require('fs'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({args:['--proxy-server=https='+process.env.HTTPS_PROXY.replace('http://','')]});
  for (const s of sizes.split(',')) {
    const [w, h] = s.split('x').map(Number);
    const mobile = w <= 640;
    const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    const p = await ctx.newPage();
    const errs = [];
    p.on('console', m => { if (m.type() === 'error' && !/TUNNEL/.test(m.text())) errs.push(m.text()); }); p.on('requestfailed', r => { if (!/cdnjs/.test(r.url())) errs.push('FAIL ' + r.url()); });
    p.on('pageerror', e => errs.push(String(e)));
    await p.goto('http://localhost:8131/index.html' + ((mode === 'static' || mode === 'ssection') ? '?static' : ''), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(mode === 'static' ? 300 : 3000);
    const el = await p.$('.cl-hero');
    if (mode === 'section' || mode === 'ssection') await el.screenshot({ path: `${out}/${w}x${h}_${mode}.png` });
    else await p.screenshot({ path: `${out}/${w}x${h}_${mode}.png` });
    const info = await p.evaluate(() => {
      const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
      const card = document.querySelector('.cl-hero__card').getBoundingClientRect();
      const cta = document.querySelector('.cl-hero__cta').getBoundingClientRect();
      const ms = [...document.querySelectorAll('.cl-hero__metric')].map(m => m.getBoundingClientRect());
      const num = document.querySelector('.cl-hero__num').getBoundingClientRect();
      const over = ms.some(m => m.right > num.right + 0.5);
      return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        hero: r('.cl-hero'), cover: r('.cl-hero__cover'), card: r('.cl-hero__card'), num: r('.cl-hero__num'), feat: r('.cl-hero__feature'),
        title: getComputedStyle(document.querySelector('.cl-hero__title')).fontSize, desc: getComputedStyle(document.querySelector('.cl-hero__desc')).fontSize,
        ctaInCard: cta.bottom <= card.bottom + 0.5, metricOverflow: over,
        nums: [...document.querySelectorAll('.cl-hero__metric-num')].map(n => n.textContent) };
    });
    console.log(s, mode, JSON.stringify(info), errs.length ? 'ERR ' + errs.join(' | ') : 'ok');
    await ctx.close();
  }
  await b.close();
})();
