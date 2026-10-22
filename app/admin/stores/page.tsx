"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ExternalLink, Folder, FolderTree, Loader2, LogOut, Plus, Settings2 } from "lucide-react";
import type { AdminStoreSummary } from "@/lib/stores/types";
import { adminApi, ApiError } from "@/component/store-admin/api";
import AddStoreModal from "@/component/store-admin/AddStoreModal";
import StoreDetailPanel from "@/component/store-admin/StoreDetailPanel";

/** Store Management dashboard. Every action is authorised server-side; this page only reflects it. */
export default function StoreManagementPage() {
  const [phase, setPhase] = useState<"loading" | "login" | "ready" | "unconfigured">("loading");
  const [stores, setStores] = useState<AdminStoreSummary[]>([]);
  const [driver, setDriver] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [managing, setManaging] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await adminApi.list();
      setStores(r.stores); setDriver(r.storage); setError(""); setPhase("ready");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setPhase("login");
      else { setError(e instanceof Error ? e.message : "Failed to load stores."); setPhase("ready"); }
    }
  }, []);

  useEffect(() => {
    adminApi.session().then((s) => {
      if (!s.configured) setPhase("unconfigured");
      else if (!s.authenticated) setPhase("login");
      else load();
    }).catch(() => setPhase("login"));
  }, [load]);

  const replace = (s: AdminStoreSummary) => setStores((all) => all.map((x) => (x.slug === s.slug ? s : x)));
  const managed = stores.find((s) => s.slug === managing && !s.builtIn) || null;

  return (
    <div className="fixed inset-0 z-[9000] overflow-y-auto bg-[#07080a] text-zinc-100">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#07080a]/90 px-5 py-4 backdrop-blur sm:px-10">
        <div><p className="text-[10.5px] font-semibold uppercase tracking-[0.3em] text-[#d4b069]">OnlyDenims</p>
          <h1 className="font-serif text-3xl text-white">Store Management</h1></div>
        {phase === "ready" && (
          <div className="flex items-center gap-3">
            <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 rounded-[2px] bg-[#cfaa66] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#15110a] hover:bg-[#e0c183]"><Plus size={14} /> Add store</button>
            <button onClick={async () => { await adminApi.logout().catch(() => {}); setStores([]); setPhase("login"); }} aria-label="Sign out" className="rounded-[2px] border border-white/20 p-2.5 text-zinc-300 hover:border-[#c5a059]"><LogOut size={15} /></button>
          </div>
        )}
      </header>

      {phase === "loading" && <p className="flex items-center justify-center gap-2 py-24 text-sm text-zinc-400"><Loader2 className="animate-spin" size={16} /> Loading…</p>}
      {phase === "unconfigured" && (
        <div className="mx-auto max-w-lg px-6 py-20 text-center text-sm leading-relaxed text-zinc-300">
          <p className="mb-3 font-serif text-2xl text-white">Admin access is not configured</p>
          Set <code className="rounded bg-white/10 px-1.5 py-0.5">STORE_ADMIN_USERNAME</code> and <code className="rounded bg-white/10 px-1.5 py-0.5">STORE_ADMIN_PASSWORD_HASH</code> (or <code className="rounded bg-white/10 px-1.5 py-0.5">STORE_ADMIN_PASSWORD</code>) and <code className="rounded bg-white/10 px-1.5 py-0.5">STORE_SESSION_SECRET</code> on the server, then reload.
        </div>
      )}
      {phase === "login" && <AdminLogin onDone={load} />}

      {phase === "ready" && (
        <main className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-10 lg:grid-cols-[1fr_17rem]">
          <section aria-label="Stores">
            {error && <p role="alert" className="mb-4 rounded-[3px] border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
            <ul className="grid gap-4 sm:grid-cols-2">
              {stores.map((s) => (
                <li key={s.id} className="flex flex-col gap-4 rounded-[4px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.logoUrl} alt="" className="h-12 w-20 shrink-0 rounded-[2px] bg-[#f1eee8] object-contain p-1" />
                    <div className="min-w-0 flex-1"><h2 className="truncate font-serif text-xl text-white">{s.name}</h2>
                      <p className="truncate font-mono text-xs text-zinc-400">{s.url}</p></div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${s.builtIn ? "bg-[#c5a059]/15 text-[#d4b069]" : s.status === "active" ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-500/20 text-zinc-300"}`}>{s.builtIn ? "Default" : s.status}</span>
                  </div>
                  <p className="flex items-center gap-2 text-xs text-zinc-400"><Folder size={13} /> <span className="font-mono">{s.folder}</span></p>
                  {!s.builtIn && <p className="text-xs text-zinc-300">{s.productCount} product{s.productCount === 1 ? "" : "s"} · <span className={s.readyCount === s.productCount && s.productCount > 0 ? "text-emerald-300" : "text-amber-300"}>{s.readyCount} ready to sell</span></p>}
                  <div className="mt-auto flex gap-2">
                    {!s.builtIn && <button onClick={() => setManaging(s.slug)} className="inline-flex items-center gap-2 rounded-[2px] border border-white/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] hover:border-[#c5a059]"><Settings2 size={13} /> Manage</button>}
                    <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[2px] border border-white/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] hover:border-[#c5a059]">Open <ExternalLink size={12} /></a>
                  </div>
                  {s.builtIn && <p className="text-[11px] text-zinc-500">Built-in store. It is never created, edited or overwritten from this dashboard.</p>}
                </li>
              ))}
            </ul>
            {stores.filter((s) => !s.builtIn).length === 0 && <p className="mt-6 text-sm text-zinc-400">No additional stores yet. Click <strong className="text-zinc-200">Add store</strong> to create one.</p>}
          </section>

          <aside aria-label="Store folders" className="h-fit rounded-[4px] border border-white/10 bg-white/[0.03] p-4 text-xs">
            <h2 className="mb-3 flex items-center gap-2 font-semibold uppercase tracking-[0.18em] text-[#d4b069]"><FolderTree size={14} /> Folders</h2>
            <pre className="whitespace-pre-wrap font-mono leading-6 text-zinc-300">{["Stores/", ...stores.flatMap((s, i) => {
              const last = i === stores.length - 1; const b = last ? "└─" : "├─"; const c = last ? "   " : "│  ";
              return s.builtIn
                ? [`${b} RBW  (built-in)`]
                : [`${b} ${s.folder.replace(/^Stores\//, "")}`, `${c}   logo/ products/ assets/ store.json`];
            })].join("\n")}</pre>
            <p className="mt-3 text-zinc-500">Storage: <span className="text-zinc-300">{driver || "—"}</span></p>
          </aside>
        </main>
      )}

      {adding && <AddStoreModal onClose={() => setAdding(false)} onCreated={(s) => setStores((a) => [...a, s])} onManage={(slug) => { setAdding(false); setManaging(slug); }} />}
      {managed && <StoreDetailPanel store={managed} onChange={replace} onClose={() => setManaging(null)} />}
    </div>
  );
}

function AdminLogin({ onDone }: { onDone: () => void }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    try { await adminApi.login(u.trim(), p); onDone(); }
    catch (x) { setErr(x instanceof Error ? x.message : "Sign-in failed."); }
    finally { setBusy(false); }
  }
  const f = "w-full rounded-[2px] border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus-visible:border-[#c5a059] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#c5a059]";
  return (
    <form onSubmit={submit} className="mx-auto mt-16 w-full max-w-sm space-y-4 px-6" aria-label="Admin sign in">
      <p className="text-sm text-zinc-400">Sign in to manage stores.</p>
      <div><label htmlFor="a-user" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300">Username</label><input id="a-user" className={f} value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" /></div>
      <div><label htmlFor="a-pass" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300">Password</label><input id="a-pass" type="password" className={f} value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" /></div>
      <p role="alert" className="min-h-[1.25rem] text-sm text-red-300">{err}</p>
      <button disabled={busy || !u || !p} className="w-full rounded-[2px] bg-[#cfaa66] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#15110a] hover:bg-[#e0c183] disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
