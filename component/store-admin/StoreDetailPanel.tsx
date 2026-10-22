"use client";

import React, { useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, ExternalLink, Loader2, Plus, Trash2, X } from "lucide-react";
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

type Run = (k: string, fn: () => Promise<{ store: AdminStoreSummary }>, ok: string) => Promise<boolean>;

export default function StoreDetailPanel({ store, onChange, onClose }: {
  store: AdminStoreSummary; onChange: (s: AdminStoreSummary) => void; onClose: () => void;
}) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState(store.name);
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [logo, setLogo] = useState<File[]>([]);
  const [newCat, setNewCat] = useState(""); const [newCol, setNewCol] = useState({ name: "", hex: "#1f2a44" }); const [newFit, setNewFit] = useState({ category: store.categories[0]?.label ?? "", fit: "" });

  const run: Run = async (key, fn, okText) => {
    setBusy(key); setMsg(null);
    try { const { store: s } = await fn(); onChange(s); setMsg({ ok: true, text: okText }); return true; }
    catch (e) { setMsg({ ok: false, text: e instanceof ApiError ? e.message : "Something went wrong." }); return false; }
    finally { setBusy(null); }
  };
  const active = store.status === "active";
  const catLabel = (id: string) => store.categories.find((c) => c.id === id)?.label ?? id;
  const colName = (id: string) => store.colors.find((c) => c.id === id)?.name ?? id;

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-2xl flex-col border-l border-white/10 bg-[#0e0f13] shadow-2xl" aria-label={`Manage ${store.name}`}>
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
            <label className="text-xs text-zinc-300"><span className={lab}>Logo colours</span>
              <select className={input} value={store.logoMode} disabled={busy !== null} onChange={(e) => run("lm", () => adminApi.patch(store.slug, { logoMode: e.target.value }), "Logo colour setting updated.")}>
                <option value="mono">Match the theme (like RBW)</option><option value="original">Keep original colours</option></select></label>
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

        <Section title="What you sell">
          <div className="space-y-3 text-sm">
            <div><span className={lab}>Categories (shown in the navbar)</span>
              <div className="flex flex-wrap gap-2">{store.categories.map((c) => <span key={c.id} className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-200">{c.label}</span>)}</div>
              <div className="mt-2 flex gap-2"><input aria-label="New category" className={input} maxLength={24} value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Add a category" />
                <button className={btn} disabled={busy !== null || !newCat.trim()} onClick={async () => { if (await run("cat", () => adminApi.patch(store.slug, { addCategories: [newCat.trim()] }), "Category added.")) setNewCat(""); }}><Plus size={13} /> Add</button></div></div>

            <div><span className={lab}>Colours (rotate on the home page)</span>
              <ul className="space-y-2">{store.colors.map((c) => (
                <li key={c.id} className="flex items-center gap-2"><input aria-label={`${c.name} shade`} type="color" defaultValue={c.hex} disabled={busy !== null} className="h-8 w-10 cursor-pointer rounded border border-white/15 bg-transparent p-0.5"
                  onBlur={(e) => { if (e.target.value.toLowerCase() !== c.hex) run(`col-${c.id}`, () => adminApi.patch(store.slug, { colorPatches: { [c.id]: { hex: e.target.value } } }), `${c.name} updated.`); }} />
                  <span className="text-sm text-zinc-200">{c.name}</span></li>))}</ul>
              <div className="mt-2 flex flex-wrap items-end gap-2"><input aria-label="New colour name" className={`${input} flex-1 min-w-[9rem]`} maxLength={24} value={newCol.name} onChange={(e) => setNewCol({ ...newCol, name: e.target.value })} placeholder="Add a colour" />
                <input aria-label="New colour shade" type="color" value={newCol.hex} onChange={(e) => setNewCol({ ...newCol, hex: e.target.value })} className="h-[38px] w-14 cursor-pointer rounded border border-white/15 bg-transparent p-1" />
                <button className={btn} disabled={busy !== null || !newCol.name.trim()} onClick={async () => { if (await run("colr", () => adminApi.patch(store.slug, { addColors: [{ name: newCol.name.trim(), hex: newCol.hex }] }), "Colour added.")) setNewCol({ ...newCol, name: "" }); }}><Plus size={13} /> Add</button></div></div>

            <div><span className={lab}>Fits</span>
              <ul className="space-y-1 text-xs text-zinc-300">{store.categories.map((c) => <li key={c.id}><span className="text-zinc-500">{c.label}:</span> {(store.fits[c.id] || []).join(", ") || "no fits"}</li>)}</ul>
              <div className="mt-2 flex flex-wrap gap-2"><select aria-label="Category for new fit" className={`${input} w-40`} value={newFit.category} onChange={(e) => setNewFit({ ...newFit, category: e.target.value })}>{store.categories.map((c) => <option key={c.id}>{c.label}</option>)}</select>
                <input aria-label="New fit name" className={`${input} flex-1 min-w-[9rem]`} maxLength={24} value={newFit.fit} onChange={(e) => setNewFit({ ...newFit, fit: e.target.value })} placeholder="Add a fit" />
                <button className={btn} disabled={busy !== null || !newFit.fit.trim()} onClick={async () => { if (await run("fit", () => adminApi.patch(store.slug, { addFits: [{ category: newFit.category, fit: newFit.fit.trim() }] }), "Fit added.")) setNewFit({ ...newFit, fit: "" }); }}><Plus size={13} /> Add</button></div></div>
          </div>
        </Section>

        <Section title={`Products · ${store.productCount}`}>
          <ul className="space-y-3">{store.products.map((p) => <ProductRow key={p.id} p={p} slug={store.slug} busy={busy} run={run} title={[catLabel(p.categoryId), colName(p.colorId), p.fit].filter(Boolean).join(" · ")} />)}</ul>
          <AddProduct store={store} busy={busy} run={run} />
        </Section>
      </div>
    </aside>
  );
}

function ProductRow({ p, slug, busy, run, title }: { p: ClientProduct; slug: string; busy: string | null; run: Run; title: string }) {
  const [f, setF] = useState({ name: p.name, price: String(p.price), description: p.description, sizes: p.sizes.join(", "), stock: p.stock });
  const [more, setMore] = useState<File[]>([]);
  const dirty = f.name !== p.name || f.price !== String(p.price) || f.description !== p.description || f.sizes !== p.sizes.join(", ") || f.stock !== p.stock;
  const file = (u: string) => u.split("/").pop()!;

  return (
    <li className="rounded-[3px] border border-white/10 bg-white/[0.03] p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d4b069]">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2"><label className={lab} htmlFor={`n-${p.id}`}>Name</label><input id={`n-${p.id}`} className={input} value={f.name} maxLength={120} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className={lab} htmlFor={`p-${p.id}`}>Price (₹)</label><input id={`p-${p.id}`} inputMode="numeric" className={input} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/[^\d]/g, "") })} /></div>
        <div><label className={lab} htmlFor={`s-${p.id}`}>Stock</label>
          <select id={`s-${p.id}`} className={input} value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value as ClientProduct["stock"] })}><option value="unknown">Not set</option><option value="in_stock">In stock</option><option value="out_of_stock">Out of stock</option></select></div>
        <div className="col-span-2"><label className={lab} htmlFor={`z-${p.id}`}>Sizes</label><input id={`z-${p.id}`} className={input} placeholder="e.g. 28, 30, 32" value={f.sizes} onChange={(e) => setF({ ...f, sizes: e.target.value })} /></div>
        <div className="col-span-2"><label className={lab} htmlFor={`d-${p.id}`}>Description</label><textarea id={`d-${p.id}`} rows={3} className={input} maxLength={2000} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {p.imageUrls.map((u, i) => (
          <div key={u} className="w-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt={`${p.name} photo ${i + 1}`} className="aspect-[3/4] w-20 rounded-[2px] bg-[#f1eee8] object-contain" />
            <div className="mt-0.5 flex justify-between">
              <button aria-label={`Move photo ${i + 1} earlier`} disabled={i === 0 || busy !== null} onClick={() => run("mv", () => adminApi.patch(slug, { moveImage: { productId: p.id, file: file(u), direction: -1 } }), "Photo moved.")} className="rounded p-1 text-zinc-400 hover:text-white disabled:opacity-30"><ArrowUp size={12} /></button>
              <button aria-label={`Move photo ${i + 1} later`} disabled={i === p.imageUrls.length - 1 || busy !== null} onClick={() => run("mv", () => adminApi.patch(slug, { moveImage: { productId: p.id, file: file(u), direction: 1 } }), "Photo moved.")} className="rounded p-1 text-zinc-400 hover:text-white disabled:opacity-30"><ArrowDown size={12} /></button>
              <button aria-label={`Remove photo ${i + 1}`} disabled={p.imageUrls.length <= 1 || busy !== null} onClick={() => run("rmi", () => adminApi.patch(slug, { removeImage: { productId: p.id, file: file(u) } }), "Photo removed.")} className="rounded p-1 text-zinc-400 hover:text-red-300 disabled:opacity-30"><X size={12} /></button>
            </div>
          </div>))}
      </div>
      <div className="mt-2"><ImagePicker id={`m-${p.id}`} label="Add photos" hint={`${p.imageUrls.length}/8`} multiple max={8 - p.imageUrls.length} files={more} onChange={setMore} onError={() => {}} maxBytes={8 * 1024 * 1024} /></div>
      {more.length > 0 && <button className={`${gold} mt-2`} disabled={busy !== null} onClick={async () => { if (await run(`ai-${p.id}`, () => adminApi.patchMultipart(slug, { addImagesToProduct: { productId: p.id } }, { addImages: more }), "Photos added.")) setMore([]); }}>Upload {more.length} photo{more.length > 1 ? "s" : ""}</button>}
      <div className="mt-3 flex items-center gap-2">
        <button className={gold} disabled={!dirty || busy !== null} onClick={() => run(`p-${p.id}`, () => adminApi.patch(slug, { productPatches: { [p.id]: { name: f.name.trim(), price: Number(f.price), description: f.description, sizes: f.sizes.split(",").map((s) => s.trim()).filter(Boolean), stock: f.stock } } }), "Product saved.")}>Save</button>
        <button className={`${btn} text-red-300 hover:!border-red-400`} disabled={busy !== null} onClick={() => { if (confirm("Remove this product and its photos?")) run(`rm-${p.id}`, () => adminApi.patch(slug, { removeProductIds: [p.id] }), "Product removed."); }}><Trash2 size={12} /> Remove</button>
      </div>
    </li>
  );
}

function AddProduct({ store, busy, run }: { store: AdminStoreSummary; busy: string | null; run: Run }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ category: store.categories[0]?.label ?? "", color: store.colors[0]?.name ?? "", fit: "", name: "", price: "", description: "", sizes: "" });
  const [photos, setPhotos] = useState<File[]>([]);
  const [err, setErr] = useState("");
  const cat = store.categories.find((c) => c.label === f.category);
  const fits = (cat && store.fits[cat.id]) || [];

  if (!open) return <button className={btn} onClick={() => setOpen(true)}><Plus size={13} /> Add a product</button>;
  return (
    <div className="space-y-3 rounded-[3px] border border-[#cfaa66]/40 bg-white/[0.03] p-3">
      <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4b069]">New product</h4>
      <div className="grid grid-cols-3 gap-2">
        <div><label className={lab} htmlFor="ap-cat">Category</label><select id="ap-cat" className={input} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value, fit: "" })}>{store.categories.map((c) => <option key={c.id}>{c.label}</option>)}</select></div>
        <div><label className={lab} htmlFor="ap-col">Colour</label><select id="ap-col" className={input} value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })}>{store.colors.map((c) => <option key={c.id}>{c.name}</option>)}</select></div>
        <div><label className={lab} htmlFor="ap-fit">Fit</label><select id="ap-fit" className={input} value={f.fit} disabled={!fits.length} onChange={(e) => setF({ ...f, fit: e.target.value })}><option value="">{fits.length ? "Choose…" : "No fits"}</option>{fits.map((x) => <option key={x}>{x}</option>)}</select></div>
        <div className="col-span-3"><label className={lab} htmlFor="ap-name">Name</label><input id="ap-name" className={input} maxLength={120} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className={lab} htmlFor="ap-price">Price (₹)</label><input id="ap-price" inputMode="numeric" className={input} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/[^\d]/g, "") })} /></div>
        <div className="col-span-2"><label className={lab} htmlFor="ap-sizes">Sizes</label><input id="ap-sizes" className={input} placeholder="optional, comma separated" value={f.sizes} onChange={(e) => setF({ ...f, sizes: e.target.value })} /></div>
        <div className="col-span-3"><label className={lab} htmlFor="ap-desc">Description</label><textarea id="ap-desc" rows={3} className={input} maxLength={2000} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      </div>
      <ImagePicker id="ap-photos" label="Photos" hint="up to 8 · first is the cover" multiple max={8} files={photos} onChange={setPhotos} onError={setErr} maxBytes={8 * 1024 * 1024} />
      {err && <p role="alert" className="text-xs text-red-300">{err}</p>}
      <div className="flex gap-2">
        <button className={gold} disabled={busy !== null} onClick={async () => {
          setErr("");
          if (!f.name.trim() || !(Number(f.price) > 0) || !photos.length || (fits.length && !f.fit)) { setErr("Name, price, a photo" + (fits.length ? " and a fit" : "") + " are required."); return; }
          const ok = await run("addp", () => adminApi.patchMultipart(store.slug, { addProduct: { category: f.category, color: f.color, fit: f.fit || null, name: f.name.trim(), price: Number(f.price), description: f.description, sizes: f.sizes.split(",").map((s) => s.trim()).filter(Boolean) } }, { newProductPhotos: photos }), "Product added.");
          if (ok) { setPhotos([]); setF({ ...f, name: "", price: "", description: "", sizes: "" }); setOpen(false); }
        }}>Add product</button>
        <button className={btn} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}
