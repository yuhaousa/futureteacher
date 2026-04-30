import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const pathways = new Hono();

// GET /api/pathways
pathways.get('/', async (c) => {
  const { category, level } = c.req.query();
  let query = `SELECT p.*, u.name as creator_name FROM learning_pathways p LEFT JOIN users u ON p.created_by = u.id WHERE 1=1`;
  const params = [];
  if (category && category !== 'all') { query += ' AND p.category = ?'; params.push(category); }
  if (level && level !== 'all') { query += ' AND p.level = ?'; params.push(level); }
  query += ' ORDER BY p.created_at DESC';
  const { results: pathwayList } = params.length > 0
    ? await c.env.DB.prepare(query).bind(...params).all()
    : await c.env.DB.prepare(query).all();
  const result = await Promise.all(pathwayList.map(async (p) => {
    const { results: pCourses } = await c.env.DB.prepare(`SELECT c.id, c.title, c.category, c.duration_hours FROM pathway_courses pc JOIN courses c ON pc.course_id = c.id WHERE pc.pathway_id = ? ORDER BY pc.order_index`).bind(p.id).all();
    return { ...p, courses: pCourses };
  }));
  return c.json(result);
});

// GET /api/pathways/:id
pathways.get('/:id', async (c) => {
  const id = c.req.param('id');
  const pathway = await c.env.DB.prepare(`SELECT p.*, u.name as creator_name FROM learning_pathways p LEFT JOIN users u ON p.created_by = u.id WHERE p.id = ?`).bind(id).first();
  if (!pathway) return c.json({ error: 'Pathway not found' }, 404);
  const { results: pCourses } = await c.env.DB.prepare(`SELECT c.*, pc.order_index FROM pathway_courses pc JOIN courses c ON pc.course_id = c.id WHERE pc.pathway_id = ? ORDER BY pc.order_index`).bind(id).all();
  return c.json({ ...pathway, courses: pCourses });
});

// POST /api/pathways (admin)
pathways.post('/', authMiddleware, adminMiddleware, async (c) => {
  const { title, description, category, level, duration_hours, image_url, course_ids = [] } = await c.req.json();
  if (!title) return c.json({ error: 'Title required' }, 400);
  const user = c.get('user');
  const result = await c.env.DB.prepare('INSERT INTO learning_pathways (title, description, category, level, duration_hours, image_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(title, description || null, category || null, level || null, duration_hours || 0, image_url || null, user.id).run();
  const pathwayId = result.meta.last_row_id;
  for (let i = 0; i < course_ids.length; i++) {
    await c.env.DB.prepare('INSERT INTO pathway_courses (pathway_id, course_id, order_index) VALUES (?, ?, ?)').bind(pathwayId, course_ids[i], i).run();
  }
  return c.json({ id: pathwayId }, 201);
});

// PUT /api/pathways/:id (admin)
pathways.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const { title, description, category, level, duration_hours, image_url, course_ids } = await c.req.json();
  await c.env.DB.prepare('UPDATE learning_pathways SET title=?, description=?, category=?, level=?, duration_hours=?, image_url=? WHERE id=?').bind(title, description, category, level, duration_hours, image_url, id).run();
  if (course_ids) {
    await c.env.DB.prepare('DELETE FROM pathway_courses WHERE pathway_id = ?').bind(id).run();
    for (let i = 0; i < course_ids.length; i++) {
      await c.env.DB.prepare('INSERT INTO pathway_courses (pathway_id, course_id, order_index) VALUES (?, ?, ?)').bind(id, course_ids[i], i).run();
    }
  }
  return c.json({ success: true });
});

// DELETE /api/pathways/:id (admin)
pathways.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM learning_pathways WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ success: true });
});

// POST /api/pathways/:id/enroll
pathways.post('/:id/enroll', authMiddleware, async (c) => {
  const user = c.get('user');
  try {
    await c.env.DB.prepare('INSERT INTO pathway_enrollments (user_id, pathway_id) VALUES (?, ?)').bind(user.id, c.req.param('id')).run();
    return c.json({ success: true });
  } catch {
    return c.json({ error: 'Already enrolled' }, 409);
  }
});

export default pathways;
