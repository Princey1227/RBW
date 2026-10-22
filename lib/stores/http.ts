import crypto from "crypto";
import { LIMITS } from "./config";
import { ImageError } from "./images";
import { StoreError } from "./repository";
import { StorageUnavailableError } from "./storage";
import { ADMIN_COOKIE, isAdminToken } from "./session";

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
  });
}

export function parseCookies(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (req.headers.get("cookie") || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

/** Blocks cross-site state-changing requests (defence in depth on top of SameSite=Lax). */
export function assertSameOrigin(req: Request): Response | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  try {
    if (new URL(origin).host !== host) return json({ error: "Cross-origin request blocked." }, 403);
  } catch {
    return json({ error: "Bad origin." }, 403);
  }
  return null;
}

export function isAdminRequest(req: Request): boolean {
  return isAdminToken(parseCookies(req)[ADMIN_COOKIE]);
}

/** Server-side authorisation for every admin endpoint. */
export function requireAdmin(req: Request): Response | null {
  return isAdminRequest(req) ? null : json({ error: "Admin authentication required." }, 401);
}

export function guardRequestSize(req: Request): Response | null {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > LIMITS.maxRequestBytes) return json({ error: "Upload is too large." }, 413);
  return null;
}

export function errorResponse(e: unknown): Response {
  if (e instanceof StoreError) return json({ error: e.message, field: e.field }, e.status);
  if (e instanceof ImageError) return json({ error: e.message, field: "images" }, 400);
  if (e instanceof StorageUnavailableError) return json({ error: e.message }, 503);
  console.error("[stores] unexpected error:", e);
  return json({ error: "Something went wrong. Nothing was saved." }, 500);
}

/* ---- admin credentials (dedicated env vars; no hard-coded fallbacks) ---- */

export function adminConfigured(): boolean {
  return !!process.env.STORE_ADMIN_USERNAME && !!(process.env.STORE_ADMIN_PASSWORD_HASH || process.env.STORE_ADMIN_PASSWORD);
}

const digest = (s: string) => crypto.createHash("sha256").update(s).digest();

const cleanEnv = (s?: string) => (s ?? "").trim().replace(/^["']|["']$/g, "").trim();

export async function verifyAdminCredentials(user: string, pass: string): Promise<boolean> {
  const { verifyPassword } = await import("./password");
  const envUser = cleanEnv(process.env.STORE_ADMIN_USERNAME);
  const inputUser = user.trim();
  const userOk = !!envUser && crypto.timingSafeEqual(digest(inputUser), digest(envUser));

  let passOk = false;
  const hashVal = cleanEnv(process.env.STORE_ADMIN_PASSWORD_HASH);
  const rawVal = cleanEnv(process.env.STORE_ADMIN_PASSWORD);

  if (hashVal && hashVal.startsWith("scrypt$")) {
    passOk = await verifyPassword(pass, hashVal);
  } else {
    // Fall back to plain text comparison (supports both STORE_ADMIN_PASSWORD and plain text STORE_ADMIN_PASSWORD_HASH)
    const expectedPass = rawVal || hashVal;
    if (expectedPass) {
      passOk = crypto.timingSafeEqual(digest(pass), digest(expectedPass));
    }
  }

  return userOk && passOk;
}
