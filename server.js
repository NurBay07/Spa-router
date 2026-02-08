import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'requests.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3');
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
});

app.use(express.json());
app.use(express.static(__dirname));

const rateBuckets = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateBuckets.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  rateBuckets.set(ip, entry);
  return entry.count > RATE_LIMIT_MAX;
}

function validatePayload(data) {
  const errors = [];
  if (!data?.name) errors.push('name');
  if (!data?.message) errors.push('message');
  if (!data?.phone) {
    errors.push('phone');
  } else if (!/^\d+$/.test(data.phone)) {
    errors.push('phone_digits');
  } else if (data.phone.length < 10) {
    errors.push('phone_min');
  }
  return errors;
}

function insertRequest(record) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO requests (name, phone, message, created_at) VALUES (?, ?, ?, ?)` ,
      [record.name, record.phone, record.message, record.created_at],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

app.post('/api/contact', async (req, res) => {
  if (isRateLimited(req.ip)) {
    return res.status(429).json({ ok: false, message: 'Too many requests. Try later.' });
  }

  const data = req.body;
  const errors = validatePayload(data);
  if (errors.length) {
    return res.status(400).json({ ok: false, message: 'Validation failed', errors });
  }

  const record = {
    name: data.name.trim(),
    phone: data.phone.trim(),
    message: data.message.trim(),
    created_at: new Date().toISOString(),
  };

  try {
    const id = await insertRequest(record);
    return res.json({ ok: true, id });
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Storage error' });
  }
});

app.get('/api/requests', (req, res) => {
  db.all('SELECT * FROM requests ORDER BY id DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ ok: false, message: 'Database error' });
    }
    return res.json({ ok: true, data: rows });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
