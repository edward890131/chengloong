// design-loop · capture_prep.js
// 擷取（generate_figma_design）或全頁截圖前整理頁面：捲到底觸發 lazy load、圖片改 eager、關掉會跑版的 CSS
// ▸ Playwright MCP：把 `async (page) => page.evaluate(...)` 整段貼進 browser_run_code_unsafe
// ▸ 網址先加 manifest.static_param（?static）；只影響目前這個分頁，重新整理就恢復
// ▸ 回報 selectArrow > 0 時，擷取後要在 Figma 修 select 箭頭（見 references/capture-gotchas.md）

const prep = async (page) => page.evaluate(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
  const step = Math.max(200, Math.floor(innerHeight * 0.8));
  for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
    scrollTo(0, y);
    await sleep(80);
  }
  scrollTo(0, 0);
  await Promise.race([
    Promise.all([...document.images].filter(i => !i.complete).map(i => new Promise(r => {
      i.addEventListener('load', r, { once: true });
      i.addEventListener('error', r, { once: true });
    }))),
    sleep(8000),
  ]);

  let underline = 0;
  let gradientLine = 0;
  let selectArrow = 0;
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    // 透明底線 → 擷取後變成看得見的底線
    if (cs.textDecorationLine.includes('underline') &&
      (cs.textDecorationColor === 'rgba(0, 0, 0, 0)' || cs.textDecorationColor === 'transparent')) {
      el.style.setProperty('text-decoration-line', 'none', 'important');
      underline++;
    }
    // 1–2px 高的漸層滑入底線 → 擷取後變成整塊實心
    const h = cs.backgroundSize.split(' ')[1] || '';
    if (cs.backgroundImage.includes('gradient') && h.endsWith('px') && parseFloat(h) <= 2) {
      el.style.setProperty('background-image', 'none', 'important');
      gradientLine++;
    }
    if (el.tagName === 'SELECT' && cs.backgroundImage !== 'none') selectArrow++;
  }
  return {
    images: document.images.length,
    imagesPending: [...document.images].filter(i => !i.complete).length,
    underline,
    gradientLine,
    selectArrow,
    height: document.documentElement.scrollHeight,
  };
});

module.exports = prep;
