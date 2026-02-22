import "dotenv/config";
import { openDb, run } from "./db.js";

const db = openDb(process.env.DB_PATH || "./data/app.db");

await run(db, `
  CREATE TABLE IF NOT EXISTS tracking (
    ref TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    origin TEXT,
    destination TEXT,
    eta TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const rows = [
  ["AGL-2026-0001", "In Transit", "Shanghai, CN", "Rotterdam, NL", "2026-02-25"],
  ["AGL-2026-0002", "Customs Cleared", "Jebel Ali, AE", "Ain Sokhna, EG", "2026-02-18"],
  ["AGL-2026-0003", "Delivered", "Hamburg, DE", "New York, US", "2026-02-05"]
];

for (const r of rows) {
  await run(db, `
    INSERT OR REPLACE INTO tracking (ref, status, origin, destination, eta, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `, r);
}

console.log("Seeded tracking data ✅");
process.exit(0);
