
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

/* 03 從機密文件到日常用紙：手機版三張卡輪播（箭頭＋指示點，1695:19756） */
(function () {
  var root = document.querySelector('.cl-paper');
  if (!root) return;
  var track = root.querySelector('.cl-paper__grid');
  var steps = root.querySelectorAll('.cl-paper__step');
  var dots = root.querySelectorAll('.cl-paper__dot');
  var prev = root.querySelector('.cl-paper__arrow--prev');
  var next = root.querySelector('.cl-paper__arrow--next');
  if (!track || !steps.length) return;

  function current() {
    var w = steps[0].offsetWidth + 8; // 卡寬＋間距 8
    return w ? Math.round(track.scrollLeft / w) : 0;
  }
  function go(i) {
    i = Math.max(0, Math.min(steps.length - 1, i));
    track.scrollTo({ left: steps[i].offsetLeft - steps[0].offsetLeft });
  }
  function sync() {
    var i = current();
    dots.forEach(function (d, k) {
      d.classList.toggle('is-active', k === i);
      if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
    if (prev) prev.disabled = i <= 0;
    if (next) next.disabled = i >= steps.length - 1;
  }

  if (prev) prev.addEventListener('click', function () { go(current() - 1); });
  if (next) next.addEventListener('click', function () { go(current() + 1); });
  dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
  var t;
  track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(sync, 60); }, { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();

/* 04 服務流程：四格卡 hover／點擊展開、詳細流程頁籤切換、手機版動線圖滑動提示 */
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

  cards.forEach(function (card) {
    card.setAttribute('aria-expanded', card.classList.contains('is-active') ? 'true' : 'false');
    card.addEventListener('mouseenter', function () { if (canHover.matches) activateCard(card); });
    card.addEventListener('click', function () { activateCard(card); });
    card.addEventListener('focus', function () { activateCard(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateCard(card); }
    });
  });

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
    });
    if (focus) tab.focus();
    // 手機版頁籤列可橫向捲動：把選中的頁籤捲進可視範圍
    if (tabList && tabList.scrollWidth > tabList.clientWidth) {
      var left = tab.offsetLeft - (tabList.clientWidth - tab.offsetWidth) / 2;
      tabList.scrollTo({ left: Math.max(0, left), behavior: document.documentElement.classList.contains('is-static') ? 'auto' : 'smooth' });
    }
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

  /* ---------- 當天進場流程：滑動後淡出「可左右滑動查看」 ---------- */
  var route = root.querySelector('.cl-process__route');
  var scroller = root.querySelector('.cl-process__route-scroll');
  if (route && scroller) {
    scroller.addEventListener('scroll', function () {
      route.classList.toggle('is-scrolled', scroller.scrollLeft > 8);
    }, { passive: true });
  }
})();

/* 05 綠點存摺與憑證（負責人 D）
   1. card_greebpt 兩張圖輪播：點擊切換，或每 6 秒自動切換（Figma：ON_CLICK／AFTER_TIMEOUT 6s，Smart animate 0.3s ease-out）
      ?static（.is-static）不自動切換，停在第一張。
   2. 手機版卡片橫向捲動：左右箭頭與頁碼點跟著捲動位置更新。 */
(function () {
  var root = document.querySelector('.cl-green');
  if (!root) return;
  var isStatic = document.documentElement.classList.contains('is-static');

  /* ---------- 圖卡輪播 ---------- */
  var slider = root.querySelector('.cl-green__slider');
  if (slider) {
    var slides = slider.querySelectorAll('.cl-green__slide');
    var dots = slider.querySelectorAll('.cl-green__dot');
    var current = 0;
    var timer = null;

    var show = function (i) {
      current = (i + slides.length) % slides.length;
      for (var k = 0; k < slides.length; k++) {
        slides[k].classList.toggle('is-active', k === current);
        if (dots[k]) dots[k].classList.toggle('is-active', k === current);
      }
    };
    var restart = function () {
      if (isStatic) return;
      clearInterval(timer);
      timer = setInterval(function () { show(current + 1); }, 6000);
    };

    slider.addEventListener('click', function () { show(current + 1); restart(); });
    restart();
  }

  /* ---------- 手機版卡片捲動 ---------- */
  var track = root.querySelector('.cl-green__cards');
  var prev = root.querySelector('.cl-green__arrow--prev');
  var next = root.querySelector('.cl-green__arrow--next');
  var pagerDots = root.querySelectorAll('.cl-green__pager-dot');
  var cards = root.querySelectorAll('.cl-green__card');
  if (!track || !cards.length) return;

  var activeIndex = function () {
    var max = track.scrollWidth - track.clientWidth;
    if (max <= 0) return 0;
    if (track.scrollLeft >= max - 2) return cards.length - 1;
    var step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
    return Math.round(track.scrollLeft / step);
  };
  var update = function () {
    var i = activeIndex();
    for (var k = 0; k < pagerDots.length; k++) pagerDots[k].classList.toggle('is-active', k === i);
    if (prev) prev.disabled = i <= 0;
    if (next) next.disabled = i >= cards.length - 1;
  };
  var go = function (dir) {
    var i = Math.max(0, Math.min(cards.length - 1, activeIndex() + dir));
    track.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: isStatic ? 'auto' : 'smooth' });
  };

  if (prev) prev.addEventListener('click', function () { go(-1); });
  if (next) next.addEventListener('click', function () { go(1); });
  track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
  update();
})();

/* 07 faq（負責人 E）：分類頁籤切換＋手風琴展開收合 */
(function () {
  var root = document.querySelector('.cl-faq');
  if (!root) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll('.cl-faq__tab'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('.cl-faq__list'));

  // 其他分類稿上沒有題目（待使用者補）：先複製第一組，題目全部收合
  var source = panels[0];
  panels.slice(1).forEach(function (panel) {
    if (panel.children.length) return;
    Array.prototype.forEach.call(source.children, function (item) {
      var clone = item.cloneNode(true);
      clone.classList.remove('is-open');
      clone.removeAttribute('data-figma');
      clone.removeAttribute('data-figma-s');
      clone.querySelector('.cl-faq__q').setAttribute('aria-expanded', 'false');
      panel.appendChild(clone);
    });
  });

  function select(index) {
    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      if (panels[i]) panels[i].hidden = !on;
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(i); });
    tab.addEventListener('keydown', function (e) {
      var next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
      if (next === null) return;
      next = (next + tabs.length) % tabs.length;
      select(next);
      tabs[next].focus();
      e.preventDefault();
    });
  });

  // 手風琴：各題獨立展開收合
  root.addEventListener('click', function (e) {
    var q = e.target.closest('.cl-faq__q');
    if (!q || !root.contains(q)) return;
    var item = q.closest('.cl-faq__item');
    var open = !item.classList.contains('is-open');
    item.classList.toggle('is-open', open);
    q.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

/* 09 footer（負責人 E）：回頂部 */
(function () {
  var root = document.querySelector('.cl-footer');
  if (!root) return;
  var btn = root.querySelector('.cl-footer__top');
  if (!btn) return;
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var smooth = !document.documentElement.classList.contains('is-static') &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  });
})();
