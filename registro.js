// registro.js — usa Supabase
const form = document.getElementById('form-registro');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = (form.nombre?.value || '').trim();
    const email  = (form.email?.value  || '').trim().toLowerCase();
    const pass   = (form.password?.value || '').trim();

    if (!nombre) return alert('Por favor ingresá tu nombre.');
    if (!email)  return alert('Por favor ingresá tu email.');
    if (!pass || pass.length < 6) return alert('La contraseña debe tener al menos 6 caracteres.');

    try {
      const { data, error } = await sb.auth.signUp({ email, password: pass });
      if (error) throw error;

      // Si hay sesión, upsert inmediato; si no, esperamos a que confirme y luego hará login.
      if (data.session) {
        await sb.from('profiles').upsert(
          { id: data.user.id, email, nombre },
          { onConflict: 'id' }
        );
        localStorage.setItem('CURRENT_USER', data.user.id);
        alert('¡Cuenta creada y sesión iniciada!');
        window.location.href = 'index.html';
      } else {
        alert('Te enviamos un mail para confirmar la cuenta. Luego iniciá sesión.');
        // Acá NO hacemos upsert porque auth.uid() es NULL.
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al registrarte.');
    }
  });
}
