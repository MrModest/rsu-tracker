import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import * as schema from './schema.js';

const dbPath = process.env.DATABASE_URL || './data/rsu.db';

mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Auto-create tables on startup
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS grants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    date TEXT NOT NULL,
    share_amount REAL NOT NULL,
    unit_price REAL NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vests (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    share_amount REAL NOT NULL,
    unit_price REAL NOT NULL,
    is_cliff INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sell_for_tax (
    id TEXT PRIMARY KEY,
    vest_id TEXT NOT NULL REFERENCES vests(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    share_amount REAL NOT NULL,
    unit_price REAL NOT NULL,
    fee REAL NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tax_cash_returns (
    id TEXT PRIMARY KEY,
    vest_id TEXT NOT NULL REFERENCES vests(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS releases (
    id TEXT PRIMARY KEY,
    vest_id TEXT NOT NULL REFERENCES vests(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    share_amount REAL NOT NULL,
    unit_price REAL NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sells (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    share_amount REAL NOT NULL,
    unit_price REAL NOT NULL,
    fee REAL NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

console.log('Database initialized at', dbPath);
