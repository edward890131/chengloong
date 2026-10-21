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
