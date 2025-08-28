// ---- Utils de storage ----
const USERS_KEY = 'users:data:v1';
const CURRENT_USER_KEY = 'CURRENT_USER';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
  catch { return {}; }
}
function setUsers(obj) {
  localStorage.setItem(USERS_KEY, JSON.stringify(obj));
}
function getCurrentUID() {
  return localStorage.getItem(CURRENT_USER_KEY);
}
function ensureLogged() {
  const uid = getCurrentUID();
  if (!uid) window.location.href = 'login.html';
  return uid;
}

// ---- Carga inicial ----
const uid = ensureLogged();
const users = getUsers();
if (!users[uid]) users[uid] = { profile: { email: uid }, createdAt: Date.now(), updatedAt: Date.now() };

const form = document.getElementById('profileForm');
const avatarInput = document.getElementById('avatarInput');
const avatarImg = document.getElementById('avatarImg');
const avatarFallback = document.getElementById('avatarFallback');

const p = users[uid].profile || {};
form.nombre.value   = p.nombre   || '';
form.email.value    = p.email    || uid;
form.deporte.value  = p.deporte  || '';
form.objetivo.value = p.objetivo || '';
form.dificultad.value = p.dificultad || '';
form.edad.value     = p.edad     || '';
form.peso.value     = p.peso     || '';
form.altura.value   = p.altura   || '';

// avatar
if (p.avatar) {
  avatarImg.src = p.avatar;
  avatarImg.style.display = 'block';
  avatarFallback.style.display = 'none';
} else {
  avatarFallback.textContent = (p.nombre?.[0] || 'b').toLowerCase();
}

// ---- Subida de imagen (DataURL en localStorage para demo) ----
avatarInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    avatarImg.src = reader.result;
    avatarImg.style.display = 'block';
    avatarFallback.style.display = 'none';
    // guardamos inmediatamente
    users[uid].profile.avatar = reader.result;
    users[uid].updatedAt = Date.now();
    setUsers(users);
  };
  reader.readAsDataURL(file);
});

// ---- Guardar perfil ----
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = {
    nombre:   form.nombre.value.trim(),
    email:    form.email.value,      // readonly
    deporte:  form.deporte.value.trim(),
    objetivo: form.objetivo.value,
    dificultad: form.dificultad.value,
    edad:     Number(form.edad.value || 0),
    peso:     Number(form.peso.value || 0),
    altura:   Number(form.altura.value || 0),
    avatar:   users[uid].profile?.avatar || null,
  };
  users[uid].profile = data;
  users[uid].updatedAt = Date.now();
  setUsers(users);
  alert('Perfil guardado ✅');
});

// ---- Cerrar sesión ----
document.getElementById('logoutBtn').addEventListener('click', ()=>{
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = 'index.html';
});

// ---- Borrar cuenta (perfil + rutinas) ----
document.getElementById('deleteBtn').addEventListener('click', ()=>{
  if (!confirm('¿Seguro que querés borrar tu cuenta y rutinas? Esta acción no se puede deshacer.')) return;
  const routinesKey = `rutinas:data:v1:${uid}`;
  localStorage.removeItem(routinesKey);
  const u = getUsers();
  delete u[uid];
  setUsers(u);
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = 'index.html';
});
