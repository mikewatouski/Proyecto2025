// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const APP_PORT = 3000;
const FRONT_DIR = __dirname; // donde están tu index.html, rutinas.css, rutinas.js, etc.
const PLAN_PATH = path.join(__dirname, 'plan.js');

const app = express();
app.use(express.json({ limit: '2mb' }));

// servir archivos estáticos (tu HTML/CSS/JS)
app.use(express.static(FRONT_DIR));

// GET actual (lee plan.js fresco)
app.get('/api/plan', (_req, res) => {
  try {
    delete require.cache[require.resolve(PLAN_PATH)];
    const plan = require(PLAN_PATH);
    res.json(plan);
  } catch (err) {
    console.error('Error leyendo plan.js:', err);
    res.status(500).json({ error: 'No se pudo leer plan.js' });
  }
});

// POST guardar (sobrescribe plan.js)
app.post('/api/plan', (req, res) => {
  try {
    const plan = req.body;
    if (typeof plan !== 'object' || Array.isArray(plan)) {
      return res.status(400).json({ error: 'Formato inválido. Debe ser un objeto { "Lunes":[...], ... }' });
    }
    const js = 'module.exports = ' + JSON.stringify(plan, null, 2) + ';\n';
    // backup opcional
    fs.writeFileSync(path.join(__dirname, 'plan.backup.json'), JSON.stringify(plan, null, 2));
    // persistencia principal
    fs.writeFileSync(PLAN_PATH, js, 'utf8');
    // limpiar caché del require
    delete require.cache[require.resolve(PLAN_PATH)];
    res.json({ ok: true });
  } catch (err) {
    console.error('Error guardando plan.js:', err);
    res.status(500).json({ error: 'No se pudo guardar plan.js' });
  }
});

app.listen(APP_PORT, () => {
  console.log(` Servidor en http://localhost:${APP_PORT}`);
});
