// design-loop · extract_computed.js
// 讀頁面渲染後的樣式，統計每種值出現幾次（S0 驗收、S1 盤點、S7 R4 量字級層級）
// ▸ Playwright MCP：把 `async (page) => page.evaluate(...)` 整段（到 `}, 40);`）貼進 browser_run_code_unsafe
// ▸ 自裝 playwright：node extract_computed.js <url> [寬] [高] > out.json
// ▸ 網址記得加 manifest.static_param（?static）；結果另存在 window.__dl，回傳被截斷時分段取

const extract = async (page) => page.evaluate((TOP) => {
  const tally = {};
  const sel = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
    [...el.classList].slice(0, 2).map(c => '.' + c).join('');
  const add = (cat, val, el) => {
    if (val === undefined || val === null || val === '') return;
    const m = (tally[cat] = tally[cat] || new Map());
    const e = m.get(val) || { n: 0, sample: [] };
    e.n++;
    if (e.sample.length < 2) e.sample.push(sel(el));
    m.set(val, e);
  };
  const clear = v => v === 'rgba(0, 0, 0, 0)' || v === 'transparent';

  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (hasText) {
      add('textColor', cs.color, el);
      add('fontSize', cs.fontSize, el);
      add('type', `${cs.fontFamily.split(',')[0].replace(/["']/g, '')} | ${cs.fontSize} | ${cs.fontWeight} | lh ${cs.lineHeight} | ls ${cs.letterSpacing}`, el);
    }
    if (!clear(cs.backgroundColor)) add('background', cs.backgroundColor, el);
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      if (parseFloat(cs['border' + side + 'Width']) > 0 && cs['border' + side + 'Style'] !== 'none') {
        add('border', `${cs['border' + side + 'Width']} ${cs['border' + side + 'Color']}`, el);
      }
      const p = cs['padding' + side];
      if (p !== '0px') add('padding', p, el);
      const mg = cs['margin' + side];
      if (mg !== '0px' && mg !== 'auto') add('margin', mg, el);
    }
    for (const g of ['rowGap', 'columnGap']) {
      const v = cs[g];
      if (v && v !== 'normal' && v !== '0px') add('gap', v, el);
    }
    if (cs.borderRadius !== '0px') add('radius', cs.borderRadius, el);
    if (cs.boxShadow !== 'none') add('shadow', cs.boxShadow, el);
    if (cs.backdropFilter && cs.backdropFilter !== 'none') add('backdrop', cs.backdropFilter, el);
    if (cs.filter !== 'none') add('filter', cs.filter, el);
  }

  const result = { url: location.href, viewport: [innerWidth, innerHeight], categories: {} };
  for (const [cat, m] of Object.entries(tally)) {
    result.categories[cat] = {
      distinct: m.size,
      top: [...m.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, TOP)
        .map(([value, e]) => ({ value, n: e.n, sample: e.sample })),
    };
  }
  window.__dl = result;
  return result;
}, 40);

module.exports = extract;

if (typeof require !== 'undefined' && require.main === module) {
  (async () => {
    const [url, w = '1440', h = '900'] = process.argv.slice(2);
    if (!url) {
      console.error('用法：node extract_computed.js <url> [寬] [高]');
      process.exit(1);
    }
    const { chromium } = require('playwright');
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: +w, height: +h } });
    await page.goto(url, { waitUntil: 'networkidle' });
    console.log(JSON.stringify(await extract(page), null, 2));
    await browser.close();
  })();
}
