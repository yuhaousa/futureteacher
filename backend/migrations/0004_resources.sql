-- Migration 0004: Course Resource Library

CREATE TABLE IF NOT EXISTS course_resources (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  file_url    TEXT NOT NULL,
  file_type   TEXT NOT NULL DEFAULT 'document',  -- 'pdf' | 'video' | 'link'
  label       TEXT,          -- e.g. 'Reading', 'Video Lecture', 'Template', 'Activity', 'Assessment'
  tags        TEXT DEFAULT '[]',  -- JSON array: '["formative","grade3","reading"]'
  size_bytes  INTEGER DEFAULT 0,
  uploaded_by INTEGER REFERENCES users(id),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_course_resources_course_id ON course_resources(course_id);
