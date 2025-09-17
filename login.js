// login.js (Supabase)
import { signIn } from "./auth.js";

const formLogin = document.getElementById("form-login");
formLogin?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const email = (formLogin.email?.value || "").trim().toLowerCase();
  const pass  = (formLogin.password?.value || "").trim();
  if (!email || !pass) return alert("Completá email y contraseña.");

  try{
    await signIn({ email, password: pass });
    alert("¡Sesión iniciada!");
    window.location.href = "index.html"; // lo mandamos directo al perfil
  }catch(err){
    alert("No se pudo iniciar sesión: " + (err.message || err));
  }
});
