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
  /* R2 客戶：觸發時機以「區塊」為單位，不再每個元素各自計算。
     觸發區＝最近的 [data-reveal-trigger]（例：一整排牌卡），沒有就用最近的 [data-reveal-group]（例：段落標題＋副標），
     都沒有才是元素自己。區塊上緣捲到觸發線時，區塊內所有 [data-reveal] 一起開始（各自的 --cl-rv-delay 照舊，群組內 .08s 錯開） */
  var triggers = new Map();
  reveals.forEach(function (el) {
    var t = el.closest('[data-reveal-trigger]') || el.closest('[data-reveal-group]') || el;
    if (!triggers.has(t)) triggers.set(t, []);
    triggers.get(t).push(el);
  });
  var fire = function (t) {
    var list = triggers.get(t);
    if (!list || t.__clRevealed) return;
    t.__clRevealed = true;
    list.forEach(show);
    t.dispatchEvent(new CustomEvent('cl:reveal'));   // 段落 JS 可跟著觸發區一起播自己的動態（例：關於四張卡 icon）
  };
  // 給段落 JS 用：把某個 reveal 元素所在的整個觸發區一起播放（例：切換頁籤時新面板已在畫面內）
  window.clRevealWith = function (el) {
    var t = el.closest('[data-reveal-trigger]') || el.closest('[data-reveal-group]') || el;
    if (triggers.has(t)) { fire(t); if (io) io.unobserve(t); } else show(el);
  };
  var io = null;
  if (isStatic || reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(show);
  } else {
    // 觸發線：區塊上緣捲到畫面 2/3 高（距畫面底部 1/3）時播放，全寬度一致
    // （客戶 R2：電腦版原本 55% 太晚，改回與平板、手機相同）
    var LINE = 2 / 3;
    // 區塊在隱藏面板裡（頁籤）時量不到位置：用第一個看得到的子元素位置代表，都看不到就等 IO
    var topOf = function (t) {
      var r = t.getBoundingClientRect();
      return r.height || r.width ? r.top : Infinity;
    };
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { fire(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -' + ((1 - LINE) * 100).toFixed(2) + '% 0px' });
    triggers.forEach(function (_, t) {
      // 載入時已在觸發線上方的區塊直接播放
      if (topOf(t) < window.innerHeight * LINE) fire(t);
      else io.observe(t);
    });
    // 錨點跳轉、scrollIntoView 這類直接跳過觸發線的情況：已在觸發線上方的區塊一律播放
    var pending = 0;
    window.addEventListener('scroll', function () {
      if (pending) return;
      pending = requestAnimationFrame(function () {
        pending = 0;
        var line = window.innerHeight * LINE;
        triggers.forEach(function (_, t) {
          if (!t.__clRevealed && topOf(t) < line) { fire(t); io.unobserve(t); }
        });
      });
    }, { passive: true });
  }

  /* ---------- 切換鈕 Rubber Segment：window.clRubberSegment(el, opts)（R2 家紙／工紙起用，R3 抽成共用）----------
     移植自 React Bits「Rubber Segment」（MIT＋Commons Clause，© David Haz）：
     點擊：綠塊左右緣先在 .19s 內拉到同時蓋住新舊兩格，.15s 後交棒給彈簧——前緣落到新格，後緣多衝 3px 再回彈。
     拖曳選中的綠塊：可左右拖，超出兩端有橡皮筋阻力；放開依位置＋甩動速度吸附到最近的一格。?static、減少動態：直接跳到位。
     結構：el（role=radiogroup）> 按鈕（role=radio、aria-checked）＋綠塊層 thumb（同樣文字的副本，clip-path 只露出選中那格）
     opts：btn 按鈕選擇器、thumb 綠塊選擇器、inset 軌道內距（預設 4）、onChange(i, btn) 選中改變時呼叫 */
  window.clRubberSegment = function (el, opts) {
    var btns = Array.prototype.slice.call(el.querySelectorAll(opts.btn));
    var thumb = el.querySelector(opts.thumb);
    if (!btns.length || !thumb) return;
    var INSET = opts.inset == null ? 4 : opts.inset, STRETCH = 1, SQUASH = 3, DILATE = 190, HANDOFF = 150, FLICK = 110, MAX_V = 2000, DEADZONE = 4, SLOP = 10, RUBBER = .55;
    var still = document.documentElement.classList.contains('is-static') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var slots = [], innerW = 0, handoffTimer = 0, gen = 0, drag = null;
    var current = Math.max(0, btns.findIndex(function (b) { return b.getAttribute('aria-checked') === 'true'; }));

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
      var box = el.getBoundingClientRect();
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
      if (opts.onChange) opts.onChange(i, btns[i]);
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

    function localX(e) { return e.clientX - el.getBoundingClientRect().left - INSET; }
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
          el.classList.add('is-held');
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
        el.classList.remove('is-held');
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
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(el);   // 面板從隱藏切到顯示時重量
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  };

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
        var d = Math.ceil(Math.hypot(tab.offsetWidth / 2 + 24, tab.offsetHeight) * 2);   // 多留 24px：頁籤選中後可能變寬（例如多一個白點）
        tab.style.setProperty('--cl-tabfill-d', d + 'px');
      });
    }
    size();
    window.addEventListener('resize', size);
    // 頁籤列放在隱藏的面板裡時（例：服務流程頁籤 3 的家紙／工紙），載入時量到的寬是 0：顯示出來、尺寸改變時重量
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(list);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  });

  /* ---------- 弧線進畫面才描線（R2）：以弧線所在段落為準，上緣進到畫面 70% 處開始；SVG 本身很大，不能直接觀察 ---------- */
  if ('IntersectionObserver' in window) {
    var curveMap = new Map();
    [].forEach.call(document.querySelectorAll('.cl-curve:not(.cl-process__card-curve)'), function (svg) {
      var sec = svg.closest('section') || svg.parentNode;
      if (!curveMap.has(sec)) curveMap.set(sec, []);
      curveMap.get(sec).push(svg);
    });
    document.documentElement.classList.add('has-curve-io');
    var curveIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        curveMap.get(en.target).forEach(function (svg) { svg.classList.add('is-inview'); });
        curveIO.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -30% 0px' });
    curveMap.forEach(function (_, sec) { curveIO.observe(sec); });
  }

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
