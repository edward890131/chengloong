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
  if (isStatic || reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(show);
  } else {
    // 觸發線：元素頂端捲到畫面這個高度時播放。
    // 電腦版 55%（客戶 R2：比原本的 2/3 晚一點）；平板與手機（≤1100）改回 2/3＝距畫面底部 1/3（客戶 R2：手機太晚出現）。
    // 依載入時的寬度決定（IntersectionObserver 的 rootMargin 建好後不能改）
    var LINE = window.matchMedia('(max-width: 1100px)').matches ? 2 / 3 : .55;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -' + ((1 - LINE) * 100).toFixed(2) + '% 0px' });
    reveals.forEach(function (el) {
      // 載入時已在觸發線上方的元素直接播放
      if (el.getBoundingClientRect().top < window.innerHeight * LINE) show(el);
      else io.observe(el);
    });
    // 錨點跳轉、scrollIntoView 這類直接跳過觸發線的情況：已在觸發線上方的一律顯示
    var pending = 0;
    window.addEventListener('scroll', function () {
      if (pending) return;
      pending = requestAnimationFrame(function () {
        pending = 0;
        var line = window.innerHeight * LINE;
        reveals.forEach(function (el) {
          if (!el.classList.contains('is-revealed') && el.getBoundingClientRect().top < line) { show(el); io.unobserve(el); }
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
