import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis: Redis;
let ratelimit: Ratelimit;

if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
    analytics: true,
  });
} else {
  console.warn('Rate limiting is disabled. Missing KV_REST_API_URL or KV_REST_API_TOKEN environment variables.');
}

export async function rate_limit(req: Request) {
  if (!ratelimit) {
    // If rate limiting is not configured, do nothing.
    return;
  }
  const identifier = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'localhost';
  const { success } = await ratelimit.limit(identifier);
  if (!success) {
    throw new Error('Rate limit exceeded');
  }
}
