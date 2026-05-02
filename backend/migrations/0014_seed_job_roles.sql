-- Seed 15 Singapore education job roles with associated skill requirements

INSERT INTO job_roles (title, description, department, level) VALUES
('Beginning Teacher', 'Newly appointed educator completing the first phase of the Enhanced Performance Management System (EPMS). Focuses on establishing foundational classroom practices and professional identity.', 'Teaching', 'entry'),
('Classroom Teacher', 'Core teaching professional responsible for designing and delivering quality lessons, managing a form class, and contributing to school programmes.', 'Teaching', 'mid'),
('Subject Head', 'Curriculum leader for a specific subject area, guiding lesson planning alignment, assessments, and resource development within the department.', 'Academic', 'mid'),
('Head of Department (HOD)', 'Senior curriculum leader overseeing a department''s instructional quality, staff development, and student outcomes across subjects.', 'Academic', 'senior'),
('Senior Teacher', 'Accomplished classroom practitioner recognised for pedagogical excellence. Leads professional learning and mentors less experienced teachers.', 'Teaching', 'senior'),
('Lead Teacher', 'Expert practitioner who provides instructional leadership, drives school-wide pedagogical innovation, and builds teacher capacity.', 'Teaching', 'lead'),
('Year Head', 'Student development leader responsible for the holistic well-being, character development, and discipline of an entire year group.', 'Student Development', 'mid'),
('Level Head', 'Middle leader coordinating programmes and well-being initiatives for a specific student level (e.g., Primary 4–6 or Secondary 1–2).', 'Student Development', 'senior'),
('Vice-Principal', 'Deputy school leader supporting the Principal in school management, staff development, curriculum oversight, and community engagement.', 'School Leadership', 'manager'),
('Principal', 'School leader responsible for the overall vision, culture, curriculum, staff, and community partnerships of the school.', 'School Leadership', 'manager'),
('ICT Mentor Teacher', 'Specialist who leads school-wide EdTech integration, coaches colleagues on purposeful technology use, and evaluates digital tools for learning.', 'ICT', 'senior'),
('Special Educational Needs Officer (SENO)', 'Professional supporting students with learning differences and special needs through assessment, intervention, and inclusive classroom practices.', 'Student Support', 'mid'),
('Educational Technology Officer', 'Technical and pedagogical specialist managing the school''s EdTech infrastructure, LMS, and digital learning programmes.', 'ICT', 'mid'),
('Curriculum Specialist', 'Expert in curriculum design and assessment literacy who supports departments in developing coherent, outcomes-aligned programmes of study.', 'Curriculum', 'senior'),
('Teacher Leader (Professional Development)', 'Experienced teacher leading professional learning communities (PLCs), lesson study cycles, and staff development initiatives within the school.', 'Professional Learning', 'lead');


-- Skills for: Beginning Teacher (entry)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Beginning Teacher'),
 'Establishing Routines & Procedures', 'Classroom Management', 'basic',
 'Implement teacher-designed classroom routines with mentoring support.', 1),
((SELECT id FROM job_roles WHERE title = 'Beginning Teacher'),
 'Lesson Structure & Pacing', 'Lesson Planning', 'basic',
 'Follow lesson templates and begin to plan well-paced lessons independently.', 2),
((SELECT id FROM job_roles WHERE title = 'Beginning Teacher'),
 'Formative Assessment Design', 'Assessment', 'basic',
 'Use basic exit tickets and quizzes to check for understanding.', 3),
((SELECT id FROM job_roles WHERE title = 'Beginning Teacher'),
 'Effective Feedback Practices', 'Feedback', 'basic',
 'Provide general written and verbal feedback on student work.', 4),
((SELECT id FROM job_roles WHERE title = 'Beginning Teacher'),
 'Evidence-Based Reflective Practice', 'Reflection', 'basic',
 'Reflect informally after lessons and discuss with mentor teacher.', 5);


-- Skills for: Classroom Teacher (mid)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Classroom Teacher'),
 'Student Motivation & Engagement Strategies', 'Student Engagement', 'intermediate',
 'Apply a range of engagement strategies to sustain student participation.', 1),
((SELECT id FROM job_roles WHERE title = 'Classroom Teacher'),
 'Learning Outcomes Alignment', 'Curriculum Design', 'intermediate',
 'Write SMART outcomes and align all lesson components consistently.', 2),
((SELECT id FROM job_roles WHERE title = 'Classroom Teacher'),
 'Formative Assessment Design', 'Assessment', 'intermediate',
 'Design varied formative tools aligned to learning outcomes.', 3),
((SELECT id FROM job_roles WHERE title = 'Classroom Teacher'),
 'Effective Feedback Practices', 'Feedback', 'intermediate',
 'Provide specific, timely written and verbal feedback regularly.', 4),
((SELECT id FROM job_roles WHERE title = 'Classroom Teacher'),
 'Social-Emotional Learning (SEL) Integration', 'Well-being', 'basic',
 'Proactively embed SEL moments into lessons and daily interactions.', 5);


-- Skills for: Subject Head (mid)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Subject Head'),
 'Learning Outcomes Alignment', 'Curriculum Design', 'advanced',
 'Design outcomes-driven units across a whole term for the subject.', 1),
((SELECT id FROM job_roles WHERE title = 'Subject Head'),
 'Vertical & Horizontal Curriculum Coherence', 'Curriculum Design', 'intermediate',
 'Map unit coherence and link to cross-subject themes within the department.', 2),
((SELECT id FROM job_roles WHERE title = 'Subject Head'),
 'Data-Informed Instruction', 'Assessment', 'intermediate',
 'Analyse assessment results and adjust department teaching strategies.', 3),
((SELECT id FROM job_roles WHERE title = 'Subject Head'),
 'Lesson Study & Peer Observation', 'Professional Learning', 'intermediate',
 'Lead lesson study cycles for the subject team.', 4);


-- Skills for: Head of Department (HOD) (senior)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Head of Department (HOD)'),
 'Vertical & Horizontal Curriculum Coherence', 'Curriculum Design', 'advanced',
 'Lead team planning for cross-curricular coherence across the department.', 1),
((SELECT id FROM job_roles WHERE title = 'Head of Department (HOD)'),
 'Data-Informed Instruction', 'Assessment', 'advanced',
 'Lead team data reviews and design departmental intervention plans.', 2),
((SELECT id FROM job_roles WHERE title = 'Head of Department (HOD)'),
 'Lesson Study & Peer Observation', 'Professional Learning', 'advanced',
 'Facilitate cross-department lesson study and peer observation programmes.', 3),
((SELECT id FROM job_roles WHERE title = 'Head of Department (HOD)'),
 'Bloom''s Taxonomy Application', 'Higher-Order Thinking', 'advanced',
 'Lead the team in designing higher-order thinking curriculum across the department.', 4),
((SELECT id FROM job_roles WHERE title = 'Head of Department (HOD)'),
 'Parent Communication & Partnership', 'Community Engagement', 'advanced',
 'Lead parent workshops and build sustained home-school programmes.', 5);


-- Skills for: Senior Teacher (senior)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Senior Teacher'),
 'Lesson Structure & Pacing', 'Lesson Planning', 'expert',
 'Model exemplary lessons and mentor colleagues on lesson design.', 1),
((SELECT id FROM job_roles WHERE title = 'Senior Teacher'),
 'Differentiated Instruction', 'Differentiation', 'advanced',
 'Create flexible grouping and task menus to address diverse learners.', 2),
((SELECT id FROM job_roles WHERE title = 'Senior Teacher'),
 'Bloom''s Taxonomy Application', 'Higher-Order Thinking', 'advanced',
 'Build unit-long progressions of higher-order thinking tasks.', 3),
((SELECT id FROM job_roles WHERE title = 'Senior Teacher'),
 'Evidence-Based Reflective Practice', 'Reflection', 'advanced',
 'Use evidence systematically to drive term-level planning improvements.', 4),
((SELECT id FROM job_roles WHERE title = 'Senior Teacher'),
 'Cooperative Learning Structures', 'Collaboration', 'advanced',
 'Design complex project-based collaborative tasks for students.', 5);


-- Skills for: Lead Teacher (lead)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Lead Teacher'),
 'Lesson Study & Peer Observation', 'Professional Learning', 'expert',
 'Coordinate school-wide lesson study programmes and model best practices.', 1),
((SELECT id FROM job_roles WHERE title = 'Lead Teacher'),
 'Evidence-Based Reflective Practice', 'Reflection', 'expert',
 'Publish action research and present findings at PLCs and conferences.', 2),
((SELECT id FROM job_roles WHERE title = 'Lead Teacher'),
 'Socratic Questioning Techniques', 'Questioning', 'expert',
 'Model and coach Socratic questioning techniques across the school.', 3),
((SELECT id FROM job_roles WHERE title = 'Lead Teacher'),
 'Learning Outcomes Alignment', 'Curriculum Design', 'expert',
 'Lead curriculum review and train colleagues in outcomes-based design.', 4);


-- Skills for: Year Head (mid)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Year Head'),
 'Social-Emotional Learning (SEL) Integration', 'Well-being', 'advanced',
 'Design SEL-integrated units and track student well-being outcomes.', 1),
((SELECT id FROM job_roles WHERE title = 'Year Head'),
 '21st Century Competencies (21CC) Development', 'Holistic Development', 'intermediate',
 'Regularly design tasks targeting 21CC development for the year group.', 2),
((SELECT id FROM job_roles WHERE title = 'Year Head'),
 'Positive Behaviour Support', 'Classroom Management', 'advanced',
 'Develop year-level positive behaviour frameworks with form teachers.', 3),
((SELECT id FROM job_roles WHERE title = 'Year Head'),
 'Parent Communication & Partnership', 'Community Engagement', 'advanced',
 'Lead parent engagement initiatives for the year group.', 4);


-- Skills for: Level Head (senior)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Level Head'),
 'Social-Emotional Learning (SEL) Integration', 'Well-being', 'advanced',
 'Lead SEL framework implementation at the level.', 1),
((SELECT id FROM job_roles WHERE title = 'Level Head'),
 '21st Century Competencies (21CC) Development', 'Holistic Development', 'advanced',
 'Map 21CC development across unit and year at the level.', 2),
((SELECT id FROM job_roles WHERE title = 'Level Head'),
 'Facilitated Discussion & Dialogue', 'Facilitation', 'advanced',
 'Design inquiry-based discussion sequences for level-wide programmes.', 3);


-- Skills for: Vice-Principal (manager)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Vice-Principal'),
 'Data-Informed Instruction', 'Assessment', 'expert',
 'Build school-wide data literacy frameworks and lead strategic planning.', 1),
((SELECT id FROM job_roles WHERE title = 'Vice-Principal'),
 'Lesson Study & Peer Observation', 'Professional Learning', 'expert',
 'Oversee school-wide professional learning structures and appraisal.', 2),
((SELECT id FROM job_roles WHERE title = 'Vice-Principal'),
 'Parent Communication & Partnership', 'Community Engagement', 'expert',
 'Develop and implement school-wide parent engagement strategy.', 3),
((SELECT id FROM job_roles WHERE title = 'Vice-Principal'),
 'Community & Industry Partnership', 'Community Engagement', 'advanced',
 'Lead school-industry partnership programmes and community outreach.', 4);


-- Skills for: Principal (manager)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Principal'),
 'Vertical & Horizontal Curriculum Coherence', 'Curriculum Design', 'expert',
 'Design school curriculum frameworks and guide HODs in implementation.', 1),
((SELECT id FROM job_roles WHERE title = 'Principal'),
 'Social-Emotional Learning (SEL) Integration', 'Well-being', 'expert',
 'Lead whole-school SEL framework and train all staff.', 2),
((SELECT id FROM job_roles WHERE title = 'Principal'),
 'Community & Industry Partnership', 'Community Engagement', 'expert',
 'Lead school-industry partnership strategy at the leadership level.', 3),
((SELECT id FROM job_roles WHERE title = 'Principal'),
 'Evidence-Based Reflective Practice', 'Reflection', 'expert',
 'Drive a school-wide culture of evidence-based practice and research.', 4);


-- Skills for: ICT Mentor Teacher (senior)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'ICT Mentor Teacher'),
 'Technology-Enhanced Pedagogy', 'ICT Integration', 'expert',
 'Lead EdTech PD and evaluate digital tools at school level.', 1),
((SELECT id FROM job_roles WHERE title = 'ICT Mentor Teacher'),
 'Data Analytics for Learning', 'ICT Integration', 'advanced',
 'Train staff on LMS analytics and derive insights about student progress.', 2),
((SELECT id FROM job_roles WHERE title = 'ICT Mentor Teacher'),
 'Digital Citizenship & Online Safety', 'Digital Literacy', 'advanced',
 'Lead school-wide digital wellness programme.', 3),
((SELECT id FROM job_roles WHERE title = 'ICT Mentor Teacher'),
 'Cooperative Learning Structures', 'Collaboration', 'intermediate',
 'Design collaborative digital learning tasks for students.', 4);


-- Skills for: Special Educational Needs Officer (SENO) (mid)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Special Educational Needs Officer (SENO)'),
 'Learning Profile Identification', 'Differentiation', 'advanced',
 'Build dynamic learner profiles for students with special needs.', 1),
((SELECT id FROM job_roles WHERE title = 'Special Educational Needs Officer (SENO)'),
 'Tiered Tasks & Scaffolding', 'Differentiation', 'advanced',
 'Design scaffolded and tiered tasks for diverse learning profiles.', 2),
((SELECT id FROM job_roles WHERE title = 'Special Educational Needs Officer (SENO)'),
 'Social-Emotional Learning (SEL) Integration', 'Well-being', 'advanced',
 'Embed SEL competencies into intervention programmes.', 3),
((SELECT id FROM job_roles WHERE title = 'Special Educational Needs Officer (SENO)'),
 'Positive Behaviour Support', 'Classroom Management', 'advanced',
 'Apply restorative and proactive behaviour support for students with special needs.', 4);


-- Skills for: Educational Technology Officer (mid)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Educational Technology Officer'),
 'Technology-Enhanced Pedagogy', 'ICT Integration', 'advanced',
 'Design blended learning sequences using EdTech platforms.', 1),
((SELECT id FROM job_roles WHERE title = 'Educational Technology Officer'),
 'Data Analytics for Learning', 'ICT Integration', 'advanced',
 'Interpret LMS analytics and produce reports for school leadership.', 2),
((SELECT id FROM job_roles WHERE title = 'Educational Technology Officer'),
 'Digital Citizenship & Online Safety', 'Digital Literacy', 'intermediate',
 'Integrate digital citizenship into school programmes.', 3);


-- Skills for: Curriculum Specialist (senior)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Curriculum Specialist'),
 'Learning Outcomes Alignment', 'Curriculum Design', 'expert',
 'Lead curriculum review and train departments in outcomes-based design.', 1),
((SELECT id FROM job_roles WHERE title = 'Curriculum Specialist'),
 'Vertical & Horizontal Curriculum Coherence', 'Curriculum Design', 'expert',
 'Design school curriculum frameworks and ensure coherence across levels.', 2),
((SELECT id FROM job_roles WHERE title = 'Curriculum Specialist'),
 'Formative Assessment Design', 'Assessment', 'expert',
 'Lead the school in building an assessment-for-learning culture.', 3),
((SELECT id FROM job_roles WHERE title = 'Curriculum Specialist'),
 'Bloom''s Taxonomy Application', 'Higher-Order Thinking', 'expert',
 'Lead team in higher-order thinking curriculum design across all subjects.', 4),
((SELECT id FROM job_roles WHERE title = 'Curriculum Specialist'),
 'Data-Informed Instruction', 'Assessment', 'expert',
 'Build school-wide data frameworks and lead instructional improvement cycles.', 5);


-- Skills for: Teacher Leader (Professional Development) (lead)
INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES
((SELECT id FROM job_roles WHERE title = 'Teacher Leader (Professional Development)'),
 'Lesson Study & Peer Observation', 'Professional Learning', 'expert',
 'Coordinate school-wide lesson study and professional observation cycles.', 1),
((SELECT id FROM job_roles WHERE title = 'Teacher Leader (Professional Development)'),
 'Evidence-Based Reflective Practice', 'Reflection', 'expert',
 'Lead action research and present findings to build school learning culture.', 2),
((SELECT id FROM job_roles WHERE title = 'Teacher Leader (Professional Development)'),
 'Cooperative Learning Structures', 'Collaboration', 'expert',
 'Train colleagues in collaborative learning design and facilitation.', 3),
((SELECT id FROM job_roles WHERE title = 'Teacher Leader (Professional Development)'),
 'Facilitated Discussion & Dialogue', 'Facilitation', 'expert',
 'Coach peers in dialogic pedagogy and Socratic facilitation.', 4);
