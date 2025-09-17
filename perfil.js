// perfil.js — perfiles con Supabase (auto-creación + soft delete)
import { sb, getUser } from "./auth.js";

const form           = document.getElementById('profileForm');
const btnLogout      = document.getElementById('logoutBtn');
const btnDelete      = document.getElementById('deleteBtn');
const avatarImg      = document.getElementById('avatarImg');
const avatarFallback = document.getElementById('avatarFallback');
const avatarInput    = document.getElementById('avatarInput');

let user = null;
let profile = null;

init().catch(err=>{
  alert('Error inicializando perfil: ' + (err.message || err));
  console.error(err);
});

async function init(){
  user = await getUser();
  if (!user) { window.location.href = 'login.html'; return; }

  profile = await ensureProfile(user);

  if (profile?.is_deleted) {
    try { await sb.auth.signOut(); } catch {}
    alert('Tu cuenta fue eliminada. No podés usar el perfil.');
    window.location.href = 'index.html';
    return;
  }

  fillForm(profile);

  if (profile.avatar_url){
    avatarImg.src = profile.avatar_url;
    avatarImg.style.display = 'block';
    avatarFallback.style.display = 'none';
  } else {
    avatarFallback.textContent = (profile.nombre?.[0] || 'b').toLowerCase();
  }
}

/* ========= Helpers ========= */

async function ensureProfile(user){
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  if (data) return data;

  const base = {
    id: user.id,
    email: user.email,
    nombre: user.user_metadata?.nombre || null,
    deporte: null, objetivo: null, dificultad: null,
    edad: null, peso: null, altura: null,
    avatar_url: null, is_deleted: false
  };
  const { data: created, error: upErr } = await sb
    .from('profiles')
    .upsert(base)
    .select()
    .single();
  if (upErr) throw upErr;
  return created;
}

function fillForm(p){
  form.nombre.value      = p?.nombre    ?? (user?.nombre || '');
  form.email.value       = p?.email     ?? (user?.email || '');
  form.deporte.value     = p?.deporte   ?? '';
  form.objetivo.value    = p?.objetivo  ?? '';
  form.dificultad.value  = p?.dificultad?? '';
  form.edad.value        = p?.edad      ?? '';
  form.peso.value        = p?.peso      ?? '';
  form.altura.value      = p?.altura    ?? '';
}

function nz(v){
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

/* ========= Eventos ========= */

// subir avatar
avatarInput?.addEventListener('change', async (e)=>{
  const file = e.target.files?.[0];
  if (!file || !user) return;

  const filename = `${user.id}/${Date.now()}_${file.name}`;
  const { error: upErr } = await sb.storage.from('avatars').upload(filename, file, { upsert:true });
  if (upErr) return alert('Error subiendo avatar: ' + upErr.message);

  const { data: pub } = sb.storage.from('avatars').getPublicUrl(filename);
  const publicUrl = pub?.publicUrl;

  const { error: upDb } = await sb
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);
  if (upDb) return alert('Error guardando avatar: ' + upDb.message);

  avatarImg.src = publicUrl;
  avatarImg.style.display = 'block';
  avatarFallback.style.display = 'none';
});

// guardar perfil
form?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  if (!user) return;

  const payload = {
    id: user.id,
    nombre:     nz(form.nombre.value),
    email:      nz(form.email.value) || user.email,
    deporte:    nz(form.deporte.value),
    objetivo:   nz(form.objetivo.value),
    dificultad: nz(form.dificultad.value),
    edad:       form.edad.value   ? Number(form.edad.value)   : null,
    peso:       form.peso.value   ? Number(form.peso.value)   : null,
    altura:     form.altura.value ? Number(form.altura.value) : null
  };

  const { error } = await sb.from('profiles').upsert(payload);
  if (error) return alert('Error guardando: ' + error.message);
  alert('Perfil guardado ✅');
});

// cerrar sesión
btnLogout?.addEventListener('click', async (e) => {
  e.preventDefault();
  try {
    await sb.auth.signOut();
    alert('Sesión cerrada.');
    window.location.href = 'index.html';
  } catch (err) {
    alert('No pude cerrar sesión: ' + (err.message || err));
  }
});

// borrar cuenta -> HARD DELETE en server + logout
btnDelete?.addEventListener('click', async ()=>{
  if (!confirm('¿Seguro que querés borrar tu cuenta y rutinas? Esta acción es permanente.')) return;
  if (!user) return;

  try {
    const { data: s } = await sb.auth.getSession();
    const token = s?.session?.access_token;
    if (!token) throw new Error("No session token");

    // MISMO ORIGEN (evita CORS / Failed to fetch)
    const res = await fetch("/api/delete-account", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });

    let j = {};
    try { j = await res.json(); } catch {}
    if (!res.ok) throw new Error(j?.error || "No se pudo borrar");

    await sb.auth.signOut().catch(()=>{});
    alert("Cuenta eliminada. Podés registrarte nuevamente cuando quieras.");
    window.location.href = "index.html";
  } catch (err) {
    alert("Error al borrar la cuenta: " + (err.message || err));
  }
});
