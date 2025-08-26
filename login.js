// Enviar el login y mandar al lobby
document.getElementById('form-login').addEventListener('submit', (e)=>{
  e.preventDefault();
  // Aquí podrías validar / enviar al backend
  window.location.href = 'index.html'; // cambia el destino si querés
});

// Botón directo al lobby
document.getElementById('go-lobby-login').addEventListener('click', ()=>{
  window.location.href = 'index.html';
});
