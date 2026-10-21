/* RWD 預覽切換（預覽工具，不屬於網站設計；上線前移除 _head／_foot 的引用即可）
   電腦版 header 加裝置切換；選平板或手機時，在 header 下方用 iframe 依裝置寬高顯示同一頁（?embed），
   外框依視窗高度等比縮放；可旋轉、關閉（Esc 也可關）。?static 與 iframe 內不啟用。 */
(function () {
  var html = document.documentElement;
  if (/[?&]embed\b/.test(location.search)) { html.classList.add('is-embed'); return; }
  if (html.classList.contains('is-static')) return;
  var actions = document.querySelector('.cl-hero__actions');
  if (!actions) return;

  var svg = function (d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  };
  var DEVICES = [
    { id: 'desktop', name: '電腦版', icon: svg('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>') },
    { id: 'ipad-pro', name: 'iPad Pro 13"', w: 1024, h: 1366, kind: 'tablet', icon: svg('<rect x="4.5" y="2.5" width="15" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>') },
    { id: 'ipad', name: 'iPad', w: 820, h: 1180, kind: 'tablet', icon: svg('<rect x="6" y="3.5" width="12" height="17" rx="2.2"/><path d="M10.75 17.5h2.5"/>') },
    { id: 'iphone', name: 'iPhone 16', w: 393, h: 852, kind: 'phone', icon: svg('<rect x="7.5" y="2.5" width="9" height="19" rx="2.5"/><path d="M11 18.5h2"/>') }
  ];
  var KIND = {
    tablet: { bezel: 12, radius: 36, statusH: 24, statusFs: 12, statusPad: 20, homeW: 320 },
    phone:  { bezel: 12, radius: 58, statusH: 54, statusFs: 17, statusPad: 32, homeW: 134 }
  };
  var STATUS_ICONS = svg('<path d="M3 18h1.5M7 15v3M11 12v6M15 9v9" stroke-width="2.4"/>') +
    svg('<path d="M3.5 9.5a12 12 0 0 1 17 0M6.5 12.8a7.5 7.5 0 0 1 11 0M9.6 15.9a3 3 0 0 1 4.8 0" stroke-width="2.2"/>') +
    '<svg viewBox="0 0 28 14" aria-hidden="true"><rect x=".75" y=".75" width="23" height="12.5" rx="3.5" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="1.5"/><rect x="2.5" y="2.5" width="19.5" height="9" rx="2" fill="currentColor"/><path d="M25.5 5v4" stroke="currentColor" stroke-opacity=".4" stroke-width="1.6" stroke-linecap="round"/></svg>';

  var state = { id: 'desktop', landscape: false };

  /* ---------- header 切換鈕 ---------- */
  var sw = document.createElement('div');
  sw.className = 'cl-pv-switch';
  sw.setAttribute('role', 'group');
  sw.setAttribute('aria-label', 'RWD 預覽');
  DEVICES.forEach(function (d) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'cl-pv-btn';
    b.dataset.device = d.id;
    b.title = d.w ? d.name + '（' + d.w + ' × ' + d.h + '）' : d.name;
    b.setAttribute('aria-label', b.title);
    b.innerHTML = d.icon;
    b.addEventListener('click', function () { select(d.id); });
    sw.appendChild(b);
  });

  var compact = document.createElement('div');
  compact.className = 'cl-pv-compact';
  compact.innerHTML = '<button type="button" class="cl-pv-btn" aria-haspopup="true" aria-expanded="false" aria-label="RWD 預覽"></button><div class="cl-pv-menu" role="menu"></div>';
  var compactBtn = compact.firstChild;
  var menu = compact.lastChild;
  DEVICES.forEach(function (d) {
    var it = document.createElement('button');
    it.type = 'button';
    it.className = 'cl-pv-item';
    it.setAttribute('role', 'menuitemradio');
    it.dataset.device = d.id;
    it.innerHTML = d.icon + '<span>' + d.name + '</span>' + (d.w ? '<small>' + d.w + ' × ' + d.h + '</small>' : '');
    it.addEventListener('click', function () { setMenu(false); select(d.id); });
    menu.appendChild(it);
  });
  compactBtn.addEventListener('click', function (e) { e.stopPropagation(); setMenu(!compact.classList.contains('is-open')); });
  document.addEventListener('click', function (e) { if (!compact.contains(e.target)) setMenu(false); });
  function setMenu(open) {
    compact.classList.toggle('is-open', open);
    compactBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  actions.insertBefore(compact, actions.firstChild);
  actions.insertBefore(sw, actions.firstChild);

  /* ---------- 預覽層 ---------- */
  var stage = document.createElement('div');
  stage.className = 'cl-pv-stage';
  stage.innerHTML =
    '<div class="cl-pv-fit"><div class="cl-pv-device"><div class="cl-pv-screen">' +
      '<div class="cl-pv-status"><span>9:41</span><span class="cl-pv-island"></span><span class="cl-pv-icons">' + STATUS_ICONS + '</span></div>' +
      '<iframe class="cl-pv-frame" title="RWD 預覽"></iframe>' +
      '<span class="cl-pv-home"></span>' +
    '</div></div></div>' +
    '<div class="cl-pv-bar"><span class="cl-pv-label"><b class="cl-pv-name"></b><span aria-hidden="true">•</span><span class="cl-pv-size"></span></span>' +
      '<button type="button" class="cl-pv-act" data-act="rotate">旋轉</button>' +
      '<button type="button" class="cl-pv-act" data-act="close">關閉</button></div>';
  document.body.appendChild(stage);
  var fit = stage.querySelector('.cl-pv-fit');
  var device = stage.querySelector('.cl-pv-device');
  var screen = stage.querySelector('.cl-pv-screen');
  var island = stage.querySelector('.cl-pv-island');
  var frame = stage.querySelector('.cl-pv-frame');
  frame.src = location.pathname + '?embed';
  stage.querySelector('[data-act="rotate"]').addEventListener('click', function () { state.landscape = !state.landscape; render(); });
  stage.querySelector('[data-act="close"]').addEventListener('click', function () { select('desktop'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.id !== 'desktop') select('desktop'); });
  window.addEventListener('resize', function () { if (state.id !== 'desktop') render(); });

  function select(id) {
    if (id !== state.id) state.landscape = false;
    state.id = id;
    render();
  }

  function render() {
    var d = DEVICES.filter(function (x) { return x.id === state.id; })[0];
    [].forEach.call(document.querySelectorAll('[data-device]'), function (b) {
      b.setAttribute('aria-pressed', b.dataset.device === d.id ? 'true' : 'false');
      if (b.getAttribute('role') === 'menuitemradio') b.setAttribute('aria-checked', b.dataset.device === d.id ? 'true' : 'false');
    });
    compactBtn.innerHTML = d.icon;
    compact.classList.toggle('is-on', d.id !== 'desktop');

    if (d.id === 'desktop') { html.classList.remove('cl-pv-open'); return; }
    window.scrollTo(0, 0);
    html.classList.add('cl-pv-open');

    var k = KIND[d.kind];
    var w = state.landscape ? d.h : d.w;
    var h = state.landscape ? d.w : d.h;
    // 橫向手機：狀態列改成平板的細條、不畫動態島
    var statusH = d.kind === 'phone' && state.landscape ? 24 : k.statusH;
    device.style.setProperty('--bezel', k.bezel + 'px');
    device.style.setProperty('--radius', k.radius + 'px');
    device.style.setProperty('--status-h', statusH + 'px');
    device.style.setProperty('--status-fs', (statusH === 24 ? 12 : k.statusFs) + 'px');
    device.style.setProperty('--status-pad', (statusH === 24 ? 20 : k.statusPad) + 'px');
    device.style.setProperty('--home-w', k.homeW + 'px');
    island.style.display = d.kind === 'phone' && !state.landscape ? '' : 'none';
    screen.style.width = w + 'px';
    screen.style.height = h + 'px';

    var fw = w + k.bezel * 2;
    var fh = h + k.bezel * 2;
    var bar = stage.querySelector('.cl-pv-bar');
    var cs = getComputedStyle(stage);
    var availW = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var availH = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - bar.offsetHeight - parseFloat(cs.rowGap || 24);
    var s = Math.min(1, availW / fw, availH / fh);
    device.style.transform = 'scale(' + s + ')';
    fit.style.width = fw * s + 'px';
    fit.style.height = fh * s + 'px';

    stage.querySelector('.cl-pv-name').textContent = d.name;
    stage.querySelector('.cl-pv-size').textContent = w + ' × ' + h;
  }

  render();
})();
