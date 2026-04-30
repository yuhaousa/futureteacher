import { verifyToken } from '../lib/crypto.js';

const DEV_SECRET = 'edulearn_dev_secret_2026';

export const authMiddleware = async (c, next) => {
  const auth = c.req.header('Authorization');
  const token = auth?.split(' ')[1];
  if (!token) return c.json({ error: 'Access token required' }, 401);
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET || DEV_SECRET);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 403);
  }
};

export const adminMiddleware = async (c, next) => {
  const user = c.get('user');
  if (user?.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
};

