import { Hono } from 'hono';
import { hashPassword, verifyPassword, createToken } from '../lib/crypto.js';
import { authMiddleware } from '../middleware/auth.js';

const DEV_SECRET = 'edulearn_dev_secret_2026';
const auth = new Hono();

// GET /api/auth/setup-status
auth.get('/setup-status', async (c) => {
  const admin = await c.env.DB.prepare("SELECT id, password_hash FROM users WHERE email = 'admin@edulearn.pro'").first();
  if (!admin) return c.json({ needsSetup: true });
  return c.json({ needsSetup: admin.password_hash === 'SETUP_REQUIRED' });
});

// POST /api/auth/setup â€” one-time admin activation
auth.post('/setup', async (c) => {
  const { password } = await c.req.json();
  if (!password || password.length < 6) return c.json({ error: 'Password must be at least 6 characters' }, 400);
  const admin = await c.env.DB.prepare("SELECT * FROM users WHERE email = 'admin@edulearn.pro'").first();
  if (!admin) return c.json({ error: 'Admin user not found. Run migrations first.' }, 404);
  if (admin.password_hash !== 'SETUP_REQUIRED') return c.json({ error: 'Setup already completed' }, 409);
  const hash = await hashPassword(password);
  await c.env.DB.prepare("UPDATE users SET password_hash = ? WHERE email = 'admin@edulearn.pro'").bind(hash).run();
  // Set all other SETUP_REQUIRED users (instructors) to a default password
  const instructorHash = await hashPassword('teacher123');
  await c.env.DB.prepare("UPDATE users SET password_hash = ? WHERE password_hash = 'SETUP_REQUIRED'").bind(instructorHash).run();
  const secret = c.env.JWT_SECRET || DEV_SECRET;
  const token = await createToken({ id: admin.id, email: admin.email, role: admin.role }, secret);
  const updatedAdmin = await c.env.DB.prepare('SELECT id, name, email, role FROM users WHERE id = ?').bind(admin.id).first();
  return c.json({ message: 'Setup complete', user: updatedAdmin, token });
});

// POST /api/auth/register
auth.post('/register', async (c) => {
  const { name, email, password, role = 'teacher' } = await c.req.json();
  if (!name || !email || !password) return c.json({ error: 'Name, email and password are required' }, 400);
  if (password.length < 6) return c.json({ error: 'Password must be at least 6 characters' }, 400);
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return c.json({ error: 'Email already registered' }, 409);
  const hash = await hashPassword(password);
  const safeRole = role === 'admin' ? 'teacher' : role;
  const result = await c.env.DB.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').bind(name, email, hash, safeRole).run();
  const user = await c.env.DB.prepare('SELECT id, name, email, role, avatar, bio FROM users WHERE id = ?').bind(result.meta.last_row_id).first();
  const secret = c.env.JWT_SECRET || DEV_SECRET;
  const token = await createToken({ id: user.id, email: user.email, role: user.role }, secret);
  return c.json({ user, token }, 201);
});

// POST /api/auth/login
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: 'Email and password required' }, 400);
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user) return c.json({ error: 'Invalid credentials' }, 401);
  if (user.password_hash === 'SETUP_REQUIRED') return c.json({ error: 'Account not activated. Complete setup first.' }, 403);
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return c.json({ error: 'Invalid credentials' }, 401);
  const { password_hash, ...safeUser } = user;
  const secret = c.env.JWT_SECRET || DEV_SECRET;
  const token = await createToken({ id: user.id, email: user.email, role: user.role }, secret);
  // Record login event (non-blocking)
  c.env.DB.prepare('INSERT INTO login_events (user_id) VALUES (?)').bind(user.id).run().catch(() => {});
  return c.json({ user: safeUser, token });
});

// GET /api/auth/me
auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  const dbUser = await c.env.DB.prepare('SELECT id, name, email, role, avatar, bio, phone, teaching_subjects, school, department, job_title, created_at FROM users WHERE id = ?').bind(user.id).first();
  if (!dbUser) return c.json({ error: 'User not found' }, 404);
  if (dbUser.teaching_subjects) {
    try { dbUser.teaching_subjects = JSON.parse(dbUser.teaching_subjects); } catch { dbUser.teaching_subjects = []; }
  } else {
    dbUser.teaching_subjects = [];
  }
  return c.json(dbUser);
});

// POST /api/auth/change-password
auth.post('/change-password', authMiddleware, async (c) => {
  const user = c.get('user');
  const { currentPassword, newPassword } = await c.req.json();
  if (!currentPassword || !newPassword) return c.json({ error: 'Both current and new password are required' }, 400);
  if (newPassword.length < 6) return c.json({ error: 'New password must be at least 6 characters' }, 400);
  const dbUser = await c.env.DB.prepare('SELECT password_hash FROM users WHERE id = ?').bind(user.id).first();
  if (!dbUser) return c.json({ error: 'User not found' }, 404);
  const valid = await verifyPassword(currentPassword, dbUser.password_hash);
  if (!valid) return c.json({ error: 'Current password is incorrect' }, 401);
  const hash = await hashPassword(newPassword);
  await c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(hash, user.id).run();
  return c.json({ message: 'Password updated successfully' });
});

export default auth;
