const { initDb, getDb } = require('./src/db/database');
const bcrypt = require('bcryptjs');

initDb();
const db = getDb();

// Seed instructors
const instructors = [
  { name: 'Dr. Sarah Tan', email: 'sarah@edulearn.pro', bio: 'Expert in formative assessment and student-centered learning with 15 years experience.' },
  { name: 'Prof. James Lee', email: 'james@edulearn.pro', bio: 'Specialist in inquiry-based learning and STEM education.' },
  { name: 'Dr. Maria Chen', email: 'maria@edulearn.pro', bio: 'AI in education researcher and curriculum design expert.' },
  { name: 'Dr. Alex Wong', email: 'alex@edulearn.pro', bio: 'Wellbeing and resilience coach for educators.' },
];

const instructorIds = [];
for (const inst of instructors) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(inst.email);
  if (!existing) {
    const hash = bcrypt.hashSync('teacher123', 10);
    const r = db.prepare('INSERT INTO users (name, email, password_hash, role, bio) VALUES (?, ?, ?, ?, ?)').run(inst.name, inst.email, hash, 'teacher', inst.bio);
    instructorIds.push(r.lastInsertRowid);
  } else {
    instructorIds.push(existing.id);
  }
}

// Seed courses
const courses = [
  {
    title: 'Formative Assessment Strategies for the 21st Century Classroom',
    description: 'Learn evidence-based formative assessment techniques to gauge student understanding in real-time. This course covers think-pair-share, exit tickets, digital polling, and metacognitive reflection strategies.',
    category: 'assessment', modality: 'Self-Paced', level: 'intermediate',
    duration_hours: 4, rating: 4.7, enrolled_count: 342, instructor_idx: 0,
    image_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800',
    modules: [
      { title: 'Introduction to Formative Assessment', description: 'Overview of formative vs summative assessment', duration_mins: 30 },
      { title: 'Exit Tickets and Digital Polling', description: 'Practical tools for real-time feedback', duration_mins: 45 },
      { title: 'Think-Pair-Share Strategies', description: 'Collaborative learning assessment techniques', duration_mins: 40 },
      { title: 'Metacognitive Reflection', description: 'Teaching students to assess their own learning', duration_mins: 35 },
      { title: 'Data-Driven Instruction', description: 'Using assessment data to guide teaching', duration_mins: 50 },
    ],
    tags: ['Assessment Literacy', 'Student-Centred Learning', 'Data-Driven Instruction'],
  },
  {
    title: 'Inquiry-Based Learning in Science Education',
    description: 'Explore how to design inquiry-based lessons that ignite curiosity and develop scientific thinking in students.',
    category: 'pedagogy', modality: 'Blended', level: 'intermediate',
    duration_hours: 6, rating: 4.5, enrolled_count: 218, instructor_idx: 1,
    image_url: 'https://images.unsplash.com/photo-1532094349884-543559c5b7f8?w=800',
    modules: [
      { title: 'Foundations of Inquiry-Based Learning', description: 'The 5E instructional model', duration_mins: 45 },
      { title: 'Designing Inquiry Lessons', description: 'Structuring open and guided inquiry', duration_mins: 60 },
      { title: 'Student-Led Investigations', description: 'Facilitating student-driven science', duration_mins: 55 },
    ],
    tags: ['Inquiry Learning', 'Science Education', 'Critical Thinking'],
  },
  {
    title: 'Leveraging AI Tools for Personalised Learning',
    description: 'Understand how artificial intelligence can enhance teaching and create personalised learning experiences for every student.',
    category: 'technology', modality: 'Microlearning', level: 'beginner',
    duration_hours: 3, rating: 4.8, enrolled_count: 456, instructor_idx: 2,
    image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    modules: [
      { title: 'AI Basics for Educators', description: 'What teachers need to know about AI', duration_mins: 20 },
      { title: 'AI Tools in the Classroom', description: 'Practical AI applications for teaching', duration_mins: 25 },
      { title: 'Personalising Learning with AI', description: 'Adaptive learning strategies', duration_mins: 30 },
    ],
    tags: ['AI in Education', 'Personalised Learning', 'EdTech'],
  },
  {
    title: 'Building Resilience and Wellbeing in Educators',
    description: 'A comprehensive programme addressing educator mental health, stress management, and building long-term professional resilience.',
    category: 'wellbeing', modality: 'Self-Paced', level: 'beginner',
    duration_hours: 5, rating: 4.9, enrolled_count: 189, instructor_idx: 3,
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    modules: [
      { title: 'Understanding Educator Burnout', description: 'Signs, causes and prevention', duration_mins: 40 },
      { title: 'Mindfulness for Teachers', description: 'Practical mindfulness techniques', duration_mins: 45 },
      { title: 'Building Support Networks', description: 'Collegial support and communities', duration_mins: 35 },
    ],
    tags: ['Teacher Wellbeing', 'Resilience', 'Mental Health'],
  },
  {
    title: 'Differentiated Instruction: Reaching Every Learner',
    description: 'Master differentiation strategies for diverse classrooms. Learn to design tiered activities and flexible learning experiences.',
    category: 'pedagogy', modality: 'Video', level: 'intermediate',
    duration_hours: 4, rating: 4.6, enrolled_count: 267, instructor_idx: 0,
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    modules: [
      { title: 'Principles of Differentiation', description: 'Content, process, and product differentiation', duration_mins: 35 },
      { title: 'Tiered Activities Design', description: 'Creating tasks at multiple levels', duration_mins: 50 },
      { title: 'Flexible Grouping', description: 'Strategic grouping for learning', duration_mins: 40 },
      { title: 'Universal Design for Learning', description: 'UDL framework and application', duration_mins: 45 },
    ],
    tags: ['Differentiation', 'Inclusive Education', 'UDL'],
  },
  {
    title: 'Leadership in Education: From Teacher to Leader',
    description: 'Develop essential leadership competencies needed to take on departmental and school leadership roles.',
    category: 'leadership', modality: 'Live Session', level: 'advanced',
    duration_hours: 8, rating: 4.7, enrolled_count: 134, instructor_idx: 1,
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    modules: [
      { title: 'Leadership Styles and Approaches', description: 'Understanding your leadership identity', duration_mins: 60 },
      { title: 'Leading Teams and Departments', description: 'Effective team management in schools', duration_mins: 75 },
      { title: 'Instructional Leadership', description: 'Leading learning improvement', duration_mins: 70 },
    ],
    tags: ['Leadership', 'School Management', 'Professional Growth'],
  },
  {
    title: 'Designing Effective Curriculum Maps',
    description: 'Learn systematic approaches to curriculum design, backward mapping, and alignment with learning standards.',
    category: 'curriculum', modality: 'Self-Paced', level: 'intermediate',
    duration_hours: 6, rating: 4.3, enrolled_count: 198, instructor_idx: 2,
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
    modules: [
      { title: 'Backward Design Principles', description: 'Understanding by design framework', duration_mins: 45 },
      { title: 'Standards Alignment', description: 'Mapping curriculum to learning standards', duration_mins: 50 },
      { title: 'Vertical and Horizontal Alignment', description: 'Cross-grade curriculum coherence', duration_mins: 40 },
    ],
    tags: ['Curriculum Design', 'Backward Design', 'Standards Alignment'],
  },
  {
    title: 'Supporting Students with Special Educational Needs',
    description: 'Practical strategies for inclusive classrooms, including Universal Design for Learning and individualised support approaches.',
    category: 'special needs', modality: 'Blended', level: 'beginner',
    duration_hours: 5, rating: 4.8, enrolled_count: 312, instructor_idx: 3,
    image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    modules: [
      { title: 'Understanding Learning Differences', description: 'Types of special educational needs', duration_mins: 40 },
      { title: 'Inclusive Classroom Strategies', description: 'Practical inclusion techniques', duration_mins: 50 },
      { title: 'IEP and Support Planning', description: 'Creating effective support plans', duration_mins: 45 },
    ],
    tags: ['Inclusive Education', 'Special Needs', 'Accessibility'],
  },
];

for (const course of courses) {
  const existing = db.prepare('SELECT id FROM courses WHERE title = ?').get(course.title);
  if (!existing) {
    const r = db.prepare('INSERT INTO courses (title, description, category, modality, level, duration_hours, image_url, instructor_id, rating, enrolled_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      course.title, course.description, course.category, course.modality, course.level,
      course.duration_hours, course.image_url, instructorIds[course.instructor_idx],
      course.rating, course.enrolled_count
    );
    const courseId = r.lastInsertRowid;
    course.modules.forEach((m, i) => {
      db.prepare('INSERT INTO course_modules (course_id, title, description, order_index, duration_mins) VALUES (?, ?, ?, ?, ?)').run(courseId, m.title, m.description, i, m.duration_mins);
    });
    course.tags.forEach(tag => {
      db.prepare('INSERT INTO competency_tags (course_id, tag) VALUES (?, ?)').run(courseId, tag);
    });
    console.log(`✓ Course created: ${course.title}`);
  }
}

// Seed communities
const communities = [
  { name: 'Assessment & Feedback Hub', description: 'Share assessment strategies and feedback techniques that work in your classroom.', category: 'assessment', image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800' },
  { name: 'EdTech Innovators', description: 'Explore the latest educational technologies and how to integrate them effectively.', category: 'technology', image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800' },
  { name: 'Inclusive Education Network', description: 'Supporting educators in creating welcoming, accessible classrooms for all learners.', category: 'special needs', image_url: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800' },
  { name: 'Teacher Wellbeing Circle', description: 'A safe space to discuss educator wellbeing, share self-care strategies, and support each other.', category: 'wellbeing', image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800' },
];

for (const comm of communities) {
  const existing = db.prepare('SELECT id FROM communities WHERE name = ?').get(comm.name);
  if (!existing) {
    db.prepare('INSERT INTO communities (name, description, category, image_url, created_by, member_count) VALUES (?, ?, ?, ?, ?, ?)').run(comm.name, comm.description, comm.category, comm.image_url, 1, Math.floor(Math.random() * 200) + 50);
    console.log(`✓ Community created: ${comm.name}`);
  }
}

// Seed learning pathways
const pathways = [
  {
    title: 'New Teacher Essentials',
    description: 'A comprehensive pathway for teachers in their first years, covering core pedagogy and classroom management.',
    category: 'pedagogy', level: 'beginner', duration_hours: 15,
    image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    course_titles: ['Differentiated Instruction: Reaching Every Learner', 'Formative Assessment Strategies for the 21st Century Classroom', 'Building Resilience and Wellbeing in Educators'],
  },
  {
    title: 'Digital Education Mastery',
    description: 'Master technology integration and AI-powered teaching tools for the modern classroom.',
    category: 'technology', level: 'intermediate', duration_hours: 12,
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    course_titles: ['Leveraging AI Tools for Personalised Learning', 'Designing Effective Curriculum Maps'],
  },
  {
    title: 'Aspiring School Leaders',
    description: 'Develop the leadership and strategic skills needed to move into school leadership positions.',
    category: 'leadership', level: 'advanced', duration_hours: 20,
    image_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
    course_titles: ['Leadership in Education: From Teacher to Leader', 'Designing Effective Curriculum Maps'],
  },
];

for (const pathway of pathways) {
  const existing = db.prepare('SELECT id FROM learning_pathways WHERE title = ?').get(pathway.title);
  if (!existing) {
    const r = db.prepare('INSERT INTO learning_pathways (title, description, category, level, duration_hours, image_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      pathway.title, pathway.description, pathway.category, pathway.level, pathway.duration_hours, pathway.image_url, 1
    );
    const pathwayId = r.lastInsertRowid;
    pathway.course_titles.forEach((title, i) => {
      const course = db.prepare('SELECT id FROM courses WHERE title = ?').get(title);
      if (course) {
        db.prepare('INSERT INTO pathway_courses (pathway_id, course_id, order_index) VALUES (?, ?, ?)').run(pathwayId, course.id, i);
      }
    });
    console.log(`✓ Pathway created: ${pathway.title}`);
  }
}

console.log('\n✅ Seed data complete!');
console.log('Admin login: admin@edulearn.pro / admin123');
