// perfil.js — Muestra datos básicos del usuario + logout
(async function () {
  const user = await sbGetUser();
  if (!user) { window.location.href = "login.html"; return; }

  try {
    const label =
      document.getElementById("perfil-nombre") ||
      document.querySelector(".perfil-nombre, #usuario-nombre");

    const { data: perfil } = await sb
      .from("profiles")
      .select("nombre")
      .eq("id", user.id)
      .single();

    if (label) label.textContent = perfil?.nombre ?? user.email;
  } catch (e) {
    console.warn("No se pudo leer el perfil:", e?.message);
  }

  // Logout
  const btn = document.getElementById("btn-logout") || document.querySelector(".btn-logout, #logout");
  if (btn) {
    btn.addEventListener("click", async () => {
      await sbSignOut();
      window.location.href = "login.html";
    });
  }
})();
