let datosPorDia = {};
let rutinasGuardadas = {};
let rutinasSubidas = {};
let diaElegido = "Lunes";
let indice = 0;

function seleccionarDia(boton, dia) {
  document.querySelectorAll('.boton-dia').forEach(b => b.classList.remove('seleccionado'));
  boton.classList.add('seleccionado');
  diaElegido = dia;

  const editable = document.getElementById("rutina-editable");
  if (editable) editable.value = rutinasGuardadas[dia] || "";

  const titulo = document.getElementById("titulo-previa");
  if (titulo) titulo.textContent = `Vista previa - ${dia}`;

  mostrarEjercicio();
  actualizarVistaPrevia();
  actualizarRutinaFinal();
}

function mostrarEjercicio() {
  const ejercicios = datosPorDia[diaElegido];

  const nombre = document.getElementById("nombre-ejercicio");
  const peso = document.getElementById("peso");
  const reps = document.getElementById("repeticiones");

  if (!nombre || !peso || !reps) return;

  if (ejercicios && ejercicios.length > 0) {
    nombre.textContent = ejercicios[indice].nombre;
    peso.textContent = "Peso: " + ejercicios[indice].peso;
    reps.textContent = "Reps: " + ejercicios[indice].reps;
  } else {
    nombre.textContent = "Sin ejercicios";
    peso.textContent = "Peso: -";
    reps.textContent = "Reps: -";
  }
}

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

function guardarRutina() {
  const texto = document.getElementById("rutina-editable").value;
  rutinasGuardadas[diaElegido] = texto;
  actualizarVistaPrevia();
}

function actualizarVistaPrevia() {
  const rutina = rutinasGuardadas[diaElegido] || "Aquí se verá la rutina guardada...";
  const guardada = document.getElementById("rutina-guardada");
  const titulo = document.getElementById("titulo-previa");

  if (guardada) guardada.textContent = rutina;
  if (titulo) titulo.textContent = `Vista previa - ${diaElegido}`;
}

function subirRutina() {
  const texto = rutinasGuardadas[diaElegido] || "";
  if (texto.trim() !== "") {
    rutinasSubidas[diaElegido] = texto;
  } else {
    delete rutinasSubidas[diaElegido];
  }
  actualizarRutinaFinal();
}

function actualizarRutinaFinal() {
  const container = document.getElementById("rutina-final-container");
  const rutina = rutinasSubidas[diaElegido];
  const finalBox = document.getElementById("rutina-final");

  if (!container || !finalBox) return;

  if (rutina && rutina.trim() !== "") {
    finalBox.textContent = rutina;
    container.style.display = "block";
  } else {
    container.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  mostrarEjercicio();
  actualizarVistaPrevia();
  actualizarRutinaFinal();
});
