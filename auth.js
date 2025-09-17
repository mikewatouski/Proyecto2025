// auth.js — Supabase only
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://nnlsljjdoyfzfabfnxxf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubHNsampkb3lmemZhYmZueHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjY2NzYsImV4cCI6MjA3MzYwMjY3Nn0.qQ_UgcNtbZtJe-ucVtqO0AT9usMuovQj2WtaGxNACsc";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helpers de sesión
export async function getSession() {
  const { data } = await sb.auth.getSession();
  return data.session || null;
}
export async function getUser() {
  const { data } = await sb.auth.getUser();
  return data.user || null;
}

// Registro: guarda nombre en user_metadata y crea fila en profiles
export async function signUp({ email, password, nombre }) {
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { data: { nombre } }
  });
  if (error) throw error;

  const user = data.user;
  if (user) {
    await sb.from("profiles").upsert({
      id: user.id,
      email: user.email,
      nombre: nombre || user.user_metadata?.nombre || null
    });
  }
  return data;
}

// Login / Logout
export async function signIn({ email, password }) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
export async function signOut() {
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

// (Opcional) Exponer global para debugs
window.sb = sb;
window.getSession = getSession;
window.getUser = getUser;
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
