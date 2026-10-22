import { assertSameOrigin, errorResponse, guardRequestSize, json, requireAdmin } from "@/lib/stores/http";
import { validateImageFile, type ValidatedImage } from "@/lib/stores/images";
import { getStore, StoreError, toAdminSummary, updateStore, type UpdateStoreInput } from "@/lib/stores/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { slug } = await ctx.params;
    const rec = await getStore(slug);
    return rec ? json({ store: toAdminSummary(rec) }) : json({ error: "Store not found." }, 404);
  } catch (e) {
    return errorResponse(e);
  }
}

const SIMPLE_KEYS = [
  "name", "status", "logoMode", "password", "confirmPassword", "addCategories", "addColors", "addFits",
  "colorPatches", "removeProductIds", "removeImage", "moveImage", "productPatches",
] as const;

/**
 * PATCH accepts JSON, or multipart with a `payload` JSON field plus optional files:
 *   logo               replace the logo
 *   addImages          photos for payload.addImagesToProduct.productId
 *   newProductPhotos   photos for payload.addProduct
 */
export async function PATCH(req: Request, ctx: Ctx) {
  const bad = assertSameOrigin(req) || requireAdmin(req) || guardRequestSize(req);
  if (bad) return bad;
  try {
    const { slug } = await ctx.params;
    const input: UpdateStoreInput = {};
    let payload: any = {};
    let form: FormData | null = null;
    if ((req.headers.get("content-type") || "").includes("multipart/form-data")) {
      form = await req.formData();
      try { payload = JSON.parse(String(form.get("payload") ?? "{}")); } catch { throw new StoreError("Malformed request.", 400); }
    } else {
      payload = await req.json().catch(() => { throw new StoreError("Malformed request.", 400); });
    }
    if (typeof payload !== "object" || payload === null) throw new StoreError("Malformed request.", 400);

    for (const k of SIMPLE_KEYS) if (payload[k] !== undefined) (input as any)[k] = payload[k];
    for (const k of ["removeProductIds", "addCategories", "addColors", "addFits"] as const)
      if (input[k] !== undefined && !Array.isArray(input[k])) throw new StoreError("Malformed request.", 400);

    if (form) {
      const logo = form.get("logo");
      if (logo instanceof File && logo.size > 0) input.logo = await validateImageFile(logo, "logo");

      const more = form.getAll("addImages").filter((f): f is File => f instanceof File && f.size > 0);
      if (more.length) {
        const pid = payload?.addImagesToProduct?.productId;
        if (typeof pid !== "string") throw new StoreError("productId is required to add photos.", 400);
        const images: ValidatedImage[] = [];
        for (const f of more) images.push(await validateImageFile(f, "product"));
        input.addImagesToProduct = { productId: pid, images };
      }

      if (payload.addProduct) {
        const ap = payload.addProduct;
        const files = form.getAll("newProductPhotos").filter((f): f is File => f instanceof File && f.size > 0);
        const photos: ValidatedImage[] = [];
        for (const f of files) photos.push(await validateImageFile(f, "product"));
        input.addProduct = {
          category: String(ap.category ?? ""), color: String(ap.color ?? ""), fit: ap.fit == null || ap.fit === "" ? null : String(ap.fit),
          name: String(ap.name ?? ""), price: Number(ap.price), description: String(ap.description ?? ""),
          sizes: Array.isArray(ap.sizes) ? ap.sizes : [], photos,
        };
      }
    }
    const rec = await updateStore(slug, input);
    return json({ store: toAdminSummary(rec) });
  } catch (e) {
    return errorResponse(e);
  }
}
