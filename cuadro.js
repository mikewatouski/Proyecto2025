// Simulación de entrada que luego será reemplazada por el backend
window.rutinasSubidas = {
  Lunes: "Sentadillas:60\nPress banca:40\nBicep:20",
  Martes: "Peso muerto:80\nRemo:60\nPres militar:40",
  Miércoles: "Sentadilla:50",
  Jueves: "Press militar:35",
  Viernes: "Curl biceps:25",
  Sábado: "Tríceps:20",
  Domingo: ""
};

// Función para convertir las rutinas en objetos de gráfico
function procesarRutinasParaGraficos(rutinas) {
  const resultado = {};
  for (const dia in rutinas) {
    const texto = rutinas[dia];
    if (!texto) {
      resultado[dia] = [];
      continue;
    }
    const lineas = texto.split("\n");
    resultado[dia] = lineas.map(linea => {
      const [ejercicio, peso] = linea.split(":");
      return {
        ejercicio: ejercicio.trim(),
        peso: parseFloat(peso)
      };
    });
  }
  return resultado;
}

// Convertimos los datos del backend a datos del gráfico
let datosPesoPorDia = procesarRutinasParaGraficos(window.rutinasSubidas || {});

// Configuración del gráfico
let graficoPeso;

function mostrarGraficoPeso(dia) {
  document.querySelectorAll('#dias-peso .boton-dia').forEach(b => b.classList.remove('seleccionado'));
  const boton = Array.from(document.querySelectorAll('#dias-peso .boton-dia')).find(b => b.textContent === dia);
  if (boton) boton.classList.add('seleccionado');

  const datos = datosPesoPorDia[dia] || [];
  const labels = datos.map(ej => ej.ejercicio);
  const pesos = datos.map(ej => ej.peso);

  const ctx = document.getElementById('grafico-peso').getContext('2d');

  if (graficoPeso) {
    graficoPeso.destroy();
  }

  graficoPeso = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Peso levantado (kg)',
        data: pesos,
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderColor: '#2563eb',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Mostrar gráfico inicial al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  mostrarGraficoPeso('Lunes');
});
