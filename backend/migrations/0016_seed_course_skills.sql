-- Migration 0016: Seed skills for 8 existing courses

-- Course 1: BambooCloud Formative Assessment Strategies (assessment)
INSERT INTO course_skills (course_id, skill_name, category, proficiency_gained) VALUES
(1, 'Formative Assessment Design', 'Assessment', 'advanced'),
(1, 'Effective Feedback Practices', 'Feedback', 'intermediate'),
(1, 'Data-Informed Instruction', 'Assessment', 'intermediate'),
(1, 'Learning Outcomes Alignment', 'Curriculum Design', 'basic');

-- Course 2: Inquiry-Based Learning in Science Education (pedagogy)
INSERT INTO course_skills (course_id, skill_name, category, proficiency_gained) VALUES
(2, 'Bloom''s Taxonomy Application', 'Higher-Order Thinking', 'advanced'),
(2, 'Socratic Questioning Techniques', 'Questioning', 'intermediate'),
(2, 'Facilitated Discussion & Dialogue', 'Facilitation', 'intermediate'),
(2, 'Cooperative Learning Structures', 'Collaboration', 'basic'),
(2, 'Lesson Structure & Pacing', 'Lesson Planning', 'intermediate');

-- Course 3: Leveraging AI Tools for Personalised Learning (technology)
INSERT INTO course_skills (course_id, skill_name, category, proficiency_gained) VALUES
(3, 'Technology-Enhanced Pedagogy', 'ICT Integration', 'advanced'),
(3, 'Data Analytics for Learning', 'ICT Integration', 'intermediate'),
(3, 'Data-Informed Instruction', 'Assessment', 'intermediate'),
(3, 'Digital Citizenship & Online Safety', 'Digital Literacy', 'basic');

-- Course 4: Building Resilience and Wellbeing in Educators (wellbeing)
INSERT INTO course_skills (course_id, skill_name, category, proficiency_gained) VALUES
(4, 'Social-Emotional Learning (SEL) Integration', 'Well-being', 'advanced'),
(4, 'Student Motivation & Engagement Strategies', 'Student Engagement', 'intermediate'),
(4, 'Positive Behaviour Support', 'Classroom Management', 'intermediate'),
(4, 'Evidence-Based Reflective Practice', 'Reflection', 'basic');

-- Course 5: Differentiated Instruction: Reaching Every Learner (pedagogy)
INSERT INTO course_skills (course_id, skill_name, category, proficiency_gained) VALUES
(5, 'Learning Profile Identification', 'Differentiation', 'advanced'),
(5, 'Tiered Tasks & Scaffolding', 'Differentiation', 'advanced'),
(5, 'Formative Assessment Design', 'Assessment', 'intermediate'),
(5, 'Student Motivation & Engagement Strategies', 'Student Engagement', 'intermediate'),
(5, 'Lesson Structure & Pacing', 'Lesson Planning', 'basic');

-- Course 6: Leadership in Education: From Teacher to Leader (leadership)
INSERT INTO course_skills (course_id, skill_name, category, proficiency_gained) VALUES
(6, 'Evidence-Based Reflective Practice', 'Reflection', 'advanced'),
(6, 'Lesson Study & Peer Observation', 'Professional Learning', 'advanced'),
(6, 'Parent Communication & Partnership', 'Community Engagement', 'intermediate'),
(6, 'Community & Industry Partnership', 'Community Engagement', 'intermediate'),
(6, '21st Century Competencies (21CC) Development', 'Holistic Development', 'basic');

-- Course 7: Designing Effective Curriculum Maps (curriculum)
INSERT INTO course_skills (course_id, skill_name, category, proficiency_gained) VALUES
(7, 'Learning Outcomes Alignment', 'Curriculum Design', 'advanced'),
(7, 'Vertical & Horizontal Curriculum Coherence', 'Curriculum Design', 'advanced'),
(7, 'Lesson Structure & Pacing', 'Lesson Planning', 'intermediate'),
(7, 'Data-Informed Instruction', 'Assessment', 'intermediate'),
(7, 'Lesson Study & Peer Observation', 'Professional Learning', 'basic');

-- Course 8: Supporting Students with Special Educational Needs (special needs)
INSERT INTO course_skills (course_id, skill_name, category, proficiency_gained) VALUES
(8, 'Learning Profile Identification', 'Differentiation', 'advanced'),
(8, 'Tiered Tasks & Scaffolding', 'Differentiation', 'advanced'),
(8, 'Social-Emotional Learning (SEL) Integration', 'Well-being', 'intermediate'),
(8, 'Positive Behaviour Support', 'Classroom Management', 'intermediate'),
(8, 'Student Motivation & Engagement Strategies', 'Student Engagement', 'basic');
