import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const jobRoles = new Hono();

// GET /api/job-roles — public list (for skill-map display)
jobRoles.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM job_roles ORDER BY department, level, title'
  ).all();
  // Attach skills to each role
  if (results.length > 0) {
    const ids = results.map(r => r.id);
    const placeholders = ids.map(() => '?').join(',');
    const { results: skills } = await c.env.DB.prepare(
      `SELECT * FROM job_skills WHERE job_role_id IN (${placeholders}) ORDER BY job_role_id, order_index`
    ).bind(...ids).all();
    results.forEach(r => { r.skills = skills.filter(s => s.job_role_id === r.id); });
  } else {
    results.forEach(r => { r.skills = []; });
  }
  return c.json(results);
});

// GET /api/job-roles/:id
jobRoles.get('/:id', async (c) => {
  const id = c.req.param('id');
  const role = await c.env.DB.prepare('SELECT * FROM job_roles WHERE id = ?').bind(id).first();
  if (!role) return c.json({ error: 'Not found' }, 404);
  const { results: skills } = await c.env.DB.prepare(
    'SELECT * FROM job_skills WHERE job_role_id = ? ORDER BY order_index'
  ).bind(id).all();
  return c.json({ ...role, skills });
});

// POST /api/job-roles (admin)
jobRoles.post('/', authMiddleware, adminMiddleware, async (c) => {
  const { title, description, department, level, skills = [] } = await c.req.json();
  if (!title) return c.json({ error: 'Title is required' }, 400);
  const result = await c.env.DB.prepare(
    'INSERT INTO job_roles (title, description, department, level) VALUES (?, ?, ?, ?)'
  ).bind(title, description || null, department || null, level || 'entry').run();
  const roleId = result.meta.last_row_id;
  for (let i = 0; i < skills.length; i++) {
    const s = skills[i];
    await c.env.DB.prepare(
      'INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(roleId, s.skill_name, s.category || null, s.required_level || 'basic', s.description || null, i).run();
  }
  const role = await c.env.DB.prepare('SELECT * FROM job_roles WHERE id = ?').bind(roleId).first();
  const { results: savedSkills } = await c.env.DB.prepare('SELECT * FROM job_skills WHERE job_role_id = ? ORDER BY order_index').bind(roleId).all();
  return c.json({ ...role, skills: savedSkills }, 201);
});

// PUT /api/job-roles/:id (admin)
jobRoles.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const { title, description, department, level, skills = [] } = await c.req.json();
  if (!title) return c.json({ error: 'Title is required' }, 400);
  await c.env.DB.prepare(
    'UPDATE job_roles SET title=?, description=?, department=?, level=? WHERE id=?'
  ).bind(title, description || null, department || null, level || 'entry', id).run();
  // Replace all skills
  await c.env.DB.prepare('DELETE FROM job_skills WHERE job_role_id = ?').bind(id).run();
  for (let i = 0; i < skills.length; i++) {
    const s = skills[i];
    await c.env.DB.prepare(
      'INSERT INTO job_skills (job_role_id, skill_name, category, required_level, description, order_index) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, s.skill_name, s.category || null, s.required_level || 'basic', s.description || null, i).run();
  }
  const role = await c.env.DB.prepare('SELECT * FROM job_roles WHERE id = ?').bind(id).first();
  const { results: savedSkills } = await c.env.DB.prepare('SELECT * FROM job_skills WHERE job_role_id = ? ORDER BY order_index').bind(id).all();
  return c.json({ ...role, skills: savedSkills });
});

// DELETE /api/job-roles/:id (admin)
jobRoles.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM job_roles WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ success: true });
});

export default jobRoles;
