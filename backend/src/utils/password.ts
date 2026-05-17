/**
 * Password hashing using PBKDF2-SHA-256 via the Web Crypto API
 * (works in Cloudflare Workers — no native bcrypt available).
 *
 * Stored format:
 *   pbkdf2_sha256$<iterations>$<salt_b64>$<hash_b64>
 *
 * 100_000 iterations is the OWASP minimum for PBKDF2-SHA-256.
 */

const ALGO = 'pbkdf2_sha256';
const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin);
}

function b64ToBuf(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    KEY_BYTES * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await pbkdf2(password, salt, ITERATIONS);
  return `${ALGO}$${ITERATIONS}$${bufToB64(salt)}$${bufToB64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4) return false;
  const [algo, itersStr, saltB64, hashB64] = parts;
  if (algo !== ALGO) return false;
  const iters = Number(itersStr);
  if (!Number.isFinite(iters) || iters < 1000) return false;

  const salt = b64ToBuf(saltB64!);
  const expected = b64ToBuf(hashB64!);
  const computed = await pbkdf2(password, salt, iters);

  if (computed.length !== expected.length) return false;

  // Constant-time compare
  let diff = 0;
  for (let i = 0; i < computed.length; i++) diff |= computed[i]! ^ expected[i]!;
  return diff === 0;
}
