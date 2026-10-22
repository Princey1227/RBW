import { cookieOptions, issueStoreToken, STORE_MAX_AGE, storeCookieName } from "@/lib/stores/session";
import { assertSameOrigin, json } from "@/lib/stores/http";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/stores/rateLimit";
import { dummyVerify, verifyPassword } from "@/lib/stores/password";
import { getStore } from "@/lib/stores/repository";
import { errorResponse } from "@/lib/stores/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };
const GENERIC = "Incorrect password.";

export async function POST(req: Request, ctx: Ctx) {
  const bad = assertSameOrigin(req);
  if (bad) return bad;
  try {
    const { slug } = await ctx.params;
    const ipKey = `store-login:${slug}:${clientIp(req)}`;
    const a = rateLimit(ipKey, 5, 15 * 60_000);
    const b = rateLimit(`store-login:${slug}:all`, 40, 15 * 60_000);
    if (!a.ok || !b.ok) {
      return json({ error: "Too many attempts. Please wait and try again." }, 429, { "retry-after": String(Math.max(a.retryAfterS, b.retryAfterS)) });
    }

    let password = "";
    try { password = String((await req.json())?.password ?? ""); } catch {}
    if (!password || password.length > 256) return json({ error: GENERIC }, 401);

    const rec = await getStore(slug);
    if (!rec || rec.status !== "active") {
      await dummyVerify(password); // same timing, same message: no store enumeration
      return json({ error: GENERIC }, 401);
    }
    if (!(await verifyPassword(password, rec.auth.hash))) return json({ error: GENERIC }, 401);

    resetRateLimit(ipKey);
    const res = json({ ok: true });
    const o = cookieOptions(STORE_MAX_AGE);
    res.headers.append("set-cookie", `${storeCookieName(slug)}=${issueStoreToken(slug, rec.auth.version)}; Path=${o.path}; Max-Age=${o.maxAge}; HttpOnly; SameSite=Lax${o.secure ? "; Secure" : ""}`);
    return res;
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const bad = assertSameOrigin(req);
  if (bad) return bad;
  const { slug } = await ctx.params;
  const res = json({ ok: true });
  res.headers.append("set-cookie", `${storeCookieName(slug)}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  return res;
}
