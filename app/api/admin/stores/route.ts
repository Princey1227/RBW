import { LIMITS } from "@/lib/stores/config";
import { assertSameOrigin, errorResponse, guardRequestSize, json, requireAdmin } from "@/lib/stores/http";
import { validateImageFile } from "@/lib/stores/images";
import { createStore, listStores, StoreError, toAdminSummary, type ProductInput } from "@/lib/stores/repository";
import { storage } from "@/lib/stores/storage";
import type { AdminStoreSummary } from "@/lib/stores/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** RBW is the built-in default store: listed for context, never writable here. */
const RBW_BUILT_IN: AdminStoreSummary = {
  id: "builtin_rbw", name: "RBW", slug: "rbw", status: "active", url: "/stores/rbw",
  folder: "Stores/RBW/ (built-in)", logoUrl: "/RBW.png", logoMode: "mono", categories: [], colors: [], fits: {},
  productCount: 0, readyCount: 0, createdAt: "", updatedAt: "", products: [], builtIn: true,
};

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const stores = (await listStores()).map(toAdminSummary);
    return json({ stores: [RBW_BUILT_IN, ...stores], storage: storage().kind });
  } catch (e) {
    return errorResponse(e);
  }
}

/**
 * multipart/form-data:
 *   payload  JSON: { name, password, confirmPassword, logoMode, categories[], colors[{name,hex}],
 *                    fits{categoryLabel: string[]}, products[{category,color,fit,name,price,description,sizes[]}] }
 *   logo     file
 *   photos_<i>  one or more files for products[i]
 */
export async function POST(req: Request) {
  const bad = assertSameOrigin(req) || requireAdmin(req) || guardRequestSize(req);
  if (bad) return bad;
  try {
    const form = await req.formData();
    let payload: any;
    try { payload = JSON.parse(String(form.get("payload") ?? "")); } catch { throw new StoreError("Malformed request.", 400); }
    if (!payload || typeof payload !== "object") throw new StoreError("Malformed request.", 400);

    const logoFile = form.get("logo");
    if (!(logoFile instanceof File) || logoFile.size === 0) throw new StoreError("Brand logo is required.", 400, "logo");
    if (!Array.isArray(payload.products)) throw new StoreError("Add at least one product.", 400, "products");
    if (payload.products.length > LIMITS.maxProductsPerRequest)
      throw new StoreError(`At most ${LIMITS.maxProductsPerRequest} products at once.`, 400, "products");

    const logo = await validateImageFile(logoFile, "logo");
    const products: ProductInput[] = [];
    for (let i = 0; i < payload.products.length; i++) {
      const p = payload.products[i] ?? {};
      const files = form.getAll(`photos_${i}`).filter((f): f is File => f instanceof File && f.size > 0);
      if (files.length > LIMITS.maxPhotosPerProduct) throw new StoreError(`Product ${i + 1}: at most ${LIMITS.maxPhotosPerProduct} photos.`, 400, "products");
      const photos = [];
      for (const f of files) photos.push(await validateImageFile(f, "product"));
      products.push({
        category: String(p.category ?? ""), color: String(p.color ?? ""), fit: p.fit == null || p.fit === "" ? null : String(p.fit),
        name: String(p.name ?? ""), price: Number(p.price), description: String(p.description ?? ""),
        sizes: Array.isArray(p.sizes) ? p.sizes : [], photos,
      });
    }

    const rec = await createStore({
      name: String(payload.name ?? ""), logo, logoMode: payload.logoMode,
      password: String(payload.password ?? ""), confirmPassword: String(payload.confirmPassword ?? ""),
      categories: payload.categories, colors: payload.colors, fits: payload.fits, products,
    });

    try {
      const { scaffoldBrandStore } = await import("@/lib/stores/scaffold");
      await scaffoldBrandStore(rec.slug, rec.name);
    } catch (scaffoldErr) {
      console.error("[Store Creation] Scaffolding error:", scaffoldErr);
    }

    return json({ store: toAdminSummary(rec) }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
