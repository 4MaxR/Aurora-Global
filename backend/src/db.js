import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

export function openDb(dbPath) {
  const full = path.resolve(dbPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  const db = new sqlite3.Database(full);
  return db;
}

export function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}
