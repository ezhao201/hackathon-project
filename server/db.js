const path = require('path');
const fs = require('fs');

// node:sqlite is built into Node >= 22.13, so there is no native module to compile.
// Some versions emit an ExperimentalWarning when it is first required; silence just that one.
const originalEmit = process.emitWarning;
process.emitWarning = (warning, ...args) => {
  const msg = typeof warning === 'string' ? warning : warning?.message || '';
  if (msg.includes('SQLite is an experimental feature')) return;
  originalEmit.call(process, warning, ...args);
};

const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'kemmdiscount.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Small helper mirroring better-sqlite3's transaction() API.
db.transaction = (fn) => (...args) => {
  db.exec('BEGIN');
  try {
    const result = fn(...args);
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
};

db.path = DB_PATH;

// Privacy: the users table intentionally stores only name, email, password hash,
// eligibility tags, location preference and preferred categories.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    eligibility TEXT NOT NULL DEFAULT '[]',
    student_verified INTEGER NOT NULL DEFAULT 0,
    location TEXT NOT NULL DEFAULT 'Pittsburgh, PA (CMU area)',
    categories TEXT NOT NULL DEFAULT '[]',
    onboarded INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS discounts (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    eligibility TEXT NOT NULL DEFAULT '[]',
    location TEXT NOT NULL DEFAULT 'Online',
    expiry TEXT NOT NULL,
    link TEXT NOT NULL DEFAULT '#',
    estimated_savings REAL NOT NULL DEFAULT 0,
    keywords TEXT NOT NULL DEFAULT '',
    popularity INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS claimed_deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    discount_id INTEGER NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
    amount_saved REAL NOT NULL DEFAULT 0,
    claimed_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, discount_id)
  );

  CREATE INDEX IF NOT EXISTS idx_claimed_user ON claimed_deals(user_id);
  CREATE INDEX IF NOT EXISTS idx_discounts_category ON discounts(category);
`);

module.exports = db;
