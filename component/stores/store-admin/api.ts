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

export const adminApi = {
  session: () => call<{ authenticated: boolean; configured: boolean }>("/api/admin/session"),
  login: (username: string, password: string) => call("/api/admin/session", jsonInit("POST", { username, password })),
  logout: () => call("/api/admin/session", { method: "DELETE" }),
  list: () => call<{ stores: AdminStoreSummary[]; storage: string }>("/api/admin/stores"),
  create: (form: FormData) => call<{ store: AdminStoreSummary }>("/api/admin/stores", { method: "POST", body: form }),
  patch: (slug: string, payload: Record<string, unknown>) =>
    call<{ store: AdminStoreSummary }>(`/api/admin/stores/${slug}`, jsonInit("PATCH", payload)),
  patchMultipart: (slug: string, payload: Record<string, unknown>, files: { logo?: File; addProducts?: File[]; addImages?: File[] }) => {
    const f = new FormData();
    f.set("payload", JSON.stringify(payload));
    if (files.logo) f.set("logo", files.logo);
    files.addProducts?.forEach((x) => f.append("addProducts", x));
    files.addImages?.forEach((x) => f.append("addImages", x));
    return call<{ store: AdminStoreSummary }>(`/api/admin/stores/${slug}`, { method: "PATCH", body: f });
  },
};
