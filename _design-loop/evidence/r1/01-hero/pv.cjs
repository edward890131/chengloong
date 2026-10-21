const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [1440, 1280]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:8121/index.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => window.scrollTo(0, 1500));
  if (w === 1440) await p.click('.cl-pv-switch [data-device="ipad"]');
  else { await p.click('.cl-pv-compact > .cl-pv-btn'); await p.click('.cl-pv-item[data-device="ipad"]'); }
  await p.waitForTimeout(3500);
  const r = await p.evaluate(() => {
    const h = document.querySelector('.cl-hero__header').getBoundingClientRect();
    const st = document.querySelector('.cl-pv-stage').getBoundingClientRect();
    const at = document.elementFromPoint(innerWidth / 2, 30);
    return { header: [h.top, h.bottom], stageTop: st.top, topEl: at.closest('.cl-hero__header') ? 'header' : at.className, switchVisible: !!document.querySelector('.cl-pv-switch').offsetParent || !!document.querySelector('.cl-pv-compact').offsetParent, open: document.documentElement.classList.contains('cl-pv-open'), scrollY };
  });
  console.log(w, JSON.stringify(r), errs.join('|') || 'no-error');
  await p.screenshot({ path: `pv_${w}.png` });
  await p.close();
  }
  await b.close();
})();
