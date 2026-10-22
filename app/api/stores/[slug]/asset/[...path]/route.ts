import { IMAGE_FILE_RE } from "@/lib/stores/images";
import { isAdminRequest, parseCookies } from "@/lib/stores/http";
import { getStore } from "@/lib/stores/repository";
import { isStoreToken, storeCookieName } from "@/lib/stores/session";
import { storage } from "@/lib/stores/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string; path: string[] }> };
const notFound = () => new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });

/**
 * Logo: public while the store is active (needed on the login screen).
 * Product images: require this store's session (or the admin session).
 * Inactive stores serve nothing to visitors.
 */
export async function GET(req: Request, ctx: Ctx) {
  try {
    const { slug, path } = await ctx.params;
    if (!Array.isArray(path) || path.length !== 2) return notFound();
    const [kind, file] = path;
    if ((kind !== "logo" && kind !== "products") || !IMAGE_FILE_RE.test(file)) return notFound();

    const rec = await getStore(slug);
    if (!rec) return notFound();
    const admin = isAdminRequest(req);
    if (rec.status !== "active" && !admin) return notFound();

    let mime: string | undefined;
    if (kind === "logo") mime = rec.logo.file === file ? rec.logo.mime : undefined;
    else mime = rec.products.flatMap((p) => p.images).find((i) => i.file === file)?.mime;
    if (!mime) return notFound();

    if (kind === "products") {
      const ok = admin || isStoreToken(parseCookies(req)[storeCookieName(slug)], slug, rec.auth.version);
      if (!ok) return new Response("Authentication required", { status: 401, headers: { "cache-control": "no-store" } });
    }

    const data = await storage().readFile(slug, `${kind}/${file}`);
    if (!data) return notFound();
    return new Response(new Uint8Array(data), {
      headers: {
        "content-type": mime,
        "content-length": String(data.length),
        "x-content-type-options": "nosniff",
        "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        "cache-control": kind === "logo" ? "public, max-age=60" : "private, max-age=60",
        "content-disposition": "inline",
      },
    });
  } catch {
    return notFound();
  }
}
