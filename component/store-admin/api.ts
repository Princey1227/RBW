import type { AdminStoreSummary } from "@/lib/stores/types";

export class ApiError extends Error {
  constructor(message: string, public status: number, public field?: string) { super(message); }
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "same-origin", ...init });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(j?.error || `Request failed (${res.status})`, res.status, j?.field);
  return j as T;
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method, headers: { "content-type": "application/json" }, body: JSON.stringify(body),
});

export interface DraftProduct {
  key: string;
  category: string;
  color: string;
  fit: string;
  name: string;
  price: string;
  description: string;
  sizes: string;
  photos: File[];
}

export interface CreatePayload {
  name: string; password: string; confirmPassword: string; logoMode: "mono" | "original";
  categories: string[]; colors: { name: string; hex: string }[]; fits: Record<string, string[]>;
}

export const adminApi = {
  session: () => call<{ authenticated: boolean; configured: boolean }>("/api/admin/session"),
  login: (username: string, password: string) => call("/api/admin/session", jsonInit("POST", { username, password })),
  logout: () => call("/api/admin/session", { method: "DELETE" }),
  list: () => call<{ stores: AdminStoreSummary[]; storage: string }>("/api/admin/stores"),
  create: (p: CreatePayload, logo: File, drafts: DraftProduct[]) => {
    const f = new FormData();
    f.set("payload", JSON.stringify({
      ...p,
      products: drafts.map((d) => ({
        category: d.category, color: d.color, fit: d.fit || null, name: d.name, price: Number(d.price), description: d.description,
        sizes: d.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      })),
    }));
    f.set("logo", logo);
    drafts.forEach((d, i) => d.photos.forEach((ph) => f.append(`photos_${i}`, ph)));
    return call<{ store: AdminStoreSummary }>("/api/admin/stores", { method: "POST", body: f });
  },
  patch: (slug: string, payload: Record<string, unknown>) =>
    call<{ store: AdminStoreSummary }>(`/api/admin/stores/${slug}`, jsonInit("PATCH", payload)),
  patchMultipart: (slug: string, payload: Record<string, unknown>, files: { logo?: File; addImages?: File[]; newProductPhotos?: File[] }) => {
    const f = new FormData();
    f.set("payload", JSON.stringify(payload));
    if (files.logo) f.set("logo", files.logo);
    files.addImages?.forEach((x) => f.append("addImages", x));
    files.newProductPhotos?.forEach((x) => f.append("newProductPhotos", x));
    return call<{ store: AdminStoreSummary }>(`/api/admin/stores/${slug}`, { method: "PATCH", body: f });
  },
};
