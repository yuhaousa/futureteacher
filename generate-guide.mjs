import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PageBreak, Header, Footer, ImageRun, convertInchesToTwip,
  TableLayoutType, VerticalAlign,
} from 'docx';
import { writeFileSync } from 'fs';

const PRIMARY   = '4F46E5'; // indigo
const DARK      = '1A2035';
const LIGHT_BG  = 'F5F6FA';
const ACCENT    = 'F5A623';
const SUCCESS   = '27AE60';
const GRAY      = '7A8294';
const WHITE     = 'FFFFFF';
const BORDER_C  = 'E0E3EA';

const h = (text, level, opts = {}) => new Paragraph({
  text,
  heading: level,
  spacing: { before: 280, after: 120 },
  ...opts,
});

const p = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, size: 22, color: '374151', font: 'Calibri', ...opts })],
  spacing: { before: 80, after: 80 },
});

const bullet = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, size: 22, color: '374151', font: 'Calibri', ...opts })],
  bullet: { level: 0 },
  spacing: { before: 60, after: 60 },
});

const subBullet = (text) => new Paragraph({
  children: [new TextRun({ text, size: 20, color: GRAY, font: 'Calibri' })],
  bullet: { level: 1 },
  spacing: { before: 40, after: 40 },
});

const note = (text) => new Paragraph({
  children: [new TextRun({ text: '💡 ' + text, size: 20, color: '1D4ED8', font: 'Calibri', italics: true })],
  spacing: { before: 100, after: 100 },
  indent: { left: convertInchesToTwip(0.3) },
});

const sectionTitle = (text) => new Paragraph({
  children: [new TextRun({ text, size: 28, bold: true, color: WHITE, font: 'Calibri' })],
  shading: { type: ShadingType.SOLID, color: PRIMARY },
  spacing: { before: 360, after: 160 },
  indent: { left: convertInchesToTwip(0.15), right: convertInchesToTwip(0.15) },
});

const subTitle = (text) => new Paragraph({
  children: [new TextRun({ text, size: 24, bold: true, color: DARK, font: 'Calibri' })],
  shading: { type: ShadingType.SOLID, color: 'EEF2FF' },
  spacing: { before: 200, after: 100 },
  indent: { left: convertInchesToTwip(0.1) },
});

const stepRow = (num, title, desc) => new Paragraph({
  children: [
    new TextRun({ text: `Step ${num}  `, size: 22, bold: true, color: PRIMARY, font: 'Calibri' }),
    new TextRun({ text: title + '  —  ', size: 22, bold: true, color: DARK, font: 'Calibri' }),
    new TextRun({ text: desc, size: 22, color: '374151', font: 'Calibri' }),
  ],
  spacing: { before: 100, after: 60 },
  indent: { left: convertInchesToTwip(0.2) },
});

const tCell = (text, header = false, width = 20) => new TableCell({
  children: [new Paragraph({
    children: [new TextRun({ text, size: header ? 20 : 20, bold: header, color: header ? WHITE : DARK, font: 'Calibri' })],
    spacing: { before: 60, after: 60 },
  })],
  shading: header ? { type: ShadingType.SOLID, color: PRIMARY } : undefined,
  width: { size: width, type: WidthType.PERCENTAGE },
  verticalAlign: VerticalAlign.CENTER,
  margins: { top: 60, bottom: 60, left: 120, right: 120 },
});

const apiTable = (rows) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  layout: TableLayoutType.FIXED,
  rows: [
    new TableRow({ children: [tCell('Method', true, 10), tCell('Endpoint', true, 35), tCell('Access', true, 15), tCell('Description', true, 40)], tableHeader: true }),
    ...rows.map(([m, e, a, d], i) => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: m, size: 20, bold: true, color: m === 'GET' ? SUCCESS : m === 'POST' ? '2563EB' : m === 'PUT' ? ACCENT : 'DC2626', font: 'Calibri' })] })], shading: i % 2 === 1 ? { type: ShadingType.SOLID, color: 'F9FAFB' } : undefined, width: { size: 10, type: WidthType.PERCENTAGE }, margins: { top: 60, bottom: 60, left: 120, right: 120 } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: e, size: 18, font: 'Courier New', color: '1E293B' })] })], shading: i % 2 === 1 ? { type: ShadingType.SOLID, color: 'F9FAFB' } : undefined, width: { size: 35, type: WidthType.PERCENTAGE }, margins: { top: 60, bottom: 60, left: 120, right: 120 } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: a, size: 19, font: 'Calibri', color: a === 'Admin' ? 'DC2626' : a === 'Bearer' ? '7C3AED' : GRAY })] })], shading: i % 2 === 1 ? { type: ShadingType.SOLID, color: 'F9FAFB' } : undefined, width: { size: 15, type: WidthType.PERCENTAGE }, margins: { top: 60, bottom: 60, left: 120, right: 120 } }),
        tCell(d, false, 40),
      ],
    })),
  ],
});

// ──────────────────────────────────────────────────────────────────────────────
const doc = new Document({
  creator: 'EduLearn Pro',
  title: 'FutureTeacher — User Guide',
  description: 'Complete user and admin guide for the FutureTeacher EduLearn Pro platform',
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 22, color: '374151' } },
      heading1: { run: { font: 'Calibri', size: 36, bold: true, color: DARK }, paragraph: { spacing: { before: 400, after: 160 } } },
      heading2: { run: { font: 'Calibri', size: 28, bold: true, color: PRIMARY }, paragraph: { spacing: { before: 280, after: 120 } } },
      heading3: { run: { font: 'Calibri', size: 24, bold: true, color: '374151' }, paragraph: { spacing: { before: 200, after: 80 } } },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1.2) },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'FutureTeacher', bold: true, size: 18, color: PRIMARY, font: 'Calibri' }),
            new TextRun({ text: '  |  EduLearn Pro User Guide', size: 18, color: GRAY, font: 'Calibri' }),
          ],
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_C } },
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [new TextRun({ text: 'Confidential — FutureTeacher Platform  |  May 2026', size: 16, color: GRAY, font: 'Calibri' })],
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: BORDER_C } },
        })],
      }),
    },
    children: [

      // ── Cover ──────────────────────────────────────────────────────────────
      new Paragraph({
        children: [new TextRun({ text: '', break: 4 })],
      }),
      new Paragraph({
        children: [new TextRun({ text: 'FutureTeacher', size: 72, bold: true, color: PRIMARY, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'EduLearn Pro', size: 48, color: DARK, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'User & Administrator Guide', size: 32, italics: true, color: GRAY, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Version 2.0  |  May 2026', size: 22, color: GRAY, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'https://futureteacher.pages.dev', size: 22, color: PRIMARY, font: 'Calibri', bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ── TOC ────────────────────────────────────────────────────────────────
      new Paragraph({ children: [new TextRun({ text: 'Table of Contents', size: 36, bold: true, color: DARK, font: 'Calibri' })], spacing: { before: 200, after: 240 } }),
      ...[
        ['1.', 'Platform Overview', '3'],
        ['2.', 'Getting Started', '4'],
        ['3.', 'Teacher User Guide', '5'],
        ['  3.1', 'Logging In', '5'],
        ['  3.2', 'Home & Dashboard', '5'],
        ['  3.3', 'Discover Courses', '6'],
        ['  3.4', 'Course Detail & Enrolment', '6'],
        ['  3.5', 'My Learning', '7'],
        ['  3.6', 'Learning Pathways', '7'],
        ['  3.7', 'Communities', '8'],
        ['  3.8', 'AI Learning Assistant', '8'],
        ['  3.9', 'Account Settings & Profile', '9'],
        ['4.', 'Administrator Guide', '11'],
        ['  4.1', 'Admin Dashboard', '11'],
        ['  4.2', 'Course Management', '12'],
        ['  4.3', 'User Management', '14'],
        ['  4.4', 'Job Roles & Skill Map', '15'],
        ['  4.5', 'Pathways Management', '16'],
        ['  4.6', 'Communities Management', '16'],
        ['5.', 'Course Modalities', '17'],
        ['6.', 'API Quick Reference', '18'],
        ['7.', 'Deployment & Configuration', '20'],
      ].map(([num, title, pg]) => new Paragraph({
        children: [
          new TextRun({ text: num.padEnd(6), size: 22, bold: num.length <= 2, color: num.length <= 2 ? PRIMARY : DARK, font: 'Calibri' }),
          new TextRun({ text: title, size: 22, color: DARK, font: 'Calibri' }),
          new TextRun({ text: ' ' + '.'.repeat(60 - num.length - title.length) + ' ' + pg, size: 22, color: GRAY, font: 'Calibri' }),
        ],
        spacing: { before: 60, after: 60 },
      })),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════════════
      // 1. Platform Overview
      // ══════════════════════════════════════════════════════════════════════
      sectionTitle('1.  Platform Overview'),
      p('FutureTeacher (EduLearn Pro) is a professional learning management system purpose-built for Malaysia\'s teacher community. It is hosted entirely on Cloudflare\'s global edge infrastructure, delivering fast and reliable access from any device.'),
      p(''),
      subTitle('Key Capabilities'),
      bullet('Course library across four modalities: Live Session, Video, Blended, and Microlearning'),
      bullet('Structured learning pathways that group related courses into career journeys'),
      bullet('Professional communities for collaborative discussion and peer learning'),
      bullet('AI-powered learning assistant for personalised course recommendations'),
      bullet('Comprehensive user profiles with teaching subjects, job title, and skill tracking'),
      bullet('Administrator portal for platform governance, analytics, and content management'),
      bullet('Job role definitions with competency skill maps and proficiency levels'),
      p(''),
      subTitle('Technology Stack'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [tCell('Layer', true, 25), tCell('Technology', true, 35), tCell('Notes', true, 40)], tableHeader: true }),
          ...([
            ['Backend API', 'Hono v4 on Cloudflare Workers', 'Serverless, globally distributed'],
            ['Database', 'Cloudflare D1 (SQLite)', 'Relational data, Workers-native'],
            ['File Storage', 'Cloudflare R2', 'Course covers, avatars, PDFs, videos'],
            ['Frontend', 'React 19 + Vite + React Router v7', 'SPA, deployed to Cloudflare Pages'],
            ['Authentication', 'JWT via jose v5 + PBKDF2', 'Stateless, Web Crypto API'],
          ]).map(([a, b, c], i) => new TableRow({ children: [tCell(a, false, 25), tCell(b, false, 35), tCell(c, false, 40)] })),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════════════
      // 2. Getting Started
      // ══════════════════════════════════════════════════════════════════════
      sectionTitle('2.  Getting Started'),
      subTitle('2.1  First-Time Setup (Admin Only)'),
      p('When the platform is first deployed, the admin account requires activation before any user can log in.'),
      stepRow(1, 'Open the Setup page', 'Navigate to https://futureteacher.pages.dev/setup'),
      stepRow(2, 'Set admin password', 'Enter a password of at least 6 characters and confirm'),
      stepRow(3, 'Activate', 'Click Activate Admin Account. All instructor accounts are also activated with default password teacher123'),
      stepRow(4, 'Login', 'You will be automatically redirected to the login page'),
      note('The setup page is only accessible once. It redirects permanently to the login page after completion.'),
      p(''),
      subTitle('2.2  Default Accounts'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [tCell('Role', true, 15), tCell('Email', true, 35), tCell('Default Password', true, 25), tCell('Access Level', true, 25)], tableHeader: true }),
          ...([
            ['Admin', 'admin@edulearn.pro', '(set during setup)', 'Full admin access'],
            ['Teacher', 'sarah@edulearn.pro', 'teacher123', 'Standard user'],
            ['Teacher', 'james@edulearn.pro', 'teacher123', 'Standard user'],
            ['Teacher', 'maria@edulearn.pro', 'teacher123', 'Standard user'],
            ['Teacher', 'alex@edulearn.pro', 'teacher123', 'Standard user'],
          ]).map(([a, b, c, d]) => new TableRow({ children: [tCell(a, false, 15), tCell(b, false, 35), tCell(c, false, 25), tCell(d, false, 25)] })),
        ],
      }),
      note('Instructors should change their password immediately after first login via Account Settings → Security.'),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════════════
      // 3. Teacher User Guide
      // ══════════════════════════════════════════════════════════════════════
      sectionTitle('3.  Teacher User Guide'),
      subTitle('3.1  Logging In'),
      stepRow(1, 'Visit', 'https://futureteacher.pages.dev/login'),
      stepRow(2, 'Credentials', 'Enter your registered email address and password'),
      stepRow(3, 'Access', 'Click Login — you will be directed to your personalised home dashboard'),
      p(''),

      subTitle('3.2  Home Dashboard'),
      p('The Home dashboard greets you by name and shows a personalised overview:'),
      bullet('Continue Learning — courses you are enrolled in with progress bars'),
      bullet('Recommended for You — courses suggested based on your teaching subjects and interests'),
      bullet('Trending — the most popular courses on the platform'),
      bullet('Your Communities — quick links to groups you have joined'),
      p('The left sidebar provides navigation to all sections of the platform. Your avatar and name appear at the bottom with a link to your profile settings.'),
      p(''),

      subTitle('3.3  Discover Courses'),
      p('Browse the full course catalogue at /discover:'),
      bullet('Search — type keywords in the search bar to filter by title or description'),
      bullet('Filter by Category — select subject areas such as Mathematics, Science, Leadership'),
      bullet('Filter by Modality — Live Session, Video, Blended, or Microlearning'),
      bullet('Filter by Level — Beginner, Intermediate, or Advanced'),
      p('Each course card shows the title, instructor, duration, modality badge, rating, and enrolment count.'),
      p(''),

      subTitle('3.4  Course Detail & Enrolment'),
      p('Click any course card to open its detail page, which contains four tabs:'),
      bullet('Overview — description, instructor info, modality-specific details, and enrol button'),
      bullet('Modules — list of learning modules in sequence'),
      bullet('Resources — downloadable PDFs and supplementary materials'),
      bullet('Discussion — threaded comments and questions from enrolled learners'),
      p(''),
      p('Modality-specific information shown in Overview:'),
      bullet('Live Session — start date/time, end date/time, available seats, and Join Session link (once enrolled)'),
      bullet('Blended — physical location, session schedule'),
      bullet('Video — on-demand indicator, no time constraints'),
      bullet('Microlearning — short focused module indicator'),
      p(''),
      p('To enrol, click the Enrol Now button on the right-hand sidebar. Live sessions show Session Full when capacity is reached.'),
      p(''),

      subTitle('3.5  My Learning'),
      p('Access at /my-learning — your personal learning record:'),
      bullet('In Progress — courses you have started, with completion percentage'),
      bullet('Completed — courses you have fully finished'),
      p('Click any course to resume where you left off. Module completion is tracked automatically.'),
      p(''),

      subTitle('3.6  Learning Pathways'),
      p('Access at /pathways — structured sequences of courses grouped into career development journeys:'),
      bullet('Browse pathways by category and level'),
      bullet('View all courses within a pathway and their sequence'),
      bullet('Enrol in an entire pathway to track overall progress'),
      note('Enrolling in a pathway does not automatically enrol you in individual courses — visit each course to enrol separately.'),
      p(''),

      subTitle('3.7  Communities'),
      p('Access at /communities — collaborative groups for peer learning:'),
      bullet('Browse available communities by category'),
      bullet('Join a community to access its discussion board'),
      bullet('Post messages and replies to share insights and ask questions'),
      bullet('View member count and community description'),
      p(''),

      subTitle('3.8  AI Learning Assistant'),
      p('Access at /ai-assistant — an intelligent chatbot that helps you find relevant learning:'),
      bullet('Type natural language queries such as "I want to improve my classroom management skills"'),
      bullet('The assistant analyses your teaching subjects and learning history'),
      bullet('Receive personalised course recommendations with explanations'),
      bullet('Click recommended course cards to go directly to the course detail page'),
      note('The more complete your profile (subjects, job title), the more accurate the recommendations will be.'),
      p(''),

      subTitle('3.9  Account Settings & Profile'),
      p('Access at /profile (click your name in the sidebar, or navigate directly). The settings page has three sections:'),
      p(''),
      new Paragraph({
        children: [new TextRun({ text: 'Personal Information', size: 22, bold: true, color: PRIMARY, font: 'Calibri' })],
        spacing: { before: 120, after: 60 },
      }),
      bullet('Profile Photo — click the upload area or drag-and-drop a portrait photo (JPEG, PNG, WebP, max 5 MB). A circular preview updates in real time.'),
      bullet('Full Name — your display name shown across the platform'),
      bullet('Email Address — read-only; contact admin to change'),
      bullet('Phone Number — optional contact number'),
      bullet('School / Institution — your school or employer'),
      bullet('Department — your department within the school'),
      bullet('Job Title — your official position (e.g. Senior Teacher, Head of Department)'),
      bullet('Bio — a short introduction visible to other community members'),
      p('Click Save Changes to persist updates.'),
      p(''),
      new Paragraph({
        children: [new TextRun({ text: 'Teaching Subjects', size: 22, bold: true, color: PRIMARY, font: 'Calibri' })],
        spacing: { before: 120, after: 60 },
      }),
      bullet('View and manage the subjects you teach'),
      bullet('Click quick-add suggestion pills (20 Malaysian school subjects pre-loaded)'),
      bullet('Type a custom subject in the input box and press Enter or click Add'),
      bullet('Remove any subject by clicking the × button on its tag'),
      bullet('Click Save Subjects when finished'),
      p(''),
      new Paragraph({
        children: [new TextRun({ text: 'Security', size: 22, bold: true, color: PRIMARY, font: 'Calibri' })],
        spacing: { before: 120, after: 60 },
      }),
      bullet('Enter your current password to verify your identity'),
      bullet('Enter and confirm a new password (minimum 6 characters)'),
      bullet('A password strength indicator shows real-time feedback'),
      bullet('Click Change Password to save'),
      note('You will remain logged in after changing your password. No need to re-login.'),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════════════
      // 4. Administrator Guide
      // ══════════════════════════════════════════════════════════════════════
      sectionTitle('4.  Administrator Guide'),
      p('Administrators access the admin panel at https://futureteacher.pages.dev/admin. The panel is accessible only to accounts with the admin role.'),
      p(''),

      subTitle('4.1  Admin Dashboard'),
      p('The dashboard provides a real-time platform overview:'),
      p(''),
      new Paragraph({
        children: [new TextRun({ text: 'Summary Cards', size: 22, bold: true, color: DARK, font: 'Calibri' })],
        spacing: { before: 80, after: 60 },
      }),
      bullet('Total Users — registered accounts; click to go to User Management'),
      bullet('Total Courses — published courses; click to go to Course Management'),
      bullet('Enrolments — total course enrolments across the platform'),
      bullet('Communities — active communities; click to go to Communities'),
      p(''),
      new Paragraph({
        children: [new TextRun({ text: 'Weekly Activity Charts', size: 22, bold: true, color: DARK, font: 'Calibri' })],
        spacing: { before: 80, after: 60 },
      }),
      bullet('User Logins — Last 7 Days: bar chart showing daily login counts. Data is recorded on every successful login.'),
      bullet('New Courses Added — Last 7 Days: bar chart showing course creation activity'),
      p('Both charts display counts above each bar and day labels (Mon–Sun) below.'),
      p(''),
      new Paragraph({
        children: [new TextRun({ text: 'Recent Enrolments Table', size: 22, bold: true, color: DARK, font: 'Calibri' })],
        spacing: { before: 80, after: 60 },
      }),
      p('Shows the 5 most recent enrolments with user name, course title, and date.'),
      p(''),

      subTitle('4.2  Course Management  (/admin/courses)'),
      p('Full CRUD interface for the course catalogue.'),
      p(''),
      new Paragraph({
        children: [new TextRun({ text: 'Creating a Course', size: 22, bold: true, color: DARK, font: 'Calibri' })],
        spacing: { before: 80, after: 60 },
      }),
      stepRow(1, 'Open form', 'Click + New Course in the top-right corner'),
      stepRow(2, 'Basic info', 'Enter title, description, category, level, duration (hours), and status (draft/published)'),
      stepRow(3, 'Modality', 'Select the delivery format — additional fields appear based on selection'),
      stepRow(4, 'Cover image', 'Upload a cover photo (JPEG/PNG/WebP, max 5 MB). Image is stored in R2 and served globally.'),
      stepRow(5, 'Save', 'Click Save Course — the course appears immediately in the catalogue if published'),
      p(''),
      new Paragraph({
        children: [new TextRun({ text: 'Modality-Specific Fields', size: 22, bold: true, color: DARK, font: 'Calibri' })],
        spacing: { before: 80, after: 60 },
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [tCell('Modality', true, 20), tCell('Additional Fields', true, 80)], tableHeader: true }),
          ...([
            ['Live Session', 'Start date/time, End date/time, Meeting URL (e.g. Zoom/Teams link), Maximum seats'],
            ['Blended', 'Physical location, Start date/time, End date/time'],
            ['Video', 'No extra fields — on-demand content'],
            ['Microlearning', 'No extra fields — short self-paced modules'],
          ]).map(([a, b]) => new TableRow({ children: [tCell(a, false, 20), tCell(b, false, 80)] })),
        ],
      }),
      p(''),
      new Paragraph({
        children: [new TextRun({ text: 'Courseware (Modules, Resources, Quizzes)', size: 22, bold: true, color: DARK, font: 'Calibri' })],
        spacing: { before: 80, after: 60 },
      }),
      p('Click the Courseware icon on a course row to open the courseware editor (/admin/courseware/:id):'),
      bullet('Modules — add learning modules with title, description, and content text'),
      bullet('Resources — upload PDF or video files (PDF max 20 MB, video max 200 MB)'),
      bullet('Quizzes — create multiple-choice questions with four options and a correct answer'),
      note('Files are uploaded to R2 and served from the Workers edge — no separate CDN required.'),
      p(''),

      subTitle('4.3  User Management  (/admin/users)'),
      p('View and manage all registered users on the platform.'),
      p(''),
      new Paragraph({
        children: [new TextRun({ text: 'User Table', size: 22, bold: true, color: DARK, font: 'Calibri' })],
        spacing: { before: 80, after: 60 },
      }),
      p('Each row shows: avatar initial, name, email, role badge, registration date, and action buttons.'),
      p(''),
      new Paragraph({
        children: [new TextRun({ text: 'Actions', size: 22, bold: true, color: DARK, font: 'Calibri' })],
        spacing: { before: 80, after: 60 },
      }),
      bullet('Grant / Revoke Admin — click the shield icon to toggle the user\'s role between teacher and admin. A confirmation prompt appears.'),
      bullet('Delete User — click the bin icon to permanently remove the user and all their data.'),
      p(''),
      note('An admin cannot remove their own admin role. The last admin account is protected.'),
      p(''),

      subTitle('4.4  Job Roles & Skill Map  (/admin/job-roles)'),
      p('Define the organisation\'s job framework: job titles, descriptions, career levels, and competency skill maps.'),
      p(''),
      new Paragraph({
        children: [new TextRun({ text: 'Creating a Job Role', size: 22, bold: true, color: DARK, font: 'Calibri' })],
        spacing: { before: 80, after: 60 },
      }),
      stepRow(1, 'Open', 'Click + New Job Role'),
      stepRow(2, 'Role details', 'Enter job title (required), department, and career level (Entry / Mid / Senior / Lead / Manager)'),
      stepRow(3, 'Description', 'Write the job description — responsibilities, scope, and expectations'),
      stepRow(4, 'Add skills', 'Click Add Skill for each competency required for this role'),
      stepRow(5, 'Skill fields', 'For each skill: Skill Name, Category (Pedagogy / Technology / Leadership etc.), Required Level (Basic / Intermediate / Advanced / Expert), and optional Description'),
      stepRow(6, 'Save', 'Click Save Role'),
      p(''),
      new Paragraph({
        children: [new TextRun({ text: 'Proficiency Levels', size: 22, bold: true, color: DARK, font: 'Calibri' })],
        spacing: { before: 80, after: 60 },
      }),
      new Table({
        width: { size: 80, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [tCell('Level', true, 30), tCell('Meaning', true, 70)], tableHeader: true }),
          ...([
            ['Basic', 'Foundational awareness; can perform with guidance'],
            ['Intermediate', 'Working knowledge; can perform independently'],
            ['Advanced', 'Deep expertise; can guide others'],
            ['Expert', 'Mastery; recognised authority; drives strategy'],
          ]).map(([a, b]) => new TableRow({ children: [tCell(a, false, 30), tCell(b, false, 70)] })),
        ],
      }),
      p(''),
      p('On the job roles list, click any card to expand and view the full skill map table inline. Use the pencil icon to edit or the bin icon to delete.'),
      p(''),

      subTitle('4.5  Pathways Management  (/admin/pathways)'),
      p('Create structured learning journeys by grouping courses in sequence:'),
      bullet('Title, description, category, level, and duration'),
      bullet('Add existing courses to a pathway and set their order'),
      bullet('Cover image upload supported'),
      p(''),

      subTitle('4.6  Communities Management  (/admin/communities)'),
      p('Create and manage discussion communities:'),
      bullet('Title, description, category, and cover image'),
      bullet('View member count and posts'),
      bullet('Delete a community (this removes all posts and memberships)'),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════════════
      // 5. Course Modalities
      // ══════════════════════════════════════════════════════════════════════
      sectionTitle('5.  Course Modalities'),
      p('FutureTeacher supports four delivery modalities. Each has distinct UI treatments on the course detail page.'),
      p(''),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [tCell('Modality', true, 20), tCell('Badge Colour', true, 15), tCell('Learner Experience', true, 65)], tableHeader: true }),
          ...([
            ['Live Session', 'Purple', 'Shows start/end datetime, remaining seats, "Session Full" badge when capacity reached. Enrolled users see a "Join Session" button linking to the meeting URL.'],
            ['Blended', 'Green', 'Shows physical location and session date/time range in both the overview card and the enrol sidebar.'],
            ['Video', 'Blue', '"On-demand" badge. Learner can start any time without scheduling constraints.'],
            ['Microlearning', 'Amber', '"Short, focused modules" badge. Designed for quick 5–15 minute learning bursts.'],
          ]).map(([a, b, c]) => new TableRow({ children: [tCell(a, false, 20), tCell(b, false, 15), tCell(c, false, 65)] })),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════════════
      // 6. API Quick Reference
      // ══════════════════════════════════════════════════════════════════════
      sectionTitle('6.  API Quick Reference'),
      p('Base URL: https://futureteacher-api.yuhaousa.workers.dev'),
      p('All protected endpoints require: Authorization: Bearer <jwt_token>'),
      p(''),
      subTitle('Authentication'),
      apiTable([
        ['GET',  '/api/auth/setup-status', 'Public', 'Check if initial setup is needed'],
        ['POST', '/api/auth/setup',         'Public', 'One-time admin password activation'],
        ['POST', '/api/auth/register',      'Public', 'Register a new teacher account'],
        ['POST', '/api/auth/login',         'Public', 'Login and receive JWT token'],
        ['GET',  '/api/auth/me',            'Bearer', 'Get current user profile'],
        ['POST', '/api/auth/change-password','Bearer', 'Change current user password'],
      ]),
      p(''),
      subTitle('Courses'),
      apiTable([
        ['GET',    '/api/courses',              'Public', 'List courses (search, category, modality filters)'],
        ['GET',    '/api/courses/:id',          'Public', 'Course detail with modules and tags'],
        ['POST',   '/api/courses',              'Admin',  'Create course'],
        ['PUT',    '/api/courses/:id',          'Admin',  'Update course'],
        ['DELETE', '/api/courses/:id',          'Admin',  'Delete course'],
        ['POST',   '/api/courses/:id/enroll',   'Bearer', 'Enrol in course'],
        ['GET',    '/api/courses/:id/discussions','Public','Get course discussions'],
        ['POST',   '/api/courses/:id/discussions','Bearer','Post discussion message'],
      ]),
      p(''),
      subTitle('Users'),
      apiTable([
        ['GET',    '/api/users/stats', 'Admin',  'Platform stats + weekly login/course charts'],
        ['GET',    '/api/users',       'Admin',  'All registered users'],
        ['PUT',    '/api/users/:id',   'Bearer', 'Update user profile (self or admin)'],
        ['DELETE', '/api/users/:id',   'Admin',  'Delete user'],
      ]),
      p(''),
      subTitle('Job Roles'),
      apiTable([
        ['GET',    '/api/job-roles',      'Public', 'List all job roles with skill maps'],
        ['GET',    '/api/job-roles/:id',  'Public', 'Single job role with skills'],
        ['POST',   '/api/job-roles',      'Admin',  'Create job role'],
        ['PUT',    '/api/job-roles/:id',  'Admin',  'Update job role and skills'],
        ['DELETE', '/api/job-roles/:id',  'Admin',  'Delete job role'],
      ]),
      p(''),
      subTitle('Upload & Files'),
      apiTable([
        ['POST', '/api/upload',        'Admin',  'Upload course/community cover image (R2)'],
        ['POST', '/api/upload/avatar', 'Bearer', 'Upload user portrait photo (R2)'],
        ['POST', '/api/upload/file',   'Admin',  'Upload PDF or video courseware file'],
        ['GET',  '/api/images/*',      'Public', 'Serve R2 image (courses/ and avatars/ paths)'],
        ['GET',  '/api/files/*',       'Public', 'Serve R2 courseware file'],
      ]),
      p(''),
      subTitle('Other'),
      apiTable([
        ['POST', '/api/ai/chat',                             'Bearer', 'AI learning assistant recommendation'],
        ['GET',  '/api/enrollments/my',                     'Bearer', 'My enrolled courses and progress'],
        ['PUT',  '/api/enrollments/:id/progress',           'Bearer', 'Update course progress'],
        ['GET',  '/api/pathways',                           'Public', 'List learning pathways'],
        ['GET',  '/api/communities',                        'Public', 'List communities'],
        ['POST', '/api/communities/:id/posts',              'Bearer', 'Post to community discussion'],
      ]),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════════════
      // 7. Deployment & Configuration
      // ══════════════════════════════════════════════════════════════════════
      sectionTitle('7.  Deployment & Configuration'),
      subTitle('Cloudflare Resources'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [tCell('Resource', true, 25), tCell('Name / ID', true, 45), tCell('Purpose', true, 30)], tableHeader: true }),
          ...([
            ['Worker', 'futureteacher-api', 'Backend API'],
            ['D1 Database', 'futureteacher-db\nc4624446-0d8d-4aa3-b1a1-b5adbf2bbb16', 'All relational data'],
            ['R2 Bucket', 'futureteacher-images', 'Images, avatars, PDFs, videos'],
            ['Pages Project', 'futureteacher', 'Frontend SPA'],
            ['Worker Secret', 'JWT_SECRET', 'JWT signing key'],
          ]).map(([a, b, c]) => new TableRow({ children: [tCell(a, false, 25), tCell(b, false, 45), tCell(c, false, 30)] })),
        ],
      }),
      p(''),
      subTitle('Database Migrations'),
      p('Run in order for a fresh installation:'),
      ...([
        ['0001_schema.sql', 'Base schema — 12 core tables'],
        ['0002_seed.sql',   'Seed data — users, courses, communities, pathways'],
        ['0003_courseware.sql', 'Courseware modules, resources, quiz tables'],
        ['0004_resources.sql',  'Additional resource fields'],
        ['0005_quizzes.sql',    'Quiz and question tables'],
        ['0006_modality_fields.sql', 'Modality fields on courses (start_time, end_time, meeting_url, max_seats, location)'],
        ['0007_user_profile_fields.sql', 'User profile extension (phone, teaching_subjects, school, department)'],
        ['0008_job_roles.sql',  'Job roles and job skills tables'],
        ['0009_user_job_title.sql', 'Job title column on users'],
        ['0010_login_events.sql', 'Login event tracking for analytics'],
      ]).map(([file, desc]) => new Paragraph({
        children: [
          new TextRun({ text: file.padEnd(36), size: 20, font: 'Courier New', color: DARK }),
          new TextRun({ text: '— ' + desc, size: 20, font: 'Calibri', color: GRAY }),
        ],
        spacing: { before: 50, after: 50 },
        indent: { left: convertInchesToTwip(0.3) },
      })),
      p(''),
      p('Command to apply a migration:'),
      new Paragraph({
        children: [new TextRun({ text: 'npx wrangler d1 execute futureteacher-db --remote --file=migrations/<file>.sql', size: 20, font: 'Courier New', color: '1E293B' })],
        shading: { type: ShadingType.SOLID, color: 'F1F5F9' },
        spacing: { before: 80, after: 80 },
        indent: { left: convertInchesToTwip(0.3) },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: PRIMARY } },
      }),
      p(''),
      subTitle('Environment Variables'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [tCell('Variable', true, 30), tCell('Where', true, 20), tCell('Value', true, 50)], tableHeader: true }),
          ...([
            ['JWT_SECRET',     'Worker secret',      'Random strong string (set via: wrangler secret put JWT_SECRET)'],
            ['FRONTEND_URL',   'wrangler.toml var',  'https://futureteacher.pages.dev'],
            ['VITE_API_URL',   '.env.production',    'https://futureteacher-api.yuhaousa.workers.dev'],
          ]).map(([a, b, c]) => new TableRow({ children: [tCell(a, false, 30), tCell(b, false, 20), tCell(c, false, 50)] })),
        ],
      }),
      p(''),
      subTitle('Deploy Commands'),
      ...([
        ['Backend Worker', 'cd backend && npx wrangler deploy'],
        ['Frontend Pages', 'cd frontend && npm run build && npx wrangler pages deploy dist --project-name futureteacher'],
      ]).map(([label, cmd]) => new Paragraph({
        children: [
          new TextRun({ text: label + ':  ', size: 20, bold: true, font: 'Calibri', color: DARK }),
          new TextRun({ text: cmd, size: 20, font: 'Courier New', color: PRIMARY }),
        ],
        spacing: { before: 80, after: 80 },
        indent: { left: convertInchesToTwip(0.2) },
      })),
      p(''),

      // ── End ──
      new Paragraph({
        children: [new TextRun({ text: '— End of Document —', size: 22, italics: true, color: GRAY, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  writeFileSync('docs/FutureTeacher_User_Guide.docx', buffer);
  console.log('✅  docs/FutureTeacher_User_Guide.docx created');
});
