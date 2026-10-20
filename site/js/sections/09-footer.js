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

  /* ---------- 標語跑馬燈（客戶 2026-10-20）----------
     句子在靜態排版下超出頁尾左右邊界就加 .is-marquee 輪播，速度固定 SPEED px/s；
     ?static 與減少動態不輪播。視窗縮放、字型載入後重新判斷。 */
  var SPEED = 37.2;   // 1339px／36s：手機版確認過的速度
  var text = root.querySelector('.cl-footer__slogan-text');
  if (!text) return;

  function update() {
    if (html.classList.contains('is-static') || reduce.matches) {
      root.classList.remove('is-marquee');
      return;
    }
    // 先回到靜態排版量字形範圍（不含跑馬燈間隔）
    root.classList.remove('is-marquee');
    var range = document.createRange();
    range.selectNodeContents(text);
    var t = range.getBoundingClientRect();
    var box = root.getBoundingClientRect();
    if (t.left < box.left - .5 || t.right > box.right + .5) {
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
