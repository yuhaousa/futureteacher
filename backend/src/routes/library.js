import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const library = new Hono();

// GET /api/library — list resources (authenticated)
library.get('/', authMiddleware, async (c) => {
  const { search, type, category, ai_source, limit = '50', offset = '0' } = c.req.query();
  let query = 'SELECT r.*, u.name as uploader_name FROM library_resources r LEFT JOIN users u ON r.uploaded_by = u.id WHERE 1=1';
  const params = [];
  if (search) { query += ' AND (r.title LIKE ? OR r.description LIKE ? OR r.tags LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (type) { query += ' AND r.file_type = ?'; params.push(type); }
  if (category) { query += ' AND r.category = ?'; params.push(category); }
  if (ai_source === '1') { query += ' AND r.is_ai_source = 1'; }
  query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  const rows = results.map(r => ({ ...r, tags: safeParseJson(r.tags, []) }));
  return c.json(rows);
});

// GET /api/library/:id
library.get('/:id', authMiddleware, async (c) => {
  const row = await c.env.DB.prepare(
    'SELECT r.*, u.name as uploader_name FROM library_resources r LEFT JOIN users u ON r.uploaded_by = u.id WHERE r.id = ?'
  ).bind(c.req.param('id')).first();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ ...row, tags: safeParseJson(row.tags, []) });
});

// POST /api/library — admin only
library.post('/', authMiddleware, adminMiddleware, async (c) => {
  const user = c.get('user');
  const { title, description, file_url, file_type, file_name, file_size, category, subject_area, target_audience, tags = [], ai_context, is_ai_source = 0 } = await c.req.json();
  if (!title) return c.json({ error: 'Title is required' }, 400);
  const result = await c.env.DB.prepare(
    `INSERT INTO library_resources (title, description, file_url, file_type, file_name, file_size, category, subject_area, target_audience, tags, ai_context, is_ai_source, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(title, description || null, file_url || null, file_type || 'document', file_name || null, file_size || 0, category || null, subject_area || null, target_audience || 'all', JSON.stringify(tags), ai_context || null, is_ai_source ? 1 : 0, user.id).run();
  const row = await c.env.DB.prepare('SELECT * FROM library_resources WHERE id = ?').bind(result.meta.last_row_id).first();
  return c.json({ ...row, tags: safeParseJson(row.tags, []) }, 201);
});

// PUT /api/library/:id — admin only
library.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const { title, description, file_url, file_type, file_name, file_size, category, subject_area, target_audience, tags = [], ai_context, is_ai_source = 0 } = await c.req.json();
  await c.env.DB.prepare(
    `UPDATE library_resources SET title=?, description=?, file_url=?, file_type=?, file_name=?, file_size=?, category=?, subject_area=?, target_audience=?, tags=?, ai_context=?, is_ai_source=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
  ).bind(title, description || null, file_url || null, file_type || 'document', file_name || null, file_size || 0, category || null, subject_area || null, target_audience || 'all', JSON.stringify(tags), ai_context || null, is_ai_source ? 1 : 0, id).run();
  const row = await c.env.DB.prepare('SELECT * FROM library_resources WHERE id = ?').bind(id).first();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ ...row, tags: safeParseJson(row.tags, []) });
});

// DELETE /api/library/:id — admin only
library.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM library_resources WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ success: true });
});

function safeParseJson(val, fallback) {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

export default library;
