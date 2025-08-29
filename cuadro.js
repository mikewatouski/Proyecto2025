// ==== CUADROS: toma datos de rutinas.html (localStorage) y arma el gráfico ====

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "rutinas:data:v1";
  const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

  const ctxEl   = document.getElementById("graficoEntrenamientos");
  const selector= document.getElementById("selectorGrafico");
  const titulo  = document.getElementById("tituloGrafico");
  if (!ctxEl || !selector || !titulo) return;

  // ---------- Cargar rutinas desde localStorage ----------
  function loadData(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }catch(_e){}
    // Fallback si no hay nada guardado (mismo formato que usabas)
    return {
      "Lunes": [
        { nombre:"Press banca", peso:40, reps:10, img:"" },
        { nombre:"Remo con barra", peso:35, reps:12, img:"" }
      ],
      "Martes":[],
      "Miércoles":[],
      "Jueves":[],
      "Viernes":[],
      "Sábado":[],
      "Domingo":[]
    };
  }

  const data = loadData();

  // ---------- Métricas por día ----------
  // completados: cantidad de ejercicios cargados por día (proxy de “entrenamientos”)
  const completadosPorDia = DAYS.map(d => (data[d] || []).length);

  // volumen: suma de (peso * reps) por día (si no hay datos -> 0)
  const volumenPorDia = DAYS.map(d => {
    const arr = data[d] || [];
    return arr.reduce((acc, ex) => acc + (Number(ex.peso)||0) * (Number(ex.reps)||0), 0);
  });

  // ---------- Chart.js con paleta cálida + sombras ----------
  const ctx = ctxEl.getContext("2d");
  const mkGrad = () => {
    const g = ctx.createLinearGradient(0, 0, ctxEl.width, 0);
    g.addColorStop(0,   "#FA4300");
    g.addColorStop(0.6, "#FA6C06");
    g.addColorStop(1,   "#D7AA18");
    return g;
  };

  const shadowLine = {
    id: "shadowLine",
    beforeDatasetDraw(chart, args) {
      const { ctx } = chart;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.45)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
    },
    afterDatasetDraw(chart, args) { chart.ctx.restore(); }
  };

  // datasets dinámicos basados en localStorage
  const dsCompletados = {
    labels: DAYS,
    datasets: [{
      label: "Ejercicios cargados",
      data: completadosPorDia,
      borderColor: mkGrad(),
      backgroundColor: "rgba(250,108,6,.18)",
      pointBackgroundColor: "#fff",
      pointBorderColor: mkGrad(),
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.35
    }]
  };

  const dsVolumen = {
    labels: DAYS,
    datasets: [{
      label: "Volumen (kg·reps)",
      data: volumenPorDia,
      borderColor: mkGrad(),
      backgroundColor: "rgba(215,170,24,.18)",
      pointBackgroundColor: "#fff",
      pointBorderColor: mkGrad(),
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.35
    }]
  };

  const baseOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f0f10",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255,255,255,.12)",
        borderWidth: 1,
        padding: 10
      },
      title: {
        display: true,
        text: "Entrenamientos Completados",
        color: "#fff",
        font: { size: 16, weight: "700" }
      }
    },
    scales: {
      x: { ticks: { color: "#f6efe9" }, grid: { color: "rgba(255,255,255,.06)" } },
      y: { ticks: { color: "#f6efe9" }, grid: { color: "rgba(255,255,255,.06)" } }
    }
  };

  const chart = new Chart(ctxEl, { type: "line", data: dsCompletados, options: baseOptions, plugins: [shadowLine] });

  // ---------- Selector: cambia dataset ----------
  selector.addEventListener("change", () => {
    if (selector.value === "duracion") {
      chart.data = dsVolumen;
      chart.options.plugins.title.text = "Volumen (kg·reps)";
      titulo.textContent = "Volumen (kg·reps)";
    } else {
      chart.data = dsCompletados;
      chart.options.plugins.title.text = "Entrenamientos Completados";
      titulo.textContent = "Entrenamientos Completados";
    }
    // Recomputa gradiente tras cambios/resize
    chart.data.datasets.forEach(ds => {
      ds.borderColor = mkGrad();
      ds.pointBorderColor = mkGrad();
    });
    chart.update();
  });

  // Recalcular gradiente en resize
  new ResizeObserver(() => {
    chart.data.datasets.forEach(ds => {
      ds.borderColor = mkGrad();
      ds.pointBorderColor = mkGrad();
    });
    chart.update("none");
  }).observe(ctxEl);
});


// === Avatar dinámico según usuario logueado ===
(function loadAvatar(){
  const KEY = "CURRENT_USER";
  const usersKey = "users:data:v1";
  const uid = localStorage.getItem(KEY);
  if(!uid) return;

  const users = JSON.parse(localStorage.getItem(usersKey) || "{}");
  const user = users[uid];
  if(!user || !user.profile) return;

  const $avatar = document.getElementById("perfilAvatar");
  if($avatar){
    if(user.profile.avatar){   // si subió foto
      $avatar.src = user.profile.avatar;
    } else {
      $avatar.src = "Logo.png"; // fallback si no tiene imagen
    }
  }
})();
