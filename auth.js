// auth.js — Supabase only + shims de compatibilidad
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://nnlsljjdoyfzfabfnxxf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubHNsampkb3lmemZhYmZueHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjY2NzYsImV4cCI6MjA3MzYwMjY3Nn0.qQ_UgcNtbZtJe-ucVtqO0AT9usMuovQj2WtaGxNACsc";

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.sb = sb; // por si querés usarlo en consola

// ---------- Helpers de Auth ----------
window.sbSignUp = async function sbSignUp(email, password, nombre) {
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw error;

  const user = data.user;
  // guardo ID local para compatibilidad con el resto de la app
  if (user?.id) localStorage.setItem("CURRENT_USER", user.id);

  // perfil básico (asegurate de tener tabla "profiles" con columna id uuid PK)
  const { error: perr } = await sb.from("profiles")
    .upsert({ id: user.id, email, nombre }, { onConflict: "id" });
  if (perr) throw perr;

  return user;
};

window.sbSignIn = async function sbSignIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: me } = await sb.auth.getUser();
  const user = me?.user ?? null;
  if (user?.id) localStorage.setItem("CURRENT_USER", user.id);
  return user;
};

window.sbSignOut = async function sbSignOut() {
  await sb.auth.signOut();
  localStorage.removeItem("CURRENT_USER");
};

window.sbGetUser = async function sbGetUser() {
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
};

// ---------- Shims de compatibilidad (para index.js que los consulta) ----------
window.getCurrentUser = function getCurrentUser() {
  // devuelve el ID cacheado (no hace llamada async)
  return localStorage.getItem("CURRENT_USER");
};
window.logout = function logout() {
  // usado por el menú
  window.sbSignOut();
};

// (opcional) bandera para debug
window.__AUTH_READY__ = true;

export { sb as supabase };
