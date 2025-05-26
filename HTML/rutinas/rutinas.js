let datosPorDia = {}; // Se llena desde la base de datos

let diaElegido = "Lunes";
let indice = 0;

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

function siguienteEjercicio() {
  const ejercicios = datosPorDia[diaElegido];
  if (!ejercicios || ejercicios.length === 0) return;
  indice = (indice + 1) % ejercicios.length;
  mostrarEjercicio();
}

function anteriorEjercicio() {
  const ejercicios = datosPorDia[diaElegido];
  if (!ejercicios || ejercicios.length === 0) return;
  indice = (indice - 1 + ejercicios.length) % ejercicios.length;
  mostrarEjercicio();
}

function cambiarDia(dia) {
  if (!datosPorDia[dia]) return;
  diaElegido = dia;
  indice = 0;
  mostrarEjercicio();
}

function seleccionarDia(boton, dia) {
  const botones = document.querySelectorAll('.boton-dia');
  botones.forEach(b => b.classList.remove('seleccionado'));
  boton.classList.add('seleccionado');
  cambiarDia(dia);
}

function cargarDesdeBase(datos) {
  datosPorDia = datos;
  mostrarEjercicio();
}

document.addEventListener("DOMContentLoaded", () => {
  // fetch('/api/ejercicios')
  //   .then(respuesta => respuesta.json())
  //   .then(data => cargarDesdeBase(data));

  mostrarEjercicio();
});


function seleccionarSeccion(boton, nombre) {
  const botones = document.querySelectorAll('.boton-seccion');
  botones.forEach(btn => {
    btn.classList.remove('blanco');
    btn.classList.add('azul');
  });

  boton.classList.remove('azul');
  boton.classList.add('blanco');
}