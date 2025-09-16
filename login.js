// login.js — Conecta tu formulario de login con Supabase
(function () {
  const form =
    document.getElementById("form-login") ||
    document.querySelector("form[action*='login'], form#login, form[name='login']");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (form.email?.value || form.querySelector("input[name='email']")?.value || "").trim();
    const password = (form.password?.value || form.querySelector("input[name='password']")?.value || "");

    try {
      await sbSignIn(email, password);
      window.location.href = "rutinas.html";
    } catch (err) {
      alert("Error al ingresar: " + err.message);
    }
  });
})();
