"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, EyeOff, ExternalLink, Loader2, Plus, Trash2, X } from "lucide-react";
import type { AdminStoreSummary } from "@/lib/stores/types";
import { adminApi, ApiError, type DraftProduct } from "./api";
import ImagePicker from "./ImagePicker";

const inputCls = "w-full rounded-[2px] border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus-visible:border-[#c5a059] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#c5a059]";
const labelCls = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300";
const chip = "rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition";
const ghostBtn = "inline-flex items-center gap-2 rounded-[2px] border border-white/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:border-[#c5a059] disabled:opacity-40";
const goldBtn = "inline-flex items-center justify-center gap-2 rounded-[2px] bg-[#cfaa66] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#15110a] hover:bg-[#e0c183] disabled:opacity-50";

const CATEGORY_PRESETS = ["Jeans", "Jackets", "Shorts", "Shirts", "T-Shirts", "Accessories"];
const COLOR_PRESETS = [
  { name: "Raw Indigo", hex: "#1f2a44" }, { name: "Black", hex: "#111111" }, { name: "White", hex: "#f4f2ec" },
  { name: "Washed Grey", hex: "#8a8f98" }, { name: "Ecru", hex: "#efe9dc" }, { name: "Olive", hex: "#5b6140" },
];
const FIT_PRESETS = ["Straight", "Slim", "Baggy", "Bootcut", "Ankle", "Comfort"];
const STEPS = ["Basics", "What you sell", "Colours", "Fits", "Products", "Review"] as const;

let keySeq = 0;
const newDraft = (category = "", color = "", fit = ""): DraftProduct => ({ key: `d${++keySeq}`, category, color, fit, name: "", price: "", description: "", sizes: "", photos: [] });

export default function AddStoreModal({ onClose, onCreated, onManage }: {
  onClose: () => void; onCreated: (s: AdminStoreSummary) => void; onManage: (slug: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<File[]>([]);
  const [logoMode, setLogoMode] = useState<"mono" | "original">("mono");
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState(""); const [show, setShow] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [customCat, setCustomCat] = useState("");
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
  const [newColor, setNewColor] = useState({ name: "", hex: "#1f2a44" });
  const [fits, setFits] = useState<Record<string, string[]>>({});
  const [customFit, setCustomFit] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<DraftProduct[]>([]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [created, setCreated] = useState<AdminStoreSummary | null>(null);

  const addErr = (m: string) => setErrors((e) => (e.includes(m) ? e : [...e, m]));
  const fitsOf = (c: string) => fits[c] || [];

  const toggleCat = (c: string) => {
    const on = categories.some((x) => x.toLowerCase() === c.toLowerCase());
    if (!on) { setCategories([...categories, c]); return; }
    // removing a category also drops its fits and any draft products for it
    setCategories(categories.filter((x) => x.toLowerCase() !== c.toLowerCase()));
    setDrafts((d) => d.filter((x) => x.category.toLowerCase() !== c.toLowerCase()));
    setFits((m) => { const n = { ...m }; delete n[c]; return n; });
  };
  const addCustomCat = () => { const v = customCat.trim(); if (v && !categories.some((x) => x.toLowerCase() === v.toLowerCase())) setCategories([...categories, v]); setCustomCat(""); };
  const addColor = () => {
    const n = newColor.name.trim();
    if (!n) return addErr("Give the colour a name.");
    if (colors.some((c) => c.name.toLowerCase() === n.toLowerCase())) return addErr(`"${n}" is already added.`);
    setColors([...colors, { name: n, hex: newColor.hex }]); setNewColor({ name: "", hex: newColor.hex });
  };
  const toggleFit = (cat: string, f: string) => setFits((m) => {
    const cur = m[cat] || [];
    return { ...m, [cat]: cur.some((x) => x.toLowerCase() === f.toLowerCase()) ? cur.filter((x) => x.toLowerCase() !== f.toLowerCase()) : [...cur, f] };
  });

  /** Every category × colour × fit that still has no product. */
  const missing = useMemo(() => {
    const out: { category: string; color: string; fit: string }[] = [];
    for (const cat of categories) for (const col of colors) for (const f of fitsOf(cat).length ? fitsOf(cat) : [""]) {
      if (!drafts.some((d) => d.category === cat && d.color === col.name && d.fit === f)) out.push({ category: cat, color: col.name, fit: f });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, colors, fits, drafts]);

  const upd = (key: string, patch: Partial<DraftProduct>) => setDrafts((d) => d.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  function validateStep(s: number): string[] {
    const e: string[] = [];
    if (s === 0) {
      if (!name.trim()) e.push("Store name is required.");
      if (!logo.length) e.push("Brand logo is required.");
      if (pw.length < 8) e.push("Password must be at least 8 characters.");
      else if (pw !== pw2) e.push("Passwords do not match.");
    }
    if (s === 1 && !categories.length) e.push("Choose at least one thing you sell.");
    if (s === 2 && !colors.length) e.push("Add at least one colour.");
    if (s === 4) {
      if (!drafts.length) e.push("Add at least one product.");
      drafts.forEach((d, i) => {
        const w = `Product ${i + 1}${d.name ? ` (${d.name})` : ""}`;
        if (!d.name.trim()) e.push(`${w}: name is required.`);
        if (!(Number(d.price) > 0)) e.push(`${w}: enter a price.`);
        if (!d.photos.length) e.push(`${w}: add at least one photo.`);
        if (fitsOf(d.category).length && !d.fit) e.push(`${w}: choose a fit.`);
      });
      const seen = new Set<string>();
      drafts.forEach((d) => { const k = `${d.category}|${d.color}|${d.fit}`; if (seen.has(k)) e.push(`Two products are both ${d.category} / ${d.color}${d.fit ? " / " + d.fit : ""}.`); seen.add(k); });
    }
    return e;
  }
  const next = () => { const e = validateStep(step); setErrors(e); if (!e.length) setStep(step + 1); };

  async function submit() {
    const all = [0, 1, 2, 4].flatMap(validateStep);
    if (all.length) { setErrors(all); return; }
    setBusy(true); setErrors([]);
    try {
      const { store } = await adminApi.create(
        { name: name.trim(), password: pw, confirmPassword: pw2, logoMode, categories, colors, fits },
        logo[0], drafts);
      setCreated(store); onCreated(store);
    } catch (err) {
      setErrors([err instanceof ApiError ? err.message : "Could not create the store. Nothing was saved."]);
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-labelledby="add-title">
      <div className="w-full max-w-3xl rounded-[4px] border border-white/10 bg-[#0e0f13] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div><h2 id="add-title" className="font-serif text-2xl text-white">{created ? "Store created" : "Add a store"}</h2>
            {!created && <p className="mt-0.5 text-xs text-zinc-400">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>}</div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-2 text-zinc-400 hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>
        {!created && <div className="flex gap-1 px-5 pt-3" aria-hidden>{STEPS.map((_, i) => <span key={i} className={`h-1 flex-1 rounded ${i <= step ? "bg-[#cfaa66]" : "bg-white/10"}`} />)}</div>}

        {created ? (
          <div className="space-y-5 p-6">
            <div className="flex items-start gap-3 text-emerald-300"><CheckCircle2 className="mt-0.5 shrink-0" size={20} />
              <p className="text-sm text-zinc-200"><strong className="text-white">{created.name}</strong> is live and password-protected. It runs the RBW storefront with its own logo, {created.categories.length} categor{created.categories.length === 1 ? "y" : "ies"}, {created.colors.length} colour{created.colors.length === 1 ? "" : "s"} and {created.productCount} product{created.productCount === 1 ? "" : "s"}.</p></div>
            <dl className="space-y-2 rounded-[3px] border border-white/10 bg-white/[0.03] p-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-zinc-400">URL</dt><dd className="font-mono text-zinc-100">{created.url}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-zinc-400">Folder</dt><dd className="font-mono text-zinc-100">{created.folder}</dd></div>
            </dl>
            <div className="flex flex-wrap gap-3">
              <a href={created.url} target="_blank" rel="noreferrer" className={goldBtn}>Open store <ExternalLink size={14} /></a>
              <button type="button" onClick={() => onManage(created.slug)} className={ghostBtn}>Manage</button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-5 sm:p-6">
            {step === 0 && (<>
              <div><label htmlFor="store-name" className={labelCls}>Store name</label>
                <input id="store-name" className={inputCls} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="e.g. THINC" autoComplete="off" />
                {name.trim() && <p className="mt-1.5 text-[11px] text-zinc-500">The store URL is generated from the name.</p>}</div>
              <ImagePicker id="store-logo" label="Brand logo" hint="PNG, JPG, WebP or SVG · up to 2 MB" files={logo} onChange={setLogo} onError={addErr} maxBytes={2 * 1024 * 1024} />
              <fieldset><legend className={labelCls}>Logo colours</legend>
                <div className="flex flex-wrap gap-2">
                  {([["mono", "Match the theme (white on dark, black on light — like RBW)"], ["original", "Keep my logo's own colours"]] as const).map(([v, t]) => (
                    <label key={v} className={`${chip} cursor-pointer ${logoMode === v ? "border-[#cfaa66] bg-[#cfaa66]/15 text-[#f1dba7]" : "border-white/15 text-zinc-300"}`}>
                      <input type="radio" name="logomode" className="sr-only" checked={logoMode === v} onChange={() => setLogoMode(v)} />{t}</label>))}
                </div></fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="store-pw" className={labelCls}>Store password</label>
                  <div className="relative"><input id="store-pw" type={show ? "text" : "password"} className={`${inputCls} pr-10`} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" placeholder="Min. 8 characters" />
                    <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide passwords" : "Show passwords"} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
                <div><label htmlFor="store-pw2" className={labelCls}>Confirm password</label>
                  <input id="store-pw2" type={show ? "text" : "password"} className={inputCls} value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></div>
              </div>
            </>)}

            {step === 1 && (<div className="space-y-4">
              <p className="text-sm text-zinc-300">What are you going to sell? Each one appears in your store&apos;s navigation bar.</p>
              <div className="flex flex-wrap gap-2">
                {[...new Set([...CATEGORY_PRESETS, ...categories])].map((c) => { const on = categories.some((x) => x.toLowerCase() === c.toLowerCase());
                  return <button key={c} type="button" aria-pressed={on} onClick={() => toggleCat(c)} className={`${chip} ${on ? "border-[#cfaa66] bg-[#cfaa66]/15 text-[#f1dba7]" : "border-white/15 text-zinc-300 hover:border-white/40"}`}>{c}</button>; })}
              </div>
              <div className="flex gap-2"><input aria-label="Other category" className={inputCls} value={customCat} maxLength={24} onChange={(e) => setCustomCat(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomCat(); } }} placeholder="Something else, e.g. Hoodies" />
                <button type="button" className={ghostBtn} onClick={addCustomCat}><Plus size={14} /> Add</button></div>
            </div>)}

            {step === 2 && (<div className="space-y-4">
              <p className="text-sm text-zinc-300">Which colours will you sell? These rotate on your store&apos;s home page, just like RBW&apos;s washes.</p>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.filter((p) => !colors.some((c) => c.name.toLowerCase() === p.name.toLowerCase())).map((p) => (
                  <button key={p.name} type="button" onClick={() => setColors([...colors, p])} className={`${chip} flex items-center gap-2 border-white/15 text-zinc-300 hover:border-white/40`}><span className="h-3 w-3 rounded-full border border-white/30" style={{ background: p.hex }} />{p.name}</button>))}
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex-1 min-w-[10rem]"><label htmlFor="c-name" className={labelCls}>Colour name</label><input id="c-name" className={inputCls} value={newColor.name} maxLength={24} onChange={(e) => setNewColor({ ...newColor, name: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }} placeholder="e.g. Midnight Blue" /></div>
                <div><label htmlFor="c-hex" className={labelCls}>Shade</label><input id="c-hex" type="color" value={newColor.hex} onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })} className="h-[42px] w-16 cursor-pointer rounded-[2px] border border-white/15 bg-transparent p-1" /></div>
                <button type="button" className={ghostBtn} onClick={addColor}><Plus size={14} /> Add colour</button>
              </div>
              {colors.length > 0 && <ul className="flex flex-wrap gap-2">{colors.map((c) => (
                <li key={c.name} className={`${chip} flex items-center gap-2 border-[#cfaa66] bg-[#cfaa66]/10 text-[#f1dba7]`}><span className="h-3.5 w-3.5 rounded-full border border-white/30" style={{ background: c.hex }} />{c.name}
                  <button type="button" aria-label={`Remove ${c.name}`} onClick={() => { setColors(colors.filter((x) => x.name !== c.name)); setDrafts((d) => d.filter((x) => x.color !== c.name)); }} className="text-zinc-400 hover:text-white"><X size={12} /></button></li>))}</ul>}
            </div>)}

            {step === 3 && (<div className="space-y-5">
              <p className="text-sm text-zinc-300">Which fits will you sell? Add fits for the categories that have them (e.g. jeans). Skip a category if it has no fits — its colour goes straight to the product page.</p>
              {categories.map((cat) => (
                <div key={cat} className="rounded-[3px] border border-white/10 bg-white/[0.03] p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#d4b069]">{cat} fits <span className="font-normal normal-case tracking-normal text-zinc-500">(optional)</span></h3>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set([...(cat.toLowerCase() === "jeans" ? FIT_PRESETS : []), ...fitsOf(cat)])].map((f) => { const on = fitsOf(cat).some((x) => x.toLowerCase() === f.toLowerCase());
                      return <button key={f} type="button" aria-pressed={on} onClick={() => toggleFit(cat, f)} className={`${chip} ${on ? "border-[#cfaa66] bg-[#cfaa66]/15 text-[#f1dba7]" : "border-white/15 text-zinc-300 hover:border-white/40"}`}>{f}</button>; })}
                  </div>
                  <div className="mt-3 flex gap-2"><input aria-label={`Add a ${cat} fit`} className={inputCls} maxLength={24} value={customFit[cat] || ""} placeholder="Add a fit, e.g. Wide Leg"
                    onChange={(e) => setCustomFit({ ...customFit, [cat]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = (customFit[cat] || "").trim(); if (v && !fitsOf(cat).some((x) => x.toLowerCase() === v.toLowerCase())) toggleFit(cat, v); setCustomFit({ ...customFit, [cat]: "" }); } }} />
                    <button type="button" className={ghostBtn} onClick={() => { const v = (customFit[cat] || "").trim(); if (v && !fitsOf(cat).some((x) => x.toLowerCase() === v.toLowerCase())) toggleFit(cat, v); setCustomFit({ ...customFit, [cat]: "" }); }}><Plus size={14} /> Add</button></div>
                </div>))}
            </div>)}

            {step === 4 && (<div className="space-y-5">
              <p className="text-sm text-zinc-300">Add each product: a name, price, description and as many photos as you like. One product per {categories.length > 1 ? "category" : "category"} / colour{categories.some((c) => fitsOf(c).length) ? " / fit" : ""}.</p>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={ghostBtn} disabled={!missing.length} onClick={() => setDrafts([...drafts, ...missing.map((m) => newDraft(m.category, m.color, m.fit))])}><Plus size={14} /> Add all {missing.length || ""} combinations</button>
                <span className="text-xs text-zinc-500">…or add the ones you sell one by one:</span>
              </div>
              {missing.length > 0 && <div className="flex flex-wrap gap-1.5">{missing.slice(0, 24).map((m) => (
                <button key={`${m.category}${m.color}${m.fit}`} type="button" onClick={() => setDrafts([...drafts, newDraft(m.category, m.color, m.fit)])} className={`${chip} border-white/15 text-[11px] text-zinc-300 hover:border-[#cfaa66]`}>+ {[m.category, m.color, m.fit].filter(Boolean).join(" · ")}</button>))}</div>}

              <ul className="space-y-4">
                {drafts.map((d, i) => (
                  <li key={d.key} className="rounded-[3px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d4b069]">{i + 1}. {[d.category, d.color, d.fit].filter(Boolean).join(" · ")}</p>
                      <button type="button" aria-label={`Remove product ${i + 1}`} onClick={() => setDrafts(drafts.filter((x) => x.key !== d.key))} className="rounded p-1.5 text-zinc-400 hover:bg-red-500/20 hover:text-red-300"><Trash2 size={14} /></button></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2"><label className={labelCls} htmlFor={`pn-${d.key}`}>Product name</label><input id={`pn-${d.key}`} className={inputCls} maxLength={120} value={d.name} onChange={(e) => upd(d.key, { name: e.target.value })} placeholder="e.g. Raw Straight Denim" /></div>
                      <div><label className={labelCls} htmlFor={`pp-${d.key}`}>Price (₹)</label><input id={`pp-${d.key}`} inputMode="numeric" className={inputCls} value={d.price} onChange={(e) => upd(d.key, { price: e.target.value.replace(/[^\d]/g, "") })} placeholder="1900" /></div>
                      <div><label className={labelCls} htmlFor={`ps-${d.key}`}>Sizes <span className="font-normal normal-case text-zinc-500">(optional, comma separated)</span></label><input id={`ps-${d.key}`} className={inputCls} value={d.sizes} onChange={(e) => upd(d.key, { sizes: e.target.value })} placeholder="28, 30, 32" /></div>
                      <div className="sm:col-span-2"><label className={labelCls} htmlFor={`pd-${d.key}`}>Description</label><textarea id={`pd-${d.key}`} rows={3} maxLength={2000} className={inputCls} value={d.description} onChange={(e) => upd(d.key, { description: e.target.value })} placeholder="Fabric, fit, care…" /></div>
                      <div className="sm:col-span-2"><ImagePicker id={`pf-${d.key}`} label="Photos" hint="up to 8 · first photo is the cover" multiple max={8} files={d.photos} onChange={(f) => upd(d.key, { photos: f })} onError={addErr} maxBytes={8 * 1024 * 1024} /></div>
                    </div>
                  </li>))}
              </ul>
              {!drafts.length && <p className="rounded-[3px] border border-dashed border-white/15 p-6 text-center text-sm text-zinc-400">No products yet. Use the buttons above to add some.</p>}
            </div>)}

            {step === 5 && (<div className="space-y-4 text-sm text-zinc-300">
              <dl className="space-y-2 rounded-[3px] border border-white/10 bg-white/[0.03] p-4">
                {[["Store", name], ["Sells", categories.join(", ")], ["Colours", colors.map((c) => c.name).join(", ")],
                  ["Fits", categories.filter((c) => fitsOf(c).length).map((c) => `${c}: ${fitsOf(c).join(", ")}`).join(" · ") || "None"],
                  ["Products", `${drafts.length} (${drafts.reduce((n, d) => n + d.photos.length, 0)} photos)`]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6"><dt className="text-zinc-500">{k}</dt><dd className="text-right text-zinc-100">{v}</dd></div>))}
              </dl>
              <p className="text-xs text-zinc-500">Creating the store saves everything at once. If anything fails, nothing is saved.</p>
            </div>)}

            {errors.length > 0 && <ul role="alert" className="space-y-1 rounded-[3px] border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{errors.map((m) => <li key={m}>{m}</li>)}</ul>}

            <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <button type="button" onClick={() => { setErrors([]); step === 0 ? onClose() : setStep(step - 1); }} disabled={busy} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 hover:text-white"><ChevronLeft size={14} />{step === 0 ? "Cancel" : "Back"}</button>
              {step < STEPS.length - 1
                ? <button type="button" onClick={next} className={goldBtn}>Next <ChevronRight size={14} /></button>
                : <button type="button" onClick={submit} disabled={busy} className={`${goldBtn} min-w-[9rem]`}>{busy ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : "Create store"}</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
