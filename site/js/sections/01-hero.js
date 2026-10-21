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

  /* ---------- header 錨點與漢堡選單（R2 客戶） ----------
     1. header／選單內的 #錨點：平滑捲動到段落（扣掉固定 header 高），時長依距離 .6–1.2s、easeInOutCubic；
        #top 回到最上面。?static、減少動態時直接跳。
     2. 漢堡選單：開啟時漢堡變 X、面板由右滑入、選項依序進場（CSS）；點選項先收選單再捲動；
        點遮罩、按 Esc、視窗放寬到有導覽時關閉；開著時鎖住頁面捲動，焦點移進面板、關閉後回到漢堡鈕。 */
  var header = root.querySelector('.cl-hero__header');
  var menuBtn = root.querySelector('.cl-hero__menu');
  var menu = document.getElementById('cl-menu');
  var scrollRaf = 0;

  function easeInOutCubic(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function scrollToHash(hash) {
    var target = hash === '#top' ? document.body : document.querySelector(hash);
    if (!target) return;
    var top = hash === '#top' ? 0 : Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - header.offsetHeight);
    cancelAnimationFrame(scrollRaf);
    if (!autoplay) { window.scrollTo(0, top); return; }
    var from = window.pageYOffset, dist = top - from, t0 = null;
    var dur = Math.min(1200, Math.max(600, Math.abs(dist) * .35));
    (function step(now) {
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, from + dist * easeInOutCubic(p));
      if (p < 1) scrollRaf = requestAnimationFrame(step);
    })(performance.now());
  }
  // 使用者自己滾輪／觸控時中止平滑捲動，不跟手勢搶
  ['wheel', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, function () { cancelAnimationFrame(scrollRaf); }, { passive: true });
  });

  function openMenu() {
    if (!menu) return;
    menu.style.setProperty('--cl-menu-top', header.offsetHeight + 'px');
    menu.hidden = false;
    menu.offsetWidth;   // 先套用起始位置再加 .is-open，滑入動畫才會播
    menu.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', '關閉選單');
    document.documentElement.style.overflow = 'hidden';
    var first = menu.querySelector('.cl-menu__link');
    if (first) first.focus({ preventScroll: true });
  }
  function closeMenu(restoreFocus) {
    if (!menu || menu.hidden) return;
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', '開啟選單');
    document.documentElement.style.overflow = '';
    var done = function () { if (!menu.classList.contains('is-open')) menu.hidden = true; };
    if (autoplay) setTimeout(done, 600); else done();
    if (restoreFocus) menuBtn.focus({ preventScroll: true });
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      if (menu.classList.contains('is-open')) closeMenu(true); else openMenu();
    });
    menu.addEventListener('click', function (e) { if (e.target.hasAttribute('data-menu-close')) closeMenu(true); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(true); });
    // 放寬到有導覽的寬度（>1200）時，選單收起
    var wide = window.matchMedia('(min-width: 1201px)');
    var onWide = function () { if (wide.matches) closeMenu(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide); else if (wide.addListener) wide.addListener(onWide);
    // 焦點留在面板與 X 之間（Tab 循環）
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var items = [menuBtn].concat(Array.prototype.slice.call(menu.querySelectorAll('a, button')));
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 1) { e.preventDefault(); menuBtn.focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); menuBtn.focus(); }
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.cl-hero__header a[href^="#"], .cl-menu a[href^="#"]'), function (a) {
    var hash = a.getAttribute('href');
    if (hash.length < 2) return;   // 服務條款、登入、預約仍是 #（尚無頁面）
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var fromMenu = menu && menu.contains(a);
      if (fromMenu) closeMenu(false);
      scrollToHash(hash);
      if (history.replaceState) history.replaceState(null, '', hash === '#top' ? location.pathname + location.search : hash);
    });
  });
})();
