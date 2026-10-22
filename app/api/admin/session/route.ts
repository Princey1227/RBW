import { ADMIN_COOKIE, ADMIN_MAX_AGE, cookieOptions, issueAdminToken } from "@/lib/stores/session";
import { adminConfigured, assertSameOrigin, isAdminRequest, json, verifyAdminCredentials } from "@/lib/stores/http";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/stores/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return json({ authenticated: isAdminRequest(req), configured: adminConfigured() });
}

export async function POST(req: Request) {
  const bad = assertSameOrigin(req);
  if (bad) return bad;
  if (!adminConfigured()) return json({ error: "Store admin is not configured on this server." }, 503);

  const ip = clientIp(req);
  const ipKey = `admin-login:${ip}`;
  const lim = rateLimit(ipKey, 5, 15 * 60_000);
  const global = rateLimit("admin-login:all", 40, 15 * 60_000);
  if (!lim.ok || !global.ok) {
    return json({ error: "Too many attempts. Try again later." }, 429, { "retry-after": String(Math.max(lim.retryAfterS, global.retryAfterS)) });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}
  const ok = await verifyAdminCredentials(String(body?.username ?? ""), String(body?.password ?? ""));
  if (!ok) return json({ error: "Invalid username or password." }, 401);

  resetRateLimit(ipKey);
  const res = json({ authenticated: true });
  const o = cookieOptions(ADMIN_MAX_AGE);
  res.headers.append("set-cookie", `${ADMIN_COOKIE}=${issueAdminToken()}; Path=${o.path}; Max-Age=${o.maxAge}; HttpOnly; SameSite=Lax${o.secure ? "; Secure" : ""}`);
  return res;
}

export async function DELETE(req: Request) {
  const bad = assertSameOrigin(req);
  if (bad) return bad;
  const res = json({ authenticated: false });
  res.headers.append("set-cookie", `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  return res;
}
