
document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("graficoProgreso").getContext("2d");

  const ejemploData = {
    labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    datasets: [{
      label: "Ejercicios realizados",
      data: [6,2 ,0 ,3 ,1 ,2 ,3 ],
      backgroundColor: "rgba(30, 144, 255, 0.5)",
      borderColor: "rgba(30, 144, 255, 1)",
      borderWidth: 2
    }]
  };

  new Chart(ctx, {
    type: "bar",
    data: ejemploData,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "white"
          }
        },
        x: {
          ticks: {
            color: "white"
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: "white"
          }
        }
      }
    }
  });
});
