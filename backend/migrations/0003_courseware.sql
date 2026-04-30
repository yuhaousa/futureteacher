-- Migration 0003: Courseware files and module video support

ALTER TABLE course_modules ADD COLUMN video_url TEXT;

CREATE TABLE IF NOT EXISTS courseware_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'document',
  size_bytes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
