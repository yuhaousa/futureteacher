-- Migration 0017: Standalone Resource Library

CREATE TABLE IF NOT EXISTS library_resources (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT NOT NULL,
  description      TEXT,
  file_url         TEXT,
  file_type        TEXT NOT NULL DEFAULT 'document', -- 'pdf' | 'video' | 'ppt' | 'doc' | 'image' | 'link'
  file_name        TEXT,
  file_size        INTEGER DEFAULT 0,
  category         TEXT,   -- pedagogy | assessment | technology | wellbeing | leadership | curriculum | special needs
  subject_area     TEXT,
  target_audience  TEXT DEFAULT 'all',  -- primary | secondary | ite | all
  tags             TEXT DEFAULT '[]',   -- JSON array of strings
  ai_context       TEXT,               -- description/notes for AI to use as context
  is_ai_source     INTEGER DEFAULT 0,  -- 1 = available as AI knowledge source
  uploaded_by      INTEGER REFERENCES users(id),
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_library_resources_type     ON library_resources(file_type);
CREATE INDEX IF NOT EXISTS idx_library_resources_category ON library_resources(category);
CREATE INDEX IF NOT EXISTS idx_library_resources_ai       ON library_resources(is_ai_source);
