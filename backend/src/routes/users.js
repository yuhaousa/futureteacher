import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const users = new Hono();

// GET /api/users/stats (admin) â€” must be before /:id
users.get('/stats', authMiddleware, adminMiddleware, async (c) => {
  const [totalUsers, totalCourses, totalEnrollments, totalCommunities] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM courses').first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM enrollments').first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM communities').first(),
  ]);
  const { results: recentEnrollments } = await c.env.DB.prepare(
    `SELECT e.enrolled_at, u.name as user_name, c.title as course_title FROM enrollments e JOIN users u ON e.user_id = u.id JOIN courses c ON e.course_id = c.id ORDER BY e.enrolled_at DESC LIMIT 5`
  ).all();

  // Weekly logins: past 7 days grouped by date
  const { results: weeklyLogins } = await c.env.DB.prepare(
    `SELECT date(logged_in_at) as day, COUNT(*) as count
     FROM login_events
     WHERE logged_in_at >= date('now', '-6 days')
     GROUP BY day ORDER BY day`
  ).all();

  // Weekly new courses: past 7 days grouped by date
  const { results: weeklyCourses } = await c.env.DB.prepare(
    `SELECT date(created_at) as day, COUNT(*) as count
     FROM courses
     WHERE created_at >= date('now', '-6 days')
     GROUP BY day ORDER BY day`
  ).all();

  // Build full 7-day arrays (fill zeros for missing days)
  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const loginMap = Object.fromEntries(weeklyLogins.map(r => [r.day, r.count]));
  const courseMap = Object.fromEntries(weeklyCourses.map(r => [r.day, r.count]));
  const weeklyLoginData  = days7.map(d => ({ day: d, count: loginMap[d]  || 0 }));
  const weeklyCourseData = days7.map(d => ({ day: d, count: courseMap[d] || 0 }));

  return c.json({
    totalUsers: totalUsers?.count || 0,
    totalCourses: totalCourses?.count || 0,
    totalEnrollments: totalEnrollments?.count || 0,
    totalCommunities: totalCommunities?.count || 0,
    recentEnrollments,
    weeklyLoginData,
    weeklyCourseData,
  });
});

// GET /api/users (admin)
users.get('/', authMiddleware, adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare('SELECT id, name, email, role, avatar, bio, created_at FROM users ORDER BY created_at DESC').all();
  return c.json(results);
});

// PUT /api/users/:id
users.put('/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const targetId = c.req.param('id');
  const isAdmin = user.role === 'admin';
  const isSelf = String(user.id) === targetId;
  if (!isAdmin && !isSelf) return c.json({ error: 'Forbidden' }, 403);
  const { name, bio, avatar, role, phone, teaching_subjects, school, department, job_title } = await c.req.json();
  if (role && !isAdmin) return c.json({ error: 'Only admin can change role' }, 403);
  const fields = [];
  const vals = [];
  if (name !== undefined) { fields.push('name = ?'); vals.push(name); }
  if (bio !== undefined) { fields.push('bio = ?'); vals.push(bio); }
  if (avatar !== undefined) { fields.push('avatar = ?'); vals.push(avatar); }
  if (phone !== undefined) { fields.push('phone = ?'); vals.push(phone); }
  if (teaching_subjects !== undefined) { fields.push('teaching_subjects = ?'); vals.push(Array.isArray(teaching_subjects) ? JSON.stringify(teaching_subjects) : teaching_subjects); }
  if (school !== undefined) { fields.push('school = ?'); vals.push(school); }
  if (department !== undefined) { fields.push('department = ?'); vals.push(department); }
  if (job_title !== undefined) { fields.push('job_title = ?'); vals.push(job_title); }
  if (role !== undefined && isAdmin) { fields.push('role = ?'); vals.push(role); }
  if (fields.length === 0) return c.json({ error: 'Nothing to update' }, 400);
  vals.push(targetId);
  await c.env.DB.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).bind(...vals).run();
  const updated = await c.env.DB.prepare('SELECT id, name, email, role, avatar, bio, phone, teaching_subjects, school, department, job_title FROM users WHERE id = ?').bind(targetId).first();
  if (updated?.teaching_subjects) {
    try { updated.teaching_subjects = JSON.parse(updated.teaching_subjects); } catch { updated.teaching_subjects = []; }
  } else {
    updated.teaching_subjects = [];
  }
  return c.json(updated);
});

// DELETE /api/users/:id (admin)
users.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ success: true });
});

export default users;
