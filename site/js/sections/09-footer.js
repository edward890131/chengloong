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
