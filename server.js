// server.js — Express + Supabase (CommonJS)
const express = require("express");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

// === Cargar variables de entorno ===
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// === Express ===
const app = express();
app.use(express.json());
const FRONT_DIR = __dirname;
app.use(express.static(FRONT_DIR));

// === Helpers ===
const PLAN_FILE = path.join(__dirname, "plan.js");
function loadLocalPlan() {
  try {
    delete require.cache[require.resolve(PLAN_FILE)];
    return require(PLAN_FILE);
  } catch {
    return {};
  }
}

// === Rutas ===
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// PLANES
app.get("/api/plan", async (req, res) => {
  const uid = (req.query.uid || "guest").toLowerCase();
  const { data, error } = await supabase
    .from("plans")
    .select("data")
    .eq("uid", uid)
    .single();
  if (error && error.code !== "PGRST116") {
    console.error(error);
    return res.status(500).json({ error: "DB error" });
  }
  if (data?.data) return res.json(data.data);
  return res.json(loadLocalPlan());
});

app.post("/api/plan", async (req, res) => {
  const { uid, data } = req.body || {};
  if (!uid || typeof data !== "object") {
    return res.status(400).json({ error: "Body inválido" });
  }
  const row = { uid: uid.toLowerCase(), data, updated_at: new Date().toISOString() };
  const { error } = await supabase.from("plans").upsert(row).eq("uid", row.uid);
  if (error) {
    console.error(error);
    return res.status(500).json({ error: "No se pudo guardar" });
  }
  fs.writeFileSync(path.join(__dirname, "plan.backup.json"), JSON.stringify(data, null, 2));
  res.json({ ok: true });
});

// PERFILES
app.get("/api/profile", async (req, res) => {
  const uid = (req.query.uid || "").toLowerCase();
  if (!uid) return res.status(400).json({ error: "Falta uid" });
  const { data, error } = await supabase
    .from("profiles")
    .select("data")
    .eq("uid", uid)
    .single();
  if (error && error.code !== "PGRST116") {
    console.error(error);
    return res.status(500).json({ error: "DB error" });
  }
  res.json(data?.data || null);
});

app.post("/api/profile", async (req, res) => {
  const { uid, data } = req.body || {};
  if (!uid || typeof data !== "object") {
    return res.status(400).json({ error: "Body inválido" });
  }
  const row = { uid: uid.toLowerCase(), data, updated_at: new Date().toISOString() };
  const { error } = await supabase.from("profiles").upsert(row).eq("uid", row.uid);
  if (error) {
    console.error(error);
    return res.status(500).json({ error: "No se pudo guardar" });
  }
  res.json({ ok: true });
});

// === Arrancar ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor arriba en http://localhost:${PORT}`);
});
