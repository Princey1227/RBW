// Usage: node scripts/hash-admin-password.mjs "my admin password"
// Prints a value for STORE_ADMIN_PASSWORD_HASH (scrypt, same format the server verifies).
import crypto from "node:crypto";
const pw = process.argv[2];
if (!pw || pw.length < 12) { console.error("Provide a password of at least 12 characters as the first argument."); process.exit(1); }
const N = 1 << 15, r = 8, p = 1, salt = crypto.randomBytes(16);
const key = crypto.scryptSync(pw, salt, 64, { N, r, p, maxmem: 128 * N * r * 2 });
console.log(["scrypt", N, r, p, salt.toString("base64"), key.toString("base64")].join("$"));
