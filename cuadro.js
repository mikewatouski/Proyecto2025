document.addEventListener("DOMContentLoaded", function () {
  const ctx = document.getElementById("graficoEntrenamientos");
  const selector = document.getElementById("selectorGrafico");
  const titulo = document.getElementById("tituloGrafico");

  if (!ctx || !selector || !titulo) return;

  const dataCompletados = {
    labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4", "Semana 5"],
    datasets: [{
      label: "Entrenamientos completados",
      data: [1, 2, 3, 3, 5],
      borderColor: "#3b82f6",
      backgroundColor: "#3b82f6",
      tension: 0.3,
      fill: false,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };

  const dataDuracion = {
    labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4", "Semana 5"],
    datasets: [{
      label: "Duración promedio (min)",
      data: [30, 35, 42, 39, 36],
      borderColor: "#10b981",
      backgroundColor: "#10b981",
      tension: 0.3,
      fill: false,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };



  const config = {
    type: "line",
    data: dataCompletados,
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Entrenamientos Completados',
          color: 'white',
          font: { size: 16 }
        }
      },
      scales: {
        x: {
          ticks: { color: "white" },
          grid: { color: "#444" }
        },
        y: {
          ticks: { color: "white" },
          grid: { color: "#444" }
        }
      }
    }
  };

  const grafico = new Chart(ctx, config);

  selector.addEventListener("change", () => {
    const valor = selector.value;
    switch (valor) {
      case "completados":
        grafico.data = dataCompletados;
        titulo.textContent = "Entrenamientos Completados";
        grafico.options.plugins.title.text = "Entrenamientos Completados";
        break;
      case "duracion":
        grafico.data = dataDuracion;
        titulo.textContent = "Duración Promedio (min)";
        grafico.options.plugins.title.text = "Duración Promedio (min)";
        break;
      case "peso":
        grafico.data = dataPeso;
        titulo.textContent = "Progreso de Peso Corporal";
        grafico.options.plugins.title.text = "Progreso de Peso Corporal";
        break;
    }
    grafico.update();
  });
});
