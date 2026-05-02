import { db } from "./client";

export async function initDb() {
    await db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      is_done INTEGER NOT NULL DEFAULT 0,
      done_at TEXT,
      due_date TEXT,
      category TEXT NOT NULL DEFAULT 'personal',
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT,
      is_synced INTEGER NOT NULL DEFAULT 0
    );
  `);
    await db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      section_id TEXT,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT,
      is_synced INTEGER NOT NULL DEFAULT 0
    );
  `);
    await db.run(`
    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '📁',
      color TEXT NOT NULL DEFAULT '#57a9ad',
      description TEXT,
      parent_id TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT,
      is_synced INTEGER NOT NULL DEFAULT 0
    );
  `);
    await db.run(`
    CREATE TABLE IF NOT EXISTS emotion_logs (
      id TEXT PRIMARY KEY,
      emotion TEXT NOT NULL,
      emotion_category TEXT NOT NULL DEFAULT 'other',
      situation TEXT NOT NULL,
      body_reaction TEXT,
      thought TEXT,
      desired_action TEXT,
      context_tag TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT,
      is_synced INTEGER NOT NULL DEFAULT 0
    );
  `);
}