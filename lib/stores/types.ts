/**
 * Multi-brand store data model (schema 2).
 *
 * A store sells CATEGORIES (jeans, jackets, …) in COLOURS, optionally in FITS
 * (per category). A PRODUCT is one category × colour × fit combination — the
 * same unit RBW sells (wash × fit) — with its own name, price, description and
 * any number of photos. The storefront is built entirely from this data.
 *
 * Logical layout per store (mirrors the requested Stores/ tree):
 *   Stores/<SLUG>/store.json   <- StoreRecord ("store configuration")
 *   Stores/<SLUG>/logo/        <- brand logo
 *   Stores/<SLUG>/products/    <- product photos
 *   Stores/<SLUG>/assets/      <- reserved for later brand assets
 *
 * RBW is the built-in default store: it is NOT a StoreRecord and is never
 * written, renamed or overwritten by this system.
 */

export type StoreStatus = "active" | "inactive";
export type StockStatus = "in_stock" | "out_of_stock" | "unknown";
/** "mono" = silhouette like RBW's own navbar logo; "original" = keep the logo's colours. */
export type LogoMode = "mono" | "original";

export interface StoredImage {
  file: string;
  mime: "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml";
  bytes: number;
  originalName?: string;
}

export interface StoreCategory { id: string; label: string }
export interface StoreColor { id: string; name: string; hex: string }

export interface StoreProduct {
  id: string;
  categoryId: string;
  colorId: string;
  /** null when the category has no fits */
  fit: string | null;
  name: string;
  /** whole rupees */
  price: number;
  description: string;
  sizes: string[];
  stock: StockStatus;
  images: StoredImage[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreAuth {
  /** scrypt hash string — server only, never serialised to clients */
  hash: string;
  /** bumped on every password change; invalidates existing store sessions */
  version: number;
  updatedAt: string;
}

export interface StoreRecord {
  schema: 2;
  id: string;
  name: string;
  slug: string;
  status: StoreStatus;
  logo: StoredImage;
  logoMode: LogoMode;
  categories: StoreCategory[];
  colors: StoreColor[];
  /** fit labels per category id */
  fits: Record<string, string[]>;
  products: StoreProduct[];
  auth: StoreAuth;
  createdAt: string;
  updatedAt: string;
}

export interface Readiness { ready: boolean; missing: string[] }

export function productReadiness(p: StoreProduct): Readiness {
  const missing: string[] = [];
  if (!p.name?.trim()) missing.push("name");
  if (!(p.price > 0)) missing.push("price");
  if (!p.images.length) missing.push("photo");
  if (p.stock === "out_of_stock") missing.push("in stock");
  return { ready: missing.length === 0, missing };
}

/* ---- client-safe shapes (no hashes, no file-system paths) ---- */

export interface ClientProduct {
  id: string;
  categoryId: string;
  colorId: string;
  fit: string | null;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  stock: StockStatus;
  imageUrls: string[];
  ready: boolean;
  missing: string[];
}

export interface PublicStore {
  name: string;
  slug: string;
  logoUrl: string;
  logoMode: LogoMode;
}

/** What the storefront needs to render the RBW journey. Only built for an authenticated visitor. */
export interface ClientStoreConfig {
  categories: StoreCategory[];
  colors: StoreColor[];
  fits: Record<string, string[]>;
}

export interface AdminStoreSummary {
  id: string;
  name: string;
  slug: string;
  status: StoreStatus;
  url: string;
  folder: string;
  logoUrl: string;
  logoMode: LogoMode;
  categories: StoreCategory[];
  colors: StoreColor[];
  fits: Record<string, string[]>;
  productCount: number;
  readyCount: number;
  createdAt: string;
  updatedAt: string;
  products: ClientProduct[];
  builtIn?: boolean;
}
