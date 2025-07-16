document.getElementById('formulario-deporte').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const deporte = document.getElementById('deporte').value;
    const dificultad = document.getElementById('dificultad').value;
    const intensidad = document.getElementById('Objetivo').value;
  
    if (!deporte || !dificultad || !intensidad) {
      document.getElementById('resultado').textContent = 'Por favor, completá todos los campos.';
      return;
    }
  
    
    const params = new URLSearchParams({
      deporte: deporte,
      dificultad: dificultad,
      intensidad: intensidad
    });
  
    window.location.href = `rutinas.html?${params.toString()}`;
  });
  