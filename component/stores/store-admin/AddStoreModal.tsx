"use client";

import React, { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2, X, ExternalLink } from "lucide-react";
import type { AdminStoreSummary } from "@/lib/stores/types";
import { adminApi, ApiError } from "./api";
import ImagePicker from "./ImagePicker";

const inputCls = "w-full rounded-[2px] border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus-visible:border-[#c5a059] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#c5a059]";
const labelCls = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300";

export default function AddStoreModal({ onClose, onCreated, onManage }: {
  onClose: () => void; onCreated: (s: AdminStoreSummary) => void; onManage: (slug: string) => void;
}) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<File[]>([]);
  const [products, setProducts] = useState<File[]>([]);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [created, setCreated] = useState<AdminStoreSummary | null>(null);

  const addErr = (m: string) => setErrors((e) => (e.includes(m) ? e : [...e, m]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const local: string[] = [];
    if (!name.trim()) local.push("Store name is required.");
    if (!logo.length) local.push("Brand logo is required.");
    if (!products.length) local.push("Upload at least one product image.");
    if (pw.length < 8) local.push("Password must be at least 8 characters.");
    else if (pw !== pw2) local.push("Passwords do not match.");
    if (local.length) { setErrors(local); return; }

    setBusy(true); setErrors([]);
    try {
      const f = new FormData();
      f.set("name", name.trim());
      f.set("logo", logo[0]);
      products.forEach((p) => f.append("products", p));
      f.set("password", pw); f.set("confirmPassword", pw2);
      const { store } = await adminApi.create(f);
      setCreated(store); onCreated(store);
    } catch (err) {
      setErrors([err instanceof ApiError ? err.message : "Could not create the store. Nothing was saved."]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-labelledby="add-title">
      <div className="w-full max-w-2xl rounded-[4px] border border-white/10 bg-[#0e0f13] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 id="add-title" className="font-serif text-2xl text-white">{created ? "Store created" : "Add a store"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-2 text-zinc-400 hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>

        {created ? (
          <div className="space-y-5 p-6">
            <div className="flex items-start gap-3 text-emerald-300"><CheckCircle2 className="mt-0.5 shrink-0" size={20} />
              <p className="text-sm text-zinc-200"><strong className="text-white">{created.name}</strong> is live and password-protected. It uses the RBW storefront design with its own logo and {created.productCount} product {created.productCount === 1 ? "image" : "images"}.</p>
            </div>
            <dl className="space-y-2 rounded-[3px] border border-white/10 bg-white/[0.03] p-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-zinc-400">URL</dt><dd className="font-mono text-zinc-100">{created.url}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-zinc-400">Folder</dt><dd className="font-mono text-zinc-100">{created.folder}</dd></div>
            </dl>
            <p className="text-xs text-zinc-400">Products start as drafts. Add names, prices and sizes in <em>Manage</em> to make them ready to sell.</p>
            <div className="flex flex-wrap gap-3">
              <a href={created.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[2px] bg-[#cfaa66] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#15110a] hover:bg-[#e0c183]">Open store <ExternalLink size={14} /></a>
              <button type="button" onClick={() => onManage(created.slug)} className="rounded-[2px] border border-white/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:border-[#c5a059]">Manage</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6 p-5 sm:p-6" noValidate>
            <div>
              <label htmlFor="store-name" className={labelCls}>Store name</label>
              <input id="store-name" className={inputCls} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="e.g. THINC" autoComplete="off" />
              {name.trim() && <p className="mt-1.5 text-[11px] text-zinc-500">URL will be generated from the name.</p>}
            </div>

            <ImagePicker id="store-logo" label="Brand logo" hint="PNG, JPG, WebP or SVG · up to 2 MB" files={logo} onChange={setLogo} onError={addErr} maxBytes={2 * 1024 * 1024} />
            <ImagePicker id="store-products" label="Product images" hint="Up to 30 · 8 MB each · first image shows first" multiple files={products} onChange={setProducts} onError={addErr} maxBytes={8 * 1024 * 1024} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="store-pw" className={labelCls}>Store password</label>
                <div className="relative">
                  <input id="store-pw" type={show ? "text" : "password"} className={`${inputCls} pr-10`} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" placeholder="Min. 8 characters" />
                  <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide passwords" : "Show passwords"} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div>
                <label htmlFor="store-pw2" className={labelCls}>Confirm password</label>
                <input id="store-pw2" type={show ? "text" : "password"} className={inputCls} value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
              </div>
            </div>

            {errors.length > 0 && (
              <ul role="alert" className="space-y-1 rounded-[3px] border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                {errors.map((m) => <li key={m}>{m}</li>)}
              </ul>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button type="button" onClick={onClose} disabled={busy} className="rounded-[2px] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 hover:text-white">Cancel</button>
              <button type="submit" disabled={busy} className="inline-flex min-w-[9rem] items-center justify-center gap-2 rounded-[2px] bg-[#cfaa66] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#15110a] hover:bg-[#e0c183] disabled:opacity-60">
                {busy ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : "Create store"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
