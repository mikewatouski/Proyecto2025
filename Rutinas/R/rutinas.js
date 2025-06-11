let datosPorDia = {}; // Ejercicios por día
let rutinasGuardadas = {}; // Rutinas de edición por día
let diaElegido = "Lunes";
let indice = 0;

// Mostrar ejercicio actual
function mostrarEjercicio() {
  const ejercicios = datosPorDia[diaElegido];
  if (ejercicios && ejercicios.length > 0) {
    document.getElementById("nombre-ejercicio").textContent = ejercicios[indice].nombre;
    document.getElementById("peso").textContent = "Peso: " + ejercicios[indice].peso;
    document.getElementById("repeticiones").textContent = "Reps: " + ejercicios[indice].reps;
  } else {
    document.getElementById("nombre-ejercicio").textContent = "Sin ejercicios";
    document.getElementById("peso").textContent = "Peso: -";
    document.getElementById("repeticiones").textContent = "Reps: -";
  }
}

// Cambiar día
function cambiarDia(dia) {
  diaElegido = dia;
  indice = 0;
  mostrarEjercicio();
  actualizarVistaPrevia();
  document.getElementById("rutina-editable").value = rutinasGuardadas[diaElegido] || "";
}

// Seleccionar botón de día
function seleccionarDia(boton, dia) {
  document.querySelectorAll('.boton-dia').forEach(b => b.classList.remove('seleccionado'));
  boton.classList.add('seleccionado');
  cambiarDia(dia);
}

// Selección entre "Rutina" y "Editar"
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
  }
}

// Guardar rutina del día
function guardarRutina() {
  const texto = document.getElementById("rutina-editable").value;
  rutinasGuardadas[diaElegido] = texto;
  actualizarVistaPrevia();
}

// Mostrar rutina en la vista previa
function actualizarVistaPrevia() {
  const rutina = rutinasGuardadas[diaElegido] || "Aquí se verá la rutina guardada...";
  document.getElementById("rutina-guardada").textContent = rutina;
  document.getElementById("titulo-previa").textContent = `Vista previa - ${diaElegido}`;
}

// Inicializar al cargar
document.addEventListener("DOMContentLoaded", () => {
  mostrarEjercicio();
  actualizarVistaPrevia();
});
