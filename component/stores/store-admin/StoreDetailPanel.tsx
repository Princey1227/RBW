"use client";

import React, { useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, ExternalLink, Loader2, Trash2, X } from "lucide-react";
import type { AdminStoreSummary, ClientProduct } from "@/lib/stores/types";
import { adminApi, ApiError } from "./api";
import ImagePicker from "./ImagePicker";

const input = "w-full rounded-[2px] border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus-visible:border-[#c5a059] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#c5a059]";
const lab = "mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-zinc-400";
const btn = "inline-flex items-center justify-center gap-2 rounded-[2px] border border-white/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:border-[#c5a059] disabled:opacity-50";
const gold = "inline-flex items-center justify-center gap-2 rounded-[2px] bg-[#cfaa66] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#15110a] hover:bg-[#e0c183] disabled:opacity-50";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 border-t border-white/10 pt-5"><h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4b069]">{title}</h3>{children}</section>;
}

export default function StoreDetailPanel({ store, onChange, onClose }: {
  store: AdminStoreSummary; onChange: (s: AdminStoreSummary) => void; onClose: () => void;
}) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState(store.name);
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [logo, setLogo] = useState<File[]>([]);
  const [more, setMore] = useState<File[]>([]);

  async function run(key: string, fn: () => Promise<{ store: AdminStoreSummary }>, okText: string) {
    setBusy(key); setMsg(null);
    try { const { store: s } = await fn(); onChange(s); setMsg({ ok: true, text: okText }); return true; }
    catch (e) { setMsg({ ok: false, text: e instanceof ApiError ? e.message : "Something went wrong." }); return false; }
    finally { setBusy(null); }
  }
  const active = store.status === "active";

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col border-l border-white/10 bg-[#0e0f13] shadow-2xl" aria-label={`Manage ${store.name}`}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="min-w-0"><h2 className="truncate font-serif text-2xl text-white">{store.name}</h2>
          <p className="font-mono text-xs text-zinc-400">{store.url} · {store.folder}</p></div>
        <button onClick={onClose} aria-label="Close panel" className="rounded p-2 text-zinc-400 hover:bg-white/10 hover:text-white"><X size={18} /></button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {msg && (
          <p role="status" className={`flex items-start gap-2 rounded-[3px] border p-3 text-sm ${msg.ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-red-500/40 bg-red-500/10 text-red-200"}`}>
            {msg.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}{msg.text}</p>
        )}

        <Section title="Store">
          <div className="flex gap-2">
            <div className="flex-1"><label className={lab} htmlFor="d-name">Name</label><input id="d-name" className={input} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} /></div>
            <button className={`${gold} self-end`} disabled={busy !== null || !name.trim() || name.trim() === store.name} onClick={() => run("name", () => adminApi.patch(store.slug, { name: name.trim() }), "Name updated. The URL stays the same.")}>Save</button>
          </div>
          <p className="text-xs text-zinc-500">The URL (<span className="font-mono">{store.url}</span>) never changes when you rename, so shared links keep working.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] ${active ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-500/20 text-zinc-300"}`}>{active ? "Active" : "Inactive"}</span>
            <button className={btn} disabled={busy !== null} onClick={() => run("status", () => adminApi.patch(store.slug, { status: active ? "inactive" : "active" }), active ? "Store deactivated. Visitors now see a 404." : "Store activated.")}>{active ? "Deactivate" : "Activate"}</button>
            <a className={btn} href={store.url} target="_blank" rel="noreferrer">Open store <ExternalLink size={12} /></a>
          </div>
        </Section>

        <Section title="Logo">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={store.logoUrl} alt={`${store.name} logo`} className="h-14 max-w-[9rem] rounded-[2px] bg-[#f1eee8] object-contain p-1.5" />
            <p className="text-xs text-zinc-400">Shown in the store header and on its login screen.</p>
          </div>
          <ImagePicker id="d-logo" label="Replace logo" hint="up to 2 MB" files={logo} onChange={setLogo} onError={(t) => setMsg({ ok: false, text: t })} maxBytes={2 * 1024 * 1024} />
          {logo.length > 0 && <button className={gold} disabled={busy !== null} onClick={async () => { if (await run("logo", () => adminApi.patchMultipart(store.slug, {}, { logo: logo[0] }), "Logo replaced.")) setLogo([]); }}>{busy === "logo" ? <Loader2 size={13} className="animate-spin" /> : null} Save logo</button>}
        </Section>

        <Section title="Access">
          <p className="text-xs text-zinc-400">Setting a new password signs out everyone currently logged in to this store.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className={lab} htmlFor="d-pw">New password</label><input id="d-pw" type="password" autoComplete="new-password" className={input} value={pw} onChange={(e) => setPw(e.target.value)} /></div>
            <div><label className={lab} htmlFor="d-pw2">Confirm</label><input id="d-pw2" type="password" autoComplete="new-password" className={input} value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
          </div>
          <button className={gold} disabled={busy !== null || !pw} onClick={async () => { if (await run("pw", () => adminApi.patch(store.slug, { password: pw, confirmPassword: pw2 }), "Password updated. Existing sessions were signed out.")) { setPw(""); setPw2(""); } }}>Update password</button>
        </Section>

        <Section title={`Products · ${store.readyCount} of ${store.productCount} ready to sell`}>
          <p className="text-xs text-zinc-400">A product is ready once it has a name, a price and at least one size (and isn’t marked out of stock). Nothing is filled in for you.</p>
          <ul className="space-y-3">
            {store.products.map((p, i) => (
              <ProductRow key={p.id} p={p} i={i} total={store.products.length} slug={store.slug} ids={store.products.map((x) => x.id)} busy={busy} run={run} />
            ))}
          </ul>
          <ImagePicker id="d-more" label="Add product images" hint="each image becomes a draft product" multiple files={more} onChange={setMore} onError={(t) => setMsg({ ok: false, text: t })} maxBytes={8 * 1024 * 1024} />
          {more.length > 0 && <button className={gold} disabled={busy !== null} onClick={async () => { if (await run("add", () => adminApi.patchMultipart(store.slug, {}, { addProducts: more }), `${more.length} product${more.length > 1 ? "s" : ""} added.`)) setMore([]); }}>Add {more.length} product{more.length > 1 ? "s" : ""}</button>}
        </Section>
      </div>
    </aside>
  );
}

function ProductRow({ p, i, total, slug, ids, busy, run }: {
  p: ClientProduct; i: number; total: number; slug: string; ids: string[]; busy: string | null;
  run: (k: string, fn: () => Promise<{ store: AdminStoreSummary }>, ok: string) => Promise<boolean>;
}) {
  const [f, setF] = useState({ name: p.name ?? "", price: p.price ? String(p.price) : "", sizes: p.sizes.join(", "), category: (p as any).category ?? p.categoryId ?? "", stock: p.stock });
  const dirty = f.name !== (p.name ?? "") || f.price !== (p.price ? String(p.price) : "") || f.sizes !== p.sizes.join(", ") || f.category !== ((p as any).category ?? p.categoryId ?? "") || f.stock !== p.stock;
  const priceNum = f.price.trim() === "" ? null : Number(f.price);
  const move = (d: -1 | 1) => { const n = [...ids]; const j = i + d; [n[i], n[j]] = [n[j], n[i]]; run("order", () => adminApi.patch(slug, { reorderProductIds: n }), "Order updated."); };

  return (
    <li className="rounded-[3px] border border-white/10 bg-white/[0.03] p-3">
      <div className="flex gap-3">
        <div className="w-20 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.imageUrls[0]} alt="" className="aspect-[3/4] w-20 rounded-[2px] bg-[#f1eee8] object-contain" />
          <div className="mt-1 flex justify-between">
            <button aria-label="Move earlier" disabled={i === 0 || busy !== null} onClick={() => move(-1)} className="rounded p-1 text-zinc-400 hover:text-white disabled:opacity-30"><ArrowUp size={13} /></button>
            <button aria-label="Move later" disabled={i === total - 1 || busy !== null} onClick={() => move(1)} className="rounded p-1 text-zinc-400 hover:text-white disabled:opacity-30"><ArrowDown size={13} /></button>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${p.ready ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
            {p.ready ? "Ready to sell" : `Needs: ${p.missing.join(", ")}`}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2"><label className={lab} htmlFor={`n-${p.id}`}>Name</label><input id={`n-${p.id}`} className={input} value={f.name} maxLength={120} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div><label className={lab} htmlFor={`p-${p.id}`}>Price (₹)</label><input id={`p-${p.id}`} inputMode="numeric" className={input} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/[^\d]/g, "") })} /></div>
            <div><label className={lab} htmlFor={`s-${p.id}`}>Stock</label>
              <select id={`s-${p.id}`} className={input} value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value as ClientProduct["stock"] })}>
                <option value="unknown">Not set</option><option value="in_stock">In stock</option><option value="out_of_stock">Out of stock</option></select></div>
            <div className="col-span-2"><label className={lab} htmlFor={`z-${p.id}`}>Sizes (comma separated)</label><input id={`z-${p.id}`} className={input} placeholder="e.g. 28, 30, 32" value={f.sizes} onChange={(e) => setF({ ...f, sizes: e.target.value })} /></div>
            <div className="col-span-2"><label className={lab} htmlFor={`c-${p.id}`}>Category</label><input id={`c-${p.id}`} className={input} placeholder="e.g. Jeans" value={f.category} maxLength={40} onChange={(e) => setF({ ...f, category: e.target.value })} /></div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button className={gold} disabled={!dirty || busy !== null} onClick={() => run(`p-${p.id}`, () => adminApi.patch(slug, { productPatches: { [p.id]: {
              name: f.name.trim() || null, price: priceNum && priceNum > 0 ? priceNum : null,
              sizes: f.sizes.split(",").map((s) => s.trim()).filter(Boolean), category: f.category.trim() || null, stock: f.stock } } }), "Product saved.")}>Save</button>
            <button className={`${btn} text-red-300 hover:!border-red-400`} disabled={busy !== null} onClick={() => { if (confirm("Remove this product and its images?")) run(`rm-${p.id}`, () => adminApi.patch(slug, { removeProductIds: [p.id] }), "Product removed."); }}><Trash2 size={12} /> Remove</button>
          </div>
        </div>
      </div>
    </li>
  );
}
