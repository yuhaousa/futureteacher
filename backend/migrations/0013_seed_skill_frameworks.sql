-- Seed 10 skill frameworks aligned to Singapore Teaching Practice (STP) and MOE competencies

INSERT INTO skill_frameworks (name, description, source_standard, version, is_active) VALUES
('Classroom Management & Student Engagement', 'Competencies for creating a positive, structured learning environment and sustaining student motivation and participation.', 'Singapore Teaching Practice (STP)', '2023', 1),
('Curriculum Design & Lesson Planning', 'Competencies for designing coherent, outcomes-aligned curriculum and detailed lesson plans that meet diverse learner needs.', 'Singapore Teaching Practice (STP)', '2023', 1),
('Assessment & Feedback Literacy', 'Competencies for designing assessments, interpreting data, and providing timely, actionable feedback to guide student learning.', 'Singapore Teaching Practice (STP)', '2023', 1),
('Differentiated Instruction', 'Competencies for adapting teaching strategies, content, and assessment to address diverse learning needs, readiness, and interests.', 'Singapore Teaching Practice (STP)', '2023', 1),
('ICT Integration & EdTech Fluency', 'Competencies for purposefully integrating technology tools to enhance pedagogy, student collaboration, and learning outcomes.', 'ISTE Standards for Educators', '2017', 1),
('Collaborative Learning & Facilitation', 'Competencies for designing and facilitating group learning experiences, peer collaboration, and constructive discourse in the classroom.', 'Singapore Teaching Practice (STP)', '2023', 1),
('Higher-Order Thinking & Questioning', 'Competencies for designing tasks and using questioning techniques that develop critical thinking, reasoning, and problem-solving skills.', 'Singapore Teaching Practice (STP)', '2023', 1),
('Professional Learning & Reflective Practice', 'Competencies for continuous self-improvement through reflection, professional development, peer learning, and evidence-based practice.', 'Singapore Teaching Practice (STP)', '2023', 1),
('Student Well-being & Holistic Development', 'Competencies for nurturing students'' social-emotional well-being, character development, and 21st Century Competencies (21CC).', 'MOE Character & Citizenship Education', '2021', 1),
('Parent & Community Engagement', 'Competencies for building productive partnerships with parents, families, and community stakeholders to support student learning.', 'Singapore Teaching Practice (STP)', '2023', 1);

-- Skills for Framework 1: Classroom Management & Student Engagement
INSERT INTO framework_skills (framework_id, name, category, description, level_basic, level_intermediate, level_advanced, level_expert, order_index) VALUES
((SELECT id FROM skill_frameworks WHERE name = 'Classroom Management & Student Engagement'),
 'Establishing Routines & Procedures', 'Classroom Management',
 'Setting clear, consistent classroom routines that minimise disruptions and maximise learning time.',
 'Implements teacher-provided routines with support', 'Independently establishes and maintains class routines', 'Adapts routines responsively based on student needs', 'Mentors peers on designing effective classroom systems', 1),
((SELECT id FROM skill_frameworks WHERE name = 'Classroom Management & Student Engagement'),
 'Student Motivation & Engagement Strategies', 'Student Engagement',
 'Using varied strategies to sustain student interest, participation, and intrinsic motivation.',
 'Uses basic praise and rewards to encourage participation', 'Applies a range of engagement strategies purposefully', 'Designs lessons that build student autonomy and ownership', 'Coaches others in engagement design; researches impact', 2),
((SELECT id FROM skill_frameworks WHERE name = 'Classroom Management & Student Engagement'),
 'Positive Behaviour Support', 'Classroom Management',
 'Applying restorative and proactive approaches to behaviour management that preserve student dignity.',
 'Responds to behaviour issues with teacher guidance', 'Consistently uses proactive and restorative strategies', 'Develops class-wide positive behaviour frameworks', 'Leads school-wide behaviour support initiatives', 3);

-- Skills for Framework 2: Curriculum Design & Lesson Planning
INSERT INTO framework_skills (framework_id, name, category, description, level_basic, level_intermediate, level_advanced, level_expert, order_index) VALUES
((SELECT id FROM skill_frameworks WHERE name = 'Curriculum Design & Lesson Planning'),
 'Learning Outcomes Alignment', 'Curriculum Design',
 'Writing clear, measurable learning outcomes and aligning all lesson components to those outcomes.',
 'Writes outcomes with guidance; partial alignment', 'Independently writes SMART outcomes with full alignment', 'Designs outcomes-driven units across a whole term', 'Leads curriculum review; trains colleagues in alignment', 1),
((SELECT id FROM skill_frameworks WHERE name = 'Curriculum Design & Lesson Planning'),
 'Lesson Structure & Pacing', 'Lesson Planning',
 'Structuring lessons with appropriate introduction, development, and closure, managing pacing effectively.',
 'Follows provided lesson templates', 'Plans well-paced lessons independently', 'Adapts pacing in real time based on student response', 'Mentors on lesson design; models exemplary lessons', 2),
((SELECT id FROM skill_frameworks WHERE name = 'Curriculum Design & Lesson Planning'),
 'Vertical & Horizontal Curriculum Coherence', 'Curriculum Design',
 'Ensuring learning builds logically within a unit (vertical) and connects across subjects (horizontal).',
 'Aware of coherence; maps own lessons', 'Maps unit coherence; links to cross-subject themes', 'Leads team planning for cross-curricular coherence', 'Designs school curriculum frameworks; mentors HODs', 3);

-- Skills for Framework 3: Assessment & Feedback Literacy
INSERT INTO framework_skills (framework_id, name, category, description, level_basic, level_intermediate, level_advanced, level_expert, order_index) VALUES
((SELECT id FROM skill_frameworks WHERE name = 'Assessment & Feedback Literacy'),
 'Formative Assessment Design', 'Assessment',
 'Creating and using ongoing checks for understanding to inform instruction in real time.',
 'Uses basic exit tickets and quizzes', 'Designs varied formative tools aligned to outcomes', 'Uses formative data to differentiate instruction', 'Leads team in building assessment-for-learning culture', 1),
((SELECT id FROM skill_frameworks WHERE name = 'Assessment & Feedback Literacy'),
 'Effective Feedback Practices', 'Feedback',
 'Providing timely, specific, and actionable feedback that moves learner thinking forward.',
 'Gives general praise or corrections', 'Provides specific written and verbal feedback regularly', 'Uses peer and self-assessment to build feedback loops', 'Trains colleagues; researches feedback effectiveness', 2),
((SELECT id FROM skill_frameworks WHERE name = 'Assessment & Feedback Literacy'),
 'Data-Informed Instruction', 'Assessment',
 'Analysing assessment data to identify learning gaps and adjust teaching strategies accordingly.',
 'Reads basic class data with support', 'Analyses results and adjusts next lessons', 'Leads team data reviews; designs intervention plans', 'Builds school-wide data literacy frameworks', 3);

-- Skills for Framework 4: Differentiated Instruction
INSERT INTO framework_skills (framework_id, name, category, description, level_basic, level_intermediate, level_advanced, level_expert, order_index) VALUES
((SELECT id FROM skill_frameworks WHERE name = 'Differentiated Instruction'),
 'Learning Profile Identification', 'Differentiation',
 'Identifying student readiness, interests, and learning profiles to inform instructional decisions.',
 'Uses basic surveys and observation', 'Systematically profiles learners using multiple data sources', 'Builds dynamic learner profiles updated across term', 'Leads school-wide learner-profile systems', 1),
((SELECT id FROM skill_frameworks WHERE name = 'Differentiated Instruction'),
 'Tiered Tasks & Scaffolding', 'Differentiation',
 'Designing tiered activities and scaffolds that challenge all learners at their appropriate level.',
 'Modifies tasks with guidance', 'Independently designs 2–3 tiered tasks per lesson', 'Creates flexible grouping and task menus', 'Mentors colleagues; presents at professional learning', 2);

-- Skills for Framework 5: ICT Integration & EdTech Fluency
INSERT INTO framework_skills (framework_id, name, category, description, level_basic, level_intermediate, level_advanced, level_expert, order_index) VALUES
((SELECT id FROM skill_frameworks WHERE name = 'ICT Integration & EdTech Fluency'),
 'Technology-Enhanced Pedagogy', 'ICT Integration',
 'Selecting and using digital tools purposefully to enhance — not merely replicate — traditional pedagogy.',
 'Uses basic presentation and productivity tools', 'Selects tools matched to specific pedagogical goals', 'Designs blended learning sequences with EdTech', 'Leads EdTech PD; evaluates tools at school level', 1),
((SELECT id FROM skill_frameworks WHERE name = 'ICT Integration & EdTech Fluency'),
 'Digital Citizenship & Online Safety', 'Digital Literacy',
 'Teaching students responsible, ethical, and safe behaviours in digital environments.',
 'Covers basic online safety rules', 'Integrates digital citizenship into regular lessons', 'Leads digital wellness programme schoolwide', 'Develops district policy; speaks at conferences', 2),
((SELECT id FROM skill_frameworks WHERE name = 'ICT Integration & EdTech Fluency'),
 'Data Analytics for Learning', 'ICT Integration',
 'Using learning management system and EdTech dashboards to derive insights about student progress.',
 'Reads basic LMS reports', 'Interprets analytics to adjust teaching', 'Trains team on LMS analytics use', 'Builds custom analytics dashboards; leads data culture', 3);

-- Skills for Framework 6: Collaborative Learning & Facilitation
INSERT INTO framework_skills (framework_id, name, category, description, level_basic, level_intermediate, level_advanced, level_expert, order_index) VALUES
((SELECT id FROM skill_frameworks WHERE name = 'Collaborative Learning & Facilitation'),
 'Cooperative Learning Structures', 'Collaboration',
 'Designing and facilitating structured cooperative learning activities (e.g. Think-Pair-Share, Jigsaw).',
 'Uses 1–2 structures with guidance', 'Uses varied structures fluently in lessons', 'Designs complex project-based collaborative tasks', 'Trains colleagues; leads professional learning', 1),
((SELECT id FROM skill_frameworks WHERE name = 'Collaborative Learning & Facilitation'),
 'Facilitated Discussion & Dialogue', 'Facilitation',
 'Using Socratic seminar, structured academic controversy, and discussion protocols to deepen learning.',
 'Leads basic class discussions', 'Facilitates structured dialogues with clear protocols', 'Designs inquiry-based discussion sequences', 'Coaches peers; researches dialogic pedagogy', 2);

-- Skills for Framework 7: Higher-Order Thinking & Questioning
INSERT INTO framework_skills (framework_id, name, category, description, level_basic, level_intermediate, level_advanced, level_expert, order_index) VALUES
((SELECT id FROM skill_frameworks WHERE name = 'Higher-Order Thinking & Questioning'),
 'Bloom''s Taxonomy Application', 'Higher-Order Thinking',
 'Designing tasks and questions that target analysis, evaluation, and creation levels of Bloom''s taxonomy.',
 'Identifies HOT vs LOT questions', 'Consistently designs tasks at higher Bloom''s levels', 'Builds unit-long progression of HOT tasks', 'Leads team in HOT curriculum design', 1),
((SELECT id FROM skill_frameworks WHERE name = 'Higher-Order Thinking & Questioning'),
 'Socratic Questioning Techniques', 'Questioning',
 'Using probing, clarifying, and extending questions to scaffold student reasoning in real time.',
 'Uses basic open-ended questions', 'Uses varied Socratic question types skillfully', 'Weaves questioning throughout lesson fluidly', 'Models and coaches Socratic questioning schoolwide', 2);

-- Skills for Framework 8: Professional Learning & Reflective Practice
INSERT INTO framework_skills (framework_id, name, category, description, level_basic, level_intermediate, level_advanced, level_expert, order_index) VALUES
((SELECT id FROM skill_frameworks WHERE name = 'Professional Learning & Reflective Practice'),
 'Lesson Study & Peer Observation', 'Professional Learning',
 'Participating in and facilitating lesson study cycles, including pre-lesson discussion, observation, and debrief.',
 'Participates as observer with guidance', 'Leads lesson study cycle for own class', 'Facilitates cross-department lesson study', 'Coordinates school-wide lesson study programme', 1),
((SELECT id FROM skill_frameworks WHERE name = 'Professional Learning & Reflective Practice'),
 'Evidence-Based Reflective Practice', 'Reflection',
 'Systematically collecting evidence of student learning to inform reflections and next steps.',
 'Reflects informally after lessons', 'Collects and reviews evidence regularly', 'Uses evidence to drive term-level planning changes', 'Publishes action research; presents at PLCs', 2);

-- Skills for Framework 9: Student Well-being & Holistic Development
INSERT INTO framework_skills (framework_id, name, category, description, level_basic, level_intermediate, level_advanced, level_expert, order_index) VALUES
((SELECT id FROM skill_frameworks WHERE name = 'Student Well-being & Holistic Development'),
 'Social-Emotional Learning (SEL) Integration', 'Well-being',
 'Embedding SEL competencies (self-awareness, empathy, responsible decision-making) into lessons and interactions.',
 'Addresses SEL reactively when issues arise', 'Proactively embeds SEL moments in lessons', 'Designs SEL-integrated units; tracks outcomes', 'Leads school SEL framework; trains staff', 1),
((SELECT id FROM skill_frameworks WHERE name = 'Student Well-being & Holistic Development'),
 '21st Century Competencies (21CC) Development', 'Holistic Development',
 'Nurturing critical thinking, communication, collaboration, and civic literacy aligned to MOE 21CC framework.',
 'Aware of 21CC; occasional application', 'Regularly designs tasks targeting specific 21CC', 'Maps 21CC development across unit and year', 'Leads 21CC integration schoolwide', 2);

-- Skills for Framework 10: Parent & Community Engagement
INSERT INTO framework_skills (framework_id, name, category, description, level_basic, level_intermediate, level_advanced, level_expert, order_index) VALUES
((SELECT id FROM skill_frameworks WHERE name = 'Parent & Community Engagement'),
 'Parent Communication & Partnership', 'Community Engagement',
 'Building transparent, respectful, and productive communication with parents about student progress and well-being.',
 'Communicates reactively when issues arise', 'Proactively updates parents on progress regularly', 'Leads parent workshops; builds home-school programmes', 'Develops school-wide parent engagement framework', 1),
((SELECT id FROM skill_frameworks WHERE name = 'Parent & Community Engagement'),
 'Community & Industry Partnership', 'Community Engagement',
 'Establishing links with community organisations and industry partners to enrich learning experiences.',
 'Aware of community resources; uses when provided', 'Independently sources and coordinates 1–2 partners', 'Manages sustained multi-partner programmes', 'Leads school-industry partnership strategy', 2);
