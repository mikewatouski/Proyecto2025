// Validación simple + demo de envío
document.getElementById('form-login').addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    // TODO: enviar a tu backend
    alert(`Sesión iniciada como:\n${data.email}`);
    // Redirigir a index o dashboard
    window.location.href = 'index.html';
  });
  