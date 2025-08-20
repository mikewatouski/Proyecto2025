// Validación simple + demo de envío
document.getElementById('form-registro').addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if ((data.password || '').length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    // TODO: enviar a tu backend
    alert(`Cuenta creada para:\n${data.nombre} <${data.email}>`);
    // Redirigir a login
    window.location.href = 'login.html';
  });
  