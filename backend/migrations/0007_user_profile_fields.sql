-- Add profile fields to users table
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN teaching_subjects TEXT; -- JSON array stored as text
ALTER TABLE users ADD COLUMN school TEXT;
ALTER TABLE users ADD COLUMN department TEXT;
