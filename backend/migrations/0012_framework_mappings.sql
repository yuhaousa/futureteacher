-- Add source standard and version tracking to skill frameworks
ALTER TABLE skill_frameworks ADD COLUMN source_standard TEXT;
ALTER TABLE skill_frameworks ADD COLUMN version TEXT;

-- Map courses to competency frameworks (framework-level alignment)
CREATE TABLE IF NOT EXISTS framework_course_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  framework_id INTEGER NOT NULL REFERENCES skill_frameworks(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(framework_id, course_id)
);

-- Map learning pathways to competency frameworks
CREATE TABLE IF NOT EXISTS framework_pathway_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  framework_id INTEGER NOT NULL REFERENCES skill_frameworks(id) ON DELETE CASCADE,
  pathway_id INTEGER NOT NULL REFERENCES learning_pathways(id) ON DELETE CASCADE,
  UNIQUE(framework_id, pathway_id)
);
