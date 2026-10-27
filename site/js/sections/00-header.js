/* 00 共用 header（首頁與服務條款頁）：錨點平滑捲動＋漢堡選單
   R3：從 01-hero.js 搬出來，改用 document 範圍，服務條款頁（沒有 .cl-hero）也能用。
   服務條款頁的錨點寫成 index.html#about（不是 # 開頭），會正常換頁，不走平滑捲動。 */
(function () {
  if (!document.querySelector('.cl-hero__header')) return;
  var html = document.documentElement;
  var autoplay = !html.classList.contains('is-static') &&
    !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- header 錨點與漢堡選單（R2 客戶） ----------
     1. header／選單內的 #錨點：平滑捲動到段落（扣掉固定 header 高），時長依距離 .6–1.2s、easeInOutCubic；
        #top 回到最上面。?static、減少動態時直接跳。
     2. 漢堡選單：開啟時漢堡變 X、面板由右滑入、選項依序進場（CSS）；點選項先收選單再捲動；
        點遮罩、按 Esc、視窗放寬到有導覽時關閉；開著時鎖住頁面捲動，焦點移進面板、關閉後回到漢堡鈕。 */
  var header = document.querySelector('.cl-hero__header');
  var menuBtn = document.querySelector('.cl-hero__menu');
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
