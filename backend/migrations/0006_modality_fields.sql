-- Add modality-specific fields to courses table
ALTER TABLE courses ADD COLUMN start_time TEXT;
ALTER TABLE courses ADD COLUMN end_time TEXT;
ALTER TABLE courses ADD COLUMN meeting_url TEXT;
ALTER TABLE courses ADD COLUMN max_seats INTEGER;
ALTER TABLE courses ADD COLUMN location TEXT;
