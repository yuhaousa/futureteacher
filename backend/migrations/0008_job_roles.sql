-- Job Roles / JD / Skill Map tables

CREATE TABLE IF NOT EXISTS job_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  level TEXT DEFAULT 'entry',   -- entry | mid | senior | lead | manager
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_role_id INTEGER NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT,                -- e.g. 'pedagogy', 'technology', 'leadership'
  required_level TEXT NOT NULL DEFAULT 'basic',  -- basic | intermediate | advanced | expert
  description TEXT,
  order_index INTEGER DEFAULT 0
);
