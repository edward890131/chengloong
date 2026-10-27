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
