const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../../data/edulearn.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'teacher',
      avatar TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      modality TEXT,
      level TEXT DEFAULT 'beginner',
      duration_hours REAL DEFAULT 0,
      image_url TEXT,
      instructor_id INTEGER REFERENCES users(id),
      status TEXT DEFAULT 'published',
      rating REAL DEFAULT 0,
      enrolled_count INTEGER DEFAULT 0,
      start_time TEXT,
      end_time TEXT,
      meeting_url TEXT,
      max_seats INTEGER,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS course_modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      order_index INTEGER DEFAULT 0,
      duration_mins INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS competency_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      tag TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      course_id INTEGER NOT NULL REFERENCES courses(id),
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      progress INTEGER DEFAULT 0,
      completed_at DATETIME,
      UNIQUE(user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS module_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      module_id INTEGER NOT NULL REFERENCES course_modules(id),
      completed INTEGER DEFAULT 0,
      completed_at DATETIME,
      UNIQUE(user_id, module_id)
    );

    CREATE TABLE IF NOT EXISTS discussions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      community_id INTEGER,
      user_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      parent_id INTEGER REFERENCES discussions(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS communities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      image_url TEXT,
      member_count INTEGER DEFAULT 0,
      created_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS community_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(community_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS learning_pathways (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      level TEXT,
      duration_hours REAL DEFAULT 0,
      image_url TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pathway_courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pathway_id INTEGER NOT NULL REFERENCES learning_pathways(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id),
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pathway_enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      pathway_id INTEGER NOT NULL REFERENCES learning_pathways(id),
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, pathway_id)
    );
  `);

  // Seed admin user if not exists
  const admin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@edulearn.pro');
  if (!admin) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`).run('Admin', 'admin@edulearn.pro', hash, 'admin');
  }

  return db;
}

module.exports = { getDb, initDb };
