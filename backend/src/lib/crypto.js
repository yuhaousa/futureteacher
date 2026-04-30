import { SignJWT, jwtVerify } from 'jose';

const toHex = (arr) => [...new Uint8Array(arr)].map(b => b.toString(16).padStart(2, '0')).join('');

export async function hashPassword(password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations: 100000 },
    keyMaterial, 256
  );
  return `pbkdf2:${toHex(saltBytes.buffer)}:${toHex(bits)}`;
}

export async function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('pbkdf2:')) return false;
  const parts = stored.split(':');
  if (parts.length !== 3) return false;
  const [, saltHex, hashHex] = parts;
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 },
    keyMaterial, 256
  );
  const newHash = toHex(bits);
  // Constant-time comparison
  if (newHash.length !== hashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < newHash.length; i++) {
    diff |= newHash.charCodeAt(i) ^ hashHex.charCodeAt(i);
  }
  return diff === 0;
}

export async function createToken(payload, secret) {
  const key = new TextEncoder().encode(secret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifyToken(token, secret) {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key);
  return payload;
}
