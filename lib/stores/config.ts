import path from "path";

export const LIMITS = {
  logoBytes: 2 * 1024 * 1024,
  productBytes: 8 * 1024 * 1024,
  maxProductsPerStore: 300,
  maxRequestBytes: 80 * 1024 * 1024,
  nameMax: 60,
  passwordMin: 8,
  passwordMax: 128,
  priceMax: 10_000_000,
  maxSizesPerProduct: 20,
  maxCategories: 8,
  maxColors: 12,
  maxFitsPerCategory: 10,
  maxProductsPerRequest: 100,
  maxPhotosPerProduct: 8,
  labelMax: 24,
  descriptionMax: 2000,
  productNameMax: 120,
} as const;

/** Slugs that would collide with existing routes or are otherwise unsafe. */
export const RESERVED_SLUGS = new Set([
  "rbw", "template", "product", "jackets", "shorts", "accessories",
  "admin", "api", "new", "edit", "login", "logout", "assets", "static",
  "_next", "preview-3d", "shop", "search", "stores",
]);

export const STORE_SESSION_TTL_S = 60 * 60 * 24 * 7; // 7 days
export const ADMIN_SESSION_TTL_S = 60 * 60 * 8; // 8 hours

export const isProd = () => process.env.NODE_ENV === "production";

export function dataRoot(): string {
  return process.env.STORES_DATA_DIR
    ? path.resolve(process.env.STORES_DATA_DIR)
    : path.join(process.cwd(), ".data", "Stores");
}
