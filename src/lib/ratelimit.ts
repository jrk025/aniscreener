import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const DAILY_LIMIT = 20;

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;

// Without Redis configured (e.g. local dev) rate limiting is skipped entirely.
const limiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(DAILY_LIMIT, "1 d"),
      prefix: "aniscreener:identify",
      analytics: false,
    })
  : null;

async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function checkDailyLimit(ip: string): Promise<boolean> {
  if (!limiter) return true;
  const key = await hashIp(ip);
  const { success } = await limiter.limit(key);
  return success;
}
