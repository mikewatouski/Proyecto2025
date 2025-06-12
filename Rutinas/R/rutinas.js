let rutinasGuardadas = {};
let rutinasSubidas = {};
let diaElegido = "Lunes";

// Cambiar de sección
function seleccionarSeccion(boton, nombre) {
  document.querySelectorAll('.boton-seccion').forEach(btn => {
    btn.classList.remove('blanco');
    btn.classList.add('azul');
  });
  boton.classList.remove('azul');
  boton.classList.add('blanco');

  const zonaContenido = document.getElementById('zona-contenido');
  const zonaEdicion = document.getElementById('zona-edicion');

  if (nombre === 'Editar') {
    zonaContenido.style.display = 'none';
    zonaEdicion.style.display = 'flex';
    actualizarVistaPrevia();
    document.getElementById("rutina-editable").value = rutinasGuardadas[diaElegido] || "";
  } else {
    zonaContenido.style.display = 'grid';
    zonaEdicion.style.display = 'none';
    actualizarRutinaFinal();
  }
}

// Seleccionar día
function seleccionarDia(boton, dia) {
  document.querySelectorAll('.boton-dia').forEach(b => b.classList.remove('seleccionado'));
  boton.classList.add('seleccionado');
  diaElegido = dia;

  document.getElementById("titulo-previa").textContent = `Vista previa - ${dia}`;
  document.getElementById("rutina-editable").value = rutinasGuardadas[dia] || "";

  actualizarVistaPrevia();
  actualizarRutinaFinal();
}

// Guardar rutina temporal
function actualizarVistaPrevia() {
  const texto = document.getElementById("rutina-editable").value;
  rutinasGuardadas[diaElegido] = texto;
}

// Subir rutina
function subirRutina() {
  const texto = document.getElementById("rutina-editable").value;
  rutinasSubidas[diaElegido] = texto;

  actualizarRutinaFinal();
}

// Mostrar rutina subida
function actualizarRutinaFinal() {
  const container = document.getElementById("rutina-final-container");
  const rutina = rutinasSubidas[diaElegido];

  if (rutina && rutina.trim() !== "") {
    document.getElementById("rutina-final").textContent = rutina;
    container.style.display = "block";
  } else {
    container.style.display = "none";
  }
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  actualizarVistaPrevia();
  actualizarRutinaFinal();
});
