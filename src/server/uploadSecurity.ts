import { Buffer } from 'node:buffer';

const MAGIC: Record<string, (bytes: Buffer) => boolean> = {
  'image/jpeg': b => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': b => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])),
  'image/gif': b => b.length >= 6 && (b.subarray(0, 6).toString('ascii') === 'GIF87a' || b.subarray(0, 6).toString('ascii') === 'GIF89a'),
  'image/webp': b => b.length >= 12 && b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
  'application/pdf': b => b.length >= 5 && b.subarray(0, 5).toString('ascii') === '%PDF-',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': b => b.length >= 4 && b.subarray(0, 4).equals(Buffer.from([0x50,0x4b,0x03,0x04])),
  'application/msword': b => b.length >= 4 && b.subarray(0, 4).equals(Buffer.from([0xd0,0xcf,0x11,0xe0])),
};

export function validateBase64Magic(mimeType: string, base64: string): boolean {
  if (mimeType === 'text/plain') return !Buffer.from(base64, 'base64').subarray(0, 4096).includes(0);
  const check = MAGIC[mimeType];
  if (!check) return false;
  return check(Buffer.from(base64, 'base64').subarray(0, 64));
}

const buckets = new Map<string, { windowStart: number; count: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;

export function geminiRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    buckets.set(key, { windowStart: now, count: 1 });
    return true;
  }
  if (bucket.count >= MAX_REQUESTS) return false;
  bucket.count += 1;
  return true;
}
