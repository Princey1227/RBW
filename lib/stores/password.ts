import crypto from "crypto";
import { LIMITS } from "./config";

/**
 * Password hashing with Node's built-in scrypt (no extra dependency).
 * Format: scrypt$N$r$p$<salt b64>$<hash b64>
 */
const N = 1 << 15; // 32768
const R = 8;
const P = 1;
const KEYLEN = 64;

function scrypt(password: string, salt: Buffer, n: number, r: number, p: number, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, { N: n, r, p, maxmem: 128 * n * r * 2 }, (err, key) =>
      err ? reject(err) : resolve(key)
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, N, R, P, KEYLEN);
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, n, r, p, saltB64, hashB64] = stored.split("$");
    if (scheme !== "scrypt") return false;
    const expected = Buffer.from(hashB64, "base64");
    const key = await scrypt(password, Buffer.from(saltB64, "base64"), +n, +r, +p, expected.length);
    return key.length === expected.length && crypto.timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

let dummy: Promise<string> | null = null;
/** Burn equivalent time for unknown/inactive stores so responses don't leak existence. */
export async function dummyVerify(password: string): Promise<void> {
  dummy ??= hashPassword("not-a-real-password");
  await verifyPassword(password, await dummy);
}

export function validateNewPassword(password: unknown, confirm: unknown): string | null {
  if (typeof password !== "string" || !password) return "Password is required.";
  if (password.length < LIMITS.passwordMin) return `Password must be at least ${LIMITS.passwordMin} characters.`;
  if (password.length > LIMITS.passwordMax) return `Password must be ${LIMITS.passwordMax} characters or fewer.`;
  if (typeof confirm !== "string" || confirm !== password) return "Passwords do not match.";
  return null;
}
