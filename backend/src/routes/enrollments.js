import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const enrollments = new Hono();

// GET /api/enrollments/my
enrollments.get('/my', authMiddleware, async (c) => {
  const user = c.get('user');
  const { results } = await c.env.DB.prepare(`
    SELECT e.*, c.title, c.description, c.category, c.modality, c.image_url, c.duration_hours, c.rating
    FROM enrollments e JOIN courses c ON e.course_id = c.id
    WHERE e.user_id = ? ORDER BY e.enrolled_at DESC
  `).bind(user.id).all();
  return c.json(results);
});

// PUT /api/enrollments/:courseId/progress
enrollments.put('/:courseId/progress', authMiddleware, async (c) => {
  const user = c.get('user');
  const courseId = c.req.param('courseId');
  const { progress } = await c.req.json();
  await c.env.DB.prepare('UPDATE enrollments SET progress = ?, completed_at = CASE WHEN ? >= 100 THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE user_id = ? AND course_id = ?').bind(progress, progress, user.id, courseId).run();
  return c.json({ success: true });
});

// POST /api/enrollments/:courseId/module/:moduleId/complete
enrollments.post('/:courseId/module/:moduleId/complete', authMiddleware, async (c) => {
  const user = c.get('user');
  const courseId = c.req.param('courseId');
  const moduleId = c.req.param('moduleId');
  const existing = await c.env.DB.prepare('SELECT id FROM module_progress WHERE user_id = ? AND module_id = ?').bind(user.id, moduleId).first();
  if (existing) {
    await c.env.DB.prepare('UPDATE module_progress SET completed = 1, completed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND module_id = ?').bind(user.id, moduleId).run();
  } else {
    await c.env.DB.prepare('INSERT INTO module_progress (user_id, module_id, completed, completed_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP)').bind(user.id, moduleId).run();
  }
  const totalRow = await c.env.DB.prepare('SELECT COUNT(*) as count FROM course_modules WHERE course_id = ?').bind(courseId).first();
  const completedRow = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM module_progress mp JOIN course_modules cm ON mp.module_id = cm.id WHERE mp.user_id = ? AND cm.course_id = ? AND mp.completed = 1`).bind(user.id, courseId).first();
  const totalModules = totalRow?.count || 0;
  const completedModules = completedRow?.count || 0;
  const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  await c.env.DB.prepare('UPDATE enrollments SET progress = ?, completed_at = CASE WHEN ? >= 100 THEN CURRENT_TIMESTAMP ELSE NULL END WHERE user_id = ? AND course_id = ?').bind(progress, progress, user.id, courseId).run();
  return c.json({ progress, completedModules, totalModules });
});

// GET /api/enrollments (admin)
enrollments.get('/', authMiddleware, adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT e.*, u.name as user_name, u.email, c.title as course_title FROM enrollments e JOIN users u ON e.user_id = u.id JOIN courses c ON e.course_id = c.id ORDER BY e.enrolled_at DESC LIMIT 100`).all();
  return c.json(results);
});

export default enrollments;
