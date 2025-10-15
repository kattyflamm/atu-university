// Simple local DB for users (stored in localStorage)
(function(){
  const KEY_USERS = 'atu_db_users';
  const KEY_CURRENT = 'atu_current_user';
  const GROUPS = ['ПИ 24-21', 'ПИ 21-25', 'ПИ 23-25', 'ИС 11-25', 'ИС 15-25'];

  function loadUsers(){
    try { return JSON.parse(localStorage.getItem(KEY_USERS) || '[]'); } catch { return []; }
  }
  function saveUsers(list){ localStorage.setItem(KEY_USERS, JSON.stringify(list)); }

  function getUser(username){
    const u = (loadUsers()).find(u => u && u.name === username);
    return u || null;
  }
  function upsertUser(user){
    const list = loadUsers();
    const idx = list.findIndex(u => u && u.name === user.name);
    if (idx >= 0) list[idx] = user; else list.push(user);
    saveUsers(list);
    return user;
  }

  function setCurrentUser(username){
    if (username) localStorage.setItem(KEY_CURRENT, JSON.stringify({ name: username }));
    else localStorage.removeItem(KEY_CURRENT);
  }
  function getCurrentUser(){
    try { const v = JSON.parse(localStorage.getItem(KEY_CURRENT) || 'null'); return v && v.name ? v.name : null; } catch { return null; }
  }
  function logout(){ setCurrentUser(null); }

  function auth(username, password){
    const u = getUser(username);
    if (!u) return false;
    if (String(u.pass || '') !== String(password || '')) return false;
    setCurrentUser(username);
    return true;
  }

  async function compressImageToDataURL(file, maxSize=256, quality=0.75){
    const img = await new Promise((res, rej)=>{ const r = new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); });
    const bitmap = await new Promise((res)=>{ const im = new Image(); im.onload=()=>res(im); im.src = img; });
    const w = bitmap.width, h = bitmap.height;
    const scale = Math.min(1, maxSize / Math.max(w, h));
    const cw = Math.round(w * scale), ch = Math.round(h * scale);
    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, cw, ch);
    return canvas.toDataURL('image/jpeg', quality);
  }

  // === ДОБАВЛЕНО: ЭДВАЙЗЕРЫ ===
  const ADVISORS = [
    {
      name: "Айгуль Тулегенова",
      position: "Старший эдвайзер",
      department: "Факультет Информационных технологий",
      knowledge: "Программная инженерия, базы данных",
      contact: "a.tulegenova@atu.edu.kz | +7 (727) 321-11-22",
      avatar: "../assets/advisors/aigul.jpg"
    },
    {
      name: "Александр Ким",
      position: "Эдвайзер кафедры ИС",
      department: "Кафедра Информационных систем",
      knowledge: "Сетевые технологии, кибербезопасность",
      contact: "a.kim@atu.edu.kz | +7 (727) 330-55-91",
      avatar: "../assets/advisors/kim.jpg"
    },
    {
      name: "Жанар Ахметова",
      position: "Эдвайзер",
      department: "Факультет Цифровых технологий",
      knowledge: "Информационные системы, аналитика данных",
      contact: "zh.akhmetova@atu.edu.kz | +7 (727) 318-20-48",
      avatar: "../assets/advisors/zh_akhmetova.jpg"
    },
    {
      name: "Руслан Ермеков",
      position: "Эдвайзер кафедры ПИ",
      department: "Кафедра программной инженерии",
      knowledge: "Frontend, Backend, JavaScript",
      contact: "r.yermekov@atu.edu.kz | +7 (727) 335-60-19",
      avatar: "../assets/advisors/ermekov.jpg"
    },
    {
      name: "Динара Сарсенова",
      position: "Эдвайзер",
      department: "Факультет информационных технологий",
      knowledge: "Информационная безопасность, базы данных",
      contact: "d.sarsenova@atu.edu.kz | +7 (727) 314-77-12",
      avatar: "../assets/advisors/sarsenova.jpg"
    }
  ];

  const GROUP_ADVISORS = {
    "ПИ 24-21": "Руслан Ермеков",
    "ПИ 21-25": "Айгуль Тулегенова",
    "ПИ 23-25": "Динара Сарсенова",
    "ИС 11-25": "Александр Ким",
    "ИС 15-25": "Жанар Ахметова"
  };

  function getAdvisorForGroup(group) {
    const name = GROUP_ADVISORS[group];
    if (!name) return null;
    return ADVISORS.find(a => a.name === name) || null;
  }

  // экспорт
  window.DB = { loadUsers, saveUsers, getUser, upsertUser, setCurrentUser, getCurrentUser, logout, auth, compressImageToDataURL };
  window.DB.randomGroup = function(){ return GROUPS[Math.floor(Math.random()*GROUPS.length)]; };
  window.DB.getCurrentUserObj = function(){ const n = getCurrentUser(); return n ? getUser(n) : null; };
  window.DB.getAdvisorForGroup = getAdvisorForGroup;
})();
