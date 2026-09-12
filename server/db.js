const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'kemmdiscount.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

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
    location TEXT NOT NULL DEFAULT 'Pittsburgh, PA',
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
