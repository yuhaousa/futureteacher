import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const communities = new Hono();

// GET /api/communities
communities.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT c.*, u.name as creator_name FROM communities c LEFT JOIN users u ON c.created_by = u.id ORDER BY c.created_at DESC`).all();
  return c.json(results);
});

// GET /api/communities/:id
communities.get('/:id', async (c) => {
  const id = c.req.param('id');
  const community = await c.env.DB.prepare(`SELECT c.*, u.name as creator_name FROM communities c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = ?`).bind(id).first();
  if (!community) return c.json({ error: 'Community not found' }, 404);
  const { results: posts } = await c.env.DB.prepare(`SELECT d.*, u.name as user_name, u.avatar FROM discussions d JOIN users u ON d.user_id = u.id WHERE d.community_id = ? AND d.parent_id IS NULL ORDER BY d.created_at DESC`).bind(id).all();
  const postsWithReplies = await Promise.all(posts.map(async (p) => {
    const { results: replies } = await c.env.DB.prepare(`SELECT d.*, u.name as user_name FROM discussions d JOIN users u ON d.user_id = u.id WHERE d.parent_id = ?`).bind(p.id).all();
    return { ...p, replies };
  }));
  return c.json({ ...community, posts: postsWithReplies });
});

// POST /api/communities (admin)
communities.post('/', authMiddleware, adminMiddleware, async (c) => {
  const { name, description, category, image_url } = await c.req.json();
  if (!name) return c.json({ error: 'Name required' }, 400);
  const user = c.get('user');
  const result = await c.env.DB.prepare('INSERT INTO communities (name, description, category, image_url, created_by) VALUES (?, ?, ?, ?, ?)').bind(name, description || null, category || null, image_url || null, user.id).run();
  return c.json({ id: result.meta.last_row_id }, 201);
});

// PUT /api/communities/:id (admin)
communities.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const { name, description, category, image_url } = await c.req.json();
  await c.env.DB.prepare('UPDATE communities SET name=?, description=?, category=?, image_url=? WHERE id=?').bind(name, description, category, image_url, id).run();
  return c.json({ success: true });
});

// DELETE /api/communities/:id (admin)
communities.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM communities WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ success: true });
});

// POST /api/communities/:id/join
communities.post('/:id/join', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  try {
    await c.env.DB.prepare('INSERT INTO community_members (community_id, user_id) VALUES (?, ?)').bind(id, user.id).run();
    await c.env.DB.prepare('UPDATE communities SET member_count = member_count + 1 WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch {
    return c.json({ error: 'Already a member' }, 409);
  }
});

// POST /api/communities/:id/posts
communities.post('/:id/posts', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const { content, parent_id } = await c.req.json();
  if (!content) return c.json({ error: 'Content required' }, 400);
  const result = await c.env.DB.prepare('INSERT INTO discussions (community_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)').bind(id, user.id, content, parent_id || null).run();
  const post = await c.env.DB.prepare(`SELECT d.*, u.name as user_name FROM discussions d JOIN users u ON d.user_id = u.id WHERE d.id = ?`).bind(result.meta.last_row_id).first();
  return c.json(post, 201);
});

export default communities;
