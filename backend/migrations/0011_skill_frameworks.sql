-- Skill Framework: master library of skills independent of job roles

CREATE TABLE IF NOT EXISTS skill_frameworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS framework_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  framework_id INTEGER NOT NULL REFERENCES skill_frameworks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  level_basic TEXT,
  level_intermediate TEXT,
  level_advanced TEXT,
  level_expert TEXT,
  order_index INTEGER DEFAULT 0
);
