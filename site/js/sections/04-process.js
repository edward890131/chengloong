/* 04 服務流程：四格卡 hover／點擊展開、詳細流程頁籤切換、手機版動線圖滑動提示
   R1：滑鼠移開四格卡區域回到第 1 格；切換頁籤時畫面內的 reveal 文字直接播放
   R2：頁籤選中底色交給 base 的 .cl-tabfill（圓形填色）；展開卡弧線一展開就描線一次（CSS），
       四格卡進畫面才加 .is-inview 開始播；頁籤 3 流程圖與說明分開滑動，提示只跟流程圖；四格卡每 8 秒自動輪播 */
(function () {
  var root = document.querySelector('.cl-process');
  if (!root) return;

  /* ---------- 服務流程B：同時只展開一格，預設第 1 格（主畫面狀態） ---------- */
  var cards = Array.prototype.slice.call(root.querySelectorAll('.cl-process__card'));
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

  function activateCard(card) {
    if (card.classList.contains('is-active')) return;
    cards.forEach(function (c) {
      var on = c === card;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  }

  // 滑鼠移開四格卡區域：回到預設的第 1 格（客戶 R1）。只在滑鼠裝置作用，觸控點選的狀態保留
  var cardList = root.querySelector('.cl-process__cards');

  // 展開卡弧線描線：四格卡進到畫面才開始播（預設展開的第 1 格不會在畫面外先畫完）
  if (cardList) {
    var markInView = function () { cardList.classList.add('is-inview'); };
    var skipAnim = document.documentElement.classList.contains('is-static') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window);
    if (skipAnim) markInView();
    else {
      var cardIO = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { markInView(); cardIO.disconnect(); }
      }, { threshold: .3 });
      cardIO.observe(cardList);
    }
  }

  if (cardList && cards.length) {
    cardList.addEventListener('mouseleave', function () { if (canHover.matches) activateCard(cards[0]); });
  }

  cards.forEach(function (card) {
    card.setAttribute('aria-expanded', card.classList.contains('is-active') ? 'true' : 'false');
    card.addEventListener('mouseenter', function () { if (canHover.matches) activateCard(card); });
    card.addEventListener('click', function () { activateCard(card); });
    card.addEventListener('focus', function () { activateCard(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateCard(card); }
    });
  });

  /* ---------- 自動輪播（客戶 R2）：每 8 秒換到下一格，最後一格之後回到第 1 格 ----------
     四格卡在畫面內才播。滑鼠移到某格（展開它）、點擊、觸控、鍵盤選取，都從那一格重新計時 8 秒；
     滑鼠停在卡上不暫停（四格卡很大，捲動時滑鼠幾乎一定停在上面，暫停會讓輪播永遠不動）。
     ?static 與減少動態不輪播。 */
  var AUTOPLAY_MS = 8000;
  var autoplay = cardList && cards.length > 1 &&
    !document.documentElement.classList.contains('is-static') &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (autoplay) {
    var timer = 0, inView = false;
    var stop = function () { clearInterval(timer); timer = 0; };
    var start = function () {
      stop();
      if (!inView) return;
      timer = setInterval(function () {
        var i = cards.findIndex(function (c) { return c.classList.contains('is-active'); });
        activateCard(cards[(i + 1) % cards.length]);
      }, AUTOPLAY_MS);
    };
    cardList.addEventListener('mouseleave', start);
    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () { if (canHover.matches) start(); });
      card.addEventListener('click', start);
      card.addEventListener('focus', start);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) start(); else stop();
      }, { threshold: .3 }).observe(cardList);
    } else {
      inView = true;
      start();
    }
  }

  /* ---------- 詳細服務流程_B：頁籤，預設「線上預約步驟」 ---------- */
  var tabList = root.querySelector('.cl-process__tabs');
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.cl-process__tab'));

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
      if (panel && on) revealInView(panel);
    });
    if (focus) tab.focus();
    // 手機版頁籤列可橫向捲動：把選中的頁籤捲進可視範圍
    if (tabList && tabList.scrollWidth > tabList.clientWidth) {
      var left = tab.offsetLeft - (tabList.clientWidth - tab.offsetWidth) / 2;
      tabList.scrollTo({ left: Math.max(0, left), behavior: document.documentElement.classList.contains('is-static') ? 'auto' : 'smooth' });
    }
  }

  // 切換頁籤：新面板裡已在畫面內的 [data-reveal] 直接播放（base 的觀察點在畫面 2/3，面板下半部不用等捲動）
  function revealInView(panel) {
    requestAnimationFrame(function () {
      Array.prototype.forEach.call(panel.querySelectorAll('[data-reveal]:not(.is-revealed)'), function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-revealed');
      });
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ---------- 當天進場流程：滑動流程圖後淡出「可左右滑動查看」（R2：說明區另有自己的捲動區，不影響提示） ---------- */
  var route = root.querySelector('.cl-process__route');
  var scroller = root.querySelector('.cl-process__route-scroll--map');
  if (route && scroller) {
    scroller.addEventListener('scroll', function () {
      route.classList.toggle('is-scrolled', scroller.scrollLeft > 8);
    }, { passive: true });
  }
})();
