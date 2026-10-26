"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Search, ShoppingBag, Sun, Moon, ChevronDown } from "lucide-react";
import type { ClientProduct, ClientStoreConfig, PublicStore } from "@/lib/stores/types";
import { useCart } from "@/context/CartContext";
import { RbwWashSelection3D } from "@/component/rbw/3d/RbwWashSelection3D";
import { RbwJourneyBar, RbwJourneyShell } from "@/component/rbw/RbwJourneyShell";
import { RbwFitSelector } from "@/component/rbw/RbwFitSelector";
import { atmosphereFor, buildCarouselItems, colorsForCategory } from "./brandItems";
import ProductStep from "./ProductStep";
import { StoreLogo, useStoreTheme } from "./StoreShell";
import "@/component/rbw/3d/rbw-showroom.css";
import "@/component/rbw/rbw-journey.css";
import "@/component/rbw/rbw-pdp.css";
import "@/component/rbw/rbw-fit.css";
import "./store-front.css";

/**
 * The RBW journey, driven by a brand's own data:
 *   Slide 1  rotating 3D colour carousel (RbwWashSelection3D)
 *   Slide 2  fit selection (RbwFitSelector) — only for categories that have fits
 *   Slide 3  product page (rbw-pdp) with the colour switcher in the top bar
 * Geometry, layering and transitions are RBW's own (same shells, same offsets).
 */
export default function BrandJourney({
  store, config, products, initial,
}: { store: PublicStore; config: ClientStoreConfig; products: ClientProduct[]; initial: { category?: string; color?: string; fit?: string } }) {
  const router = useRouter();
  const [theme, toggleTheme] = useStoreTheme("dark");
  const { cart, setIsOpen: setCartOpen } = useCart();
  const totalCartItems = cart?.lines.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const subtotal = cart?.lines.reduce((acc, item) => {
    const price = parseFloat(item.merchandise.price?.amount || "0");
    return acc + price * item.quantity;
  }, 0) || 0;
  const firstCat = config.categories[0]?.id ?? "";
  const [category, setCategory] = useState<string>(config.categories.some((c) => c.id === initial.category) ? initial.category! : firstCat);
  const [colorId, setColorId] = useState<string | null>(config.colors.some((c) => c.id === initial.color) ? initial.color! : null);
  const [fit, setFit] = useState<string | null>(initial.fit ?? null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const fitsRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState(0);

  const wishKey = `od_wishlist_${store.slug}`;
  useEffect(() => { try { setWishlist(JSON.parse(localStorage.getItem(wishKey) || "[]")); } catch {} }, [wishKey]);
  const toggleWish = (id: string) => setWishlist((w) => {
    const n = w.includes(id) ? w.filter((x) => x !== id) : [...w, id];
    try { localStorage.setItem(wishKey, JSON.stringify(n)); } catch {}
    return n;
  });

  const items = useMemo(() => buildCarouselItems(config, products), [config, products]);
  const catFits = config.fits[category] || [];
  const hasFits = catFits.length > 0;
  const color = config.colors.find((c) => c.id === colorId) ?? null;
  const catLabel = config.categories.find((c) => c.id === category)?.label ?? "";
  const colorsHere = useMemo(() => colorsForCategory(config, products, category), [config, products, category]);

  const find = useCallback((cat: string, col: string, f: string | null) =>
    products.find((p) => p.categoryId === cat && p.colorId === col && (p.fit ?? null) === f), [products]);

  // fits that exist for the chosen colour (RBW shows every fit; a brand may not make every combination)
  const fitsForColor = useMemo(() => (color ? catFits.filter((f) => find(category, color.id, f)) : []), [catFits, color, category, find]);

  // RBW resets each drawer to the top on every step change; do the same so a
  // returning visitor never lands scrolled past the header/back button.
  useEffect(() => {
    if (fitsRef.current) fitsRef.current.scrollTop = 0;
    if (detailRef.current) detailRef.current.scrollTop = 0;
  }, [colorId, fit]);

  const product = color ? (hasFits ? (fit ? find(category, color.id, fit) : undefined) : find(category, color.id, null)) : undefined;
  const fitOpen = !!color && hasFits && !fit;
  const productOpen = !!product;

  /* ---- URL sync (deep links + browser back/forward) ---- */
  const push = (cat: string, col: string | null, f: string | null) => {
    const q = new URLSearchParams();
    if (col) { q.set("category", cat); q.set("color", col); if (f) q.set("fit", f); }
    const qs = q.toString();
    window.history.pushState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
  };
  useEffect(() => {
    const onPop = () => {
      const q = new URLSearchParams(window.location.search);
      const cat = q.get("category"); const col = q.get("color"); const f = q.get("fit");
      if (cat && config.categories.some((c) => c.id === cat)) setCategory(cat);
      setColorId(col && config.colors.some((c) => c.id === col) ? col : null);
      setFit(f);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [config]);

  /* ---- journey handlers ---- */
  const selectColor = (colId: string, cat: string = category) => {
    const fits = config.fits[cat] || [];
    let f: string | null = null;
    if (fits.length && fit && find(cat, colId, fit)) f = fit; // keep the chosen fit when switching colour
    setCategory(cat); setColorId(colId); setFit(f); setEntries((n) => n + 1);
    push(cat, colId, f);
  };
  const selectFit = (name: string) => { setFit(name); push(category, colorId, name); };
  const home = () => { setColorId(null); setFit(null); push(category, null, null); };
  const backToFits = () => { setFit(null); push(category, colorId, null); };
  const pickCategory = (id: string) => { setCategory(id); setColorId(null); setFit(null); push(id, null, null); };
  const logout = async () => { await fetch(`/api/stores/${store.slug}/login`, { method: "DELETE" }).catch(() => {}); router.refresh(); };

  const atm = color ? atmosphereFor(color.hex) : "raw";
  const ghostWord = (s: string) => s.toUpperCase().replace(/[^A-Z0-9 ]/g, "").trim().slice(0, 14);

  return (
    <main
      data-theme={theme}
      className={`rbw-showroom od-store fixed inset-0 z-[9000] w-full h-screen ${theme === "dark" ? "bg-[#07080a]" : "bg-[var(--background)]"} overflow-hidden pt-[75px] md:pt-[85px] xl:pt-[103px] box-border`}
    >
      {/* Brand header — occupies the same slot (and height) as RBW's navbar */}
      <header className="od-head" data-surface={fitOpen ? "light" : undefined} aria-label={`${store.name} navigation`}>
        <div className="od-head__side">
          <a href="/" className="od-textbtn" aria-label="Back to OnlyDenims"><ArrowLeft size={14} strokeWidth={1.5} /><span>OnlyDenims</span></a>
          <nav className="od-cats" aria-label="Categories">
            {config.categories.map((c) => (
              <button key={c.id} type="button" className="od-cat" data-active={c.id === category} aria-pressed={c.id === category} onClick={() => pickCategory(c.id)}>
                {c.label}
              </button>
            ))}
          </nav>
        </div>
        <button type="button" onClick={home} aria-label={`${store.name} home`} className="od-logo-btn"><StoreLogo store={store} theme={fitOpen ? "light" : theme} /></button>
        <div className="od-head__side od-head__side--end flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("OPEN_SEARCH_OVERLAY"))}
            aria-label="Search Products"
            className="p-1.5 rounded-full cursor-pointer flex items-center justify-center text-white/80 hover:text-white"
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-1.5 rounded-full cursor-pointer flex items-center justify-center border border-white/15 bg-white/5 text-[#B9965A]"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Shopping Cart"
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white cursor-pointer select-none"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag size={17} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 font-sans flex items-center justify-center rounded-full bg-[#B9965A] text-white text-[8px] font-bold w-3.5 h-3.5">
                  {totalCartItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-sans text-[11px] font-extrabold">
              ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </button>
        </div>
      </header>

      <div className="w-full h-full relative">
        {/* Slide 1 — rotating colour carousel */}
        <div className={`absolute left-0 w-full h-[100dvh] top-[-75px] md:top-[-85px] xl:top-[-103px] shrink-0 overflow-hidden transition-all duration-500 ${colorId ? "scale-[0.98] brightness-75 filter blur-[0.5px]" : "scale-100 brightness-100"}`}>
          <RbwWashSelection3D
            items={items}
            controlledCategory={category}
            onWashSelect={(washKey, cat) => selectColor(washKey, cat ?? category)}
            theme={theme}
            onToggleTheme={toggleTheme}
            isPaused={!!colorId}
            selectedWash={colorId}
            selectedCategory={category}
          />
        </div>

        {/* Slide 2 — fit (only categories that have fits) */}
        <RbwJourneyShell
          open={fitOpen}
          layerClass="z-50"
          washKey={atm}
          ghostText={ghostWord(color?.name ?? "")}
          receded={!!fit}
          scrollRef={fitsRef}
          theme="light"
        >
          <div className="flex-1 flex flex-col justify-start pt-1 sm:pt-3 pb-4">
            {color && (
              <RbwFitSelector
                key={`${color.id}-${entries}`}
                selectedWash={color.name}
                selectedFit={fit}
                fits={fitsForColor.map((f) => ({ name: f, keySpec: "", description: "" }))}
                sizing={{}}
                hideMeasurements
                heading="SELECT YOUR FIT"
                backLabel="Colours"
                onBack={home}
                washOptions={colorsHere.map((c) => ({ key: c.name, label: c.name }))}
                onWashChange={(name: string) => { const c = colorsHere.find((x) => x.name === name); if (c) selectColor(c.id); }}
                imageFor={(f) => find(category, color.id, f)?.imageUrls[0] ?? ""}
                onFitClick={selectFit}
              />
            )}
          </div>
        </RbwJourneyShell>

        {/* Slide 3 — product */}
        <RbwJourneyShell
          open={productOpen}
          layerClass="z-55"
          washKey={atm}
          ghostText={ghostWord(fit ?? product?.name.split(" ")[0] ?? color?.name ?? "")}
          ghost="soft"
          scrollRef={detailRef}
          theme={theme}
          bar={
            <RbwJourneyBar
              backLabel={hasFits ? "Fits" : "Back"}
              onBack={hasFits ? backToFits : home}
              rightSlot={
                colorsHere.length > 1 ? (
                  <div className="flex items-center bg-white/10 dark:bg-black/40 border border-white/20 dark:border-white/10 rounded-full p-0.5 shadow-xs max-w-[60vw] overflow-x-auto">
                    {colorsHere.map((c) => {
                      const cur = c.id === colorId;
                      const ok = !!find(category, c.id, hasFits ? fit : null);
                      return (
                        <button key={c.id} type="button" disabled={!ok} onClick={() => selectColor(c.id)} title={`Switch to ${c.name}`}
                          className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed ${cur ? "bg-[#B9965A] text-black shadow-xs font-black" : "text-[color:var(--rbw-ink-dim)] hover:text-[color:var(--rbw-ink)] hover:bg-white/10"}`}>
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                ) : undefined
              }
            />
          }
        >
          {product && color && (
            <ProductStep key={product.id} product={product} categoryLabel={catLabel} colorName={color.name} brandName={store.name}
              wished={wishlist.includes(product.id)} onWish={() => toggleWish(product.id)} />
          )}
        </RbwJourneyShell>
      </div>
    </main>
  );
}
