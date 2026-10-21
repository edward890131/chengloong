/* 02 關於正隆水銷服務：水銷價值循環的迴圈箭頭 Lottie（R1 客戶 2026-10-21）
   infinity-breathe.json：1200×560、60fps、936 影格循環（816 收完後全空停 2 秒）；影格 170–630 是四段全滿＋四個箭頭都在的停留段。
   ?static／prefers-reduced-motion：停在 STATIC_FRAME（完整可讀）。離開畫面時暫停。
   lottie 沒載到或 JSON 失敗：保留備援箭頭層（value-cycle-*-band.svg），畫面與 S0 相同。 */
(function () {
  var root = document.querySelector('.cl-about');
  if (!root) return;
  var stage = root.querySelector('.cl-about__cycle-stage');
  var host = root.querySelector('.cl-about__cycle-anim');
  if (!stage || !host || !window.lottie) return;

  var STATIC_FRAME = 400;
  var html = document.documentElement;
  var still = html.classList.contains('is-static') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var anim = window.lottie.loadAnimation({
    container: host,
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path: host.getAttribute('data-lottie'),
    rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
  });

  var visible = false;
  var ready = false;
  function update() {
    if (!ready || still) return;
    if (visible) anim.play(); else anim.pause();
  }

  anim.addEventListener('DOMLoaded', function () {
    ready = true;
    stage.classList.add('is-lottie');
    if (still) anim.goToAndStop(STATIC_FRAME, true);
    else update();
  });
  anim.addEventListener('data_failed', function () {
    stage.classList.remove('is-lottie');
    anim.destroy();
  });

  if (!still) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        update();
      }, { threshold: 0.15 }).observe(stage);
    } else {
      visible = true;
    }
  }
})();
