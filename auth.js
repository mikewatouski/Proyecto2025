// auth.js — Inicializa Supabase y expone helpers de Auth + CRUD
// 🔧 REEMPLAZÁ con tus credenciales reales:
const SUPABASE_URL = "https://TU-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY";

// Requiere que en el HTML esté cargado ANTES el SDK:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
if (!window.supabase) {
  throw new Error("Falta cargar el SDK de Supabase antes de auth.js");
}

window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------- AUTH ---------- */
window.sbSignUp = async function sbSignUp(email, password, nombre) {
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw error;
  const userId = data.user.id;
  const { error: perr } = await sb.from("profiles").upsert({ id: userId, nombre });
  if (perr) throw perr;
  return data.user;
};

window.sbSignIn = async function sbSignIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
};

window.sbSignOut = async function sbSignOut() {
  await sb.auth.signOut();
};

window.sbGetUser = async function sbGetUser() {
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
};

/* ---------- RUTINAS CRUD ---------- */
window.sbCrearRutina = async function sbCrearRutina(titulo, objetoRutina) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("No logueado");
  const { data, error } = await sb.from("rutinas")
    .insert({ user_id: user.id, titulo, data: objetoRutina })
    .select()
    .single();
  if (error) throw error;
  return data;
};

window.sbListarRutinas = async function sbListarRutinas() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("No logueado");
  const { data, error } = await sb.from("rutinas")
    .select("id, titulo, data, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

window.sbActualizarRutina = async function sbActualizarRutina(id, cambios) {
  const { data, error } = await sb.from("rutinas")
    .update(cambios) // { titulo?, data? }
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

window.sbBorrarRutina = async function sbBorrarRutina(id) {
  const { error } = await sb.from("rutinas").delete().eq("id", id);
  if (error) throw error;
  return true;
};

/* ---------- Migrar LocalStorage → Nube (opcional) ---------- */
window.sbMigrarLocal = async function sbMigrarLocal() {
  const str = localStorage.getItem("rutinas");
  if (!str) return 0;
  const arr = JSON.parse(str);
  let count = 0;
  for (const r of arr) {
    await window.sbCrearRutina(r.titulo ?? "Rutina", r);
    count++;
  }
  // localStorage.removeItem("rutinas"); // si querés limpiar
  return count;
};
