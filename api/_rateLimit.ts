/**
 * Lightweight in-memory rate limiter for serverless endpoints.
 * Protects endpoints from burst flooding and resource exhaustion.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit?: number; // max requests per window (default 60)
  windowMs?: number; // window size in ms (default 60,000ms = 1 min)
}

export function checkRateLimit(req: any, res: any, options: RateLimitOptions = {}): boolean {
  const limit = options.limit || 60;
  const windowMs = options.windowMs || 60 * 1000;

  const rawIp =
    (req.headers && req.headers['x-forwarded-for']) ||
    (req.headers && req.headers['x-real-ip']) ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  const clientIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : '127.0.0.1';
  const routeKey = `${clientIp}:${req.url?.split('?')[0] || 'endpoint'}`;

  const now = Date.now();
  const existing = rateLimitStore.get(routeKey);

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(routeKey, {
      count: 1,
      resetTime: now + windowMs,
    });
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', (limit - 1).toString());
    return true;
  }

  if (existing.count >= limit) {
    const retryAfter = Math.ceil((existing.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', '0');
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please wait ${retryAfter} seconds before retrying.`,
      status: 429,
    });
    return false;
  }

  existing.count += 1;
  res.setHeader('X-RateLimit-Limit', limit.toString());
  res.setHeader('X-RateLimit-Remaining', (limit - existing.count).toString());
  return true;
}
