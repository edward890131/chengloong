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
    // 元素頂端進入畫面上方 2/3（＝滾過畫面 1/3）時播放
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -33.333% 0px' });
    reveals.forEach(function (el) {
      // 載入時已在畫面內的元素直接播放（首屏偏下的文字不必等捲動）
      if (el.getBoundingClientRect().top < window.innerHeight) show(el);
      else io.observe(el);
    });
  }

  /* ---------- 果凍頁籤 .cl-jelly ---------- */
  [].forEach.call(document.querySelectorAll('.cl-jelly'), function (list) {
    var pill = document.createElement('span');
    pill.className = 'cl-jelly__pill';
    pill.setAttribute('aria-hidden', 'true');
    list.insertBefore(pill, list.firstChild);
    var current = null;

    function place(animate) {
      var tab = list.querySelector(':scope > .is-active');
      if (!tab) { pill.style.opacity = '0'; return; }
      pill.style.opacity = '1';
      // 用 rect 量小數座標（offset* 會取整，pill 偏 1px）；可橫捲的頁籤列要加上 scroll 位移
      var lr = list.getBoundingClientRect(), tr = tab.getBoundingClientRect();
      var to = { x: tr.left - lr.left - list.clientLeft + list.scrollLeft, y: tr.top - lr.top - list.clientTop + list.scrollTop, w: tr.width, h: tr.height };
      var from = current;
      pill.style.width = to.w + 'px';
      pill.style.height = to.h + 'px';
      pill.style.transform = 'translate(' + to.x + 'px,' + to.y + 'px)';
      if (animate && from && pill.animate && !isStatic && !reduce && from.x !== to.x) {
        // 果凍：先拉長壓扁朝目標衝過頭，再回彈
        var dir = to.x > from.x ? 1 : -1;
        pill.animate([
          { width: from.w + 'px', transform: 'translate(' + from.x + 'px,' + from.y + 'px) scale(1, 1)' },
          { width: (Math.abs(to.x - from.x) * .55 + Math.max(from.w, to.w)) + 'px',
            transform: 'translate(' + (dir > 0 ? from.x : to.x) + 'px,' + to.y + 'px) scale(1, .82)', offset: .4 },
          { width: to.w + 'px', transform: 'translate(' + (to.x + dir * 6) + 'px,' + to.y + 'px) scale(1.04, .94)', offset: .72 },
          { width: to.w + 'px', transform: 'translate(' + to.x + 'px,' + to.y + 'px) scale(1, 1)' }
        ], { duration: 650, easing: 'cubic-bezier(.3, .7, .3, 1)' });
      }
      current = to;
    }

    place(false);
    // 段落 JS 只要切換 .is-active，pill 就會跟著走
    new MutationObserver(function () { place(true); })
      .observe(list, { subtree: true, attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', function () { place(false); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(false); });
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
