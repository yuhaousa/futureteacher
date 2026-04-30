import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const upload = new Hono();

const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCS   = ['application/pdf'];
const ALLOWED_VIDEO  = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const MAX_IMAGE = 5  * 1024 * 1024;  //  5 MB
const MAX_DOC   = 20 * 1024 * 1024;  // 20 MB
const MAX_VIDEO = 200 * 1024 * 1024; // 200 MB

// POST /api/upload — admin only, image upload for course/community covers
upload.post('/', authMiddleware, adminMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    if (!file || typeof file === 'string') return c.json({ error: 'No file provided.' }, 400);
    if (!ALLOWED_IMAGES.includes(file.type)) return c.json({ error: `Type "${file.type}" not allowed. Use JPEG, PNG, WebP, or GIF.` }, 415);
    if (file.size > MAX_IMAGE) return c.json({ error: 'Image must be 5 MB or smaller.' }, 413);
    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const key = `courses/${crypto.randomUUID()}.${ext}`;
    await c.env.IMAGES.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
    const origin = new URL(c.req.url).origin;
    return c.json({ url: `${origin}/api/images/${key.replace('courses/', '')}` });
  } catch (err) {
    console.error('Image upload error:', err?.message);
    return c.json({ error: `Upload failed: ${err?.message}` }, 500);
  }
});

// POST /api/upload/file — admin only, PDF or video for courseware modules
upload.post('/file', authMiddleware, adminMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    if (!file || typeof file === 'string') return c.json({ error: 'No file provided.' }, 400);
    const isPdf   = ALLOWED_DOCS.includes(file.type);
    const isVideo = ALLOWED_VIDEO.includes(file.type);
    if (!isPdf && !isVideo) return c.json({ error: 'Only PDF or video files (MP4, WebM, OGG) are allowed.' }, 415);
    const maxSize = isVideo ? MAX_VIDEO : MAX_DOC;
    if (file.size > maxSize) return c.json({ error: `File too large. Max ${isVideo ? '200' : '20'} MB.` }, 413);
    const rawExt = file.name?.split('.').pop() || (isPdf ? 'pdf' : 'mp4');
    const ext = rawExt.replace(/[^a-z0-9]/gi, '').toLowerCase() || (isPdf ? 'pdf' : 'mp4');
    const folder = isPdf ? 'courseware/pdf' : 'courseware/video';
    const key = `${folder}/${crypto.randomUUID()}.${ext}`;
    await c.env.IMAGES.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
    const origin = new URL(c.req.url).origin;
    const url = `${origin}/api/files/${key}`;
    return c.json({ url, file_type: isPdf ? 'pdf' : 'video', name: file.name, size_bytes: file.size });
  } catch (err) {
    console.error('File upload error:', err?.message);
    return c.json({ error: `Upload failed: ${err?.message}` }, 500);
  }
});

// POST /api/upload/avatar — any authenticated user, portrait photo upload
upload.post('/avatar', authMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    if (!file || typeof file === 'string') return c.json({ error: 'No file provided.' }, 400);
    if (!ALLOWED_IMAGES.includes(file.type)) return c.json({ error: `Type "${file.type}" not allowed. Use JPEG, PNG, or WebP.` }, 415);
    if (file.size > MAX_IMAGE) return c.json({ error: 'Image must be 5 MB or smaller.' }, 413);
    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const key = `avatars/${crypto.randomUUID()}.${ext}`;
    await c.env.IMAGES.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
    const origin = new URL(c.req.url).origin;
    return c.json({ url: `${origin}/api/images/avatars/${key.replace('avatars/', '')}` });
  } catch (err) {
    console.error('Avatar upload error:', err?.message);
    return c.json({ error: `Upload failed: ${err?.message}` }, 500);
  }
});

export default upload;

