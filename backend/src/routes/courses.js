import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const courses = new Hono();

// GET /api/courses
courses.get('/', async (c) => {
  const { category, modality, search, limit = '20', offset = '0' } = c.req.query();
  let query = `SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.status = 'published'`;
  const params = [];
  if (category && category !== 'all') { query += ' AND c.category = ?'; params.push(category); }
  if (modality && modality !== 'all') { query += ' AND c.modality = ?'; params.push(modality); }
  if (search) { query += ' AND (c.title LIKE ? OR c.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));
  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  let countQuery = `SELECT COUNT(*) as count FROM courses c WHERE c.status = 'published'`;
  const countParams = [];
  if (category && category !== 'all') { countQuery += ' AND c.category = ?'; countParams.push(category); }
  if (modality && modality !== 'all') { countQuery += ' AND c.modality = ?'; countParams.push(modality); }
  if (search) { countQuery += ' AND (c.title LIKE ? OR c.description LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
  const countRow = countParams.length > 0
    ? await c.env.DB.prepare(countQuery).bind(...countParams).first()
    : await c.env.DB.prepare(countQuery).first();

  return c.json({ courses: results, total: countRow?.count || 0, limit: Number(limit), offset: Number(offset) });
});

// GET /api/courses/:id
courses.get('/:id', async (c) => {
  const id = c.req.param('id');
  const course = await c.env.DB.prepare(`SELECT c.*, u.name as instructor_name, u.bio as instructor_bio FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = ?`).bind(id).first();
  if (!course) return c.json({ error: 'Course not found' }, 404);
  const { results: modules } = await c.env.DB.prepare('SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index').bind(id).all();
  const { results: tagRows } = await c.env.DB.prepare('SELECT tag FROM competency_tags WHERE course_id = ?').bind(id).all();
  if (modules.length > 0) {
    const placeholders = modules.map(() => '?').join(',');
    const { results: files } = await c.env.DB.prepare(
      `SELECT * FROM courseware_files WHERE module_id IN (${placeholders}) ORDER BY created_at`
    ).bind(...modules.map(m => m.id)).all();
    modules.forEach(m => { m.files = files.filter(f => f.module_id === m.id); });
  }
  return c.json({ ...course, modules, competency_tags: tagRows.map(r => r.tag) });
});

// POST /api/courses (admin)
courses.post('/', authMiddleware, adminMiddleware, async (c) => {
  const { title, description, category, modality, level, duration_hours, image_url, instructor_id, status, modules = [], competency_tags = [], start_time, end_time, meeting_url, max_seats, location } = await c.req.json();
  if (!title) return c.json({ error: 'Title is required' }, 400);
  const result = await c.env.DB.prepare(`INSERT INTO courses (title, description, category, modality, level, duration_hours, image_url, instructor_id, status, start_time, end_time, meeting_url, max_seats, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(title, description || null, category || null, modality || null, level || 'beginner', duration_hours || 0, image_url || null, instructor_id || null, status || 'published', start_time || null, end_time || null, meeting_url || null, max_seats || null, location || null).run();
  const courseId = result.meta.last_row_id;
  for (let i = 0; i < modules.length; i++) {
    const m = modules[i];
    await c.env.DB.prepare('INSERT INTO course_modules (course_id, title, description, content, order_index, duration_mins) VALUES (?, ?, ?, ?, ?, ?)').bind(courseId, m.title, m.description || null, m.content || null, i, m.duration_mins || 0).run();
  }
  for (const tag of competency_tags) {
    await c.env.DB.prepare('INSERT INTO competency_tags (course_id, tag) VALUES (?, ?)').bind(courseId, tag).run();
  }
  const course = await c.env.DB.prepare('SELECT * FROM courses WHERE id = ?').bind(courseId).first();
  return c.json(course, 201);
});

// PUT /api/courses/:id (admin)
courses.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const { title, description, category, modality, level, duration_hours, image_url, instructor_id, status, start_time, end_time, meeting_url, max_seats, location } = await c.req.json();
  await c.env.DB.prepare(`UPDATE courses SET title=?, description=?, category=?, modality=?, level=?, duration_hours=?, image_url=?, instructor_id=?, status=?, start_time=?, end_time=?, meeting_url=?, max_seats=?, location=? WHERE id=?`).bind(title, description, category, modality, level, duration_hours, image_url, instructor_id, status, start_time || null, end_time || null, meeting_url || null, max_seats || null, location || null, id).run();
  const course = await c.env.DB.prepare('SELECT * FROM courses WHERE id = ?').bind(id).first();
  return c.json(course);
});

// DELETE /api/courses/:id (admin)
courses.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM courses WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ success: true });
});

// POST /api/courses/:id/enroll
courses.post('/:id/enroll', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const course = await c.env.DB.prepare('SELECT id FROM courses WHERE id = ?').bind(id).first();
  if (!course) return c.json({ error: 'Course not found' }, 404);
  try {
    await c.env.DB.prepare('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)').bind(user.id, id).run();
    await c.env.DB.prepare('UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch {
    return c.json({ error: 'Already enrolled' }, 409);
  }
});

// ── Module CRUD ──────────────────────────────────────────────────────────────

// GET /api/courses/:id/modules (with files)
courses.get('/:id/modules', async (c) => {
  const id = c.req.param('id');
  const { results: modules } = await c.env.DB.prepare(
    'SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index'
  ).bind(id).all();
  if (modules.length > 0) {
    const placeholders = modules.map(() => '?').join(',');
    const { results: files } = await c.env.DB.prepare(
      `SELECT * FROM courseware_files WHERE module_id IN (${placeholders}) ORDER BY created_at`
    ).bind(...modules.map(m => m.id)).all();
    modules.forEach(m => { m.files = files.filter(f => f.module_id === m.id); });
  }
  return c.json(modules);
});

// POST /api/courses/:id/modules
courses.post('/:id/modules', authMiddleware, adminMiddleware, async (c) => {
  const courseId = c.req.param('id');
  const { title, description, content, duration_mins, video_url } = await c.req.json();
  if (!title) return c.json({ error: 'Title is required' }, 400);
  const maxRow = await c.env.DB.prepare('SELECT MAX(order_index) as m FROM course_modules WHERE course_id = ?').bind(courseId).first();
  const nextIdx = (maxRow?.m ?? -1) + 1;
  const result = await c.env.DB.prepare(
    'INSERT INTO course_modules (course_id, title, description, content, order_index, duration_mins, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(courseId, title, description || null, content || null, nextIdx, duration_mins || 0, video_url || null).run();
  const module = await c.env.DB.prepare('SELECT * FROM course_modules WHERE id = ?').bind(result.meta.last_row_id).first();
  return c.json({ ...module, files: [] }, 201);
});

// PUT /api/courses/:id/modules/:mid
courses.put('/:id/modules/:mid', authMiddleware, adminMiddleware, async (c) => {
  const mid = c.req.param('mid');
  const { title, description, content, duration_mins, video_url, order_index } = await c.req.json();
  await c.env.DB.prepare(
    'UPDATE course_modules SET title=?, description=?, content=?, duration_mins=?, video_url=?, order_index=? WHERE id=?'
  ).bind(title, description || null, content || null, duration_mins || 0, video_url || null, order_index ?? 0, mid).run();
  const module = await c.env.DB.prepare('SELECT * FROM course_modules WHERE id = ?').bind(mid).first();
  const { results: files } = await c.env.DB.prepare('SELECT * FROM courseware_files WHERE module_id = ?').bind(mid).all();
  return c.json({ ...module, files });
});

// DELETE /api/courses/:id/modules/:mid
courses.delete('/:id/modules/:mid', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM course_modules WHERE id = ?').bind(c.req.param('mid')).run();
  return c.json({ success: true });
});

// POST /api/courses/:id/modules/:mid/files
courses.post('/:id/modules/:mid/files', authMiddleware, adminMiddleware, async (c) => {
  const mid = c.req.param('mid');
  const { name, file_url, file_type, size_bytes } = await c.req.json();
  if (!name || !file_url) return c.json({ error: 'name and file_url required' }, 400);
  const result = await c.env.DB.prepare(
    'INSERT INTO courseware_files (module_id, name, file_url, file_type, size_bytes) VALUES (?, ?, ?, ?, ?)'
  ).bind(mid, name, file_url, file_type || 'document', size_bytes || 0).run();
  const file = await c.env.DB.prepare('SELECT * FROM courseware_files WHERE id = ?').bind(result.meta.last_row_id).first();
  return c.json(file, 201);
});

// DELETE /api/courses/:id/modules/:mid/files/:fid
courses.delete('/:id/modules/:mid/files/:fid', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM courseware_files WHERE id = ?').bind(c.req.param('fid')).run();
  return c.json({ success: true });
});

// ── Resource Library ──────────────────────────────────────────────────────────

// GET /api/courses/:id/resources?tag=&label=&type=&search=
courses.get('/:id/resources', async (c) => {
  const courseId = c.req.param('id');
  const { tag, label, type, search } = c.req.query();
  let query = 'SELECT * FROM course_resources WHERE course_id = ?';
  const params = [courseId];
  if (label) { query += ' AND label = ?'; params.push(label); }
  if (type)  { query += ' AND file_type = ?'; params.push(type); }
  if (search) { query += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }
  query += ' ORDER BY created_at DESC';
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  // Parse tags JSON and optionally filter by tag
  const parsed = results.map(r => ({ ...r, tags: (() => { try { return JSON.parse(r.tags || '[]'); } catch { return []; } })() }));
  const filtered = tag ? parsed.filter(r => r.tags.includes(tag)) : parsed;
  return c.json(filtered);
});

// POST /api/courses/:id/resources (admin)
courses.post('/:id/resources', authMiddleware, adminMiddleware, async (c) => {
  const courseId = c.req.param('id');
  const user = c.get('user');
  const { name, description, file_url, file_type, label, tags, size_bytes } = await c.req.json();
  if (!name || !file_url) return c.json({ error: 'name and file_url are required' }, 400);
  const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
  const result = await c.env.DB.prepare(
    'INSERT INTO course_resources (course_id, name, description, file_url, file_type, label, tags, size_bytes, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(courseId, name, description || null, file_url, file_type || 'document', label || null, tagsJson, size_bytes || 0, user.id).run();
  const resource = await c.env.DB.prepare('SELECT * FROM course_resources WHERE id = ?').bind(result.meta.last_row_id).first();
  return c.json({ ...resource, tags: JSON.parse(resource.tags || '[]') }, 201);
});

// PUT /api/courses/:id/resources/:rid (admin) — update metadata + optional file replacement
courses.put('/:id/resources/:rid', authMiddleware, adminMiddleware, async (c) => {
  const rid = c.req.param('rid');
  const { name, description, label, tags, file_url, file_type, size_bytes } = await c.req.json();
  const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
  if (file_url) {
    await c.env.DB.prepare(
      'UPDATE course_resources SET name=?, description=?, label=?, tags=?, file_url=?, file_type=?, size_bytes=? WHERE id=?'
    ).bind(name, description || null, label || null, tagsJson, file_url, file_type, size_bytes || 0, rid).run();
  } else {
    await c.env.DB.prepare(
      'UPDATE course_resources SET name=?, description=?, label=?, tags=? WHERE id=?'
    ).bind(name, description || null, label || null, tagsJson, rid).run();
  }
  const resource = await c.env.DB.prepare('SELECT * FROM course_resources WHERE id = ?').bind(rid).first();
  return c.json({ ...resource, tags: JSON.parse(resource.tags || '[]') });
});

// DELETE /api/courses/:id/resources/:rid (admin)
courses.delete('/:id/resources/:rid', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM course_resources WHERE id = ?').bind(c.req.param('rid')).run();
  return c.json({ success: true });
});

// ── Question Bank ─────────────────────────────────────────────────────────────

// GET /api/courses/:id/questions
courses.get('/:id/questions', authMiddleware, async (c) => {
  const courseId = c.req.param('id');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM questions WHERE course_id = ? ORDER BY created_at DESC'
  ).bind(courseId).all();
  return c.json(results.map(q => ({ ...q, options: JSON.parse(q.options || '[]') })));
});

// POST /api/courses/:id/questions (admin)
courses.post('/:id/questions', authMiddleware, adminMiddleware, async (c) => {
  const courseId = c.req.param('id');
  const { question_text, question_type, options, correct_answer, explanation, points } = await c.req.json();
  if (!question_text?.trim()) return c.json({ error: 'question_text is required' }, 400);
  if (correct_answer === undefined || correct_answer === null || correct_answer === '') return c.json({ error: 'correct_answer is required' }, 400);
  const optionsJson = JSON.stringify(Array.isArray(options) ? options : []);
  const result = await c.env.DB.prepare(
    'INSERT INTO questions (course_id, question_text, question_type, options, correct_answer, explanation, points) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(courseId, question_text.trim(), question_type || 'multiple_choice', optionsJson, String(correct_answer), explanation || null, points || 1).run();
  const q = await c.env.DB.prepare('SELECT * FROM questions WHERE id = ?').bind(result.meta.last_row_id).first();
  return c.json({ ...q, options: JSON.parse(q.options || '[]') }, 201);
});

// PUT /api/courses/:id/questions/:qid (admin)
courses.put('/:id/questions/:qid', authMiddleware, adminMiddleware, async (c) => {
  const qid = c.req.param('qid');
  const { question_text, question_type, options, correct_answer, explanation, points } = await c.req.json();
  const optionsJson = JSON.stringify(Array.isArray(options) ? options : []);
  await c.env.DB.prepare(
    'UPDATE questions SET question_text=?, question_type=?, options=?, correct_answer=?, explanation=?, points=? WHERE id=?'
  ).bind(question_text.trim(), question_type, optionsJson, String(correct_answer), explanation || null, points || 1, qid).run();
  const q = await c.env.DB.prepare('SELECT * FROM questions WHERE id = ?').bind(qid).first();
  return c.json({ ...q, options: JSON.parse(q.options || '[]') });
});

// DELETE /api/courses/:id/questions/:qid (admin)
courses.delete('/:id/questions/:qid', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM questions WHERE id = ?').bind(c.req.param('qid')).run();
  return c.json({ success: true });
});

// ── Quizzes ───────────────────────────────────────────────────────────────────

// GET /api/courses/:id/quizzes
courses.get('/:id/quizzes', authMiddleware, async (c) => {
  const courseId = c.req.param('id');
  const { results } = await c.env.DB.prepare(
    `SELECT z.*, COUNT(qq.id) as question_count FROM quizzes z
     LEFT JOIN quiz_questions qq ON qq.quiz_id = z.id
     WHERE z.course_id = ? GROUP BY z.id ORDER BY z.created_at DESC`
  ).bind(courseId).all();
  return c.json(results);
});

// POST /api/courses/:id/quizzes (admin)
courses.post('/:id/quizzes', authMiddleware, adminMiddleware, async (c) => {
  const courseId = c.req.param('id');
  const { title, description, quiz_type, time_limit_mins, pass_score, randomize, module_id } = await c.req.json();
  if (!title?.trim()) return c.json({ error: 'title is required' }, 400);
  const result = await c.env.DB.prepare(
    'INSERT INTO quizzes (course_id, module_id, title, description, quiz_type, time_limit_mins, pass_score, randomize) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(courseId, module_id || null, title.trim(), description || null, quiz_type || 'quiz', time_limit_mins || 0, pass_score || 70, randomize ? 1 : 0).run();
  const quiz = await c.env.DB.prepare('SELECT * FROM quizzes WHERE id = ?').bind(result.meta.last_row_id).first();
  return c.json({ ...quiz, question_count: 0 }, 201);
});

// PUT /api/courses/:id/quizzes/:qzid (admin)
courses.put('/:id/quizzes/:qzid', authMiddleware, adminMiddleware, async (c) => {
  const qzid = c.req.param('qzid');
  const { title, description, quiz_type, time_limit_mins, pass_score, randomize, module_id } = await c.req.json();
  await c.env.DB.prepare(
    'UPDATE quizzes SET title=?, description=?, quiz_type=?, time_limit_mins=?, pass_score=?, randomize=?, module_id=? WHERE id=?'
  ).bind(title.trim(), description || null, quiz_type, time_limit_mins || 0, pass_score || 70, randomize ? 1 : 0, module_id || null, qzid).run();
  const quiz = await c.env.DB.prepare('SELECT * FROM quizzes WHERE id = ?').bind(qzid).first();
  return c.json(quiz);
});

// DELETE /api/courses/:id/quizzes/:qzid (admin)
courses.delete('/:id/quizzes/:qzid', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM quizzes WHERE id = ?').bind(c.req.param('qzid')).run();
  return c.json({ success: true });
});

// GET /api/courses/:id/quizzes/:qzid — full quiz with questions (student + admin)
courses.get('/:id/quizzes/:qzid', authMiddleware, async (c) => {
  const qzid = c.req.param('qzid');
  const quiz = await c.env.DB.prepare('SELECT * FROM quizzes WHERE id = ?').bind(qzid).first();
  if (!quiz) return c.json({ error: 'Quiz not found' }, 404);
  const { results: qs } = await c.env.DB.prepare(
    `SELECT q.* FROM questions q
     JOIN quiz_questions qq ON qq.question_id = q.id
     WHERE qq.quiz_id = ? ORDER BY qq.order_index`
  ).bind(qzid).all();
  const user = c.get('user');
  const questions = qs.map(q => {
    const parsed = { ...q, options: JSON.parse(q.options || '[]') };
    // Only admins see correct_answer when fetching to take a quiz
    if (user?.role !== 'admin') delete parsed.correct_answer;
    return parsed;
  });
  return c.json({ ...quiz, questions });
});

// GET /api/courses/:id/quizzes/:qzid/full — admin full view with answers
courses.get('/:id/quizzes/:qzid/full', authMiddleware, adminMiddleware, async (c) => {
  const qzid = c.req.param('qzid');
  const quiz = await c.env.DB.prepare('SELECT * FROM quizzes WHERE id = ?').bind(qzid).first();
  if (!quiz) return c.json({ error: 'Quiz not found' }, 404);
  const { results: qs } = await c.env.DB.prepare(
    `SELECT q.* FROM questions q
     JOIN quiz_questions qq ON qq.question_id = q.id
     WHERE qq.quiz_id = ? ORDER BY qq.order_index`
  ).bind(qzid).all();
  return c.json({ ...quiz, questions: qs.map(q => ({ ...q, options: JSON.parse(q.options || '[]') })) });
});

// POST /api/courses/:id/quizzes/:qzid/questions — add question to quiz (admin)
courses.post('/:id/quizzes/:qzid/questions', authMiddleware, adminMiddleware, async (c) => {
  const qzid = c.req.param('qzid');
  const { question_id } = await c.req.json();
  const count = await c.env.DB.prepare('SELECT COUNT(*) as n FROM quiz_questions WHERE quiz_id = ?').bind(qzid).first();
  try {
    await c.env.DB.prepare(
      'INSERT INTO quiz_questions (quiz_id, question_id, order_index) VALUES (?, ?, ?)'
    ).bind(qzid, question_id, count?.n || 0).run();
  } catch {
    return c.json({ error: 'Question already in this quiz' }, 409);
  }
  return c.json({ success: true });
});

// DELETE /api/courses/:id/quizzes/:qzid/questions/:qid — remove from quiz (admin)
courses.delete('/:id/quizzes/:qzid/questions/:qid', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM quiz_questions WHERE quiz_id = ? AND question_id = ?')
    .bind(c.req.param('qzid'), c.req.param('qid')).run();
  return c.json({ success: true });
});

// POST /api/courses/:id/quizzes/:qzid/attempt — student submits attempt
courses.post('/:id/quizzes/:qzid/attempt', authMiddleware, async (c) => {
  const qzid = c.req.param('qzid');
  const user = c.get('user');
  const { answers } = await c.req.json(); // { questionId: answer }
  const { results: qs } = await c.env.DB.prepare(
    `SELECT q.id, q.correct_answer, q.points FROM questions q
     JOIN quiz_questions qq ON qq.question_id = q.id WHERE qq.quiz_id = ?`
  ).bind(qzid).all();
  const quiz = await c.env.DB.prepare('SELECT pass_score FROM quizzes WHERE id = ?').bind(qzid).first();
  let totalPoints = 0, earnedPoints = 0;
  const feedback = {};
  qs.forEach(q => {
    totalPoints += q.points;
    const correct = String(answers?.[q.id] ?? '') === String(q.correct_answer);
    if (correct) earnedPoints += q.points;
    feedback[q.id] = { correct, correct_answer: q.correct_answer };
  });
  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= (quiz?.pass_score || 70);
  const result = await c.env.DB.prepare(
    'INSERT INTO quiz_attempts (quiz_id, user_id, answers, score, passed) VALUES (?, ?, ?, ?, ?)'
  ).bind(qzid, user.id, JSON.stringify(answers), score, passed ? 1 : 0).run();
  return c.json({ score, passed, feedback, attempt_id: result.meta.last_row_id });
});

// GET /api/courses/:id/quizzes/:qzid/attempts/my — student's best attempt
courses.get('/:id/quizzes/:qzid/attempts/my', authMiddleware, async (c) => {
  const user = c.get('user');
  const attempt = await c.env.DB.prepare(
    'SELECT * FROM quiz_attempts WHERE quiz_id = ? AND user_id = ? ORDER BY score DESC LIMIT 1'
  ).bind(c.req.param('qzid'), user.id).first();
  return c.json(attempt || null);
});

// ── Discussions ───────────────────────────────────────────────────────────────

// GET /api/courses/:id/discussions
courses.get('/:id/discussions', async (c) => {
  const id = c.req.param('id');
  const { results: discussions } = await c.env.DB.prepare(`SELECT d.*, u.name as user_name, u.avatar FROM discussions d JOIN users u ON d.user_id = u.id WHERE d.course_id = ? AND d.parent_id IS NULL ORDER BY d.created_at DESC`).bind(id).all();
  const result = await Promise.all(discussions.map(async (d) => {
    const { results: replies } = await c.env.DB.prepare(`SELECT d.*, u.name as user_name, u.avatar FROM discussions d JOIN users u ON d.user_id = u.id WHERE d.parent_id = ? ORDER BY d.created_at`).bind(d.id).all();
    return { ...d, replies };
  }));
  return c.json(result);
});

// POST /api/courses/:id/discussions
courses.post('/:id/discussions', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const { content, parent_id } = await c.req.json();
  if (!content) return c.json({ error: 'Content required' }, 400);
  const result = await c.env.DB.prepare('INSERT INTO discussions (course_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)').bind(id, user.id, content, parent_id || null).run();
  const discussion = await c.env.DB.prepare(`SELECT d.*, u.name as user_name FROM discussions d JOIN users u ON d.user_id = u.id WHERE d.id = ?`).bind(result.meta.last_row_id).first();
  return c.json(discussion, 201);
});

export default courses;
