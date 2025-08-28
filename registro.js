// ========== registro.js ==========
const form = document.getElementById('form-registro');

if (form) {
  form.addEventListener('submit', (e)=>{
    e.preventDefault();

    const nombre   = (form.nombre?.value || '').trim();
    const emailRaw = (form.email?.value  || '').trim();
    const pass     = (form.password?.value || '').trim();
    const email = emailRaw.toLowerCase();

    if (!nombre)  return alert('Por favor ingresá tu nombre.');
    if (!email)   return alert('Por favor ingresá tu email.');
    if (!pass || pass.length < 6) return alert('La contraseña debe tener al menos 6 caracteres.');

    const users = getUsers();
    const current = users[email];

    if (current) {
      // Si existe, permito loguear si la pass coincide
      if (current.password === pass) {
        setCurrentUser(email);
        alert('¡Bienvenido! Sesión iniciada.');
        window.location.href = 'index.html';
        return;
      } else {
        alert('Ese email ya existe, pero la contraseña no coincide. Probá iniciar sesión.');
        return;
      }
    }

    // Crear nuevo usuario
    users[email] = {
      profile: {
        nombre,
        email,
        avatar: null,
        deporte: '',
        objetivo: '',
        dificultad: '',
        edad: null,
        peso: null,
        altura: null
      },
      password: pass,              // (demo) en producción, nunca en claro
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    saveUsers(users);
    setCurrentUser(email);

    alert('¡Cuenta creada y sesión iniciada!');
    window.location.href = 'index.html';
  });
}
