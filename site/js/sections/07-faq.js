/* 07 faq（負責人 E）：分類頁籤切換＋手風琴展開收合
   頁籤選中底色由 base .cl-jelly 處理（只切 .is-active）；展開高度過場在 CSS（grid-template-rows） */
(function () {
  var root = document.querySelector('.cl-faq');
  if (!root) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll('.cl-faq__tab'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('.cl-faq__list'));

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
