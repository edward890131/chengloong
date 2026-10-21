/* 01 首屏 · 負責人 A
   1. cover_img 輪播：Figma 元件 cover_img Property 1=1→2→3→4→1，AFTER_TIMEOUT 10s／ON_CLICK，SMART_ANIMATE 0.6s ease-out
      預設＝主畫面 Property 1=2
   2. 首頁特色_B 垂直輪播（電腦版）：Property 1=1→2→3→1，AFTER_TIMEOUT 4s，0.6s ease-out，每格位移 36px（R2 電腦版乘縮放比，見 CSS --cl-hero-step）
   3. 數據 tooltip：hover／focus 由 CSS 顯示；點擊切換 .is-open（觸控用），點外面關閉
   4. 首屏 reveal：畫面內的直接在載入時播放（見下）
   5. 數字計數（R1 客戶要求，參考 reactbits Count Up）：[data-count] 進入畫面時從 0 以 ease-out 數到 HTML 寫的目標值，
      保留千分位逗號；計數中單位先隱藏、數完淡入（避免數字寬度變動讓單位左右跳）
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
      list.style.setProperty('--cl-hero-step', step);   // R2：位移寫在 CSS（每格 36 × 縮放比）
    }, 4000);
  }

  /* ---------- 首屏 reveal：base.js 在元素捲過畫面 1/3 才播放；首屏在畫面內但位置偏下（矮視窗、手機）會等到捲動才出現，
     這裡在載入時直接播放畫面內的首屏 reveal（只動自己段落） ---------- */
  if (autoplay) {
    requestAnimationFrame(function () {
      root.querySelectorAll('[data-reveal]').forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-revealed');
      });
    });
  }

  /* ---------- 數字計數 Count Up ---------- */
  var counters = [].slice.call(root.querySelectorAll('[data-count]'));
  if (counters.length && autoplay && 'IntersectionObserver' in window) {
    var DURATION = 2000;
    var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
    var easeOut = function (t) { return 1 - Math.pow(1 - t, 4); };
    // 計數中數字寬度一直變，旁邊的單位會左右跳：計數時先藏單位（.is-counting），數完再淡入
    counters.forEach(function (el) {
      el.dataset.target = el.textContent.replace(/[^\d]/g, '');
      el.textContent = '0';
      el.parentNode.classList.add('is-counting');
    });
    var run = function (el) {
      var target = +el.dataset.target;
      var start = null;
      var tick = function (now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / DURATION);
        el.textContent = fmt(Math.round(target * easeOut(t)));
        if (t < 1) requestAnimationFrame(tick);
        else el.parentNode.classList.remove('is-counting');
      };
      requestAnimationFrame(tick);
    };
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
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
