-- Migration 0015: Course skills - link courses to skill framework skills

CREATE TABLE IF NOT EXISTS course_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT,
  proficiency_gained TEXT DEFAULT 'basic'
);
