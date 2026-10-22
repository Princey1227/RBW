import { getStore, toClientConfig, toClientProduct, toPublicStore } from "./repository";
import { isStoreToken } from "./session";
import type { ClientProduct, ClientStoreConfig, PublicStore } from "./types";

/**
 * Authorisation boundary for the storefront page.
 *
 * The page must never `await` a raw StoreRecord: it contains the password
 * hash. The hash-bearing record stays inside this function and only the
 * already-filtered result — public brand info, plus catalogue data ONLY for a
 * valid session on THIS store — ever leaves it.
 */
export type StorefrontView =
  | { kind: "notfound" }
  | { kind: "gate"; store: PublicStore }
  | { kind: "open"; store: PublicStore; config: ClientStoreConfig; products: ClientProduct[] };

export async function loadStorefront(slug: string, sessionToken: string | undefined): Promise<StorefrontView> {
  const rec = await getStore(slug);
  if (!rec || rec.status !== "active") return { kind: "notfound" };
  const store = toPublicStore(rec);
  if (!isStoreToken(sessionToken, slug, rec.auth.version)) return { kind: "gate", store };
  return { kind: "open", store, config: toClientConfig(rec), products: rec.products.map((p) => toClientProduct(slug, p)) };
}

/** Name only, for <title>. Never exposes anything else. */
export async function activeStoreName(slug: string): Promise<string | null> {
  const rec = await getStore(slug);
  return rec && rec.status === "active" ? rec.name : null;
}
