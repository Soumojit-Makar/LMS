import crypto from 'crypto';
import { env } from '../config/env';

const SECRET = env.JWT_ACCESS_SECRET;

interface PlaybackPayload {
  videoId:  string;
  userId:   string;
  courseId: string;
  exp:      number;   // unix seconds
}

export function issuePlaybackToken(payload: Omit<PlaybackPayload, 'exp'>, ttlSeconds = 3600): string {
  const full: PlaybackPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const data   = Buffer.from(JSON.stringify(full)).toString('base64url');
  const sig    = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyPlaybackToken(token: string): PlaybackPayload {
  const parts = token.split('.');
  if (parts.length !== 2) throw new Error('Invalid token format');
  const [data, sig] = parts;
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  if (expected !== sig) throw new Error('Token signature mismatch');
  const payload: PlaybackPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return payload;
}