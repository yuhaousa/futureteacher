-- Schema migration for EduLearn Pro (Cloudflare D1)

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
