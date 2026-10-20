/* 01 首屏 · 負責人 A
   1. cover_img 輪播：Figma 元件 cover_img Property 1=1→2→3→4→1，AFTER_TIMEOUT 10s／ON_CLICK，SMART_ANIMATE 0.6s ease-out
      預設＝主畫面 Property 1=2
   2. 首頁特色_B 垂直輪播（電腦版）：Property 1=1→2→3→1，AFTER_TIMEOUT 4s，0.6s ease-out，每格位移 36px
   3. 數據 tooltip：hover／focus 由 CSS 顯示；點擊切換 .is-open（觸控用），點外面關閉
   ?static（.is-static）與 prefers-reduced-motion 時不自動輪播，停在主畫面 */
(function () {
  var root = document.querySelector('.cl-hero');
  if (!root) return;

  var html = document.documentElement;
  var isStatic = html.classList.contains('is-static');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var autoplay = !isStatic && !reduce;

  /* ---------- cover_img 輪播 ---------- */
  var cover = root.querySelector('.cl-hero__cover');
  if (cover) {
    var order = ['1', '2', '3', '4'];
    var current = '2';
    var coverTimer = null;
    var show = function (key) {
      current = key;
      cover.querySelectorAll('.cl-hero__slide').forEach(function (img) {
        img.classList.toggle('is-active', img.getAttribute('data-slide') === key);
      });
    };
    var next = function () {
      show(order[(order.indexOf(current) + 1) % order.length]);
    };
    var restart = function () {
      if (!autoplay) return;
      clearInterval(coverTimer);
      coverTimer = setInterval(next, 10000);
    };
    cover.addEventListener('click', function () { next(); restart(); });
    restart();
  }

  /* ---------- 首頁特色_B 垂直輪播 ---------- */
  var list = root.querySelector('.cl-hero__feature-list');
  if (list && autoplay) {
    var step = 0;
    var count = list.children.length;
    setInterval(function () {
      step = (step + 1) % count;
      list.style.transform = 'translateY(' + (-36 * step) + 'px)';
    }, 4000);
  }

  /* ---------- tooltip ---------- */
  var tips = root.querySelectorAll('.cl-hero__tip');
  var closeAll = function (except) {
    tips.forEach(function (t) {
      if (t === except) return;
      t.classList.remove('is-open');
      var b = t.querySelector('.cl-hero__tip-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  };
  tips.forEach(function (tip) {
    var btn = tip.querySelector('.cl-hero__tip-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !tip.classList.contains('is-open');
      closeAll(tip);
      tip.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function () { closeAll(null); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();
