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
