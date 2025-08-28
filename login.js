// ========== login.js ==========
const formLogin = document.getElementById('form-login');

if (formLogin) {
  formLogin.addEventListener('submit', (e)=>{
    e.preventDefault();

    const email = (formLogin.email?.value || '').trim().toLowerCase();
    const pass  = (formLogin.password?.value || '').trim();

    if (!email || !pass) return alert('Completá email y contraseña.');

    const users  = getUsers();
    const record = users[email];

    if (!record) return alert('No existe una cuenta con ese email. Registrate.');
    if (record.password !== pass) return alert('Contraseña incorrecta.');

    setCurrentUser(email);
    alert('¡Sesión iniciada!');
    window.location.href = 'index.html';
  });
}
