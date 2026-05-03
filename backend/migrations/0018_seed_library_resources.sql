-- Migration 0018: Seed 20 curated library resources (PDFs, videos, links, docs)
-- Videos use real YouTube URLs; PDFs/links use authoritative public URLs
-- All resources tagged with STP skill framework keywords

INSERT INTO library_resources
  (title, description, file_url, file_type, file_name, file_size,
   category, subject_area, target_audience, tags, ai_context, is_ai_source)
VALUES

-- 1 ─ YouTube video: Dylan Wiliam on formative assessment
(
  'Embedded Formative Assessment – Dylan Wiliam',
  'Dylan Wiliam presents the five key strategies of embedded formative assessment: learning intentions, eliciting evidence, feedback, activating peers, and activating learners as owners. Essential viewing for all teachers.',
  'https://www.youtube.com/watch?v=r1LL9NX1hUw',
  'video', NULL, 0,
  'assessment', 'Assessment for Learning', 'all',
  '["formative assessment","feedback","learning intentions","peer assessment","self-assessment","Dylan Wiliam","AfL"]',
  'Covers the five key formative assessment strategies: sharing learning intentions, eliciting evidence of learning, providing feedback that moves learning forward, activating students as instructional resources for each other, and activating students as owners of their learning.',
  1
),

-- 2 ─ YouTube video: Visible Learning – John Hattie
(
  'Visible Learning – What Works Best in Education (John Hattie)',
  'John Hattie summarises findings from the Visible Learning meta-analysis of 800+ studies, identifying the highest-impact teaching strategies including feedback, teacher-student relationships, and metacognitive strategies.',
  'https://www.youtube.com/watch?v=sng4p3Vsu7Y',
  'video', NULL, 0,
  'pedagogy', 'Evidence-Based Teaching', 'all',
  '["visible learning","Hattie","effect size","feedback","metacognition","high-impact strategies","evidence-based"]',
  'John Hattie discusses Visible Learning research findings. Top influences on student achievement: feedback (d=0.70), metacognitive strategies (d=0.69), teacher-student relationships (d=0.52). Useful for professional learning discussions on evidence-based practice.',
  1
),

-- 3 ─ YouTube video: Bloom's Taxonomy explained
(
  'Bloom''s Taxonomy Explained for Teachers',
  'A clear visual walkthrough of the revised Bloom''s Taxonomy (Anderson & Krathwohl 2001), showing how to design questions and tasks at each cognitive level from Remember to Create. Includes classroom examples.',
  'https://www.youtube.com/watch?v=OOy3m02uEaE',
  'video', NULL, 0,
  'pedagogy', 'Higher-Order Thinking', 'all',
  '["Bloom''s taxonomy","higher-order thinking","lesson design","cognitive levels","questioning","critical thinking","HOT"]',
  'Explains the six levels of Bloom''s revised taxonomy: Remember, Understand, Apply, Analyse, Evaluate, Create. Includes example verbs and question stems for each level. Useful context for designing HOT tasks and assessments.',
  1
),

-- 4 ─ YouTube video: Differentiated Instruction strategies
(
  'Differentiated Instruction – Strategies for Diverse Learners',
  'Carol Ann Tomlinson outlines how to differentiate content, process, and product based on student readiness, interest, and learning profile. Includes practical classroom examples for primary and secondary settings.',
  'https://www.youtube.com/watch?v=RtBHi5NiOhY',
  'video', NULL, 0,
  'pedagogy', 'Differentiated Instruction', 'all',
  '["differentiated instruction","Tomlinson","readiness","learning profile","tiered tasks","scaffolding","mixed ability"]',
  'Carol Tomlinson explains differentiation by content (what students learn), process (how they learn), and product (how they demonstrate learning). Key principles: respectful tasks, flexible grouping, ongoing assessment, quality curriculum.',
  1
),

-- 5 ─ YouTube video: Classroom management tips
(
  'Effective Classroom Management – Proactive Strategies',
  'Research-based classroom management techniques including establishing routines, proactive behaviour support, proximity, non-verbal cues, and building positive teacher-student relationships. Suitable for beginning teachers.',
  'https://www.youtube.com/watch?v=MFntJ9k_9bc',
  'video', NULL, 0,
  'pedagogy', 'Classroom Management', 'all',
  '["classroom management","routines","behaviour support","positive relationships","proactive","beginning teacher","discipline"]',
  'Covers proactive classroom management strategies: establishing clear routines and procedures, building positive rapport, using non-verbal signals, proximity control, and restorative conversations. Relevant to F1 Classroom Management framework skills.',
  1
),

-- 6 ─ YouTube video: Project-Based Learning
(
  'Project-Based Learning in Practice (PBL Works)',
  'PBLWorks demonstrates Gold Standard PBL design principles: challenging problem, sustained inquiry, authenticity, student voice and choice, reflection, critique and revision, public product.',
  'https://www.youtube.com/watch?v=LMCZvGesRz8',
  'video', NULL, 0,
  'pedagogy', 'Project-Based Learning', 'secondary',
  '["project-based learning","PBL","inquiry","authentic tasks","student agency","21CC","collaboration","problem-solving"]',
  'PBL Gold Standard elements: (1) challenging problem or question, (2) sustained inquiry, (3) authenticity, (4) student voice and choice, (5) reflection, (6) critique and revision, (7) public product. Aligns with 21CC development and collaborative learning frameworks.',
  1
),

-- 7 ─ YouTube video: Social-Emotional Learning
(
  'Social-Emotional Learning in the Classroom – CASEL Framework',
  'Introduction to CASEL''s five SEL competencies: self-awareness, self-management, social awareness, relationship skills, and responsible decision-making. Includes strategies for embedding SEL into daily instruction.',
  'https://www.youtube.com/watch?v=vCjqXLNMWBs',
  'video', NULL, 0,
  'wellbeing', 'Social-Emotional Learning', 'all',
  '["SEL","CASEL","self-awareness","empathy","responsible decision-making","well-being","character education","21CC"]',
  'CASEL SEL framework five competencies: self-awareness, self-management, social awareness, relationship skills, responsible decision-making. Includes classroom-level strategies for embedding SEL. Aligns with MOE CCE framework and F9 Student Well-being skill framework.',
  1
),

-- 8 ─ YouTube video: Metacognition strategies
(
  'Teaching Metacognition – Helping Students Think About Their Learning',
  'The Education Endowment Foundation presents metacognition and self-regulation strategies with evidence ratings. Shows how to model thinking, use structured reflection, and build students'' awareness of their own learning processes.',
  'https://www.youtube.com/watch?v=vvQFHTRtcCQ',
  'video', NULL, 0,
  'pedagogy', 'Metacognition & Self-Regulation', 'all',
  '["metacognition","self-regulation","EEF","think aloud","learning strategies","reflection","study skills"]',
  'EEF guidance on metacognition and self-regulation. Seven-step model: activating prior knowledge, explicit strategy instruction, modelling, memorisation, guided practice, independent practice, structured reflection. High evidence base (d=0.60+).',
  1
),

-- 9 ─ Link: MOE Singapore Teaching Practice framework
(
  'Singapore Teaching Practice (STP) – MOE Framework Overview',
  'Official MOE overview of the Singapore Teaching Practice framework, describing the four domains: Cultivating a Caring and Enabling Environment, Directing and Facilitating Learning, Nurturing the Whole Child, and Working with Others.',
  'https://www.moe.gov.sg/education-in-sg/educational-research-and-teaching-practice/singapore-teaching-practice',
  'link', NULL, 0,
  'pedagogy', 'Teaching Practice Framework', 'all',
  '["Singapore Teaching Practice","STP","MOE","teaching framework","professional standards","EPMS","teaching competencies"]',
  'Official STP framework: four domains covering classroom environment, lesson facilitation, whole-child development, and professional collaboration. Underpins all ten skill frameworks used on this platform. Reference for curriculum design and professional development planning.',
  1
),

-- 10 ─ Link: NIE Teacher Education in Singapore
(
  'Teacher Education in Singapore – NIE Overview',
  'National Institute of Education overview of initial teacher preparation programmes, professional development pathways, and research initiatives supporting Singapore''s teaching profession.',
  'https://www.nie.edu.sg/our-programmes/teacher-education',
  'link', NULL, 0,
  'pedagogy', 'Teacher Education', 'all',
  '["NIE","initial teacher education","professional development","Singapore","teacher preparation","PGDE","B.Ed"]',
  'NIE provides initial teacher preparation and continuing professional development for Singapore teachers. Programmes aligned to STP framework. Useful background for understanding Singapore teacher career pathways and professional learning expectations.',
  0
),

-- 11 ─ Link: ISTE Standards for Educators
(
  'ISTE Standards for Educators 2017',
  'The International Society for Technology in Education (ISTE) standards define seven roles for educators using technology: Learner, Leader, Citizen, Collaborator, Designer, Facilitator, and Analyst.',
  'https://www.iste.org/standards/educators',
  'link', NULL, 0,
  'technology', 'EdTech Standards', 'all',
  '["ISTE","EdTech","digital learning","technology integration","digital citizenship","educator standards","ICT pedagogy"]',
  'ISTE 2017 Educator Standards: Learner (professional growth), Leader (school improvement), Citizen (digital citizenship), Collaborator (peer learning), Designer (authentic learning experiences), Facilitator (student-centered learning), Analyst (data use). Underpins F5 ICT Integration framework.',
  1
),

-- 12 ─ Link: EEF Teaching and Learning Toolkit
(
  'Education Endowment Foundation – Teaching & Learning Toolkit',
  'The EEF Toolkit summarises evidence on 50+ teaching approaches, each rated for cost, months of additional progress, and evidence strength. Covers feedback, metacognition, collaborative learning, digital technology, and more.',
  'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit',
  'link', NULL, 0,
  'pedagogy', 'Evidence-Based Teaching', 'all',
  '["EEF","evidence-based","teaching toolkit","feedback","metacognition","collaborative learning","effect size","research"]',
  'EEF Toolkit covers 50+ interventions. Highest-impact approaches: feedback (+8 months, high evidence), metacognition (+7 months, high), collaborative learning (+5 months, moderate). Essential reference for evidence-based professional development planning.',
  1
),

-- 13 ─ Link: MOE CCE Framework
(
  'MOE Character & Citizenship Education (CCE) 2021 Framework',
  'Singapore MOE''s updated CCE framework for 2021, covering core values, social-emotional competencies, and citizenship dispositions. Includes school-based CCE, Form Teacher Guidance, and Programme for Active Learning.',
  'https://www.moe.gov.sg/education-in-sg/our-programmes/character-and-citizenship-education',
  'link', NULL, 0,
  'wellbeing', 'Character & Citizenship Education', 'all',
  '["CCE","character education","citizenship","SEL","21CC","values","well-being","form teacher","PAL","Singapore"]',
  'MOE CCE 2021 framework: core values (respect, responsibility, integrity, care, resilience, harmony), social-emotional competencies aligned to CASEL, and citizenship dispositions. Underpins F9 Student Well-being framework. Relevant to Year Heads, form teachers, and pastoral roles.',
  1
),

-- 14 ─ Link: Cognitive Load Theory – CESE NSW
(
  'Cognitive Load Theory – A Practical Guide for Teachers (CESE)',
  'The NSW Centre for Education Statistics and Evaluation guide explains cognitive load theory and its implications for lesson design, worked examples, split-attention effect, redundancy, and modality principles.',
  'https://www.cese.nsw.gov.au/publications-filter/cognitive-load-theory-research-that-teachers-really-need-to-understand',
  'link', NULL, 0,
  'pedagogy', 'Cognitive Science & Learning Design', 'all',
  '["cognitive load theory","working memory","Sweller","lesson design","scaffolding","worked examples","instructional design"]',
  'Cognitive Load Theory by John Sweller. Key principles: limit intrinsic load (manage task complexity), reduce extraneous load (clear design), build germane load (schema formation). Implications: use worked examples, avoid split-attention, apply modality principle (audio+visual). Directly applicable to lesson and courseware design.',
  1
),

-- 15 ─ Link: Hattie & Timperley Feedback Model
(
  'The Power of Feedback – Hattie & Timperley (2007)',
  'Seminal paper by Hattie and Timperley defining four levels of feedback (task, process, self-regulation, self), and three feedback questions: Where am I going? How am I going? Where to next?',
  'https://visible-learning.org/2013/10/john-hattie-article-feedback-in-schools/',
  'link', NULL, 0,
  'assessment', 'Feedback Practice', 'all',
  '["feedback","Hattie","Timperley","feed forward","self-regulation","task feedback","process feedback","assessment"]',
  'Hattie & Timperley (2007) feedback model. Four levels: (1) Task – correctness of work, (2) Process – strategies used, (3) Self-regulation – metacognitive monitoring, (4) Self – personal praise. Most effective: process and self-regulation levels. Three questions: Where am I going (goals)? How am I going (progress)? Where to next (next steps)?',
  1
),

-- 16 ─ Link: Universal Design for Learning (UDL)
(
  'Universal Design for Learning (UDL) Guidelines – CAST',
  'CAST''s UDL framework provides three principles for designing inclusive learning: Multiple Means of Engagement, Representation, and Action & Expression. Each principle has specific checkpoints for implementation.',
  'https://udlguidelines.cast.org/',
  'link', NULL, 0,
  'pedagogy', 'Inclusive Education', 'all',
  '["UDL","universal design","inclusive education","differentiation","accessibility","special needs","CAST","representation"]',
  'UDL three principles: (1) Multiple Means of Engagement – motivation, self-regulation; (2) Multiple Means of Representation – perception, language, comprehension; (3) Multiple Means of Action & Expression – physical action, expression, executive function. Goal: expert learners who are purposeful, motivated, resourceful, and strategic.',
  1
),

-- 17 ─ YouTube video: Socratic Seminar facilitation
(
  'Socratic Seminar – A Guide to Structured Academic Dialogue',
  'Demonstration of a Socratic Seminar in a secondary classroom. Shows how to design an inner circle/outer circle discussion, prepare higher-order questions, and facilitate accountable talk to deepen student reasoning.',
  'https://www.youtube.com/watch?v=nnXMqH_bpOs',
  'video', NULL, 0,
  'pedagogy', 'Discussion & Dialogue', 'secondary',
  '["Socratic seminar","dialogue","higher-order thinking","questioning","accountable talk","facilitation","critical thinking"]',
  'Socratic seminar format: inner/outer circle, open-ended anchor question, student-to-student dialogue, teacher as facilitator. Develops critical thinking, listening, respectful disagreement, and evidence-based reasoning. Aligns with F7 Higher-Order Thinking and F6 Collaborative Learning frameworks.',
  1
),

-- 18 ─ YouTube video: Lesson study process
(
  'Lesson Study – A Collaborative Professional Learning Cycle',
  'An overview of the Japanese-origin Lesson Study process: collaborative planning, research lesson observation, and post-lesson reflection. Shows how Singapore schools use lesson study to improve teaching and build professional learning communities.',
  'https://www.youtube.com/watch?v=lzAR8S1UDp0',
  'video', NULL, 0,
  'pedagogy', 'Professional Learning Communities', 'all',
  '["lesson study","professional learning","PLC","peer observation","collaborative planning","teacher research","reflective practice"]',
  'Lesson Study cycle: (1) Study curriculum and student learning goals, (2) Plan research lesson collaboratively, (3) Teach and observe lesson, (4) Debrief and reflect, (5) Revise and re-teach (optional). Aligns with F8 Professional Learning framework skills: Lesson Study & Peer Observation, Evidence-Based Reflective Practice.',
  1
),

-- 19 ─ YouTube video: Inquiry-based learning science
(
  'Inquiry-Based Learning in Science – 5E Instructional Model',
  'Explains the 5E instructional model (Engage, Explore, Explain, Elaborate, Evaluate) for science lessons. Includes classroom footage showing how inquiry-based learning develops scientific thinking and student curiosity.',
  'https://www.youtube.com/watch?v=UBOIQF0a1wQ',
  'video', NULL, 0,
  'curriculum', 'Science Education', 'primary',
  '["inquiry-based learning","5E model","science","STEM","engagement","exploration","scientific thinking","primary science"]',
  '5E Model: Engage (activate prior knowledge, generate curiosity), Explore (hands-on investigation), Explain (vocabulary and concepts), Elaborate (apply to new contexts), Evaluate (assess understanding). Strong alignment with student motivation, higher-order thinking, and collaborative learning frameworks.',
  0
),

-- 20 ─ Link: MOE 21st Century Competencies Framework
(
  'MOE 21st Century Competencies (21CC) Framework',
  'Singapore MOE''s framework for 21st Century Competencies, comprising civic literacy, global awareness, cross-cultural skills, critical thinking, communication, and information skills. Describes how schools develop these through curriculum, co-curriculum, and CCE.',
  'https://www.moe.gov.sg/education-in-sg/educational-research-and-teaching-practice/21st-century-competencies',
  'link', NULL, 0,
  'curriculum', '21st Century Learning', 'all',
  '["21CC","21st century","critical thinking","communication","collaboration","civic literacy","global awareness","MOE"]',
  'MOE 21CC Framework: Core values at centre, then social-emotional competencies, then three 21CC domains: (1) Civic Literacy, Global Awareness & Cross-Cultural Skills; (2) Critical and Inventive Thinking; (3) Communication, Collaboration & Information Skills. Essential reference for curriculum design and 21CC integration across subjects.',
  1
);
