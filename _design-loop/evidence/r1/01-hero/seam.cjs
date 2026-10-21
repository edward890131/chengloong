const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => {
  const b = await chromium.launch();
  for (const [tag, css] of [['old', '.cl-hero .cl-hero__cover{bottom:78px !important}'], ['new', '']]) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto('http://localhost:8121/index.html', { waitUntil: 'networkidle' });
    await p.click('.cl-pv-switch [data-device="ipad"]');
    await p.waitForTimeout(1500);
    const f = p.frames().find(x => x.url().includes('embed'));
    await f.addStyleTag({ content: css + ' .is-counting>*{opacity:1!important}' });
    await p.waitForTimeout(800);
    await p.screenshot({ path: `seam_${tag}.png`, clip: { x: 470, y: 440, width: 500, height: 70 } });
    await p.close();
  }
  await b.close();
})();
