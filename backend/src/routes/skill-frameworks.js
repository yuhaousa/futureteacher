import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const skillFrameworks = new Hono();

// GET /api/skill-frameworks — list all frameworks with skill counts + linked content counts
skillFrameworks.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM skill_frameworks ORDER BY created_at DESC'
  ).all();
  if (results.length > 0) {
    const ids = results.map(r => r.id);
    const placeholders = ids.map(() => '?').join(',');
    const { results: skills } = await c.env.DB.prepare(
      `SELECT * FROM framework_skills WHERE framework_id IN (${placeholders}) ORDER BY framework_id, category, order_index`
    ).bind(...ids).all();
    // Linked course counts
    let courseCounts = [], pathwayCounts = [];
    try {
      const cc = await c.env.DB.prepare(
        `SELECT framework_id, COUNT(*) as count FROM framework_course_mappings WHERE framework_id IN (${placeholders}) GROUP BY framework_id`
      ).bind(...ids).all();
      courseCounts = cc.results;
    } catch {}
    try {
      const pc = await c.env.DB.prepare(
        `SELECT framework_id, COUNT(*) as count FROM framework_pathway_mappings WHERE framework_id IN (${placeholders}) GROUP BY framework_id`
      ).bind(...ids).all();
      pathwayCounts = pc.results;
    } catch {}
    results.forEach(f => {
      f.skills = skills.filter(s => s.framework_id === f.id);
      f.linked_courses_count = (courseCounts.find(cc => cc.framework_id === f.id) || {}).count || 0;
      f.linked_pathways_count = (pathwayCounts.find(pc => pc.framework_id === f.id) || {}).count || 0;
    });
  } else {
    results.forEach(f => { f.skills = []; f.linked_courses_count = 0; f.linked_pathways_count = 0; });
  }
  return c.json(results);
});

// GET /api/skill-frameworks/:id
skillFrameworks.get('/:id', async (c) => {
  const id = c.req.param('id');
  const framework = await c.env.DB.prepare('SELECT * FROM skill_frameworks WHERE id = ?').bind(id).first();
  if (!framework) return c.json({ error: 'Not found' }, 404);
  const { results: skills } = await c.env.DB.prepare(
    'SELECT * FROM framework_skills WHERE framework_id = ? ORDER BY category, order_index'
  ).bind(id).all();
  return c.json({ ...framework, skills });
});

// GET /api/skill-frameworks/:id/linked-content — courses and pathways aligned to this framework
skillFrameworks.get('/:id/linked-content', authMiddleware, async (c) => {
  const id = c.req.param('id');
  let courses = [], pathways = [];
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT c.id, c.title, c.category, c.modality, c.level, c.duration_hours, c.status
       FROM framework_course_mappings fcm
       JOIN courses c ON fcm.course_id = c.id
       WHERE fcm.framework_id = ?
       ORDER BY c.title`
    ).bind(id).all();
    courses = results;
  } catch {}
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT p.id, p.title, p.category, p.level, p.duration_hours
       FROM framework_pathway_mappings fpm
       JOIN learning_pathways p ON fpm.pathway_id = p.id
       WHERE fpm.framework_id = ?
       ORDER BY p.title`
    ).bind(id).all();
    pathways = results;
  } catch {}
  return c.json({ courses, pathways });
});

// POST /api/skill-frameworks/:id/link-course (admin)
skillFrameworks.post('/:id/link-course', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const { course_id } = await c.req.json();
  if (!course_id) return c.json({ error: 'course_id required' }, 400);
  await c.env.DB.prepare(
    'INSERT OR IGNORE INTO framework_course_mappings (framework_id, course_id) VALUES (?, ?)'
  ).bind(id, course_id).run();
  return c.json({ success: true });
});

// DELETE /api/skill-frameworks/:id/unlink-course/:courseId (admin)
skillFrameworks.delete('/:id/unlink-course/:courseId', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const courseId = c.req.param('courseId');
  await c.env.DB.prepare(
    'DELETE FROM framework_course_mappings WHERE framework_id = ? AND course_id = ?'
  ).bind(id, courseId).run();
  return c.json({ success: true });
});

// POST /api/skill-frameworks/:id/link-pathway (admin)
skillFrameworks.post('/:id/link-pathway', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const { pathway_id } = await c.req.json();
  if (!pathway_id) return c.json({ error: 'pathway_id required' }, 400);
  await c.env.DB.prepare(
    'INSERT OR IGNORE INTO framework_pathway_mappings (framework_id, pathway_id) VALUES (?, ?)'
  ).bind(id, pathway_id).run();
  return c.json({ success: true });
});

// DELETE /api/skill-frameworks/:id/unlink-pathway/:pathwayId (admin)
skillFrameworks.delete('/:id/unlink-pathway/:pathwayId', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const pathwayId = c.req.param('pathwayId');
  await c.env.DB.prepare(
    'DELETE FROM framework_pathway_mappings WHERE framework_id = ? AND pathway_id = ?'
  ).bind(id, pathwayId).run();
  return c.json({ success: true });
});

// POST /api/skill-frameworks (admin)
skillFrameworks.post('/', authMiddleware, adminMiddleware, async (c) => {
  const { name, description, source_standard, version, is_active = 1, skills = [] } = await c.req.json();
  if (!name) return c.json({ error: 'Name is required' }, 400);
  const result = await c.env.DB.prepare(
    'INSERT INTO skill_frameworks (name, description, is_active, source_standard, version) VALUES (?, ?, ?, ?, ?)'
  ).bind(name, description || null, is_active ? 1 : 0, source_standard || null, version || null).run();
  const fid = result.meta.last_row_id;
  for (let i = 0; i < skills.length; i++) {
    const s = skills[i];
    await c.env.DB.prepare(
      `INSERT INTO framework_skills (framework_id, name, category, description, level_basic, level_intermediate, level_advanced, level_expert, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(fid, s.name, s.category || 'Other', s.description || null,
      s.level_basic || null, s.level_intermediate || null, s.level_advanced || null, s.level_expert || null, i).run();
  }
  const framework = await c.env.DB.prepare('SELECT * FROM skill_frameworks WHERE id = ?').bind(fid).first();
  const { results: savedSkills } = await c.env.DB.prepare(
    'SELECT * FROM framework_skills WHERE framework_id = ? ORDER BY category, order_index'
  ).bind(fid).all();
  return c.json({ ...framework, skills: savedSkills, linked_courses_count: 0, linked_pathways_count: 0 }, 201);
});

// PUT /api/skill-frameworks/:id (admin)
skillFrameworks.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const { name, description, source_standard, version, is_active, skills = [] } = await c.req.json();
  if (!name) return c.json({ error: 'Name is required' }, 400);
  await c.env.DB.prepare(
    'UPDATE skill_frameworks SET name=?, description=?, is_active=?, source_standard=?, version=? WHERE id=?'
  ).bind(name, description || null, is_active ? 1 : 0, source_standard || null, version || null, id).run();
  await c.env.DB.prepare('DELETE FROM framework_skills WHERE framework_id = ?').bind(id).run();
  for (let i = 0; i < skills.length; i++) {
    const s = skills[i];
    await c.env.DB.prepare(
      `INSERT INTO framework_skills (framework_id, name, category, description, level_basic, level_intermediate, level_advanced, level_expert, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, s.name, s.category || 'Other', s.description || null,
      s.level_basic || null, s.level_intermediate || null, s.level_advanced || null, s.level_expert || null, i).run();
  }
  const framework = await c.env.DB.prepare('SELECT * FROM skill_frameworks WHERE id = ?').bind(id).first();
  const { results: savedSkills } = await c.env.DB.prepare(
    'SELECT * FROM framework_skills WHERE framework_id = ? ORDER BY category, order_index'
  ).bind(id).all();
  let courseCount = 0, pathwayCount = 0;
  try {
    const cc = await c.env.DB.prepare('SELECT COUNT(*) as count FROM framework_course_mappings WHERE framework_id = ?').bind(id).first();
    courseCount = cc?.count || 0;
  } catch {}
  try {
    const pc = await c.env.DB.prepare('SELECT COUNT(*) as count FROM framework_pathway_mappings WHERE framework_id = ?').bind(id).first();
    pathwayCount = pc?.count || 0;
  } catch {}
  return c.json({ ...framework, skills: savedSkills, linked_courses_count: courseCount, linked_pathways_count: pathwayCount });
});

// DELETE /api/skill-frameworks/:id (admin)
skillFrameworks.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM skill_frameworks WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ success: true });
});

export default skillFrameworks;
