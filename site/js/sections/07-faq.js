/* 07 faq（負責人 E）：分類頁籤切換＋手風琴展開收合 */
(function () {
  var root = document.querySelector('.cl-faq');
  if (!root) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll('.cl-faq__tab'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('.cl-faq__list'));

  // 其他分類稿上沒有題目（待使用者補）：先複製第一組，題目全部收合
  var source = panels[0];
  panels.slice(1).forEach(function (panel) {
    if (panel.children.length) return;
    Array.prototype.forEach.call(source.children, function (item) {
      var clone = item.cloneNode(true);
      clone.classList.remove('is-open');
      clone.removeAttribute('data-figma');
      clone.removeAttribute('data-figma-s');
      clone.querySelector('.cl-faq__q').setAttribute('aria-expanded', 'false');
      panel.appendChild(clone);
    });
  });

  function select(index) {
    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      if (panels[i]) panels[i].hidden = !on;
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(i); });
    tab.addEventListener('keydown', function (e) {
      var next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
      if (next === null) return;
      next = (next + tabs.length) % tabs.length;
      select(next);
      tabs[next].focus();
      e.preventDefault();
    });
  });

  // 手風琴：各題獨立展開收合
  root.addEventListener('click', function (e) {
    var q = e.target.closest('.cl-faq__q');
    if (!q || !root.contains(q)) return;
    var item = q.closest('.cl-faq__item');
    var open = !item.classList.contains('is-open');
    item.classList.toggle('is-open', open);
    q.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();
