-- Seed data migration for EduLearn Pro (Cloudflare D1)
-- Passwords are set to 'SETUP_REQUIRED' — activate via POST /api/auth/setup

-- Users (admin + instructors)
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, bio) VALUES
(1, 'Admin', 'admin@edulearn.pro', 'SETUP_REQUIRED', 'admin', 'Platform administrator'),
(2, 'Dr. Sarah Tan', 'sarah@edulearn.pro', 'SETUP_REQUIRED', 'teacher', 'Expert in formative assessment and student-centered learning with 15 years experience.'),
(3, 'Prof. James Lee', 'james@edulearn.pro', 'SETUP_REQUIRED', 'teacher', 'Specialist in inquiry-based learning and STEM education.'),
(4, 'Dr. Maria Chen', 'maria@edulearn.pro', 'SETUP_REQUIRED', 'teacher', 'AI in education researcher and curriculum design expert.'),
(5, 'Dr. Alex Wong', 'alex@edulearn.pro', 'SETUP_REQUIRED', 'teacher', 'Wellbeing and resilience coach for educators.');

-- Courses
INSERT OR IGNORE INTO courses (id, title, description, category, modality, level, duration_hours, image_url, instructor_id, rating, enrolled_count) VALUES
(1, 'Formative Assessment Strategies for the 21st Century Classroom',
   'Learn evidence-based formative assessment techniques to gauge student understanding in real-time. This course covers think-pair-share, exit tickets, digital polling, and metacognitive reflection strategies.',
   'assessment', 'Self-Paced', 'intermediate', 4,
   'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800', 2, 4.7, 342),
(2, 'Inquiry-Based Learning in Science Education',
   'Explore how to design inquiry-based lessons that ignite curiosity and develop scientific thinking in students.',
   'pedagogy', 'Blended', 'intermediate', 6,
   'https://images.unsplash.com/photo-1532094349884-543559c5b7f8?w=800', 3, 4.5, 218),
(3, 'Leveraging AI Tools for Personalised Learning',
   'Understand how artificial intelligence can enhance teaching and create personalised learning experiences for every student.',
   'technology', 'Microlearning', 'beginner', 3,
   'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800', 4, 4.8, 456),
(4, 'Building Resilience and Wellbeing in Educators',
   'A comprehensive programme addressing educator mental health, stress management, and building long-term professional resilience.',
   'wellbeing', 'Self-Paced', 'beginner', 5,
   'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', 5, 4.9, 189),
(5, 'Differentiated Instruction: Reaching Every Learner',
   'Master differentiation strategies for diverse classrooms. Learn to design tiered activities and flexible learning experiences.',
   'pedagogy', 'Video', 'intermediate', 4,
   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', 2, 4.6, 267),
(6, 'Leadership in Education: From Teacher to Leader',
   'Develop essential leadership competencies needed to take on departmental and school leadership roles.',
   'leadership', 'Live Session', 'advanced', 8,
   'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', 3, 4.7, 134),
(7, 'Designing Effective Curriculum Maps',
   'Learn systematic approaches to curriculum design, backward mapping, and alignment with learning standards.',
   'curriculum', 'Self-Paced', 'intermediate', 6,
   'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800', 4, 4.3, 198),
(8, 'Supporting Students with Special Educational Needs',
   'Practical strategies for inclusive classrooms, including Universal Design for Learning and individualised support approaches.',
   'special needs', 'Blended', 'beginner', 5,
   'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800', 5, 4.8, 312);

-- Course modules
INSERT OR IGNORE INTO course_modules (course_id, title, description, order_index, duration_mins) VALUES
(1, 'Introduction to Formative Assessment', 'Overview of formative vs summative assessment', 0, 30),
(1, 'Exit Tickets and Digital Polling', 'Practical tools for real-time feedback', 1, 45),
(1, 'Think-Pair-Share Strategies', 'Collaborative learning assessment techniques', 2, 40),
(1, 'Metacognitive Reflection', 'Teaching students to assess their own learning', 3, 35),
(1, 'Data-Driven Instruction', 'Using assessment data to guide teaching', 4, 50),
(2, 'Foundations of Inquiry-Based Learning', 'The 5E instructional model', 0, 45),
(2, 'Designing Inquiry Lessons', 'Structuring open and guided inquiry', 1, 60),
(2, 'Student-Led Investigations', 'Facilitating student-driven science', 2, 55),
(3, 'AI Basics for Educators', 'What teachers need to know about AI', 0, 20),
(3, 'AI Tools in the Classroom', 'Practical AI applications for teaching', 1, 25),
(3, 'Personalising Learning with AI', 'Adaptive learning strategies', 2, 30),
(4, 'Understanding Educator Burnout', 'Signs, causes and prevention', 0, 40),
(4, 'Mindfulness for Teachers', 'Practical mindfulness techniques', 1, 45),
(4, 'Building Support Networks', 'Collegial support and communities', 2, 35),
(5, 'Principles of Differentiation', 'Content, process, and product differentiation', 0, 35),
(5, 'Tiered Activities Design', 'Creating tasks at multiple levels', 1, 50),
(5, 'Flexible Grouping', 'Strategic grouping for learning', 2, 40),
(5, 'Universal Design for Learning', 'UDL framework and application', 3, 45),
(6, 'Leadership Styles and Approaches', 'Understanding your leadership identity', 0, 60),
(6, 'Leading Teams and Departments', 'Effective team management in schools', 1, 75),
(6, 'Instructional Leadership', 'Leading learning improvement', 2, 70),
(7, 'Backward Design Principles', 'Understanding by design framework', 0, 45),
(7, 'Standards Alignment', 'Mapping curriculum to learning standards', 1, 50),
(7, 'Vertical and Horizontal Alignment', 'Cross-grade curriculum coherence', 2, 40),
(8, 'Understanding Learning Differences', 'Types of special educational needs', 0, 40),
(8, 'Inclusive Classroom Strategies', 'Practical inclusion techniques', 1, 50),
(8, 'IEP and Support Planning', 'Creating effective support plans', 2, 45);

-- Competency tags
INSERT OR IGNORE INTO competency_tags (course_id, tag) VALUES
(1, 'Assessment Literacy'), (1, 'Student-Centred Learning'), (1, 'Data-Driven Instruction'),
(2, 'Inquiry Learning'), (2, 'Science Education'), (2, 'Critical Thinking'),
(3, 'AI in Education'), (3, 'Personalised Learning'), (3, 'EdTech'),
(4, 'Teacher Wellbeing'), (4, 'Resilience'), (4, 'Mental Health'),
(5, 'Differentiation'), (5, 'Inclusive Education'), (5, 'UDL'),
(6, 'Leadership'), (6, 'School Management'), (6, 'Professional Growth'),
(7, 'Curriculum Design'), (7, 'Backward Design'), (7, 'Standards Alignment'),
(8, 'Inclusive Education'), (8, 'Special Needs'), (8, 'Accessibility');

-- Communities
INSERT OR IGNORE INTO communities (id, name, description, category, image_url, member_count, created_by) VALUES
(1, 'Assessment & Feedback Hub', 'Share assessment strategies and feedback techniques that work in your classroom.', 'assessment', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', 142, 1),
(2, 'EdTech Innovators', 'Explore the latest educational technologies and how to integrate them effectively.', 'technology', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800', 237, 1),
(3, 'Inclusive Education Network', 'Supporting educators in creating welcoming, accessible classrooms for all learners.', 'special needs', 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800', 98, 1),
(4, 'Teacher Wellbeing Circle', 'A safe space to discuss educator wellbeing, share self-care strategies, and support each other.', 'wellbeing', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800', 175, 1);

-- Learning pathways
INSERT OR IGNORE INTO learning_pathways (id, title, description, category, level, duration_hours, image_url, created_by) VALUES
(1, 'New Teacher Essentials', 'A comprehensive pathway for teachers in their first years, covering core pedagogy and classroom management.', 'pedagogy', 'beginner', 15, 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800', 1),
(2, 'Digital Education Mastery', 'Master technology integration and AI-powered teaching tools for the modern classroom.', 'technology', 'intermediate', 12, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', 1),
(3, 'Aspiring School Leaders', 'Develop the leadership and strategic skills needed to move into school leadership positions.', 'leadership', 'advanced', 20, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800', 1);

-- Pathway courses
INSERT OR IGNORE INTO pathway_courses (pathway_id, course_id, order_index) VALUES
(1, 5, 0), (1, 1, 1), (1, 4, 2),
(2, 3, 0), (2, 7, 1),
(3, 6, 0), (3, 7, 1);
