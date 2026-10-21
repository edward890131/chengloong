const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const out = 'motion'; require('fs').mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1440, 900], [375, 667], [820, 1180]]) {
    const mobile = w <= 640;
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await p.goto('http://localhost:8121/index.html', { waitUntil: 'domcontentloaded' });
    const samples = [];
    const unitX = [];
    for (let i = 0; i < 10; i++) {
      samples.push(await p.evaluate(() => [...document.querySelectorAll('.cl-hero__metric-num')].map(n => n.textContent).join(' ')));
      unitX.push(await p.evaluate(() => Math.round(document.querySelector('.cl-hero__metric-unit').getBoundingClientRect().left)));
      if (i === 2) await p.screenshot({ path: `${out}/${w}_mid.png` });
      await p.waitForTimeout(250);
    }
    await p.waitForTimeout(1500);
    const fin = await p.evaluate(() => [...document.querySelectorAll('.cl-hero__metric-num')].map(n => n.textContent + '|' + n.style.minWidth).join(' '));
    const rv = await p.evaluate(() => [...document.querySelectorAll('.cl-hero [data-reveal]')].map(e => e.classList.contains('is-revealed')).join(','));
    console.log(w, 'samples', samples.join(' / '));
    console.log(w, 'unitX', unitX.join(','), 'final', fin, 'revealed', rv);
    await p.screenshot({ path: `${out}/${w}_final.png` });
    // zoom hover
    if (!mobile) {
      const c = await p.$('.cl-hero__cover'); const r = await c.boundingBox();
      await p.mouse.move(r.x + 150, r.y + 100); await p.waitForTimeout(900);
      console.log(w, 'zoom scale', await p.evaluate(() => getComputedStyle(document.querySelector('.cl-hero__slide.is-active')).scale));
      await p.screenshot({ path: `${out}/${w}_zoom.png` });
      await p.mouse.move(5, 300);
    }
    // header fixed after scroll
    await p.evaluate(() => window.scrollTo(0, 2500)); await p.waitForTimeout(400);
    const hb = await p.evaluate(() => { const r = document.querySelector('.cl-hero__header').getBoundingClientRect(); const top = document.elementFromPoint(document.documentElement.clientWidth/2|0, 20); return [r.top, r.height, top.closest('.cl-hero__header') ? 'header-on-top' : top.className]; });
    console.log(w, 'header after scroll', JSON.stringify(hb));
    await p.screenshot({ path: `${out}/${w}_scrolled.png` });
    console.log(w, errs.length ? 'ERR ' + errs.join('|') : 'no-console-error');
    await ctx.close();
  }
  await b.close();
})();
