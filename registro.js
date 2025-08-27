// Enviar el registro y redirigir a Iniciar sesión
document.getElementById('form-registro').addEventListener('submit', (e)=>{
  e.preventDefault();
  // Acá podrías enviar al backend; al terminar:
  window.location.href = 'login.html';
});

