import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { openDb, run, get } from "./db.js";
import { quoteSchema, trackRefSchema } from "./validators.js";

const PORT = Number(process.env.PORT || 9090);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const DB_PATH = process.env.DB_PATH || "./data/app.db";

const app = express();
const db = openDb(DB_PATH);
const allowedOrigins = new Set([
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

// Security + basics
app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      cb(null, allowedOrigins.has(origin));
    },
  }),
);
app.use(express.json({ limit: "200kb" }));

// Rate limiting
app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
  }),
);

// Health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Init tables
await run(
  db,
  `
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    shipment_type TEXT NOT NULL,
    trade_lane TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`,
);

await run(
  db,
  `
  CREATE TABLE IF NOT EXISTS tracking (
    ref TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    origin TEXT,
    destination TEXT,
    eta TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`,
);

// POST /api/quote
app.post("/api/quote", async (req, res) => {
  const parsed = quoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, errors: parsed.error.issues });
  }

  const q = parsed.data;
  await run(
    db,
    `
    INSERT INTO quotes (full_name, company, email, phone, shipment_type, trade_lane, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
    [
      q.fullName,
      q.company,
      q.email,
      q.phone,
      q.shipmentType,
      q.tradeLane,
      q.message,
    ],
  );

  // Production note: here you can trigger email notifications.

  res.json({ ok: true, message: "Quote request received." });
});

// GET /api/track/:ref
app.get("/api/track/:ref", async (req, res) => {
  const ref = String(req.params.ref || "").trim();
  const v = trackRefSchema.safeParse(ref);
  if (!v.success)
    return res.status(400).json({ ok: false, message: "Invalid reference." });

  const row = await get(db, `SELECT * FROM tracking WHERE ref = ?`, [ref]);
  if (!row) {
    return res.status(404).json({ ok: false, message: "Shipment not found." });
  }
  res.json({ ok: true, data: row });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
