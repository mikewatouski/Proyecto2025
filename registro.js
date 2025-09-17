// registro.js (Supabase)
import { signUp } from "./auth.js";

const form = document.getElementById("form-registro");
form?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const nombre = (form.nombre?.value || "").trim();
  const email  = (form.email?.value  || "").trim().toLowerCase();
  const pass   = (form.password?.value || "").trim();

  if (!nombre) return alert("Ingresá tu nombre.");
  if (!email)  return alert("Ingresá tu email.");
  if (!pass || pass.length < 6) return alert("La contraseña debe tener al menos 6 caracteres.");

  try{
    await signUp({ email, password: pass, nombre });
    alert("Cuenta creada. Si hace falta, verificá el email.");
    window.location.href = "login.html"; // entra y ya ve el perfil completado
  }catch(err){
    alert("Error al registrar: " + (err.message || err));
  }
});
