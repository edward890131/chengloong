(window.clWhenReady || function (fn) { fn(); })(function () {
/* ==========================================================================
   base.js（主控負責）：全站共用動態，用法見 base.css 同名區塊
   ========================================================================== */
(function () {
  var html = document.documentElement;
  var isStatic = html.classList.contains('is-static');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 進場 mask reveal up ---------- */
  var reveals = [].slice.call(document.querySelectorAll('[data-reveal]'));
  reveals.forEach(function (el) {
    if (el.getAttribute('data-reveal') !== 'fade') {
      var inner = document.createElement('span');
      inner.className = 'cl-rv__in';
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
    }
    var delay = el.getAttribute('data-reveal-delay');
    if (delay === null) {
      var group = el.closest('[data-reveal-group]');
      if (group) delay = [].indexOf.call(group.querySelectorAll('[data-reveal]'), el) * 80;
    }
    if (delay) el.style.setProperty('--cl-rv-delay', delay + 'ms');
  });
  var show = function (el) { el.classList.add('is-revealed'); };
  /* R2 客戶：觸發時機以「區塊」為單位，不再每個元素各自計算。
     觸發區＝最近的 [data-reveal-trigger]（例：一整排牌卡），沒有就用最近的 [data-reveal-group]（例：段落標題＋副標），
     都沒有才是元素自己。區塊上緣捲到觸發線時，區塊內所有 [data-reveal] 一起開始（各自的 --cl-rv-delay 照舊，群組內 .08s 錯開） */
  var triggers = new Map();
  reveals.forEach(function (el) {
    var t = el.closest('[data-reveal-trigger]') || el.closest('[data-reveal-group]') || el;
    if (!triggers.has(t)) triggers.set(t, []);
    triggers.get(t).push(el);
  });
  var fire = function (t) {
    var list = triggers.get(t);
    if (!list || t.__clRevealed) return;
    t.__clRevealed = true;
    list.forEach(show);
    t.dispatchEvent(new CustomEvent('cl:reveal'));   // 段落 JS 可跟著觸發區一起播自己的動態（例：關於四張卡 icon）
  };
  // 給段落 JS 用：把某個 reveal 元素所在的整個觸發區一起播放（例：切換頁籤時新面板已在畫面內）
  window.clRevealWith = function (el) {
    var t = el.closest('[data-reveal-trigger]') || el.closest('[data-reveal-group]') || el;
    if (triggers.has(t)) { fire(t); if (io) io.unobserve(t); } else show(el);
  };
  var io = null;
  if (isStatic || reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(show);
  } else {
    // 觸發線：區塊上緣捲到畫面 2/3 高（距畫面底部 1/3）時播放，全寬度一致
    // （客戶 R2：電腦版原本 55% 太晚，改回與平板、手機相同）
    var LINE = 2 / 3;
    // 區塊在隱藏面板裡（頁籤）時量不到位置：用第一個看得到的子元素位置代表，都看不到就等 IO
    var topOf = function (t) {
      var r = t.getBoundingClientRect();
      return r.height || r.width ? r.top : Infinity;
    };
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { fire(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -' + ((1 - LINE) * 100).toFixed(2) + '% 0px' });
    triggers.forEach(function (_, t) {
      // 載入時已在觸發線上方的區塊直接播放
      if (topOf(t) < window.innerHeight * LINE) fire(t);
      else io.observe(t);
    });
    // 錨點跳轉、scrollIntoView 這類直接跳過觸發線的情況：已在觸發線上方的區塊一律播放
    var pending = 0;
    window.addEventListener('scroll', function () {
      if (pending) return;
      pending = requestAnimationFrame(function () {
        pending = 0;
        var line = window.innerHeight * LINE;
        triggers.forEach(function (_, t) {
          if (!t.__clRevealed && topOf(t) < line) { fire(t); io.unobserve(t); }
        });
      });
    }, { passive: true });
  }

  /* ---------- 頁籤圓形填色 .cl-tabfill（客戶 R2：取代果凍頁籤，效果同按鈕 hover 的圓） ----------
     每個頁籤底部放一顆圓（.cl-tabfill__circle），選中時放大填滿頁籤；圓的直徑依頁籤對角線算，寬窄頁籤都填得滿 */
  [].forEach.call(document.querySelectorAll('.cl-tabfill'), function (list) {
    var tabs = [].slice.call(list.children);
    tabs.forEach(function (tab) {
      var c = document.createElement('span');
      c.className = 'cl-tabfill__circle';
      c.setAttribute('aria-hidden', 'true');
      tab.insertBefore(c, tab.firstChild);
    });
    function size() {
      tabs.forEach(function (tab) {
        var d = Math.ceil(Math.hypot(tab.offsetWidth / 2 + 24, tab.offsetHeight) * 2);   // 多留 24px：頁籤選中後可能變寬（例如多一個白點）
        tab.style.setProperty('--cl-tabfill-d', d + 'px');
      });
    }
    size();
    window.addEventListener('resize', size);
    // 頁籤列放在隱藏的面板裡時（例：服務流程頁籤 3 的家紙／工紙），載入時量到的寬是 0：顯示出來、尺寸改變時重量
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(list);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  });

  /* ---------- 弧線進畫面才描線（R2）：以弧線所在段落為準，上緣進到畫面 70% 處開始；SVG 本身很大，不能直接觀察 ---------- */
  if ('IntersectionObserver' in window) {
    var curveMap = new Map();
    [].forEach.call(document.querySelectorAll('.cl-curve:not(.cl-process__card-curve)'), function (svg) {
      var sec = svg.closest('section') || svg.parentNode;
      if (!curveMap.has(sec)) curveMap.set(sec, []);
      curveMap.get(sec).push(svg);
    });
    document.documentElement.classList.add('has-curve-io');
    var curveIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        curveMap.get(en.target).forEach(function (svg) { svg.classList.add('is-inview'); });
        curveIO.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -30% 0px' });
    curveMap.forEach(function (_, sec) { curveIO.observe(sec); });
  }

  /* ---------- 圖片載入 skeleton ---------- */
  [].forEach.call(document.querySelectorAll('.cl-skeleton'), function (box) {
    var imgs = [].slice.call(box.querySelectorAll('img'));
    var done = function () {
      if (imgs.every(function (i) { return i.complete && i.naturalWidth; })) box.classList.add('is-loaded');
    };
    imgs.forEach(function (i) { i.addEventListener('load', done); i.addEventListener('error', function () { box.classList.add('is-loaded'); }); });
    done();
  });
})();

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

  /* ---------- 手機版三顆標籤：點擊往下展開說明（R3 客戶）----------
     同時只開一個；再點同一顆、點外面、按 Esc 收起。箭頭位置＝點的那顆標籤中心（相對標籤列） */
  var tagBtns = Array.prototype.slice.call(root.querySelectorAll('.cl-hero__tags .cl-hero__tag'));
  var tagTip = root.querySelector('.cl-hero__tag-tip');
  if (tagBtns.length && tagTip) {
    var tagBody = tagTip.querySelector('.cl-hero__tag-tip-body');
    var closeTag = function () {
      tagTip.classList.remove('is-open');
      tagBtns.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    };
    tagBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (btn.getAttribute('aria-expanded') === 'true') { closeTag(); return; }
        closeTag();
        tagBody.textContent = btn.getAttribute('data-tip');
        var list = btn.closest('.cl-hero__tags').getBoundingClientRect(), r = btn.getBoundingClientRect();
        tagTip.style.setProperty('--cl-tag-x', (r.left + r.width / 2 - list.left) + 'px');
        btn.setAttribute('aria-expanded', 'true');
        tagTip.classList.add('is-open');
      });
    });
    document.addEventListener('click', closeTag);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeTag(); });
  }
})();

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

/* 02 關於：四張卡 icon 動態（R2 客戶）——跟卡片文字同一個觸發區（.cl-about__cards）一起進場，滑鼠移到卡片上重播。
   ?static／減少動態：不加 .is-armed，icon 維持完成狀態。CSS 見 02-about.css「四張卡 icon 動態」 */
(function () {
  var list = document.querySelector('.cl-about__cards');
  if (!list) return;
  var html = document.documentElement;
  if (html.classList.contains('is-static') || window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)) return;
  var cards = Array.prototype.slice.call(list.querySelectorAll('.cl-about__card'));
  list.classList.add('is-armed');
  var play = function () { cards.forEach(function (c) { c.classList.add('is-play'); }); };
  list.addEventListener('cl:reveal', play);
  // 載入時觸發區已在觸發線上方：base.js 比這裡早跑完，事件已錯過 → 看文字是否已進場
  if (list.querySelector('[data-reveal].is-revealed')) play();
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      if (!canHover.matches || !card.classList.contains('is-play')) return;
      card.classList.remove('is-play');
      void card.offsetWidth;   // 重新套用初始狀態，動畫才會從頭播
      card.classList.add('is-play');
    });
  });
})();

/* 02 關於：手機版循環圖「直式／橫式滑動」切換（R3 客戶，比對用；切換鈕只在手機顯示）
   預設橫式滑動：開場把捲動位置放到中間圓幣（∞ 交會點）。電腦與平板不受影響（一律橫式圖）。 */
(function () {
  var cycle = document.querySelector('.cl-about__cycle');
  if (!cycle) return;
  var btns = Array.prototype.slice.call(cycle.querySelectorAll('.cl-about__cycle-mode-btn'));
  var scroller = cycle.querySelector('.cl-about__cycle-img');
  var stage = cycle.querySelector('.cl-about__cycle-stage');
  function center() {
    if (!cycle.classList.contains('is-h') || scroller.scrollWidth <= scroller.clientWidth) return;
    // 圓幣在 1200 寬圖的 x≈600（中線）
    scroller.scrollLeft = stage.offsetLeft + stage.offsetWidth / 2 - scroller.clientWidth / 2;
  }
  function setMode(m) {
    cycle.classList.toggle('is-h', m === 'h');
    btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mode') === m ? 'true' : 'false'); });
    requestAnimationFrame(function () { center(); window.dispatchEvent(new Event('resize')); });   // resize：讓 Lottie 依新尺寸重算
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); }); });
  setMode('h');
  window.addEventListener('load', center);
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
    requestAnimationFrame(placeMap);   // 當天進場流程：手機版流程圖起始位置（見下方）
    // 手機版頁籤列可橫向捲動：把選中的頁籤捲進可視範圍
    if (tabList && tabList.scrollWidth > tabList.clientWidth) {
      var left = tab.offsetLeft - (tabList.clientWidth - tab.offsetWidth) / 2;
      tabList.scrollTo({ left: Math.max(0, left), behavior: document.documentElement.classList.contains('is-static') ? 'auto' : 'smooth' });
    }
  }

  // 切換頁籤：新面板裡已在畫面內的 [data-reveal] 連同所在觸發區直接播放（不用等捲動到觸發線）
  function revealInView(panel) {
    requestAnimationFrame(function () {
      Array.prototype.forEach.call(panel.querySelectorAll('[data-reveal]:not(.is-revealed)'), function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) window.clRevealWith(el);   // 同一觸發區（例：整排步驟）一起播
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

  /* ---------- 當天進場流程：家紙／工紙切換（R2）——只換流程圖（交叉淡入），下方 01–06 說明固定 ----------
     切換動態移植自 React Bits「Rubber Segment」（MIT＋Commons Clause，© David Haz）：
     點擊：綠塊左右緣先在 .19s 內拉到同時蓋住新舊兩格，.15s 後交棒給彈簧——前緣落到新格，後緣多衝 3px 再回彈。
     拖曳選中的綠塊：可左右拖，超出兩端有橡皮筋阻力；放開依位置＋甩動速度吸附到最近的一格。
     ?static、減少動態：直接跳到位。 */
  var paper = root.querySelector('.cl-process__paper');
  var mapImgs = Array.prototype.slice.call(root.querySelectorAll('.cl-process__map-img'));
  if (paper) (function () {
    var btns = Array.prototype.slice.call(paper.querySelectorAll(':scope > .cl-process__paper-btn'));
    var thumb = paper.querySelector('.cl-process__paper-thumb');
    var INSET = 4, STRETCH = 1, SQUASH = 3, DILATE = 190, HANDOFF = 150, FLICK = 110, MAX_V = 2000, DEADZONE = 4, SLOP = 10, RUBBER = .55;
    var still = document.documentElement.classList.contains('is-static') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var slots = [], innerW = 0, current = 0, handoffTimer = 0, gen = 0, drag = null;

    // 一個邊緣＝位置＋速度；tween（拉長）或彈簧（落位）二選一驅動
    function Edge() { this.x = 0; this.v = 0; this.run = null; }
    var L = new Edge(), R = new Edge();
    var raf = 0;
    function paint() {
      thumb.style.clipPath = 'inset(0 ' + Math.max(0, innerW - R.x) + 'px 0 ' + Math.max(0, L.x) + 'px round 999px)';
    }
    function tick(now) {
      raf = 0;
      [L, R].forEach(function (e) { if (e.run) e.run(e, now); });
      paint();
      if (L.run || R.run) raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    function stop(e) { e.run = null; e.v = 0; }
    function jump(e, x) { stop(e); e.x = x; }
    // easeOut cubic-bezier(.23,1,.32,1) 近似（easeOutQuint）
    function tween(e, to, ms) {
      var from = e.x, t0 = null;
      e.run = function (e, now) {
        if (t0 === null) t0 = now;
        var p = Math.min(1, (now - t0) / ms), q = 1 - Math.pow(1 - p, 5);
        var nx = from + (to - from) * q;
        e.v = (nx - e.x) * 60; e.x = nx;
        if (p >= 1) { e.run = null; e.v = 0; }
      };
      kick();
    }
    // Motion 的時長型彈簧：剛度 (2π/時長)²、阻尼 2(1−彈性)√剛度
    function spring(e, to, sec, bounce, v, done) {
      var k = Math.pow(2 * Math.PI / sec, 2), c = 2 * (1 - bounce) * Math.sqrt(k), last = null;
      if (v !== null) e.v = Math.max(-MAX_V, Math.min(MAX_V, v));
      e.run = function (e, now) {
        var dt = last === null ? 1 / 60 : Math.min(.032, (now - last) / 1000); last = now;
        for (var i = 0; i < 4; i++) {   // 小步積分，穩定
          var h = dt / 4, a = -k * (e.x - to) - c * e.v;
          e.v += a * h; e.x += e.v * h;
        }
        if (Math.abs(e.x - to) < .1 && Math.abs(e.v) < 2) { e.x = to; e.v = 0; e.run = null; if (done) done(); }
      };
      kick();
    }

    function measure() {
      var box = paper.getBoundingClientRect();
      if (!box.width) return;
      innerW = box.width - INSET * 2;
      slots = btns.map(function (b) {
        var r = b.getBoundingClientRect();
        return { l: r.left - box.left - INSET, r: r.right - box.left - INSET };
      });
      if (!drag) { gen++; clearTimeout(handoffTimer); jump(L, slots[current].l); jump(R, slots[current].r); paint(); }
    }

    function select(i) {
      if (i === current) return false;
      current = i;
      btns.forEach(function (b, j) {
        b.setAttribute('aria-checked', j === i ? 'true' : 'false');
        b.tabIndex = j === i ? 0 : -1;
      });
      var key = btns[i].getAttribute('data-paper');
      mapImgs.forEach(function (img) { img.classList.toggle('is-active', img.getAttribute('data-paper') === key); });
      resetMap();   // R2 客戶：切換家紙／工紙時，流程圖平滑捲回起始位置（見下方 placeMap）
      return true;
    }

    function land(to, v, flick, withSquash) {
      var b = slots[to], g = ++gen;
      var dir = Math.sign((b.l + b.r) / 2 - (L.x + R.x) / 2) || 1;
      var lead = dir > 0 ? R : L, leadTo = dir > 0 ? b.r : b.l;
      var trail = dir > 0 ? L : R, trailTo = dir > 0 ? b.l : b.r;
      spring(lead, leadTo, flick ? .4 : .3, flick ? .2 : 0, v);
      if (!withSquash) { spring(trail, trailTo, .3, 0, v); return; }
      spring(trail, trailTo + dir * SQUASH, .3, 0, v, function () {
        if (gen === g) spring(trail, trailTo, .16, 0, null);
      });
    }

    function travel(from, to) {
      var a = slots[from], b = slots[to];
      clearTimeout(handoffTimer); gen++;
      if (still) { jump(L, b.l); jump(R, b.r); paint(); return; }
      tween(L, b.l + (Math.min(a.l, b.l) - b.l) * STRETCH, DILATE);
      tween(R, b.r + (Math.max(a.r, b.r) - b.r) * STRETCH, DILATE);
      handoffTimer = setTimeout(function () { land(to, null, false, true); }, HANDOFF);
    }

    function localX(e) { return e.clientX - paper.getBoundingClientRect().left - INSET; }
    function rubber(over, dim) { return (over * dim * RUBBER) / (dim + RUBBER * Math.abs(over)); }
    function nearest(x) {
      var best = 0;
      slots.forEach(function (s, i) { if (Math.abs((s.l + s.r) / 2 - x) < Math.abs((slots[best].l + slots[best].r) / 2 - x)) best = i; });
      return best;
    }
    function velocity(hist, now) {
      var recent = hist.filter(function (h) { return now - h[0] <= 100; });
      if (recent.length < 2) return 0;
      var a = recent[0], b = recent[recent.length - 1];
      return b[0] - a[0] >= 8 ? (b[1] - a[1]) / (b[0] - a[0]) * 1000 : 0;
    }
    function project(v) { var d = 1 - .1 * Math.pow(.05, .75); return (v / 1000) * d / (1 - d); }

    btns.forEach(function (btn, i) {
      btn.addEventListener('pointerdown', function (e) {
        if (drag || e.button !== 0) return;
        try { btn.setPointerCapture(e.pointerId); } catch (err) {}
        var x = localX(e);
        var onThumb = x >= L.x && x <= R.x;
        drag = { id: e.pointerId, x0: x, slot: i, onThumb: onThumb, live: false, offset: 0, w: 0, hist: [[e.timeStamp, x]] };
        if (onThumb) { clearTimeout(handoffTimer); gen++; stop(L); stop(R); }
        else if (!still) btn.classList.add('is-pressed');
      });
      btn.addEventListener('pointermove', function (e) {
        var d = drag;
        if (!d || e.pointerId !== d.id || !d.onThumb) return;
        var x = localX(e);
        d.hist.push([e.timeStamp, x]); if (d.hist.length > 8) d.hist.shift();
        if (!d.live) {
          if (Math.abs(x - d.x0) < DEADZONE) return;
          d.live = true; d.offset = x - L.x; d.w = R.x - L.x;
          paper.classList.add('is-held');
        }
        var l = x - d.offset, maxL = innerW - d.w;
        if (still) { l = Math.max(0, Math.min(maxL, l)); L.x = l; R.x = l + d.w; }
        else if (l < 0) { L.x = 0; R.x = d.w - rubber(-l, d.w); }
        else if (l > maxL) { R.x = innerW; L.x = maxL + rubber(l - maxL, d.w); }
        else { L.x = l; R.x = l + d.w; }
        paint();
      });
      function release() {
        var d = drag; drag = null;
        paper.classList.remove('is-held');
        btns[d.slot].classList.remove('is-pressed');
        return d;
      }
      btn.addEventListener('pointerup', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = release(), x = localX(e);
        if (!d.live) {
          var from = current;
          if (Math.abs(x - d.x0) <= SLOP && select(d.slot)) travel(from, d.slot);
          return;
        }
        var v = velocity(d.hist, e.timeStamp), flick = Math.abs(v) > FLICK;
        var to = nearest((L.x + R.x) / 2 + project(v));
        if (flick && to === current) to = Math.max(0, Math.min(btns.length - 1, to + Math.sign(v)));
        select(to);
        if (still) { jump(L, slots[to].l); jump(R, slots[to].r); paint(); }
        else land(to, v, flick, flick);
      });
      function cancel(e) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = release();
        if (d.live) land(current, null, false, false);
      }
      btn.addEventListener('pointercancel', cancel);
      btn.addEventListener('lostpointercapture', cancel);
      btn.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(btns.length - 1, current + 1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(0, current - 1);
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = btns.length - 1;
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); return; }   // 鍵盤選取走方向鍵（radio 群組慣例）
        if (next === null) return;
        e.preventDefault();
        var from = current;
        if (select(next)) travel(from, next);
        btns[next].focus({ preventScroll: true });
      });
    });

    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(paper);   // 面板從隱藏切到顯示時重量
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  })();

  /* ---------- 當天進場流程：手機版流程圖起始位置（「可左右滑動查看」提示固定顯示，R2） ---------- */
  var route = root.querySelector('.cl-process__route');
  var scroller = root.querySelector('.cl-process__route-scroll--map');
  // 手機版（≤640）流程圖起始位置對齊 Figma 2266:8754：圖在 343 框內 x −112.1 → 捲動區預設往左捲 30＋112.1。
  // 使用者自己捲動過就不再重設。「可左右滑動查看」提示固定顯示（R2 客戶），不再隨捲動淡出
  var mqPhone = window.matchMedia('(max-width: 640px)');
  var START = 142.1, startLeft = 0, userScrolled = false;
  function placeMap() {
    if (!scroller || userScrolled) return;
    startLeft = mqPhone.matches ? START : 0;
    scroller.scrollLeft = startLeft;
  }
  // 家紙／工紙切換：不管滑到哪，都平滑回到起始位置
  function resetMap() {
    if (!scroller) return;
    userScrolled = false;
    startLeft = mqPhone.matches ? START : 0;
    var still = document.documentElement.classList.contains('is-static') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scroller.scrollTo({ left: startLeft, behavior: still ? 'auto' : 'smooth' });
  }
  if (route && scroller) {
    scroller.addEventListener('scroll', function () {
      userScrolled = Math.abs(scroller.scrollLeft - startLeft) > 8;   // 捲回起始位置後視為沒捲過
    }, { passive: true });
    // 面板 3 預設隱藏（隱藏時設 scrollLeft 無效）：selectTab 每次切換後會呼叫 placeMap；視窗跨過 640 時也重放
    if (mqPhone.addEventListener) mqPhone.addEventListener('change', function () { userScrolled = false; placeMap(); });
    placeMap();
  }

  /* ---------- 「挑選到廠日期與時段」info tooltip（R2 客戶）：hover／focus 由 CSS 顯示；點擊切換（觸控用），點外面或 Esc 關閉 ---------- */
  Array.prototype.forEach.call(root.querySelectorAll('.cl-process__tip'), function (tip) {
    var btn = tip.querySelector('.cl-process__tip-btn');
    var set = function (open) { tip.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(!tip.classList.contains('is-open')); });
    document.addEventListener('click', function () { set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  });
})();

/* 05 綠點存摺與憑證（負責人 D）
   1. card_greebpt 兩張圖輪播：點擊切換，或每 6 秒自動切換（Figma：ON_CLICK／AFTER_TIMEOUT 6s，Smart animate 0.3s ease-out）
      ?static（.is-static）不自動切換，停在第一張。
   2. 手機版卡片橫向捲動：左右箭頭與頁碼點跟著捲動位置更新。
   3. R1：證明文件「查看」→ 彈窗（關閉鈕、點遮罩、Esc 關閉；開啟時鎖背景捲動、焦點移入，關閉後還原）。 */
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

  /* ---------- 證明文件彈窗 ---------- */
  var modal = root.querySelector('.cl-green__modal');
  var viewBtn = root.querySelector('.cl-green__doc-view');
  var doc = root.querySelector('.cl-green__doc');
  if (modal && viewBtn) {
    var closeBtn = modal.querySelector('.cl-green__modal-close');
    var body = modal.querySelector('.cl-green__modal-body');
    var lastFocus = null;
    var lock = { html: '', body: '', pad: '' };
    var hideTimer = null;

    var open = function () {
      if (!modal.hidden && modal.classList.contains('is-open')) return;
      clearTimeout(hideTimer);
      lastFocus = document.activeElement;
      // 鎖背景捲動：補上捲軸寬度避免版面跳動
      var sbw = window.innerWidth - document.documentElement.clientWidth;
      lock.html = document.documentElement.style.overflow;
      lock.body = document.body.style.overflow;
      lock.pad = document.body.style.paddingRight;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      if (sbw > 0) document.body.style.paddingRight = sbw + 'px';
      modal.hidden = false;
      body.scrollTop = 0;
      body.scrollLeft = 0;
      void modal.offsetWidth; // 先套用初始狀態再開，過場才會跑
      modal.classList.add('is-open');
      closeBtn.focus({ preventScroll: true });
      document.addEventListener('keydown', onKey);
    };
    var close = function () {
      if (modal.hidden) return;
      modal.classList.remove('is-open');
      document.removeEventListener('keydown', onKey);
      var done = function () {
        modal.hidden = true;
        document.documentElement.style.overflow = lock.html;
        document.body.style.overflow = lock.body;
        document.body.style.paddingRight = lock.pad;
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      };
      if (isStatic) done(); else hideTimer = setTimeout(done, 350);
    };
    var onKey = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); } // 彈窗內只有一個可聚焦元素
    };

    viewBtn.addEventListener('click', function (e) { e.stopPropagation(); open(); });
    // 觸控裝置：點整張證明圖也能開
    if (doc) doc.addEventListener('click', function () { open(); });
    [].forEach.call(modal.querySelectorAll('[data-close]'), function (el) { el.addEventListener('click', close); });
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

/* 07 faq（負責人 E）：分類頁籤切換＋手風琴展開收合
   頁籤選中底色由 base .cl-tabfill 的圓形填色處理（只切 .is-active）；展開高度過場在 CSS（grid-template-rows） */
(function () {
  var root = document.querySelector('.cl-faq');
  if (!root) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll('.cl-faq__tab'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('.cl-faq__list'));

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

/* 09 footer（負責人 E）：回頂部；標語跑馬燈 */
(function () {
  var root = document.querySelector('.cl-footer');
  if (!root) return;
  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- 回頂部 ---------- */
  var btn = root.querySelector('.cl-footer__top');
  if (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var smooth = !html.classList.contains('is-static') && !reduce.matches;
      window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    });
  }

  /* ---------- 標語跑馬燈（客戶 2026-10-20）＋寬螢幕放大填滿（客戶 R2 2026-10-21）----------
     句子在靜態排版下超出頁尾左右邊界就加 .is-marquee 輪播，速度固定 SPEED px/s；
     ?static 與減少動態不輪播。視窗縮放、字型載入後重新判斷。 */
  var SPEED = 37.2;   // 1339px／36s：手機版確認過的速度
  var text = root.querySelector('.cl-footer__slogan-text');
  if (!text) return;

  /* 寬螢幕放大填滿（客戶 R2）：句子在靜態排版放得下時，字級等比放大到左右各留 FILL_GUTTER；
     ?static 與減少動態也適用（這是排版，不是動態） */
  var FILL_GUTTER = 24;

  function update() {
    // 先回到靜態排版量字形範圍（不含跑馬燈間隔）
    root.classList.remove('is-marquee', 'is-fill');
    root.style.removeProperty('--cl-footer-slogan-fs');
    var range = document.createRange();
    range.selectNodeContents(text);
    var t = range.getBoundingClientRect();
    var box = root.getBoundingClientRect();
    var overflow = t.left < box.left - .5 || t.right > box.right + .5;
    if (!overflow) {
      var fs = parseFloat(getComputedStyle(text).fontSize);
      var target = box.width - FILL_GUTTER * 2;
      root.style.setProperty('--cl-footer-slogan-fs', (fs * target / t.width).toFixed(2) + 'px');
      root.classList.add('is-fill');
      // 字距是固定 px、不跟字級等比，第一次放大後再量一次校正
      var t2 = range.getBoundingClientRect();
      var fs2 = parseFloat(getComputedStyle(text).fontSize);
      root.style.setProperty('--cl-footer-slogan-fs', (fs2 * target / t2.width).toFixed(2) + 'px');
      return;
    }
    if (html.classList.contains('is-static') || reduce.matches) return;
    if (overflow) {
      root.classList.add('is-marquee');
      // 一輪距離＝一句加間隔（.is-marquee 時的 span 寬）
      var loop = text.getBoundingClientRect().width;
      root.style.setProperty('--cl-footer-marquee-dur', (loop / SPEED).toFixed(2) + 's');
    }
  }

  var frame = 0;
  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }
  // 手機捲動時網址列收合也會觸發 resize：只有寬度改變才重算，避免跑馬燈一直重頭開始
  var lastWidth = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    schedule();
  });
  if (reduce.addEventListener) reduce.addEventListener('change', schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  update();
})();

});
