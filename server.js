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

// Cliente ADMIN (Service Role) — ¡solo en backend!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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

// ===================== PLANES =====================
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

// ===================== PERFILES =====================
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

// ===================== DELETE ACCOUNT =====================
// POST /api/delete-account  (Authorization: Bearer <access_token>)
app.post("/api/delete-account", async (req, res) => {
  try {
    const auth = req.header("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing bearer token" });

    // 1) Resolver usuario desde el token
    const { data: userData, error: uErr } = await supabase.auth.getUser(token);
    if (uErr || !userData?.user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const u = userData.user;
    const userId = u.id;
    const userEmail = (u.email || "").toLowerCase();

    // 2) Borrar filas auxiliares (mejor esfuerzo)
    try { await supabase.from("profiles").delete().eq("id", userId); } catch {}
    try { await supabase.from("profiles").delete().eq("uid", userId); } catch {}
    try { await supabase.from("plans").delete().in("uid", [userId, userEmail]); } catch {}

    // 3) Borrar archivos de avatar (bucket "avatars/userId/*")
    try {
      const AVATAR_BUCKET = "avatars";
      const { data: files } = await supabase.storage.from(AVATAR_BUCKET).list(userId, { limit: 100 });
      if (files?.length) {
        await supabase.storage.from(AVATAR_BUCKET)
          .remove(files.map(f => `${userId}/${f.name}`));
      }
    } catch {}

    // 4) Borrar usuario de Auth (Service Role)
    const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
    if (delErr) return res.status(400).json({ error: delErr.message });

    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE ACCOUNT error:", err);
    res.status(500).json({ error: "server_error", message: err.message });
  }
});

// === Arrancar ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor arriba en http://localhost:${PORT}`);
});
