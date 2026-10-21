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
    var img = modal.querySelector('.cl-green__modal-img');
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
      modal.classList.remove('is-zoomed');
      body.scrollTop = 0;
      body.scrollLeft = 0;
      modal.classList.toggle('is-zoomable', body.clientWidth < 920);
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
    // 面板比原圖窄時，點圖切換原寸／符合寬度，放大後捲到點擊位置附近
    img.addEventListener('click', function (e) {
      if (!modal.classList.contains('is-zoomable')) return;
      var r = img.getBoundingClientRect();
      var fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
      var zoomed = modal.classList.toggle('is-zoomed');
      if (zoomed) {
        body.scrollLeft = fx * img.offsetWidth - body.clientWidth / 2;
        body.scrollTop = fy * img.offsetHeight - body.clientHeight / 2;
      }
    });
    window.addEventListener('resize', function () {
      if (!modal.hidden) modal.classList.toggle('is-zoomable', body.clientWidth < 920 || modal.classList.contains('is-zoomed'));
    });
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
