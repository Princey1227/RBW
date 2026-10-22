/**
 * Sliding-window limiter, in memory.
 * LIMITATION: state is per server instance. On serverless / multi-instance
 * deployments back this with a shared store (Redis/Upstash) — same interface.
 */
const hits = new Map<string, number[]>();

export interface LimitResult { ok: boolean; retryAfterS: number }

export function rateLimit(key: string, max: number, windowMs: number): LimitResult {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return { ok: false, retryAfterS: Math.max(1, Math.ceil((windowMs - (now - arr[0])) / 1000)) };
  }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return { ok: true, retryAfterS: 0 };
}

export function resetRateLimit(key: string) { hits.delete(key); }

export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  return (xf?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}
