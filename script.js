(function () {
  var toggle = document.getElementById('toggle');
  var menu = document.getElementById('menu');

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  }
  toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var form = document.getElementById('form');
  var ok = document.getElementById('ok');

  function check(input, errId, message) {
    var err = document.getElementById(errId);
    var valid = input.checkValidity() && input.value.trim() !== '';
    input.setAttribute('aria-invalid', String(!valid));
    if (!valid) input.setAttribute('aria-describedby', errId); else input.removeAttribute('aria-describedby');
    err.textContent = valid ? '' : message;
    return valid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ok.textContent = '';
    var name = form.elements.name;
    var email = form.elements.email;
    var a = check(name, 'name-err', '이름을 입력해 주세요.');
    var b = check(email, 'email-err', '이메일 형식으로 입력해 주세요. 예: name@example.com');
    if (!a) { name.focus(); return; }
    if (!b) { email.focus(); return; }
    // 서버 연동 전: 전송 없이 접수 완료 안내만 보여 줍니다.
    ok.textContent = '문의가 접수되었습니다. 곧 연락드리겠습니다.';
    form.reset();
  });
})();
