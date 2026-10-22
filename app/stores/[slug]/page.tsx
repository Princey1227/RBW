import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import BrandJourney from "@/component/store-front/BrandJourney";
import StoreLoginGate from "@/component/store-front/StoreLoginGate";
import { activeStoreName, loadStorefront } from "@/lib/stores/storefront";
import { storeCookieName } from "@/lib/stores/session";

/**
 * Dynamic brand storefront: /stores/<slug>.
 * Static routes (/stores/rbw, /stores/template) take precedence over this
 * segment, so RBW is untouched. Authorisation happens on the server, inside
 * loadStorefront(): catalogue data is only serialised into the page when the
 * visitor holds a valid signed session for THIS store.
 */
export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;
type SP = Promise<{ [k: string]: string | string[] | undefined }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const robots = { index: false, follow: false };
  try {
    const { slug } = await params;
    const name = await activeStoreName(slug);
    if (name) return { title: `${name} | ONLY DENIMS`, robots };
  } catch {}
  return { title: "Store | ONLY DENIMS", robots };
}

export default async function BrandStorePage({ params, searchParams }: { params: Params; searchParams: SP }) {
  const { slug } = await params;
  const sp = await searchParams;
  const token = (await cookies()).get(storeCookieName(slug))?.value;

  const view = await loadStorefront(slug, token);
  if (view.kind === "notfound") notFound();
  if (view.kind === "gate") return <StoreLoginGate store={view.store} />;

  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  return (
    <BrandJourney
      store={view.store}
      config={view.config}
      products={view.products}
      initial={{ category: one(sp.category), color: one(sp.color), fit: one(sp.fit) }}
    />
  );
}
