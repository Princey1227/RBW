import crypto from "crypto";
import { LIMITS } from "./config";
import type { StoredImage } from "./types";

export const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const;
const EXT: Record<StoredImage["mime"], string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg",
};

/** Detect type from the bytes — the client-supplied MIME/extension is never trusted. */
export function sniffMime(buf: Buffer): StoredImage["mime"] | null {
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  const head = buf.subarray(0, Math.min(buf.length, 2048)).toString("utf8").replace(/^\uFEFF/, "").trimStart();
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(head)) return "image/svg+xml";
  return null;
}

/** SVG is active content; refuse anything that can execute or fetch. */
export function svgIsSafe(buf: Buffer): boolean {
  const s = buf.toString("utf8");
  const bad = [
    /<\s*script/i, /\son[a-z]+\s*=/i, /<\s*foreignObject/i, /<\s*iframe/i, /<\s*embed/i,
    /<\s*object/i, /javascript\s*:/i, /<!ENTITY/i, /<!DOCTYPE[^>]*\[/i, /data\s*:\s*text\/html/i,
    /<\s*(use|image)[^>]+(?:xlink:)?href\s*=\s*["']\s*(?!#|data:image\/)/i,
    /@import/i, /url\(\s*["']?\s*(?!#|data:image\/)/i,
  ];
  return !bad.some((re) => re.test(s));
}

export interface ValidatedImage { data: Buffer; mime: StoredImage["mime"]; originalName: string }

export async function validateImageFile(file: File, kind: "logo" | "product"): Promise<ValidatedImage> {
  const label = `"${(file.name || "file").slice(0, 60)}"`;
  const limit = kind === "logo" ? LIMITS.logoBytes : LIMITS.productBytes;
  if (file.size === 0) throw new ImageError(`${label} is empty.`);
  if (file.size > limit) throw new ImageError(`${label} is larger than ${Math.round(limit / 1048576)} MB.`);
  const data = Buffer.from(await file.arrayBuffer());
  const mime = sniffMime(data);
  if (!mime) throw new ImageError(`${label} is not a supported image (PNG, JPG, WebP or SVG).`);
  if (mime === "image/svg+xml" && !svgIsSafe(data)) {
    throw new ImageError(`${label} is an SVG containing scripts or external references, which is not allowed.`);
  }
  return { data, mime, originalName: (file.name || "").slice(0, 120) };
}

export class ImageError extends Error {}

export function newStoredImage(v: ValidatedImage): { meta: StoredImage; data: Buffer } {
  const file = `${crypto.randomBytes(12).toString("hex")}.${EXT[v.mime]}`;
  return { meta: { file, mime: v.mime, bytes: v.data.length, originalName: v.originalName }, data: v.data };
}

export const IMAGE_FILE_RE = /^[a-f0-9]{24}\.(png|jpg|webp|svg)$/;
