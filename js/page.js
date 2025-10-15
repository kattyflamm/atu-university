// Simple local auth using localStorage
(function () {
  // DB-based profile page
  const profileView = document.getElementById('profile-view');
  const profileAvatar = document.getElementById('profile-avatar');
  const profilePhoto = document.getElementById('profile-photo');
  const profileName = document.getElementById('user-name');
  const profilePass = document.getElementById('profile-pass');
  const saveBtn = document.getElementById('save-profile');
  const togglePass = document.getElementById('toggle-pass');
  const toggleName = document.getElementById('toggle-name');
  const profileGroup = document.getElementById('group-name');

  function toDataURL(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  function render() {
    if (!window.DB) return;
    const name = DB.getCurrentUser();
    const user = name ? DB.getUser(name) : null;
    if (!user) {
      window.location.href = '../index.html';
      return;
    }
    if (profileName) {
      if (profileName.tagName === 'INPUT') profileName.value = user.name || '';
      else profileName.textContent = user.name || '';
    }
    if (profilePass) profilePass.value = user.pass || '';
    if (profileAvatar)
      profileAvatar.src = user.photo || '../media/user.png';
    if (profileGroup)
      profileGroup.textContent = user.group || '';
  }

  if (profilePhoto)
    profilePhoto.addEventListener('change', async () => {
      if (!window.DB) return;
      if (profilePhoto.files && profilePhoto.files[0]) {
        const name = DB.getCurrentUser();
        const user = DB.getUser(name) || { name };
        user.photo = await DB.compressImageToDataURL(
          profilePhoto.files[0],
          512,
          0.8
        );
        DB.upsertUser(user);
        render();
      }
    });

    if (saveBtn)
      saveBtn.addEventListener('click', () => {
        if (!window.DB) return;
        const name = DB.getCurrentUser();
        const user = DB.getUser(name) || { name };
    
        // имя
        user.name = profileName.value;
    
        // ✅ если поле пароля не пустое — обновляем пароль
        if (profilePass && profilePass.value.trim() !== '') {
          user.pass = profilePass.value.trim();
        }
    
        // если нет группы или программы — создаём
        if (!user.group) user.group = DB.randomGroup();
        if (!user.program) user.program = 'АТУ — Бакалавриат';
    
        DB.upsertUser(user);
        DB.setCurrentUser(user.name);
        render();
        alert('Профиль сохранён');
      });
    

  if (togglePass)
    togglePass.addEventListener('click', () => {
      const shown = profilePass.style.display !== 'none';
      profilePass.style.display = shown ? 'none' : '';
      if (!shown) profilePass.focus();
    });

  if (toggleName)
    toggleName.addEventListener('click', () => {
      const ro = profileName.hasAttribute('readonly');
      if (ro) profileName.removeAttribute('readonly');
      else profileName.setAttribute('readonly', '');
      if (profileName.tagName === 'INPUT') profileName.focus();
    });

  render();
})();



// === FLOOR 2: Advisor info page ===
window.addEventListener('load', () => {
  if (!window.DB) {
    console.error("База данных не найдена");
    return;
  }

  const user = DB.getCurrentUserObj();
  if (!user) {
    alert('Сессия истекла. Войдите заново.');
    window.location.href = '../index.html';
    return;
  }

  const advisor = DB.getAdvisorForGroup(user.group);
  if (!advisor) {
    console.warn('Эдвайзер не найден для группы', user.group);
    document.getElementById('adv-name').textContent = 'Эдвайзер не назначен';
    return;
  }

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set('adv-name', advisor.name);
  set('adv-role', advisor.position);
  set('adv-dept', advisor.department);
  set('adv-field', advisor.knowledge);
  set('adv-contact', advisor.contact);

  const photo = document.getElementById('adv-photo');
  if (photo) photo.src = advisor.avatar || '../assets/default-avatar.jpg';

  const back = document.getElementById('goBack');
  if (back) back.addEventListener('click', e => {
    e.preventDefault();
    window.location.href = '../index.html';
  });
});
// === Главная страница: показать эдвайзера ===
window.addEventListener('load', () => {
  if (!window.DB) return;

  const user = DB.getCurrentUserObj();
  const edviserEl = document.getElementById('edviser-name');
  if (!user || !edviserEl) return;

  const advisor = DB.getAdvisorForGroup(user.group);
  if (!advisor) {
    edviserEl.textContent = '(эдвайзер не назначен)';
  } else {
    edviserEl.textContent = advisor.name;
  }
});
