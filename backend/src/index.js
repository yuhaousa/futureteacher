import { Hono } from 'hono';
import { cors } from 'hono/cors';

import authRoutes from './routes/auth.js';
import coursesRoutes from './routes/courses.js';
import enrollmentsRoutes from './routes/enrollments.js';
import pathwaysRoutes from './routes/pathways.js';
import communitiesRoutes from './routes/communities.js';
import usersRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import uploadRoutes from './routes/upload.js';
import jobRolesRoutes from './routes/job-roles.js';

const app = new Hono();

// CORS — reflects request origin so Pages + Workers work seamlessly
app.use('*', async (c, next) => {
  const origin = c.req.header('Origin') || '';
  const corsMiddleware = cors({
    origin: origin || '*',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });
  return corsMiddleware(c, next);
});

app.route('/api/auth', authRoutes);
app.route('/api/courses', coursesRoutes);
app.route('/api/enrollments', enrollmentsRoutes);
app.route('/api/pathways', pathwaysRoutes);
app.route('/api/communities', communitiesRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/upload', uploadRoutes);
app.route('/api/job-roles', jobRolesRoutes);

// Serve uploaded images from R2 (handles courses/ and avatars/ sub-paths)
app.get('/api/images/*', async (c) => {
  const path = c.req.path.replace('/api/images/', '');
  if (!path) return c.json({ error: 'Not found' }, 404);
  // If the path already contains a subfolder (avatars/, courses/) use as-is, else prepend courses/
  const key = (path.startsWith('avatars/') || path.startsWith('courses/')) ? path : 'courses/' + path;
  const object = await c.env.IMAGES.get(key);
  if (!object) return c.json({ error: 'Image not found' }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
});

// Serve courseware files (PDFs, videos) from R2
app.get('/api/files/*', async (c) => {
  const key = c.req.path.replace('/api/files/', '');
  if (!key) return c.json({ error: 'Not found' }, 404);
  const object = await c.env.IMAGES.get(key);
  if (!object) return c.json({ error: 'File not found' }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=86400');
  return new Response(object.body, { headers });
});

app.get('/api/health', (c) => c.json({ status: 'ok', version: '2.0.0' }));

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
