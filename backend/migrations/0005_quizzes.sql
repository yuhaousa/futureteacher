-- Migration 0005: Question Bank and Quizzes/Exams

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice', -- 'multiple_choice' | 'true_false' | 'short_answer'
  options TEXT DEFAULT '[]',        -- JSON array of strings (MC options or empty)
  correct_answer TEXT NOT NULL DEFAULT '', -- '0'-'3' for MC, 'true'/'false' for TF, text for SA
  explanation TEXT,
  points INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_questions_course_id ON questions(course_id);

CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  quiz_type TEXT NOT NULL DEFAULT 'quiz',  -- 'quiz' | 'exam'
  time_limit_mins INTEGER DEFAULT 0,       -- 0 = no limit
  pass_score INTEGER DEFAULT 70,           -- percentage
  randomize INTEGER DEFAULT 0,             -- 0|1
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  UNIQUE(quiz_id, question_id)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers TEXT DEFAULT '{}',  -- JSON { questionId: answer }
  score INTEGER DEFAULT 0,    -- percentage 0-100
  passed INTEGER DEFAULT 0,   -- 0|1
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(quiz_id, user_id);
