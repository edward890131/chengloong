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
    // 元素頂端捲到畫面 55% 高時播放（客戶 R2：比原本的 2/3 晚一點）
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -45% 0px' });
    reveals.forEach(function (el) {
      // 載入時已在觸發線上方的元素直接播放
      if (el.getBoundingClientRect().top < window.innerHeight * .55) show(el);
      else io.observe(el);
    });
    // 錨點跳轉、scrollIntoView 這類直接跳過觸發線的情況：已在觸發線上方的一律顯示
    var pending = 0;
    window.addEventListener('scroll', function () {
      if (pending) return;
      pending = requestAnimationFrame(function () {
        pending = 0;
        var line = window.innerHeight * .55;
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
        var d = Math.ceil(Math.hypot(tab.offsetWidth / 2, tab.offsetHeight) * 2) + 2;
        tab.style.setProperty('--cl-tabfill-d', d + 'px');
      });
    }
    size();
    window.addEventListener('resize', size);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  });

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
