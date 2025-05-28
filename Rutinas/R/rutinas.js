function seleccionarSeccion(boton, nombre) {
  const botones = document.querySelectorAll('.boton-seccion');
  botones.forEach(btn => {
    btn.classList.remove('blanco');
    btn.classList.add('azul');
  });
  boton.classList.remove('azul');
  boton.classList.add('blanco');

  const zonaContenido = document.getElementById('zona-contenido');
  const zonaEdicion = document.getElementById('zona-edicion');

  if (nombre === 'Editar') {
    zonaContenido.style.display = 'none';
    zonaEdicion.style.display = 'block';
  } else {
    zonaContenido.style.display = 'grid';
    zonaEdicion.style.display = 'none';
  }
}

function guardarRutina() {
  const rutinaTexto = document.getElementById('rutina-editable').value;
  console.log('Rutina guardada:', rutinaTexto);
  // Acá podrías hacer un fetch para guardar en tu backend
}
