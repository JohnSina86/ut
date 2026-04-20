import { Request, Response, NextFunction } from 'express';

/**
 * Minimal in-memory sliding-window rate limiter for admin endpoints.
 *
 * Intentionally zero-dependency: the original checklist suggests
 * `express-rate-limit`, but since the rest of the project avoids
 * adding optional npm packages mid-stream, this small helper gives
 * us the same 60-req/min-per-IP protection without a new dependency.
 *
 * If you later add `express-rate-limit` to the project, swap the
 * implementation here and keep the exported `adminRateLimiter`
 * signature unchanged.
 */
interface Bucket {
  windowStart: number;
  count: number;
}

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 60;
const buckets = new Map<string, Bucket>();

export function adminRateLimiter(req: Request, res: Response, next: NextFunction) {
  const key = (req.ip || req.socket.remoteAddress || 'unknown').toString();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    buckets.set(key, { windowStart: now, count: 1 });
    return next();
  }

  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    return res
      .status(429)
      .json({ error: 'Too many requests. Please slow down.' });
  }

  next();
}
