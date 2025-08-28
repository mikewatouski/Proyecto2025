// === auth.js (GLOBAL) ===
// Claves de localStorage
const LS_USERS   = 'users:data:v1';
const LS_CURRENT = 'CURRENT_USER';

// Funciones
function getUsers() {
  try { return JSON.parse(localStorage.getItem(LS_USERS)) || {}; }
  catch { return {}; }
}
function saveUsers(obj) {
  localStorage.setItem(LS_USERS, JSON.stringify(obj));
}
function setCurrentUser(uid) {
  localStorage.setItem(LS_CURRENT, uid);
}
function getCurrentUser() {
  return localStorage.getItem(LS_CURRENT);
}
function logout() {
  localStorage.removeItem(LS_CURRENT);
}

// EXponer explícitamente al global (por si algún script usa type="module")
window.getUsers       = getUsers;
window.saveUsers      = saveUsers;
window.setCurrentUser = setCurrentUser;
window.getCurrentUser = getCurrentUser;
window.logout         = logout;
window.__AUTH_READY__ = true; // bandera opcional de diagnóstico
