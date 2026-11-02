/* 樣式檢查模式（預覽工具，不屬於網站設計；上線前移除 _head／_foot 的引用即可）
   開啟後滑鼠停在元素上：像瀏覽器檢查一樣標出 margin／border／padding／內容範圍，
   旁邊顯示文字樣式、顏色、間距、尺寸／圓角／陰影；數值寫「token 名稱 · 實際值」，沒用 token 的寫死值標「未綁 token」。
   開關在電腦版 header 的 RWD 切換旁；平板／手機預覽（iframe ?embed）會跟著開關（postMessage）。?static 不啟用。 */
(function () {
  var html = document.documentElement;
  if (html.classList.contains('is-static')) return;
  var EMBED = html.classList.contains('is-embed') || /[?&]embed\b/.test(location.search);

  /* ---------- 讀 CSS 規則（含 media 條件），用來找元素「宣告」的值（才看得到 token 名稱） ---------- */
  var RULES = null;
  function collect() {
    RULES = [];
    var order = 0;
    function walk(list, media) {
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        if (r.type === 1) RULES.push({ sel: r.selectorText, style: r.style, media: media, order: order++, parts: splitSel(r.selectorText) });
        else if (r.type === 4) walk(r.cssRules, media.concat(r.media.mediaText));
        else if (r.cssRules) walk(r.cssRules, media);
      }
    }
    for (var s = 0; s < document.styleSheets.length; s++) {
      var sh = document.styleSheets[s];
      if (sh.ownerNode && sh.ownerNode.hasAttribute('data-cl-inspect')) continue;
      try { walk(sh.cssRules, []); } catch (e) { /* 跨網域樣式表（字型）讀不到，略過 */ }
    }
  }
  function splitSel(sel) {
    var out = [], depth = 0, cur = '';
    for (var i = 0; i < sel.length; i++) {
      var c = sel[i];
      if (c === '(' || c === '[') depth++;
      else if (c === ')' || c === ']') depth--;
      if (c === ',' && !depth) { out.push(cur.trim()); cur = ''; } else cur += c;
    }
    out.push(cur.trim());
    return out.map(function (p) { return { text: p, spec: spec(p) }; });
  }
  function spec(sel) {
    var s = sel.replace(/::?(before|after|placeholder|marker|selection|first-line|first-letter)\b/g, '');
    var a = (s.match(/#[\w-]+/g) || []).length;
    var b = (s.match(/\.[\w-]+|\[[^\]]*\]|:(?!not|is|where)[\w-]+/g) || []).length;
    var c = (s.replace(/\([^)]*\)/g, '').match(/(^|[\s>+~])[a-z][\w-]*/gi) || []).length;
    return a * 10000 + b * 100 + c;
  }
  var MEDIA = {};
  function mediaOk(list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (!(m in MEDIA)) MEDIA[m] = window.matchMedia(m);
      if (!MEDIA[m].matches) return false;
    }
    return true;
  }
  var SHORT = {
    'padding-top': 'padding', 'padding-right': 'padding', 'padding-bottom': 'padding', 'padding-left': 'padding',
    'margin-top': 'margin', 'margin-right': 'margin', 'margin-bottom': 'margin', 'margin-left': 'margin',
    'row-gap': 'gap', 'column-gap': 'gap', 'background-color': 'background', 'border-top-color': 'border-color'
  };
  // 回傳 {text, prop}：prop 是實際寫的屬性（可能是簡寫）
  function declared(el, prop) {
    var best = null;
    var inline = el.style && (el.style.getPropertyValue(prop) || (SHORT[prop] && el.style.getPropertyValue(SHORT[prop])));
    if (inline) return { text: inline, prop: el.style.getPropertyValue(prop) ? prop : SHORT[prop], from: 'style 屬性' };
    for (var i = 0; i < RULES.length; i++) {
      var r = RULES[i];
      var v = r.style.getPropertyValue(prop), p = prop;
      if (!v && SHORT[prop]) { v = r.style.getPropertyValue(SHORT[prop]); p = SHORT[prop]; }
      if (!v || !mediaOk(r.media)) continue;
      var sp = -1;
      for (var k = 0; k < r.parts.length; k++) {
        try { if (el.matches(r.parts[k].text)) sp = Math.max(sp, r.parts[k].spec); } catch (e) { /* 瀏覽器不認得的選擇器 */ }
      }
      if (sp < 0) continue;
      var imp = r.style.getPropertyPriority(p) === 'important' ? 1 : 0;
      var score = [imp, sp, r.order];
      if (!best || cmp(score, best.score) > 0) best = { text: v, prop: p, score: score, from: r.sel };
    }
    return best;
  }
  function cmp(a, b) { for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; }
  // 會繼承的屬性：自己沒寫就往上找
  function declaredInh(el, prop) {
    for (var e = el; e && e !== document.documentElement; e = e.parentElement) {
      var d = declared(e, prop);
      if (d && d.text !== 'inherit') { if (e !== el) d.inherit = label(e); return d; }
    }
    return null;
  }

  /* ---------- token 對照（目前斷點的實際值） ---------- */
  function tokenValue(name) { return getComputedStyle(html).getPropertyValue(name).trim(); }
  function vars(text) { return (text || '').match(/--cl-[\w-]+/g) || []; }
  var probe = null;
  function toHex(c) {
    if (!c) return '';
    if (!probe) { probe = document.createElement('i'); probe.style.display = 'none'; document.body.appendChild(probe); }
    probe.style.color = ''; probe.style.color = c;
    var m = getComputedStyle(probe).color.match(/[\d.]+/g);
    if (!m) return c;
    var hex = '#' + m.slice(0, 3).map(function (n) { return ('0' + (+n).toString(16)).slice(-2); }).join('');
    var a = m[3] !== undefined ? +m[3] : 1;
    return a < 1 ? hex + ' ' + Math.round(a * 100) + '%' : hex;
  }
  var RAW = /(^|[\s(,])-?(?!0px|1px)\d*\.?\d+px|#[0-9a-f]{3,8}\b|rgba?\(/i;
  function rawFlag(text) {
    if (!text) return '';
    var noVar = text.replace(/var\([^()]*(\([^()]*\))?[^()]*\)/g, '');
    return RAW.test(noVar) ? '<em class="cl-ins-raw">未綁 token</em>' : '';
  }
  function fmtDecl(d) {
    if (!d) return '<span class="cl-ins-dim">（預設）</span>';
    var t = esc(d.text).replace(/var\((--cl-[\w-]+)\)/g, '<b>$1</b>');
    return t + rawFlag(d.text) + (d.inherit ? '<span class="cl-ins-dim">　繼承自 ' + esc(d.inherit) + '</span>' : '');
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function px(v) { var n = parseFloat(v); return isNaN(n) ? v : (Math.round(n * 100) / 100) + ''; }
  function label(el) {
    var cls = (typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal) || '').trim().split(/\s+/).filter(function (c) { return c && !/^is-|^cl-rv/.test(c); });
    return el.tagName.toLowerCase() + (cls.length ? '.' + cls.slice(0, 2).join('.') : '');
  }

  /* ---------- 資訊面板內容 ---------- */
  var WEIGHT = { 100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black' };
  function row(k, v) { return '<div class="cl-ins-row"><span>' + k + '</span><span>' + v + '</span></div>'; }
  function sec(title, body) { return body ? '<div class="cl-ins-sec"><h6>' + title + '</h6>' + body + '</div>' : ''; }
  function hasText(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.textContent.trim()) return true;
    return false;
  }
  function colorRow(name, d, value) {
    var hex = toHex(value);
    return row(name, '<i class="cl-ins-sw" style="background:' + esc(value) + '"></i>' + fmtDecl(d) + ' <span class="cl-ins-dim">' + hex + '</span>');
  }
  // padding／margin 四邊各自找宣告（可能寫在簡寫或單邊），重複的合併
  function declSides(el, base) {
    var seen = {}, out = [];
    ['top', 'right', 'bottom', 'left'].forEach(function (sd) {
      var d = declared(el, base + '-' + sd);
      if (!d) return;
      var key = d.prop + ':' + d.text;
      if (seen[key]) return;
      seen[key] = 1;
      out.push((d.prop === base ? '' : '<span class="cl-ins-dim">' + sd + '：</span>') + fmtDecl(d));
    });
    return out.length ? out.join('<br>') : fmtDecl(null);
  }
  function sides(cs, p) {
    var v = ['top', 'right', 'bottom', 'left'].map(function (s) { return px(cs[p + s.charAt(0).toUpperCase() + s.slice(1)]); });
    if (v.every(function (x) { return x === '0'; })) return '';
    return v.join(' · ');
  }
  function build(el) {
    var cs = getComputedStyle(el), r = el.getBoundingClientRect(), out = '';
    out += '<div class="cl-ins-head"><b>' + esc(label(el)) + '</b><span>' + px(r.width) + ' × ' + px(r.height) + '</span></div>';

    // 文字
    if (hasText(el)) {
      var fs = declaredInh(el, 'font-size');
      var m = fs && fs.text.match(/--cl-([a-z]+)-([a-z]+)-fs/);
      var w = WEIGHT[cs.fontWeight] || cs.fontWeight;
      var styleName = m ? m[1].charAt(0).toUpperCase() + m[1].slice(1) + '/' + m[2].toUpperCase() + '/' + w : '<em class="cl-ins-raw">未套 text style</em>';
      var t = row('樣式', '<b>' + styleName + '</b>');
      t += row('字型', esc(cs.fontFamily.split(',')[0].replace(/["']/g, '')) + ' ' + cs.fontWeight);
      t += row('字級', fmtDecl(fs) + ' <span class="cl-ins-dim">' + px(cs.fontSize) + 'px</span>');
      t += row('行高', fmtDecl(declaredInh(el, 'line-height')) + ' <span class="cl-ins-dim">' + (cs.lineHeight === 'normal' ? 'normal' : px(cs.lineHeight) + 'px') + '</span>');
      t += row('字距', fmtDecl(declaredInh(el, 'letter-spacing')) + ' <span class="cl-ins-dim">' + (cs.letterSpacing === 'normal' ? '0' : px(cs.letterSpacing) + 'px') + '</span>');
      t += row('字重', fmtDecl(declaredInh(el, 'font-weight')));
      out += sec('文字', t);
    }

    // 顏色
    var c = '';
    if (hasText(el)) c += colorRow('文字', declaredInh(el, 'color'), cs.color);
    var bgd = declared(el, 'background-color');
    if (cs.backgroundImage !== 'none' && /gradient/.test(cs.backgroundImage)) c += row('底色', fmtDecl(declared(el, 'background-image') || bgd));
    else if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') c += colorRow('底色', bgd, cs.backgroundColor);
    if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') {
      var bd = declared(el, 'border-top-color') || declared(el, 'border') || declared(el, 'border-top');
      c += colorRow('框線', bd, cs.borderTopColor) + row('框線寬', px(cs.borderTopWidth) + 'px');
    }
    out += sec('顏色', c);

    // 間距
    var s = '', v;
    if ((v = sides(cs, 'padding'))) s += row('padding', v + '<br>' + declSides(el, 'padding'));
    if ((v = sides(cs, 'margin'))) s += row('margin', v + '<br>' + declSides(el, 'margin'));
    if (/flex|grid/.test(cs.display) && cs.rowGap !== 'normal' && (parseFloat(cs.rowGap) || parseFloat(cs.columnGap))) {
      s += row('gap', (cs.rowGap === cs.columnGap ? px(cs.rowGap) : px(cs.rowGap) + ' · ' + px(cs.columnGap)) + '<br>' + fmtDecl(declared(el, 'row-gap')));
    }
    out += sec('間距', s);

    // 尺寸、圓角、陰影
    var z = row('寬 × 高', px(r.width) + ' × ' + px(r.height));
    if (parseFloat(cs.borderTopLeftRadius) > 0) z += row('圓角', fmtDecl(declared(el, 'border-radius') || declared(el, 'border-top-left-radius')) + ' <span class="cl-ins-dim">' + px(cs.borderTopLeftRadius) + 'px</span>');
    if (cs.boxShadow !== 'none') z += row('陰影', fmtDecl(declared(el, 'box-shadow')));
    var bf = cs.backdropFilter || cs.webkitBackdropFilter;
    if (bf && bf !== 'none') z += row('毛玻璃', fmtDecl(declared(el, 'backdrop-filter') || declared(el, '-webkit-backdrop-filter')));
    if (cs.opacity !== '1') z += row('透明度', cs.opacity);
    out += sec('尺寸', z);
    return out;
  }

  /* ---------- 標示框（margin 橘、border 黃、padding 綠、內容 藍）與面板 ---------- */
  var ui = document.createElement('div');
  ui.className = 'cl-ins';
  ui.setAttribute('aria-hidden', 'true');
  ui.innerHTML = '<div class="cl-ins-m"></div><div class="cl-ins-b"></div><div class="cl-ins-p"></div><div class="cl-ins-c"></div><div class="cl-ins-panel"></div>';
  var boxM = ui.children[0], boxB = ui.children[1], boxP = ui.children[2], boxC = ui.children[3], panel = ui.children[4];
  function place(div, x, y, w, h, bw) {
    div.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    div.style.width = Math.max(0, w) + 'px';
    div.style.height = Math.max(0, h) + 'px';
    if (bw) div.style.borderWidth = bw.map(function (n) { return Math.max(0, n) + 'px'; }).join(' ');
  }
  function draw(el) {
    var cs = getComputedStyle(el), r = el.getBoundingClientRect();
    var mt = parseFloat(cs.marginTop), mr = parseFloat(cs.marginRight), mb = parseFloat(cs.marginBottom), ml = parseFloat(cs.marginLeft);
    var bt = parseFloat(cs.borderTopWidth), br = parseFloat(cs.borderRightWidth), bb = parseFloat(cs.borderBottomWidth), bl = parseFloat(cs.borderLeftWidth);
    var pt = parseFloat(cs.paddingTop), pr = parseFloat(cs.paddingRight), pb = parseFloat(cs.paddingBottom), pl = parseFloat(cs.paddingLeft);
    var M = [Math.max(0, mt), Math.max(0, mr), Math.max(0, mb), Math.max(0, ml)];
    place(boxM, r.left - M[3], r.top - M[0], r.width + M[1] + M[3], r.height + M[0] + M[2], M);
    place(boxB, r.left, r.top, r.width, r.height, [bt, br, bb, bl]);
    place(boxP, r.left + bl, r.top + bt, r.width - bl - br, r.height - bt - bb, [pt, pr, pb, pl]);
    place(boxC, r.left + bl + pl, r.top + bt + pt, r.width - bl - br - pl - pr, r.height - bt - bb - pt - pb);
  }
  function movePanel(x, y) {
    var pw = panel.offsetWidth, ph = panel.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    var left = x + 16, top = y + 16;
    if (left + pw > vw - 8) left = Math.max(8, x - pw - 16);
    if (top + ph > vh - 8) top = Math.max(8, vh - ph - 8);
    panel.style.transform = 'translate(' + left + 'px,' + top + 'px)';
  }

  var on = false, cur = null, raf = 0, lastX = 0, lastY = 0;
  function skip(el) { return !el || el === html || el === document.body || el.closest('.cl-ins, .cl-pv-stage, .cl-pv-switch, .cl-pv-compact, .cl-ins-toggle'); }
  function onMove(e) {
    lastX = e.clientX; lastY = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      var el = document.elementFromPoint(lastX, lastY);
      if (skip(el)) { ui.classList.remove('is-show'); cur = null; return; }
      if (el !== cur) { cur = el; panel.innerHTML = build(el); }
      draw(el);
      ui.classList.add('is-show');
      movePanel(lastX, lastY);
    });
  }
  function onScroll() { if (cur && on) draw(cur); }
  function onLeave() { ui.classList.remove('is-show'); cur = null; }

  function set(next) {
    on = !!next;
    html.classList.toggle('cl-ins-on', on);
    if (on) {
      if (!RULES) collect();
      if (!ui.parentNode) document.body.appendChild(ui);
      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('scroll', onScroll, true);
      document.addEventListener('mouseleave', onLeave);
    } else {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('mouseleave', onLeave);
      onLeave();
    }
    if (btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    var frame = document.querySelector('.cl-pv-frame');
    if (frame && frame.contentWindow) frame.contentWindow.postMessage({ clInspect: on }, '*');
    try { sessionStorage.setItem('cl-inspect', on ? '1' : ''); } catch (e) { /* 無痕或停用儲存 */ }
  }
  // 斷點切換時 media 條件要重算
  window.addEventListener('resize', function () { MEDIA = {}; cur = null; });

  /* ---------- iframe 內：聽父頁開關 ---------- */
  if (EMBED) {
    window.addEventListener('message', function (e) { if (e.data && typeof e.data.clInspect === 'boolean') set(e.data.clInspect); });
    return;
  }

  /* ---------- 電腦版 header：開關放在 RWD 切換旁 ---------- */
  var btn = null;
  var anchor = document.querySelector('.cl-pv-switch');
  if (anchor) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cl-ins-toggle';
    btn.title = '樣式檢查：滑過元素顯示文字樣式、顏色、間距與 token';
    btn.setAttribute('aria-label', '樣式檢查');
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><path d="M10 10l3.5 8 1.2-3.3L18 13.5z"/></svg><span>檢查</span>';
    btn.addEventListener('click', function () { set(!on); });
    anchor.parentNode.insertBefore(btn, anchor);
    var frame = document.querySelector('.cl-pv-frame');
    if (frame) frame.addEventListener('load', function () { frame.contentWindow.postMessage({ clInspect: on }, '*'); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && on && !html.classList.contains('cl-pv-open')) set(false); });
  try { if (sessionStorage.getItem('cl-inspect')) set(true); } catch (e) { /* 同上 */ }
})();
