import crypto from "crypto";
import { ADMIN_SESSION_TTL_S, STORE_SESSION_TTL_S, isProd } from "./config";

/**
 * Stateless signed session cookies (HMAC-SHA256). The cookie carries only a
 * scope, an expiry and — for stores — the credential version, so changing a
 * store's password instantly invalidates every existing session for it.
 */

type Payload =
  | { t: "admin"; exp: number }
  | { t: "store"; s: string; v: number; exp: number };

let devSecret: string | null = null;
function secret(): string {
  const env = process.env.STORE_SESSION_SECRET;
  if (env && env.length >= 32) return env;
  if (isProd()) throw new Error("STORE_SESSION_SECRET must be set (>= 32 chars) in production.");
  devSecret ??= crypto.randomBytes(32).toString("hex");
  return devSecret; // dev only: sessions reset on restart
}

const b64u = (b: Buffer | string) => Buffer.from(b).toString("base64url");

function sign(payload: Payload): string {
  const body = b64u(JSON.stringify(payload));
  const mac = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

function verify(token: string | undefined): Payload | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = crypto.createHmac("sha256", secret()).update(body).digest();
  let given: Buffer;
  try { given = Buffer.from(mac, "base64url"); } catch { return null; }
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload;
    if (typeof p.exp !== "number" || p.exp < Math.floor(Date.now() / 1000)) return null;
    return p;
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE = "od_admin";
export const storeCookieName = (slug: string) => `od_store_${slug}`;

const now = () => Math.floor(Date.now() / 1000);

export function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: isProd(), sameSite: "lax" as const, path: "/", maxAge };
}

export function issueAdminToken(): string {
  return sign({ t: "admin", exp: now() + ADMIN_SESSION_TTL_S });
}
export function issueStoreToken(slug: string, version: number): string {
  return sign({ t: "store", s: slug, v: version, exp: now() + STORE_SESSION_TTL_S });
}

export function isAdminToken(token: string | undefined): boolean {
  return verify(token)?.t === "admin";
}
export function isStoreToken(token: string | undefined, slug: string, version: number): boolean {
  const p = verify(token);
  return !!p && p.t === "store" && p.s === slug && p.v === version;
}

export const ADMIN_MAX_AGE = ADMIN_SESSION_TTL_S;
export const STORE_MAX_AGE = STORE_SESSION_TTL_S;
