// --- "Base de datos" local ---
const STORAGE_KEY = "rutinas_gym_v1";

const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

let rutinas = {};
let diaElegido = "Lunes";
let indiceEjercicio = 0;

// Mini rutina precargada (se instala si no hay datos)
const SEED = {
  "Lunes": [
    { nombre: "Press banca", peso: 40, reps: 10, img: "imagen-ejemplo.png" },
    { nombre: "Remo con barra", peso: 35, reps: 12, img: "imagen-ejemplo.png" }
  ],
  "Martes": [
    { nombre: "Sentadillas", peso: 50, reps: 10, img: "imagen-ejemplo.png" }
  ]
};

// ----------------- Utilidades de almacenamiento -----------------
function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      rutinas = JSON.parse(raw);
    } catch {
      rutinas = {};
    }
  }
  // Si no hay nada, seed
  if (!raw || Object.keys(rutinas).length === 0) {
    rutinas = { ...SEED };
    DIAS.forEach(d => { if (!rutinas[d]) rutinas[d] = []; });
    saveData();
  } else {
    // aseguro que existan todos los días
    DIAS.forEach(d => { if (!rutinas[d]) rutinas[d] = []; });
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rutinas));
}

// ----------------- Navegación de secciones -----------------
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
    document.getElementById("titulo-previa").textContent = `Edición rutina día ${diaElegido}`;
    renderEditDias();
    renderEditList();
    renderPreviewDia();
  } else {
    zonaContenido.style.display = 'grid';
    zonaEdicion.style.display = 'none';
    indiceEjercicio = 0;
    renderEjercicioActual();
    renderRutinaFinalColumnaDerecha();
  }
}

// ----------------- Selección de día -----------------
function seleccionarDia(boton, dia) {
  document.querySelectorAll('.boton-dia').forEach(b => b.classList.remove('seleccionado'));
  boton.classList.add('seleccionado');
  diaElegido = dia;
  indiceEjercicio = 0;

  // Si estoy en edición, también reflejo
  const seccionEdicionVisible = document.getElementById('zona-edicion').style.display !== 'none';
  if (seccionEdicionVisible) {
    document.getElementById("titulo-previa").textContent = `Edición rutina día ${dia}`;
    // sin perder estilos, re-renderizo
    marcarDiaEnEdicion();
    renderEditList();
    renderPreviewDia();
  }

  renderEjercicioActual();
  renderRutinaFinalColumnaDerecha();
}

// ----------------- Render de la zona de visualización -----------------
function renderEjercicioActual() {
  const lista = rutinas[diaElegido] || [];
  const actual = lista[indiceEjercicio] || null;

  const img = document.getElementById("img-ejercicio");
  const nombreEl = document.getElementById("nombre-ejercicio");
  const pesoEl = document.getElementById("peso");
  const repsEl = document.getElementById("repeticiones");

  if (!actual) {
    img.src = "imagen-ejemplo.png";
    nombreEl.textContent = "Ejercicio: -";
    pesoEl.textContent = "Peso: -";
    repsEl.textContent = "Reps: -";
    return;
  }

  img.src = actual.img || "imagen-ejemplo.png";
  nombreEl.textContent = `Ejercicio: ${actual.nombre || "-"}`;
  pesoEl.textContent = `Peso: ${actual.peso ?? "-"} kg`;
  repsEl.textContent = `Reps: ${actual.reps ?? "-"}`;
}

function anteriorEjercicio() {
  const lista = rutinas[diaElegido] || [];
  if (lista.length === 0) return;
  indiceEjercicio = (indiceEjercicio - 1 + lista.length) % lista.length;
  renderEjercicioActual();
}

function siguienteEjercicio() {
  const lista = rutinas[diaElegido] || [];
  if (lista.length === 0) return;
  indiceEjercicio = (indiceEjercicio + 1) % lista.length;
  renderEjercicioActual();
}

// ----------------- Columna derecha: rutina del día -----------------
function renderRutinaFinalColumnaDerecha() {
  const container = document.getElementById("rutina-final-container");
  const box = document.getElementById("rutina-final");
  const lista = rutinas[diaElegido] || [];

  if (lista.length === 0) {
    box.textContent = "No hay ejercicios cargados para este día.";
    container.style.display = "block";
    return;
  }

  // formateo simple
  const lines = lista.map((e, i) => `${i+1}. ${e.nombre} - ${e.peso} kg x ${e.reps} reps`);
  box.textContent = lines.join("\n");
  container.style.display = "block";
}

// ----------------- EDICIÓN -----------------
function renderEditDias() {
  const cont = document.getElementById("edit-dias");
  cont.innerHTML = "";
  DIAS.forEach(d => {
    const btn = document.createElement("button");
    btn.textContent = d;
    btn.className = "boton-dia" + (d === diaElegido ? " seleccionado" : "");
    btn.onclick = () => {
      // sincronizo selección en ambos lados
      diaElegido = d;
      indiceEjercicio = 0;
      document.getElementById("titulo-previa").textContent = `Edición rutina día ${d}`;
      marcarDiaEnEdicion();
      marcarDiaEnVista(d);
      renderEditList();
      renderPreviewDia();
      renderEjercicioActual();
      renderRutinaFinalColumnaDerecha();
    };
    cont.appendChild(btn);
  });

  // Botones acciones
  document.getElementById("btn-add").onclick = () => {
    rutinas[diaElegido].push({ nombre: "Nuevo ejercicio", peso: 0, reps: 0, img: "imagen-ejemplo.png" });
    renderEditList();
    renderPreviewDia();
  };

  document.getElementById("btn-save").onclick = () => {
    saveData();
    alert("Modificación guardada");
    renderRutinaFinalColumnaDerecha();
    renderEjercicioActual();
  };
}

function marcarDiaEnEdicion() {
  document.querySelectorAll('#edit-dias .boton-dia').forEach(btn => {
    btn.classList.toggle('seleccionado', btn.textContent === diaElegido);
  });
}

function marcarDiaEnVista(d) {
  document.querySelectorAll('#dias .boton-dia').forEach(btn => {
    btn.classList.toggle('seleccionado', btn.textContent === d);
  });
}

function renderEditList() {
  const cont = document.getElementById("edit-list");
  cont.innerHTML = "";

  const lista = rutinas[diaElegido] || [];
  if (lista.length === 0) {
    cont.innerHTML = `<div class="text-gray-300">No hay ejercicios. Presioná "Agregar ejercicio".</div>`;
    return;
  }

  lista.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "fila-edit";

    // Nombre
    const g1 = document.createElement("div");
    g1.className = "grupo-edit";
    const l1 = document.createElement("label");
    l1.className = "label-edit";
    l1.textContent = "Ejercicio";
    const i1 = document.createElement("input");
    i1.className = "input-oscuro";
    i1.type = "text";
    i1.value = item.nombre || "";
    i1.oninput = (e) => { item.nombre = e.target.value; renderPreviewDia(); };

    // Peso
    const g2 = document.createElement("div");
    g2.className = "grupo-edit";
    const l2 = document.createElement("label");
    l2.className = "label-edit";
    l2.textContent = "Peso (kg)";
    const i2 = document.createElement("input");
    i2.className = "input-oscuro";
    i2.type = "number";
    i2.min = "0";
    i2.value = item.peso ?? 0;
    i2.oninput = (e) => { item.peso = Number(e.target.value); renderPreviewDia(); };

    // Reps
    const g3 = document.createElement("div");
    g3.className = "grupo-edit";
    const l3 = document.createElement("label");
    l3.className = "label-edit";
    l3.textContent = "Reps";
    const i3 = document.createElement("input");
    i3.className = "input-oscuro";
    i3.type = "number";
    i3.min = "0";
    i3.value = item.reps ?? 0;
    i3.oninput = (e) => { item.reps = Number(e.target.value); renderPreviewDia(); };

    // Imagen (opcional, por si querés distintas imágenes)
    const g4 = document.createElement("div");
    g4.className = "grupo-edit";
    const l4 = document.createElement("label");
    l4.className = "label-edit";
    l4.textContent = "Imagen (URL)";
    const i4 = document.createElement("input");
    i4.className = "input-oscuro";
    i4.type = "text";
    i4.placeholder = "imagen-ejemplo.png";
    i4.value = item.img || "";
    i4.oninput = (e) => { item.img = e.target.value; renderPreviewDia(); };

    // Botón borrar
    const borrar = document.createElement("button");
    borrar.className = "btn-secundario";
    borrar.textContent = "Eliminar";
    borrar.onclick = () => {
      rutinas[diaElegido].splice(idx, 1);
      renderEditList();
      renderPreviewDia();
      renderEjercicioActual();
      renderRutinaFinalColumnaDerecha();
    };

    g1.appendChild(l1); g1.appendChild(i1);
    g2.appendChild(l2); g2.appendChild(i2);
    g3.appendChild(l3); g3.appendChild(i3);
    g4.appendChild(l4); g4.appendChild(i4);

    row.appendChild(g1);
    row.appendChild(g2);
    row.appendChild(g3);
    row.appendChild(g4);
    row.appendChild(borrar);

    cont.appendChild(row);
  });
}

function renderPreviewDia() {
  const box = document.getElementById("preview-dia");
  const lista = rutinas[diaElegido] || [];
  if (lista.length === 0) {
    box.textContent = "Sin ejercicios.";
    return;
  }
  const lines = lista.map((e,i)=> `${i+1}. ${e.nombre} - ${e.peso} kg x ${e.reps} reps`);
  box.textContent = lines.join("\n");
}

// ----------------- Init -----------------
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  // marcar Lunes seleccionado por defecto en vista
  marcarDiaEnVista(diaElegido);
  renderEjercicioActual();
  renderRutinaFinalColumnaDerecha();
});

// Exponer funciones al scope global para los onclick del HTML
window.seleccionarSeccion = seleccionarSeccion;
window.seleccionarDia = seleccionarDia;
window.anteriorEjercicio = anteriorEjercicio;
window.siguienteEjercicio = siguienteEjercicio;
