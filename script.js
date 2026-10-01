(function () {
  var toggle = document.getElementById('toggle');
  var menu = document.getElementById('menu');

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? toggle.dataset.close : toggle.dataset.open;
  }
  toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a') && !e.target.closest('.lang')) setMenu(false); });

  var lang = document.querySelector('.lang');
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    setMenu(false);
    if (lang && lang.open) { lang.open = false; lang.querySelector('summary').focus(); }
  });
  document.addEventListener('click', function (e) {
    if (lang && lang.open && !lang.contains(e.target)) lang.open = false;
  });
})();
