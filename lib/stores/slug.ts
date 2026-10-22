import { LIMITS, RESERVED_SLUGS } from "./config";

/** "Thinc & Co." -> "thinc-co". Returns "" when nothing usable remains. */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(s: string): boolean {
  return s.length > 0 && s.length <= 48 && SLUG_RE.test(s);
}

export function isReservedSlug(s: string): boolean {
  return RESERVED_SLUGS.has(s);
}

export function cleanName(raw: unknown): string {
  return String(raw ?? "").replace(/\s+/g, " ").trim();
}

export function validateName(name: string): string | null {
  if (!name) return "Store name is required.";
  if (name.length > LIMITS.nameMax) return `Store name must be ${LIMITS.nameMax} characters or fewer.`;
  if (/[<>]/.test(name)) return "Store name cannot contain < or >.";
  return null;
}
