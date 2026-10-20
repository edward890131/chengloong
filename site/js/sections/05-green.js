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
