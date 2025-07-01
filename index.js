document.getElementById('formulario-deporte').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const deporte = document.getElementById('deporte').value;
    const intensidad = document.getElementById('intensidad').value;
  
    if (!deporte || !intensidad) {
      document.getElementById('resultado').textContent = 'Por favor, completá todos los campos.';
      return;
    }
  
    
    const params = new URLSearchParams({
      deporte: deporte,
      intensidad: intensidad
    });
  
    window.location.href = `rutinas.html?${params.toString()}`;
  });
  