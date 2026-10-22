import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { dataRoot } from "./config";
import type { StoreRecord } from "./types";

/**
 * Persistence boundary. Everything above this file is storage-agnostic.
 *
 * Shipped driver: FILESYSTEM (local dev, VPS, Docker with a mounted volume).
 * It writes to <STORES_DATA_DIR | ./.data/Stores>/<SLUG>/{logo,products,assets,store.json}.
 *
 * Serverless hosts (Vercel etc.) have an ephemeral, mostly read-only
 * filesystem, so data written there would silently disappear. We therefore
 * REFUSE to start on such hosts unless a persistent volume is configured via
 * STORES_DATA_DIR, instead of pretending to persist. For production on Vercel,
 * implement `StoreStorage` against Postgres (records) + Blob/S3 (images).
 */
export interface StoreStorage {
  readonly kind: string;
  /** Atomically create the whole store (record + files). Throws SlugTakenError if it exists. */
  createStoreAtomic(slug: string, record: StoreRecord, files: { rel: string; data: Buffer }[]): Promise<void>;
  readRecord(slug: string): Promise<StoreRecord | null>;
  writeRecord(slug: string, record: StoreRecord): Promise<void>;
  listSlugs(): Promise<string[]>;
  putFile(slug: string, rel: string, data: Buffer): Promise<void>;
  deleteFile(slug: string, rel: string): Promise<void>;
  readFile(slug: string, rel: string): Promise<Buffer | null>;
  /** Human-readable logical location shown in the dashboard. */
  locationOf(slug: string): string;
}

export class SlugTakenError extends Error {}
export class StorageUnavailableError extends Error {}

const SAFE_REL = /^(logo|products|assets)\/[a-zA-Z0-9._-]+$/;
const SLUG_DIR = /^[a-z0-9-]+$/;

class FsStorage implements StoreStorage {
  readonly kind = "filesystem";
  private root = dataRoot();

  private dir(slug: string) {
    if (!SLUG_DIR.test(slug)) throw new Error("Invalid slug");
    return path.join(this.root, slug.toUpperCase());
  }
  private file(slug: string, rel: string) {
    if (!SAFE_REL.test(rel)) throw new Error("Invalid path");
    return path.join(this.dir(slug), rel);
  }
  locationOf(slug: string) {
    return `Stores/${slug.toUpperCase()}/`;
  }

  private async writeJsonAtomic(target: string, value: unknown) {
    const tmp = `${target}.${crypto.randomBytes(6).toString("hex")}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(value, null, 2), { mode: 0o600 });
    await fs.rename(tmp, target);
  }

  async createStoreAtomic(slug: string, record: StoreRecord, files: { rel: string; data: Buffer }[]) {
    await fs.mkdir(this.root, { recursive: true });
    const tmp = path.join(this.root, `.tmp-${crypto.randomBytes(8).toString("hex")}`);
    try {
      for (const sub of ["logo", "products", "assets"]) await fs.mkdir(path.join(tmp, sub), { recursive: true });
      for (const f of files) {
        if (!SAFE_REL.test(f.rel)) throw new Error("Invalid path");
        await fs.writeFile(path.join(tmp, f.rel), f.data, { mode: 0o600 });
      }
      await fs.writeFile(path.join(tmp, "store.json"), JSON.stringify(record, null, 2), { mode: 0o600 });
      // rename() onto an existing non-empty dir fails -> race-safe uniqueness
      try {
        await fs.rename(tmp, this.dir(slug));
      } catch (e: any) {
        if (e?.code === "ENOTEMPTY" || e?.code === "EEXIST" || e?.code === "EPERM") throw new SlugTakenError(slug);
        throw e;
      }
    } catch (e) {
      await fs.rm(tmp, { recursive: true, force: true }).catch(() => {});
      throw e;
    }
  }

  async readRecord(slug: string) {
    try {
      return JSON.parse(await fs.readFile(path.join(this.dir(slug), "store.json"), "utf8")) as StoreRecord;
    } catch (e: any) {
      if (e?.code === "ENOENT") return null;
      throw e;
    }
  }
  async writeRecord(slug: string, record: StoreRecord) {
    await this.writeJsonAtomic(path.join(this.dir(slug), "store.json"), record);
  }
  async listSlugs() {
    try {
      const entries = await fs.readdir(this.root, { withFileTypes: true });
      return entries
        .filter((e) => e.isDirectory() && !e.name.startsWith("."))
        .map((e) => e.name.toLowerCase())
        .filter((n) => SLUG_DIR.test(n))
        .sort();
    } catch (e: any) {
      if (e?.code === "ENOENT") return [];
      throw e;
    }
  }
  async putFile(slug: string, rel: string, data: Buffer) {
    await fs.writeFile(this.file(slug, rel), data, { mode: 0o600 });
  }
  async deleteFile(slug: string, rel: string) {
    await fs.rm(this.file(slug, rel), { force: true });
  }
  async readFile(slug: string, rel: string) {
    try {
      return await fs.readFile(this.file(slug, rel));
    } catch (e: any) {
      if (e?.code === "ENOENT") return null;
      throw e;
    }
  }
}

let instance: StoreStorage | null = null;
export function storage(): StoreStorage {
  if (instance) return instance;
  const serverless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
  if (serverless && !process.env.STORES_DATA_DIR) {
    throw new StorageUnavailableError(
      "This host has an ephemeral filesystem. Configure persistent storage (STORES_DATA_DIR on a mounted volume, or implement the Postgres + Blob driver) before creating stores."
    );
  }
  instance = new FsStorage();
  return instance;
}
