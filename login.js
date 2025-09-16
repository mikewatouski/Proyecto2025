// login.js — usa Supabase
const formLogin = document.getElementById('form-login');

async function ensureProfile() {
  const { data: me } = await sb.auth.getUser();
  const user = me?.user;
  if (!user) return;
  // upsert minimal por si no existe fila aún
  await sb.from('profiles').upsert(
    { id: user.id, email: user.email }, // nombre podrá completarse después desde perfil
    { onConflict: 'id' }
  );
}

if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (formLogin.email?.value || '').trim().toLowerCase();
    const pass  = (formLogin.password?.value || '').trim();
    if (!email || !pass) return alert('Completá email y contraseña.');

    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;

      const user = data?.user;
      if (user?.id) localStorage.setItem('CURRENT_USER', user.id);

      await ensureProfile();  // crea la fila si faltaba
      alert('¡Sesión iniciada!');
      window.location.href = 'index.html';
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al iniciar sesión.');
    }
  });
}
