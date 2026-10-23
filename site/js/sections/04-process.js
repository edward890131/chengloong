/* 04 服務流程：四格卡 hover／點擊展開、詳細流程頁籤切換、手機版動線圖滑動提示
   R1：滑鼠移開四格卡區域回到第 1 格；切換頁籤時畫面內的 reveal 文字直接播放
   R2：頁籤選中底色交給 base 的 .cl-tabfill（圓形填色）；展開卡弧線一展開就描線一次（CSS），
       四格卡進畫面才加 .is-inview 開始播；頁籤 3 流程圖與說明分開滑動，提示只跟流程圖；四格卡每 8 秒自動輪播 */
(function () {
  var root = document.querySelector('.cl-process');
  if (!root) return;

  /* ---------- 服務流程B：同時只展開一格，預設第 1 格（主畫面狀態） ---------- */
  var cards = Array.prototype.slice.call(root.querySelectorAll('.cl-process__card'));
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

  function activateCard(card) {
    if (card.classList.contains('is-active')) return;
    cards.forEach(function (c) {
      var on = c === card;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  }

  // 滑鼠移開四格卡區域：回到預設的第 1 格（客戶 R1）。只在滑鼠裝置作用，觸控點選的狀態保留
  var cardList = root.querySelector('.cl-process__cards');

  // 展開卡弧線描線：四格卡進到畫面才開始播（預設展開的第 1 格不會在畫面外先畫完）
  if (cardList) {
    var markInView = function () { cardList.classList.add('is-inview'); };
    var skipAnim = document.documentElement.classList.contains('is-static') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window);
    if (skipAnim) markInView();
    else {
      var cardIO = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { markInView(); cardIO.disconnect(); }
      }, { threshold: .3 });
      cardIO.observe(cardList);
    }
  }

  if (cardList && cards.length) {
    cardList.addEventListener('mouseleave', function () { if (canHover.matches) activateCard(cards[0]); });
  }

  cards.forEach(function (card) {
    card.setAttribute('aria-expanded', card.classList.contains('is-active') ? 'true' : 'false');
    card.addEventListener('mouseenter', function () { if (canHover.matches) activateCard(card); });
    card.addEventListener('click', function () { activateCard(card); });
    card.addEventListener('focus', function () { activateCard(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateCard(card); }
    });
  });

  /* ---------- 自動輪播（客戶 R2）：每 8 秒換到下一格，最後一格之後回到第 1 格 ----------
     四格卡在畫面內才播。滑鼠移到某格（展開它）、點擊、觸控、鍵盤選取，都從那一格重新計時 8 秒；
     滑鼠停在卡上不暫停（四格卡很大，捲動時滑鼠幾乎一定停在上面，暫停會讓輪播永遠不動）。
     ?static 與減少動態不輪播。 */
  var AUTOPLAY_MS = 8000;
  var autoplay = cardList && cards.length > 1 &&
    !document.documentElement.classList.contains('is-static') &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (autoplay) {
    var timer = 0, inView = false;
    var stop = function () { clearInterval(timer); timer = 0; };
    var start = function () {
      stop();
      if (!inView) return;
      timer = setInterval(function () {
        var i = cards.findIndex(function (c) { return c.classList.contains('is-active'); });
        activateCard(cards[(i + 1) % cards.length]);
      }, AUTOPLAY_MS);
    };
    cardList.addEventListener('mouseleave', start);
    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () { if (canHover.matches) start(); });
      card.addEventListener('click', start);
      card.addEventListener('focus', start);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) start(); else stop();
      }, { threshold: .3 }).observe(cardList);
    } else {
      inView = true;
      start();
    }
  }

  /* ---------- 詳細服務流程_B：頁籤，預設「線上預約步驟」 ---------- */
  var tabList = root.querySelector('.cl-process__tabs');
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.cl-process__tab'));

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
      if (panel && on) revealInView(panel);
    });
    if (focus) tab.focus();
    requestAnimationFrame(placeMap);   // 當天進場流程：手機版流程圖起始位置（見下方）
    // 手機版頁籤列可橫向捲動：把選中的頁籤捲進可視範圍
    if (tabList && tabList.scrollWidth > tabList.clientWidth) {
      var left = tab.offsetLeft - (tabList.clientWidth - tab.offsetWidth) / 2;
      tabList.scrollTo({ left: Math.max(0, left), behavior: document.documentElement.classList.contains('is-static') ? 'auto' : 'smooth' });
    }
  }

  // 切換頁籤：新面板裡已在畫面內的 [data-reveal] 連同所在觸發區直接播放（不用等捲動到觸發線）
  function revealInView(panel) {
    requestAnimationFrame(function () {
      Array.prototype.forEach.call(panel.querySelectorAll('[data-reveal]:not(.is-revealed)'), function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) window.clRevealWith(el);   // 同一觸發區（例：整排步驟）一起播
      });
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ---------- 當天進場流程：家紙／工紙切換（R2）——只換流程圖（交叉淡入），下方 01–06 說明固定 ----------
     切換動態移植自 React Bits「Rubber Segment」（MIT＋Commons Clause，© David Haz）：
     點擊：綠塊左右緣先在 .19s 內拉到同時蓋住新舊兩格，.15s 後交棒給彈簧——前緣落到新格，後緣多衝 3px 再回彈。
     拖曳選中的綠塊：可左右拖，超出兩端有橡皮筋阻力；放開依位置＋甩動速度吸附到最近的一格。
     ?static、減少動態：直接跳到位。 */
  var paper = root.querySelector('.cl-process__paper');
  var mapImgs = Array.prototype.slice.call(root.querySelectorAll('.cl-process__map-img'));
  if (paper) (function () {
    var btns = Array.prototype.slice.call(paper.querySelectorAll(':scope > .cl-process__paper-btn'));
    var thumb = paper.querySelector('.cl-process__paper-thumb');
    var INSET = 4, STRETCH = 1, SQUASH = 3, DILATE = 190, HANDOFF = 150, FLICK = 110, MAX_V = 2000, DEADZONE = 4, SLOP = 10, RUBBER = .55;
    var still = document.documentElement.classList.contains('is-static') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var slots = [], innerW = 0, current = 0, handoffTimer = 0, gen = 0, drag = null;

    // 一個邊緣＝位置＋速度；tween（拉長）或彈簧（落位）二選一驅動
    function Edge() { this.x = 0; this.v = 0; this.run = null; }
    var L = new Edge(), R = new Edge();
    var raf = 0;
    function paint() {
      thumb.style.clipPath = 'inset(0 ' + Math.max(0, innerW - R.x) + 'px 0 ' + Math.max(0, L.x) + 'px round 999px)';
    }
    function tick(now) {
      raf = 0;
      [L, R].forEach(function (e) { if (e.run) e.run(e, now); });
      paint();
      if (L.run || R.run) raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    function stop(e) { e.run = null; e.v = 0; }
    function jump(e, x) { stop(e); e.x = x; }
    // easeOut cubic-bezier(.23,1,.32,1) 近似（easeOutQuint）
    function tween(e, to, ms) {
      var from = e.x, t0 = null;
      e.run = function (e, now) {
        if (t0 === null) t0 = now;
        var p = Math.min(1, (now - t0) / ms), q = 1 - Math.pow(1 - p, 5);
        var nx = from + (to - from) * q;
        e.v = (nx - e.x) * 60; e.x = nx;
        if (p >= 1) { e.run = null; e.v = 0; }
      };
      kick();
    }
    // Motion 的時長型彈簧：剛度 (2π/時長)²、阻尼 2(1−彈性)√剛度
    function spring(e, to, sec, bounce, v, done) {
      var k = Math.pow(2 * Math.PI / sec, 2), c = 2 * (1 - bounce) * Math.sqrt(k), last = null;
      if (v !== null) e.v = Math.max(-MAX_V, Math.min(MAX_V, v));
      e.run = function (e, now) {
        var dt = last === null ? 1 / 60 : Math.min(.032, (now - last) / 1000); last = now;
        for (var i = 0; i < 4; i++) {   // 小步積分，穩定
          var h = dt / 4, a = -k * (e.x - to) - c * e.v;
          e.v += a * h; e.x += e.v * h;
        }
        if (Math.abs(e.x - to) < .1 && Math.abs(e.v) < 2) { e.x = to; e.v = 0; e.run = null; if (done) done(); }
      };
      kick();
    }

    function measure() {
      var box = paper.getBoundingClientRect();
      if (!box.width) return;
      innerW = box.width - INSET * 2;
      slots = btns.map(function (b) {
        var r = b.getBoundingClientRect();
        return { l: r.left - box.left - INSET, r: r.right - box.left - INSET };
      });
      if (!drag) { gen++; clearTimeout(handoffTimer); jump(L, slots[current].l); jump(R, slots[current].r); paint(); }
    }

    function select(i) {
      if (i === current) return false;
      current = i;
      btns.forEach(function (b, j) {
        b.setAttribute('aria-checked', j === i ? 'true' : 'false');
        b.tabIndex = j === i ? 0 : -1;
      });
      var key = btns[i].getAttribute('data-paper');
      mapImgs.forEach(function (img) { img.classList.toggle('is-active', img.getAttribute('data-paper') === key); });
      resetMap();   // R2 客戶：切換家紙／工紙時，流程圖平滑捲回起始位置（見下方 placeMap）
      return true;
    }

    function land(to, v, flick, withSquash) {
      var b = slots[to], g = ++gen;
      var dir = Math.sign((b.l + b.r) / 2 - (L.x + R.x) / 2) || 1;
      var lead = dir > 0 ? R : L, leadTo = dir > 0 ? b.r : b.l;
      var trail = dir > 0 ? L : R, trailTo = dir > 0 ? b.l : b.r;
      spring(lead, leadTo, flick ? .4 : .3, flick ? .2 : 0, v);
      if (!withSquash) { spring(trail, trailTo, .3, 0, v); return; }
      spring(trail, trailTo + dir * SQUASH, .3, 0, v, function () {
        if (gen === g) spring(trail, trailTo, .16, 0, null);
      });
    }

    function travel(from, to) {
      var a = slots[from], b = slots[to];
      clearTimeout(handoffTimer); gen++;
      if (still) { jump(L, b.l); jump(R, b.r); paint(); return; }
      tween(L, b.l + (Math.min(a.l, b.l) - b.l) * STRETCH, DILATE);
      tween(R, b.r + (Math.max(a.r, b.r) - b.r) * STRETCH, DILATE);
      handoffTimer = setTimeout(function () { land(to, null, false, true); }, HANDOFF);
    }

    function localX(e) { return e.clientX - paper.getBoundingClientRect().left - INSET; }
    function rubber(over, dim) { return (over * dim * RUBBER) / (dim + RUBBER * Math.abs(over)); }
    function nearest(x) {
      var best = 0;
      slots.forEach(function (s, i) { if (Math.abs((s.l + s.r) / 2 - x) < Math.abs((slots[best].l + slots[best].r) / 2 - x)) best = i; });
      return best;
    }
    function velocity(hist, now) {
      var recent = hist.filter(function (h) { return now - h[0] <= 100; });
      if (recent.length < 2) return 0;
      var a = recent[0], b = recent[recent.length - 1];
      return b[0] - a[0] >= 8 ? (b[1] - a[1]) / (b[0] - a[0]) * 1000 : 0;
    }
    function project(v) { var d = 1 - .1 * Math.pow(.05, .75); return (v / 1000) * d / (1 - d); }

    btns.forEach(function (btn, i) {
      btn.addEventListener('pointerdown', function (e) {
        if (drag || e.button !== 0) return;
        try { btn.setPointerCapture(e.pointerId); } catch (err) {}
        var x = localX(e);
        var onThumb = x >= L.x && x <= R.x;
        drag = { id: e.pointerId, x0: x, slot: i, onThumb: onThumb, live: false, offset: 0, w: 0, hist: [[e.timeStamp, x]] };
        if (onThumb) { clearTimeout(handoffTimer); gen++; stop(L); stop(R); }
        else if (!still) btn.classList.add('is-pressed');
      });
      btn.addEventListener('pointermove', function (e) {
        var d = drag;
        if (!d || e.pointerId !== d.id || !d.onThumb) return;
        var x = localX(e);
        d.hist.push([e.timeStamp, x]); if (d.hist.length > 8) d.hist.shift();
        if (!d.live) {
          if (Math.abs(x - d.x0) < DEADZONE) return;
          d.live = true; d.offset = x - L.x; d.w = R.x - L.x;
          paper.classList.add('is-held');
        }
        var l = x - d.offset, maxL = innerW - d.w;
        if (still) { l = Math.max(0, Math.min(maxL, l)); L.x = l; R.x = l + d.w; }
        else if (l < 0) { L.x = 0; R.x = d.w - rubber(-l, d.w); }
        else if (l > maxL) { R.x = innerW; L.x = maxL + rubber(l - maxL, d.w); }
        else { L.x = l; R.x = l + d.w; }
        paint();
      });
      function release() {
        var d = drag; drag = null;
        paper.classList.remove('is-held');
        btns[d.slot].classList.remove('is-pressed');
        return d;
      }
      btn.addEventListener('pointerup', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = release(), x = localX(e);
        if (!d.live) {
          var from = current;
          if (Math.abs(x - d.x0) <= SLOP && select(d.slot)) travel(from, d.slot);
          return;
        }
        var v = velocity(d.hist, e.timeStamp), flick = Math.abs(v) > FLICK;
        var to = nearest((L.x + R.x) / 2 + project(v));
        if (flick && to === current) to = Math.max(0, Math.min(btns.length - 1, to + Math.sign(v)));
        select(to);
        if (still) { jump(L, slots[to].l); jump(R, slots[to].r); paint(); }
        else land(to, v, flick, flick);
      });
      function cancel(e) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = release();
        if (d.live) land(current, null, false, false);
      }
      btn.addEventListener('pointercancel', cancel);
      btn.addEventListener('lostpointercapture', cancel);
      btn.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(btns.length - 1, current + 1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(0, current - 1);
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = btns.length - 1;
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); return; }   // 鍵盤選取走方向鍵（radio 群組慣例）
        if (next === null) return;
        e.preventDefault();
        var from = current;
        if (select(next)) travel(from, next);
        btns[next].focus({ preventScroll: true });
      });
    });

    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(paper);   // 面板從隱藏切到顯示時重量
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  })();

  /* ---------- 當天進場流程：手機版流程圖起始位置（「可左右滑動查看」提示固定顯示，R2） ---------- */
  var route = root.querySelector('.cl-process__route');
  var scroller = root.querySelector('.cl-process__route-scroll--map');
  // 手機版（≤640）流程圖起始位置對齊 Figma 2266:8754：圖在 343 框內 x −112.1 → 捲動區預設往左捲 30＋112.1。
  // 使用者自己捲動過就不再重設。「可左右滑動查看」提示固定顯示（R2 客戶），不再隨捲動淡出
  var mqPhone = window.matchMedia('(max-width: 640px)');
  var START = 142.1, startLeft = 0, userScrolled = false;
  function placeMap() {
    if (!scroller || userScrolled) return;
    startLeft = mqPhone.matches ? START : 0;
    scroller.scrollLeft = startLeft;
  }
  // 家紙／工紙切換：不管滑到哪，都平滑回到起始位置
  function resetMap() {
    if (!scroller) return;
    userScrolled = false;
    startLeft = mqPhone.matches ? START : 0;
    var still = document.documentElement.classList.contains('is-static') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scroller.scrollTo({ left: startLeft, behavior: still ? 'auto' : 'smooth' });
  }
  if (route && scroller) {
    scroller.addEventListener('scroll', function () {
      userScrolled = Math.abs(scroller.scrollLeft - startLeft) > 8;   // 捲回起始位置後視為沒捲過
    }, { passive: true });
    // 面板 3 預設隱藏（隱藏時設 scrollLeft 無效）：selectTab 每次切換後會呼叫 placeMap；視窗跨過 640 時也重放
    if (mqPhone.addEventListener) mqPhone.addEventListener('change', function () { userScrolled = false; placeMap(); });
    placeMap();
  }

  /* ---------- 「挑選到廠日期與時段」info tooltip（R2 客戶）：hover／focus 由 CSS 顯示；點擊切換（觸控用），點外面或 Esc 關閉 ---------- */
  Array.prototype.forEach.call(root.querySelectorAll('.cl-process__tip'), function (tip) {
    var btn = tip.querySelector('.cl-process__tip-btn');
    var set = function (open) { tip.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(!tip.classList.contains('is-open')); });
    document.addEventListener('click', function () { set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  });
})();
