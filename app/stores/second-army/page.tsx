import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import StoreLoginGate from "@/component/store-front/StoreLoginGate";
import { activeStoreName, loadStorefront } from "@/lib/stores/storefront";
import { storeCookieName } from "@/lib/stores/session";
import StoreFront from "@/component/second-army/StoreFront";

export const dynamic = "force-dynamic";

type SP = Promise<{ [k: string]: string | string[] | undefined }>;

export async function generateMetadata(): Promise<Metadata> {
  const robots = { index: false, follow: false };
  try {
    const name = await activeStoreName("second-army");
    if (name) return { title: `${name} | ONLY DENIMS`, robots };
  } catch {}
  return { title: "Second army | ONLY DENIMS", robots };
}

export default async function DedicatedBrandPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const slug = "second-army";
  const sp = await searchParams;
  const token = (await cookies()).get(storeCookieName(slug))?.value;

  const view = await loadStorefront(slug, token);
  if (view.kind === "notfound") notFound();
  if (view.kind === "gate") return <StoreLoginGate store={view.store} />;

  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  return (
    <StoreFront
      store={view.store}
      config={view.config}
      products={view.products}
      initial={{ category: one(sp.category), color: one(sp.color), fit: one(sp.fit) }}
    />
  );
}
