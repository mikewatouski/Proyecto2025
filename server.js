// server.js (Express 5 + endpoint admin)
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.use(express.json());

// ⚠️ Variables de entorno: NO pongas la service role en el front
const SUPABASE_URL   = "https://nnlsljjdoyfzfabfnxxf.supabase.co";
const SERVICE_ROLE   = process.env.SUPABASE_SERVICE_ROLE;   // PONELA ANTES DE LEVANTAR EL SERVER

if (!SERVICE_ROLE) {
  console.warn("[WARN] Falta SUPABASE_SERVICE_ROLE en el entorno.");
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ====== Endpoint: borrar definitivamente la cuenta ======
app.post("/api/delete-account", async (req, res) => {
  try {
    const bearer = req.headers.authorization || "";
    const token  = bearer.startsWith("Bearer ") ? bearer.slice(7) : null;
    if (!token) return res.status(401).json({ error: "missing bearer token" });

    // Validar token de usuario
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: "invalid token" });

    const uid = data.user.id;

    // Limpieza de tus tablas (ajustá nombres si hace falta)
    await admin.from("rutinas").delete().eq("user_id", uid);
    await admin.from("profiles").delete().eq("id", uid);

    // Borrado real del auth.user
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) return res.status(500).json({ error: delErr.message });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// ====== Archivos estáticos (tu app) ======
app.use(express.static(__dirname)); // sirve el directorio actual
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server escuchando en http://localhost:" + PORT));
