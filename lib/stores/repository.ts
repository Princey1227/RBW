import crypto from "crypto";
import { LIMITS } from "./config";
import { cleanName, isReservedSlug, isValidSlug, slugify, validateName } from "./slug";
import { hashPassword, validateNewPassword } from "./password";
import { newStoredImage, type ValidatedImage } from "./images";
import { SlugTakenError, storage } from "./storage";
import {
  productReadiness,
  type AdminStoreSummary,
  type ClientProduct,
  type ClientStoreConfig,
  type LogoMode,
  type PublicStore,
  type StockStatus,
  type StoreCategory,
  type StoreColor,
  type StoreProduct,
  type StoreRecord,
  type StoreStatus,
} from "./types";

export class StoreError extends Error {
  constructor(message: string, public status = 400, public field?: string) { super(message); }
}

/* ---- per-store write lock (single-instance; see storage.ts for multi-instance note) ---- */
const locks = new Map<string, Promise<unknown>>();
async function withLock<T>(slug: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(slug) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(fn);
  locks.set(slug, next);
  try { return await next; } finally { if (locks.get(slug) === next) locks.delete(slug); }
}

const nowIso = () => new Date().toISOString();
const newId = (p: string) => `${p}_${crypto.randomBytes(8).toString("hex")}`;

/* ---------------------------------------------------------------- projections */

export const assetUrl = (slug: string, kind: "logo" | "products", file: string) =>
  `/api/stores/${slug}/asset/${kind}/${file}`;

export function toClientProduct(slug: string, p: StoreProduct): ClientProduct {
  const r = productReadiness(p);
  return {
    id: p.id, categoryId: p.categoryId, colorId: p.colorId, fit: p.fit, name: p.name, description: p.description,
    price: p.price, sizes: p.sizes, stock: p.stock,
    imageUrls: p.images.map((i) => assetUrl(slug, "products", i.file)),
    ready: r.ready, missing: r.missing,
  };
}

export function toPublicStore(s: StoreRecord): PublicStore {
  return { name: s.name, slug: s.slug, logoUrl: assetUrl(s.slug, "logo", s.logo.file), logoMode: s.logoMode };
}

/** Only categories/colours/fits that actually have a product are shown to visitors. */
export function toClientConfig(s: StoreRecord): ClientStoreConfig {
  const usedCats = new Set(s.products.map((p) => p.categoryId));
  const usedColors = new Set(s.products.map((p) => p.colorId));
  const fits: Record<string, string[]> = {};
  for (const c of s.categories) {
    const used = (s.fits[c.id] || []).filter((f) => s.products.some((p) => p.categoryId === c.id && p.fit === f));
    if (used.length) fits[c.id] = used;
  }
  return {
    categories: s.categories.filter((c) => usedCats.has(c.id)),
    colors: s.colors.filter((c) => usedColors.has(c.id)),
    fits,
  };
}

export function toAdminSummary(s: StoreRecord): AdminStoreSummary {
  const products = s.products.map((p) => toClientProduct(s.slug, p));
  return {
    id: s.id, name: s.name, slug: s.slug, status: s.status,
    url: `/stores/${s.slug}`, folder: storage().locationOf(s.slug),
    logoUrl: assetUrl(s.slug, "logo", s.logo.file), logoMode: s.logoMode,
    categories: s.categories, colors: s.colors, fits: s.fits,
    productCount: products.length, readyCount: products.filter((p) => p.ready).length,
    createdAt: s.createdAt, updatedAt: s.updatedAt, products,
  };
}

/* ---------------------------------------------------------------- reads */

export async function getStore(slug: string): Promise<StoreRecord | null> {
  if (!isValidSlug(slug)) return null;
  const rec = await storage().readRecord(slug);
  return rec && rec.schema === 2 ? rec : null;
}

export async function listStores(): Promise<StoreRecord[]> {
  const st = storage();
  const out: StoreRecord[] = [];
  for (const slug of await st.listSlugs()) {
    const r = await st.readRecord(slug).catch(() => null);
    if (r && r.schema === 2) out.push(r);
  }
  return out.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/* ---------------------------------------------------------------- validation helpers */

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function label(raw: unknown, what: string, field: string): string {
  const v = cleanName(raw);
  if (!v) throw new StoreError(`${what} cannot be empty.`, 400, field);
  if (v.length > LIMITS.labelMax) throw new StoreError(`${what} must be ${LIMITS.labelMax} characters or fewer.`, 400, field);
  if (/[<>]/.test(v)) throw new StoreError(`${what} cannot contain < or >.`, 400, field);
  return v;
}

function buildCategories(labels: unknown): StoreCategory[] {
  if (!Array.isArray(labels) || !labels.length) throw new StoreError("Choose at least one thing you sell (e.g. Jeans).", 400, "categories");
  if (labels.length > LIMITS.maxCategories) throw new StoreError(`At most ${LIMITS.maxCategories} categories.`, 400, "categories");
  const out: StoreCategory[] = [];
  for (const l of labels) {
    const lab = label(l, "Category", "categories");
    const id = slugify(lab);
    if (!id) throw new StoreError(`"${lab}" is not a valid category name.`, 400, "categories");
    if (out.some((c) => c.id === id)) throw new StoreError(`Category "${lab}" is listed twice.`, 400, "categories");
    out.push({ id, label: lab });
  }
  return out;
}

function buildColors(raw: unknown): StoreColor[] {
  if (!Array.isArray(raw) || !raw.length) throw new StoreError("Add at least one colour.", 400, "colors");
  if (raw.length > LIMITS.maxColors) throw new StoreError(`At most ${LIMITS.maxColors} colours.`, 400, "colors");
  const out: StoreColor[] = [];
  for (const c of raw) {
    const name = label(c?.name, "Colour name", "colors");
    const hex = String(c?.hex ?? "");
    if (!HEX_RE.test(hex)) throw new StoreError(`"${name}" needs a valid colour (e.g. #1f2a44).`, 400, "colors");
    const id = slugify(name);
    if (!id) throw new StoreError(`"${name}" is not a valid colour name.`, 400, "colors");
    if (out.some((x) => x.id === id)) throw new StoreError(`Colour "${name}" is listed twice.`, 400, "colors");
    out.push({ id, name, hex: hex.toLowerCase() });
  }
  return out;
}

function buildFits(raw: unknown, categories: StoreCategory[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (raw == null) return out;
  if (typeof raw !== "object" || Array.isArray(raw)) throw new StoreError("Malformed fits.", 400, "fits");
  for (const [catLabel, list] of Object.entries(raw as Record<string, unknown>)) {
    const cat = categories.find((c) => c.label.toLowerCase() === catLabel.toLowerCase() || c.id === catLabel);
    if (!cat) throw new StoreError(`Fits were given for "${catLabel}", which you don't sell.`, 400, "fits");
    if (!Array.isArray(list)) throw new StoreError("Malformed fits.", 400, "fits");
    if (list.length > LIMITS.maxFitsPerCategory) throw new StoreError(`At most ${LIMITS.maxFitsPerCategory} fits per category.`, 400, "fits");
    const fits: string[] = [];
    for (const f of list) {
      const lab = label(f, "Fit name", "fits");
      if (fits.some((x) => x.toLowerCase() === lab.toLowerCase())) throw new StoreError(`Fit "${lab}" is listed twice for ${cat.label}.`, 400, "fits");
      fits.push(lab);
    }
    if (fits.length) out[cat.id] = fits;
  }
  return out;
}

function cleanSizes(v: unknown): string[] {
  if (v == null) return [];
  if (!Array.isArray(v)) throw new StoreError("Sizes must be a list.", 400, "sizes");
  const out = [...new Set(v.map((x) => cleanName(x)).filter(Boolean))];
  if (out.length > LIMITS.maxSizesPerProduct) throw new StoreError(`At most ${LIMITS.maxSizesPerProduct} sizes.`, 400, "sizes");
  if (out.some((x) => x.length > 12 || /[<>]/.test(x))) throw new StoreError("Invalid size.", 400, "sizes");
  return out;
}

export interface ProductInput {
  category: string;
  color: string;
  fit?: string | null;
  name: string;
  price: number;
  description?: string;
  sizes?: string[];
  stock?: StockStatus;
  photos: ValidatedImage[];
}

/** Validate one product against a store's structure and build the record (files returned separately). */
function buildProduct(
  inp: ProductInput,
  ctx: { categories: StoreCategory[]; colors: StoreColor[]; fits: Record<string, string[]> },
  idx: number
): { product: StoreProduct; files: { rel: string; data: Buffer }[] } {
  const where = `Product ${idx + 1}`;
  const cat = ctx.categories.find((c) => c.label.toLowerCase() === String(inp.category).toLowerCase() || c.id === inp.category);
  if (!cat) throw new StoreError(`${where}: unknown category "${inp.category}".`, 400, "products");
  const color = ctx.colors.find((c) => c.name.toLowerCase() === String(inp.color).toLowerCase() || c.id === inp.color);
  if (!color) throw new StoreError(`${where}: unknown colour "${inp.color}".`, 400, "products");
  const fitList = ctx.fits[cat.id] || [];
  let fit: string | null = null;
  if (fitList.length) {
    const f = fitList.find((x) => x.toLowerCase() === String(inp.fit ?? "").toLowerCase());
    if (!f) throw new StoreError(`${where}: choose a fit for ${cat.label}.`, 400, "products");
    fit = f;
  } else if (inp.fit) {
    throw new StoreError(`${where}: ${cat.label} has no fits.`, 400, "products");
  }

  const name = cleanName(inp.name);
  if (!name) throw new StoreError(`${where}: name is required.`, 400, "products");
  if (name.length > LIMITS.productNameMax || /[<>]/.test(name)) throw new StoreError(`${where}: invalid name.`, 400, "products");
  const price = inp.price;
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0 || price > LIMITS.priceMax)
    throw new StoreError(`${where} (${name}): enter a price greater than 0.`, 400, "products");
  const description = String(inp.description ?? "").replace(/\r\n/g, "\n").trim();
  if (description.length > LIMITS.descriptionMax || /[<>]/.test(description))
    throw new StoreError(`${where} (${name}): description is too long or contains < >.`, 400, "products");
  if (!inp.photos.length) throw new StoreError(`${where} (${name}): add at least one photo.`, 400, "products");
  if (inp.photos.length > LIMITS.maxPhotosPerProduct)
    throw new StoreError(`${where} (${name}): at most ${LIMITS.maxPhotosPerProduct} photos.`, 400, "products");
  const stock = inp.stock ?? "unknown";
  if (!["in_stock", "out_of_stock", "unknown"].includes(stock)) throw new StoreError("Invalid stock status.", 400, "products");

  const imgs = inp.photos.map((p) => newStoredImage(p));
  const ts = nowIso();
  return {
    product: {
      id: newId("prod"), categoryId: cat.id, colorId: color.id, fit, name, price: Math.round(price), description,
      sizes: cleanSizes(inp.sizes), stock, images: imgs.map((i) => i.meta), createdAt: ts, updatedAt: ts,
    },
    files: imgs.map((i) => ({ rel: `products/${i.meta.file}`, data: i.data })),
  };
}

const comboKey = (p: { categoryId: string; colorId: string; fit: string | null }) =>
  `${p.categoryId}|${p.colorId}|${(p.fit ?? "").toLowerCase()}`;

/* ---------------------------------------------------------------- create */

export interface CreateStoreInput {
  name: string;
  logo: ValidatedImage;
  logoMode?: LogoMode;
  password: string;
  confirmPassword: string;
  categories: string[];
  colors: { name: string; hex: string }[];
  fits?: Record<string, string[]>;
  products: ProductInput[];
}

export async function createStore(input: CreateStoreInput): Promise<StoreRecord> {
  const name = cleanName(input.name);
  const nameErr = validateName(name);
  if (nameErr) throw new StoreError(nameErr, 400, "name");
  if (!input.logo) throw new StoreError("Brand logo is required.", 400, "logo");
  const pwErr = validateNewPassword(input.password, input.confirmPassword);
  if (pwErr) throw new StoreError(pwErr, 400, "password");
  const logoMode: LogoMode = input.logoMode === "original" ? "original" : "mono";

  const categories = buildCategories(input.categories);
  const colors = buildColors(input.colors);
  const fits = buildFits(input.fits, categories);

  if (!Array.isArray(input.products) || !input.products.length)
    throw new StoreError("Add at least one product (name, price and a photo).", 400, "products");
  if (input.products.length > LIMITS.maxProductsPerRequest)
    throw new StoreError(`At most ${LIMITS.maxProductsPerRequest} products at once.`, 400, "products");

  const built = input.products.map((p, i) => buildProduct(p, { categories, colors, fits }, i));
  const seen = new Set<string>();
  for (const b of built) {
    const k = comboKey(b.product);
    if (seen.has(k)) {
      const c = categories.find((x) => x.id === b.product.categoryId)!.label;
      const col = colors.find((x) => x.id === b.product.colorId)!.name;
      throw new StoreError(`Two products share the same ${c} / ${col}${b.product.fit ? " / " + b.product.fit : ""}. Each combination can have one product.`, 400, "products");
    }
    seen.add(k);
  }

  const base = slugify(name);
  if (!base) throw new StoreError("Store name must contain letters or numbers.", 400, "name");
  if (isReservedSlug(base)) throw new StoreError(`"${name}" is a reserved name. Please choose another.`, 409, "name");
  const existing = await listStores();
  if (existing.some((s) => s.name.toLowerCase() === name.toLowerCase()))
    throw new StoreError("A store with this name already exists.", 409, "name");

  const hash = await hashPassword(input.password);
  const st = storage();
  const logo = newStoredImage(input.logo);
  const ts = nowIso();
  const files = [{ rel: `logo/${logo.meta.file}`, data: logo.data }, ...built.flatMap((b) => b.files)];

  for (let n = 1; n <= 50; n++) {
    const slug = n === 1 ? base : `${base}-${n}`.slice(0, 48);
    if (isReservedSlug(slug) || !isValidSlug(slug)) continue;
    const record: StoreRecord = {
      schema: 2, id: newId("store"), name, slug, status: "active", logo: logo.meta, logoMode,
      categories, colors, fits, products: built.map((b) => b.product),
      auth: { hash, version: 1, updatedAt: ts }, createdAt: ts, updatedAt: ts,
    };
    try {
      await st.createStoreAtomic(slug, record, files);
      return record;
    } catch (e) {
      if (e instanceof SlugTakenError) continue;
      throw e;
    }
  }
  throw new StoreError("Could not generate a unique URL for this store. Try a different name.", 409, "name");
}

/* ---------------------------------------------------------------- update */

export interface ProductPatch {
  name?: string;
  price?: number;
  description?: string;
  sizes?: string[];
  stock?: StockStatus;
}

export interface UpdateStoreInput {
  name?: string;
  status?: StoreStatus;
  logoMode?: LogoMode;
  password?: string;
  confirmPassword?: string;
  logo?: ValidatedImage;
  addCategories?: string[];
  addColors?: { name: string; hex: string }[];
  addFits?: { category: string; fit: string }[];
  colorPatches?: Record<string, { name?: string; hex?: string }>;
  addProduct?: Omit<ProductInput, "photos"> & { photos: ValidatedImage[] };
  removeProductIds?: string[];
  removeImage?: { productId: string; file: string };
  addImagesToProduct?: { productId: string; images: ValidatedImage[] };
  moveImage?: { productId: string; file: string; direction: -1 | 1 };
  productPatches?: Record<string, ProductPatch>;
}

function applyPatch(p: StoreProduct, patch: ProductPatch) {
  if ("name" in patch) {
    const n = cleanName(patch.name);
    if (!n || n.length > LIMITS.productNameMax || /[<>]/.test(n)) throw new StoreError("Invalid product name.", 400);
    p.name = n;
  }
  if ("price" in patch) {
    if (typeof patch.price !== "number" || !Number.isFinite(patch.price) || patch.price <= 0 || patch.price > LIMITS.priceMax)
      throw new StoreError("Price must be a positive number.", 400);
    p.price = Math.round(patch.price);
  }
  if ("description" in patch) {
    const d = String(patch.description ?? "").replace(/\r\n/g, "\n").trim();
    if (d.length > LIMITS.descriptionMax || /[<>]/.test(d)) throw new StoreError("Invalid description.", 400);
    p.description = d;
  }
  if ("sizes" in patch) p.sizes = cleanSizes(patch.sizes);
  if ("stock" in patch) {
    if (!["in_stock", "out_of_stock", "unknown"].includes(patch.stock as string)) throw new StoreError("Invalid stock status.", 400);
    p.stock = patch.stock as StockStatus;
  }
  p.updatedAt = nowIso();
}

export async function updateStore(slug: string, input: UpdateStoreInput): Promise<StoreRecord> {
  return withLock(slug, async () => {
    const st = storage();
    const rec = await st.readRecord(slug);
    if (!rec || rec.schema !== 2) throw new StoreError("Store not found.", 404);
    const filesToDelete: string[] = [];
    const newFiles: { rel: string; data: Buffer }[] = [];
    const ts = nowIso();

    if (input.name !== undefined) {
      const name = cleanName(input.name);
      const err = validateName(name);
      if (err) throw new StoreError(err, 400, "name");
      const others = await listStores();
      if (others.some((s) => s.slug !== slug && s.name.toLowerCase() === name.toLowerCase()))
        throw new StoreError("A store with this name already exists.", 409, "name");
      if (isReservedSlug(slugify(name)) && slugify(name) !== slug) throw new StoreError(`"${name}" is a reserved name.`, 409, "name");
      rec.name = name; // slug (URL) intentionally never changes
    }
    if (input.status !== undefined) {
      if (input.status !== "active" && input.status !== "inactive") throw new StoreError("Invalid status.", 400);
      rec.status = input.status;
    }
    if (input.logoMode !== undefined) {
      if (input.logoMode !== "mono" && input.logoMode !== "original") throw new StoreError("Invalid logo mode.", 400);
      rec.logoMode = input.logoMode;
    }
    if (input.password !== undefined || input.confirmPassword !== undefined) {
      const err = validateNewPassword(input.password, input.confirmPassword);
      if (err) throw new StoreError(err, 400, "password");
      rec.auth = { hash: await hashPassword(input.password!), version: rec.auth.version + 1, updatedAt: ts };
    }
    if (input.logo) {
      const img = newStoredImage(input.logo);
      newFiles.push({ rel: `logo/${img.meta.file}`, data: img.data });
      filesToDelete.push(`logo/${rec.logo.file}`);
      rec.logo = img.meta;
    }

    if (input.addCategories?.length) {
      rec.categories = buildCategories([...rec.categories.map((c) => c.label), ...input.addCategories]);
    }
    if (input.addColors?.length) {
      rec.colors = buildColors([...rec.colors.map((c) => ({ name: c.name, hex: c.hex })), ...input.addColors]);
    }
    if (input.addFits?.length) {
      for (const { category, fit } of input.addFits) {
        const cat = rec.categories.find((c) => c.label.toLowerCase() === String(category).toLowerCase() || c.id === category);
        if (!cat) throw new StoreError(`Unknown category "${category}".`, 400, "fits");
        const lab = label(fit, "Fit name", "fits");
        const list = rec.fits[cat.id] || [];
        if (list.some((f) => f.toLowerCase() === lab.toLowerCase())) throw new StoreError(`Fit "${lab}" already exists for ${cat.label}.`, 400, "fits");
        if (list.length >= LIMITS.maxFitsPerCategory) throw new StoreError(`At most ${LIMITS.maxFitsPerCategory} fits per category.`, 400, "fits");
        rec.fits[cat.id] = [...list, lab];
      }
    }
    if (input.colorPatches) {
      for (const [id, patch] of Object.entries(input.colorPatches)) {
        const c = rec.colors.find((x) => x.id === id);
        if (!c) throw new StoreError("Colour not found.", 404);
        if (patch.name !== undefined) {
          const nm = label(patch.name, "Colour name", "colors");
          if (rec.colors.some((x) => x.id !== id && x.name.toLowerCase() === nm.toLowerCase())) throw new StoreError(`Colour "${nm}" already exists.`, 400, "colors");
          c.name = nm; // id stays stable so products keep pointing at it
        }
        if (patch.hex !== undefined) {
          if (!HEX_RE.test(patch.hex)) throw new StoreError("Invalid colour value.", 400, "colors");
          c.hex = patch.hex.toLowerCase();
        }
      }
    }

    if (input.removeProductIds?.length) {
      for (const id of input.removeProductIds) {
        const i = rec.products.findIndex((p) => p.id === id);
        if (i < 0) throw new StoreError("Product not found.", 404);
        for (const im of rec.products[i].images) filesToDelete.push(`products/${im.file}`);
        rec.products.splice(i, 1);
      }
    }
    if (input.addProduct) {
      if (rec.products.length >= LIMITS.maxProductsPerStore) throw new StoreError(`A store can hold at most ${LIMITS.maxProductsPerStore} products.`, 400);
      const b = buildProduct(input.addProduct, { categories: rec.categories, colors: rec.colors, fits: rec.fits }, rec.products.length);
      if (rec.products.some((p) => comboKey(p) === comboKey(b.product)))
        throw new StoreError("A product already exists for that category / colour / fit.", 409, "products");
      rec.products.push(b.product);
      newFiles.push(...b.files);
    }
    if (input.removeImage) {
      const p = rec.products.find((x) => x.id === input.removeImage!.productId);
      if (!p) throw new StoreError("Product not found.", 404);
      if (p.images.length <= 1) throw new StoreError("A product needs at least one photo.", 400);
      const i = p.images.findIndex((im) => im.file === input.removeImage!.file);
      if (i < 0) throw new StoreError("Photo not found.", 404);
      filesToDelete.push(`products/${p.images[i].file}`);
      p.images.splice(i, 1);
      p.updatedAt = ts;
    }
    if (input.addImagesToProduct) {
      const p = rec.products.find((x) => x.id === input.addImagesToProduct!.productId);
      if (!p) throw new StoreError("Product not found.", 404);
      if (p.images.length + input.addImagesToProduct.images.length > LIMITS.maxPhotosPerProduct)
        throw new StoreError(`At most ${LIMITS.maxPhotosPerProduct} photos per product.`, 400);
      for (const v of input.addImagesToProduct.images) {
        const img = newStoredImage(v);
        newFiles.push({ rel: `products/${img.meta.file}`, data: img.data });
        p.images.push(img.meta);
      }
      p.updatedAt = ts;
    }
    if (input.moveImage) {
      const p = rec.products.find((x) => x.id === input.moveImage!.productId);
      if (!p) throw new StoreError("Product not found.", 404);
      const i = p.images.findIndex((im) => im.file === input.moveImage!.file);
      const j = i + (input.moveImage.direction === 1 ? 1 : -1);
      if (i < 0 || j < 0 || j >= p.images.length) throw new StoreError("Cannot move that photo.", 400);
      [p.images[i], p.images[j]] = [p.images[j], p.images[i]];
      p.updatedAt = ts;
    }
    if (input.productPatches) {
      for (const [id, patch] of Object.entries(input.productPatches)) {
        const p = rec.products.find((x) => x.id === id);
        if (!p) throw new StoreError("Product not found.", 404);
        applyPatch(p, patch);
      }
    }

    rec.updatedAt = ts;
    // New files first, then the record, then delete superseded files: a failure
    // at any point never leaves the record pointing at missing files.
    const written: string[] = [];
    try {
      for (const f of newFiles) { await st.putFile(slug, f.rel, f.data); written.push(f.rel); }
      await st.writeRecord(slug, rec);
    } catch (e) {
      for (const rel of written) await st.deleteFile(slug, rel).catch(() => {});
      throw e;
    }
    for (const rel of filesToDelete) await st.deleteFile(slug, rel).catch(() => {});
    return rec;
  });
}
