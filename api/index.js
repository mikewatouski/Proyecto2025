const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // permite acceso desde el frontend
app.use(express.json()); // permite leer JSON del body

// Ruta que recibe datos desde el front
app.post('/api/guardar', (req, res) => {
  const datos = req.body;
  console.log('📩 Datos recibidos:', datos);

  // Acá más adelante vas a guardar en MySQL
  res.status(200).json({ mensaje: 'Datos recibidos correctamente' });
});

app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

app.listen(PORT, () => {
  console.log(`✅ API corriendo en http://localhost:${PORT}`);
});
