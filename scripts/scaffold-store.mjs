import fs from 'fs/promises';
import path from 'path';

const slug = process.argv[2] || 'second-army';
const storeName = process.argv[3] || 'Second army';

const projectRoot = path.resolve('c:/Users/princ/Downloads/frontend-rbw-cinematic/frontend');
const compDir = path.join(projectRoot, 'component', slug);
const comp3dDir = path.join(compDir, '3d');
const pageDir = path.join(projectRoot, 'app', 'stores', slug);
const rbw3dDir = path.join(projectRoot, 'component', 'rbw', '3d');

console.log(`Scaffolding dedicated store for "${storeName}" (slug: ${slug})...`);

await fs.mkdir(comp3dDir, { recursive: true });
await fs.mkdir(pageDir, { recursive: true });

// Copy 3D files
const rbwFiles = await fs.readdir(rbw3dDir);
for (const file of rbwFiles) {
  const src = path.join(rbw3dDir, file);
  const dest = path.join(comp3dDir, file);
  try {
    let content = await fs.readFile(src, 'utf8');
    content = content.replace(/@\/component\/rbw\/3d\//g, `@/component/${slug}/3d/`);
    content = content.replace(/@\/component\/rbw\//g, `@/component/${slug}/`);
    await fs.writeFile(dest, content, 'utf8');
  } catch (e) {
    console.warn(`Warning copying ${file}:`, e);
  }
}

// brand.css
const brandCss = `/* ==========================================================================
   ${storeName} (${slug}) — Dedicated Scoped Styles
   Modify brand colors, typography, and logo sizes specifically for this store.
   ========================================================================== */

.${slug}-store {
  --brand-accent: #5A6E3E; /* Tactical olive accent for Second Army */
  --brand-accent-glow: rgba(90, 110, 62, 0.25);
  --brand-bg-dark: #07080a;
  --brand-bg-light: #ecece4;
}

/* Header & Navbar */
.${slug}-store .brand-head {
  position: absolute;
  inset: 0 0 auto 0;
  z-index: 70;
  height: 75px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 clamp(16px, 3vw, 40px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(7, 8, 10, 0.88);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}
@media (min-width: 768px) { .${slug}-store .brand-head { height: 85px; } }
@media (min-width: 1280px) { .${slug}-store .brand-head { height: 103px; } }

/* Brand Logo in Header */
.${slug}-store .brand-logo {
  display: block;
  max-height: 48px;
  max-width: min(240px, 45vw);
  width: auto;
  height: auto;
  object-fit: contain;
  transition: transform 250ms ease;
}
.${slug}-store .brand-logo:hover {
  transform: scale(1.03);
}
@media (max-width: 767px) {
  .${slug}-store .brand-logo {
    max-height: 36px;
    max-width: 38vw;
  }
}

/* Category Filter Pills */
.${slug}-store .brand-cat-btn {
  height: 34px;
  padding: 0 14px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #e5e5e5;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 250ms ease;
}
.${slug}-store .brand-cat-btn:hover {
  border-color: var(--brand-accent);
  color: #fff;
}
.${slug}-store .brand-cat-btn[data-active="true"] {
  background: var(--brand-accent);
  border-color: var(--brand-accent);
  color: #fff;
}
`;
await fs.writeFile(path.join(compDir, 'brand.css'), brandCss, 'utf8');

// Navbar.tsx
const navbarTsx = `"use client";

import React from "react";
import { ArrowLeft, LogOut, Sun, Moon } from "lucide-react";
import type { PublicStore, StoreCategory } from "@/lib/stores/types";

interface BrandNavbarProps {
  store: PublicStore;
  categories: StoreCategory[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onHomeClick: () => void;
  onLogout: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

/**
 * Dedicated Brand Header / Navbar for ${storeName}
 * Customize your logo, links, and layout directly here.
 */
export function BrandNavbar({
  store,
  categories,
  activeCategory,
  onSelectCategory,
  onHomeClick,
  onLogout,
  theme,
  onToggleTheme,
}: BrandNavbarProps) {
  const filter =
    store.logoMode === "original"
      ? "none"
      : theme === "dark"
      ? "brightness(0) invert(1)"
      : "brightness(0)";

  return (
    <header className="brand-head" aria-label="${storeName} navigation">
      {/* Left: Back to Main Mall & Category Pills */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm transition-all shrink-0"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          <span className="hidden sm:inline">OnlyDenims</span>
        </a>

        <nav className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className="brand-cat-btn"
              data-active={c.id === activeCategory}
              onClick={() => onSelectCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Center: Brand Logo */}
      <button
        type="button"
        onClick={onHomeClick}
        aria-label="${storeName} home"
        className="cursor-pointer bg-transparent border-0 p-1 flex items-center justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={store.logoUrl}
          alt={store.name}
          className="brand-logo"
          style={{ filter }}
        />
      </button>

      {/* Right: Theme Switcher & Logout */}
      <div className="flex items-center justify-end gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 inline-flex items-center justify-center rounded-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button
          type="button"
          onClick={onLogout}
          aria-label="Log out"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm transition-all cursor-pointer"
        >
          <LogOut size={13} strokeWidth={1.75} />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
}

export default BrandNavbar;
`;
await fs.writeFile(path.join(compDir, 'Navbar.tsx'), navbarTsx, 'utf8');

// PDP.tsx
const pdpTsx = `"use client";

import React, { useRef, useState } from "react";
import { Heart, X, ZoomIn, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import type { ClientProduct } from "@/lib/stores/types";
import { fmtPrice } from "@/component/store-front/brandItems";
import "@/component/rbw/rbw-pdp.css";

interface PDPProps {
  product: ClientProduct;
  categoryLabel: string;
  colorName: string;
  brandName: string;
  wished?: boolean;
  onWish?: () => void;
  onBackToFits?: () => void;
}

/**
 * Dedicated Product Detail Page (PDP) for ${storeName}
 * Edit product layout, gallery, buy buttons, or specifications here.
 */
export function PDP({
  product,
  categoryLabel,
  colorName,
  brandName,
  wished = false,
  onWish,
  onBackToFits,
}: PDPProps) {
  const [img, setImg] = useState(0);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const frame = useRef<HTMLDivElement>(null);
  const images = product.imageUrls;

  const onMove = (e: React.MouseEvent) => {
    if (!zoom || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    setOrigin(\`\${((e.clientX - r.left) / r.width) * 100}% \${((e.clientY - r.top) / r.height) * 100}%\`);
  };

  return (
    <div className="rbw-pdp w-[90%] max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-16">
      {/* Left: Product Images Gallery */}
      <div className="w-full lg:col-span-6 lg:sticky lg:top-6 flex flex-col items-center lg:items-start">
        <div className="w-full flex flex-col-reverse sm:flex-row items-center sm:items-start justify-center lg:justify-start gap-4">
          {images.length > 1 && (
            <div className="rbw-j-thumbs flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 max-w-full">
              {images.map((u, i) => (
                <button
                  key={u}
                  type="button"
                  className="rbw-j-thumb"
                  data-on={img === i}
                  aria-label={\`View photo \${i + 1}\`}
                  onClick={() => { setImg(i); setZoom(false); }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" />
                </button>
              ))}
            </div>
          )}

          <div
            ref={frame}
            className="rbw-j-frame"
            onMouseMove={onMove}
            style={{ cursor: zoom ? "zoom-out" : "zoom-in" }}
            onClick={() => setZoom((z) => !z)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={images[img]}
              src={images[img]}
              alt={product.name}
              className="rbw-fade w-full h-full object-contain object-center pointer-events-none"
              style={{
                transform: zoom ? "scale(2)" : "none",
                transformOrigin: origin,
                transition: "transform 250ms cubic-bezier(0.25,1,0.5,1)",
              }}
            />
            <button
              type="button"
              className="rbw-glass-btn absolute bottom-3 left-3 z-20 w-10 h-10 rounded-full !text-[color:var(--rbw-ink)]"
              aria-label={zoom ? "Zoom out" : "Zoom photo"}
              onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}
            >
              {zoom ? <X className="w-4 h-4" strokeWidth={1.5} /> : <ZoomIn className="w-4 h-4" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {images.length > 1 && (
          <p className="rbw-j-counter mt-4 text-center sm:text-left w-full sm:pl-20 lg:pl-24">
            <b>{String(img + 1).padStart(2, "0")}</b> / {String(images.length).padStart(2, "0")}
          </p>
        )}
      </div>

      {/* Right: Product Details & Purchase Form */}
      <div className="w-full lg:col-span-6 flex flex-col text-left justify-start">
        <p className="rbw-eyebrow">
          {[brandName, categoryLabel, colorName].filter(Boolean).join(" · ")}
        </p>

        <h1 className="rbw-j-title mt-2">{product.name}</h1>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          {product.price ? (
            <span className="rbw-j-price">{fmtPrice(product.price)}</span>
          ) : (
            <span className="rbw-j-note">Price on request</span>
          )}
        </div>

        {product.stock !== "unknown" && (
          <div className="mt-3">
            <span className="rbw-j-status" data-low={product.stock === "out_of_stock"}>
              {product.stock === "in_stock" ? "In stock · Ready to ship" : "Currently out of stock"}
            </span>
          </div>
        )}

        <span className="rbw-j-rule my-6" />

        {/* Sizes */}
        {product.sizes.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="rbw-j-label">Select Size</span>
            </div>
            <div className="rbw-j-sizes grid grid-cols-4 sm:grid-cols-6 gap-2" role="group" aria-label="Size">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                  className="rbw-j-size"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Stepper */}
        <div className="mt-6 flex items-center justify-between">
          <span className="rbw-j-label">Quantity</span>
          <div className="rbw-j-stepper">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>&minus;</button>
            <span aria-live="polite">{qty}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => setQty(Math.min(10, qty + 1))}>+</button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-6 flex flex-col gap-3">
          <button
            type="button"
            className="rbw-cta rbw-j-cta-block flex items-center justify-center gap-2"
            onClick={() => alert(\`Added \${qty}x \${product.name} (Size \${size || "Standard"}) to bag!\`)}
          >
            <ShoppingBag size={16} />
            <span>Add to Bag · {product.price ? fmtPrice(product.price * qty) : "Buy"}</span>
          </button>

          {onWish && (
            <button
              type="button"
              className="rbw-j-btn flex items-center justify-center gap-2"
              onClick={onWish}
              aria-pressed={wished}
            >
              <Heart className="w-4 h-4" fill={wished ? "currentColor" : "none"} />
              <span>{wished ? "Saved to Wishlist" : "Add to Wishlist"}</span>
            </button>
          )}
        </div>

        {/* Brand Specs */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-[#5A6E3E]" />
            <span>Express domestic delivery across India (2–4 business days)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#5A6E3E]" />
            <span>100% Authentic tactical guarantee directly from ${storeName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDP;
`;
await fs.writeFile(path.join(compDir, 'PDP.tsx'), pdpTsx, 'utf8');

// ShopByFit.tsx
const fitTsx = `"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import "@/component/rbw/rbw-fit.css";
import "@/component/rbw/rbw-journey.css";

interface ShopByFitProps {
  fits: string[];
  selectedFit: string | null;
  onSelectFit: (fit: string) => void;
  onBack: () => void;
  colorName?: string;
}

/**
 * Dedicated Shop By Fit Slide for ${storeName}
 * Edit fits presentation, silhouettes, and sizing cards here.
 */
export function ShopByFit({
  fits,
  selectedFit,
  onSelectFit,
  onBack,
  colorName,
}: ShopByFitProps) {
  return (
    <div className="flex-1 flex flex-col justify-start pt-3 sm:pt-6 pb-8 px-4 sm:px-8 max-w-[1400px] mx-auto w-full">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase text-zinc-800 bg-white hover:bg-zinc-100 border border-zinc-300 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft size={13} className="text-[#5A6E3E]" />
          <span>Colors</span>
        </button>

        <div className="text-center">
          <h2 className="rbw-fit__heading">SELECT YOUR FIT</h2>
          <span className="rbw-fit__heading-accent" />
        </div>

        <div className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">
          {colorName || "All Shades"}
        </div>
      </div>

      {/* Fits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {fits.map((fitName, idx) => (
          <div
            key={fitName}
            onClick={() => onSelectFit(fitName)}
            className="rbw-fit__card group cursor-pointer border border-zinc-200 hover:border-[#5A6E3E] rounded-lg p-5 bg-white/90 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-zinc-400">
              <span>{String(idx + 1).padStart(2, "0")}</span>
              <span className="text-[#5A6E3E] group-hover:translate-x-1 transition-transform">Explore →</span>
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#5A6E3E] transition-colors">
              {fitName}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Custom ${storeName} silhouette tailored for tactical utility and comfort.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShopByFit;
`;
await fs.writeFile(path.join(compDir, 'ShopByFit.tsx'), fitTsx, 'utf8');

// StoreFront.tsx
const storeFrontTsx = `"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientProduct, ClientStoreConfig, PublicStore } from "@/lib/stores/types";
import { atmosphereFor, buildCarouselItems, colorsForCategory } from "@/component/store-front/brandItems";
import { RbwWashSelection3D } from "./3d/RbwWashSelection3D";
import { RbwJourneyShell } from "@/component/rbw/RbwJourneyShell";
import Navbar from "./Navbar";
import ShopByFit from "./ShopByFit";
import PDP from "./PDP";
import "./brand.css";
import "@/component/rbw/3d/rbw-showroom.css";
import "@/component/rbw/rbw-journey.css";

interface StoreFrontProps {
  store: PublicStore;
  config: ClientStoreConfig;
  products: ClientProduct[];
  initial?: { category?: string; color?: string; fit?: string };
}

/**
 * Main Dedicated Storefront for ${storeName}
 *
 * It manages the 3 cinematic slides:
 *   Slide 1: 3D Color Carousel & Showroom
 *   Slide 2: Shop by Fit
 *   Slide 3: Product Detail View (PDP)
 *
 * You can freely customize or rearrange components in this folder.
 */
export default function StoreFront({
  store,
  config,
  products,
  initial = {},
}: StoreFrontProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const defaultCategory = config.categories[0]?.id || "jeans";
  const [category, setCategory] = useState<string>(initial.category || defaultCategory);
  const [colorId, setColorId] = useState<string | null>(initial.color || null);
  const [fit, setFit] = useState<string | null>(initial.fit || null);
  const [wished, setWished] = useState(false);

  const colors = useMemo(() => colorsForCategory(config, products, category), [config, products, category]);
  const color = useMemo(() => colors.find((c) => c.id === colorId) ?? null, [colors, colorId]);
  const items = useMemo(() => buildCarouselItems(config, products), [config, products]);

  const fitsRef = useRef<HTMLDivElement>(null);
  const pdpRef = useRef<HTMLDivElement>(null);

  const pushState = useCallback((cat: string, col: string | null, f: string | null) => {
    const sp = new URLSearchParams();
    if (cat) sp.set("category", cat);
    if (col) sp.set("color", col);
    if (f) sp.set("fit", f);
    const qs = sp.toString();
    const url = qs ? \`/stores/\${store.slug}?\${qs}\` : \`/stores/\${store.slug}\`;
    window.history.replaceState(null, "", url);
  }, [store.slug]);

  const selectColor = (cId: string, cat?: string) => {
    const targetCat = cat ?? category;
    setCategory(targetCat);
    setColorId(cId);
    pushState(targetCat, cId, fit);
  };

  const selectFit = (fName: string) => {
    setFit(fName);
    pushState(category, colorId, fName);
  };

  const goHome = () => {
    setColorId(null);
    setFit(null);
    pushState(category, null, null);
  };

  const backToFits = () => {
    setFit(null);
    pushState(category, colorId, null);
  };

  const handleLogout = async () => {
    await fetch(\`/api/stores/\${store.slug}/login\`, { method: "DELETE" }).catch(() => {});
    router.refresh();
  };

  const categoryFits = config.fits[category] || [];
  const fitOpen = Boolean(colorId && !fit && categoryFits.length > 0);
  const pdpOpen = Boolean(colorId && (fit || categoryFits.length === 0));

  const activeProduct = useMemo(() => {
    if (!pdpOpen) return null;
    return products.find((p) => p.categoryId === category && p.colorId === colorId && (!fit || p.fit === fit))
      ?? products.find((p) => p.categoryId === category && p.colorId === colorId)
      ?? products[0];
  }, [pdpOpen, products, category, colorId, fit]);

  const atm = color ? atmosphereFor(color.hex) : "raw";

  return (
    <main
      data-theme={theme}
      className={\`\${store.slug}-store fixed inset-0 z-[9000] w-full h-screen \${
        theme === "dark" ? "bg-[#07080a]" : "bg-[#faf8f5]"
      } overflow-hidden pt-[75px] md:pt-[85px] xl:pt-[103px] box-border\`}
    >
      {/* 1. Dedicated Brand Navbar */}
      <Navbar
        store={store}
        categories={config.categories}
        activeCategory={category}
        onSelectCategory={(catId) => {
          setCategory(catId);
          setColorId(null);
          setFit(null);
          pushState(catId, null, null);
        }}
        onHomeClick={goHome}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="w-full h-full relative">
        {/* Slide 1: 3D Color Carousel & Showroom */}
        <div
          className={\`absolute left-0 w-full h-[100dvh] top-[-75px] md:top-[-85px] xl:top-[-103px] shrink-0 overflow-hidden transition-all duration-500 \${
            colorId ? "scale-[0.98] brightness-75 filter blur-[0.5px]" : "scale-100 brightness-100"
          }\`}
        >
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

        {/* Slide 2: Shop by Fit */}
        <RbwJourneyShell
          open={fitOpen}
          layerClass="z-50"
          washKey={atm}
          ghostText={color?.name || store.name}
          receded={!!fit}
          scrollRef={fitsRef}
          theme="light"
        >
          <ShopByFit
            fits={categoryFits}
            selectedFit={fit}
            onSelectFit={selectFit}
            onBack={goHome}
            colorName={color?.name}
          />
        </RbwJourneyShell>

        {/* Slide 3: Product Detail View (PDP) */}
        <RbwJourneyShell
          open={pdpOpen}
          layerClass="z-55"
          washKey={atm}
          ghostText={fit || color?.name || store.name}
          scrollRef={pdpRef}
          theme="light"
        >
          <div className="flex-1 flex flex-col justify-start">
            {activeProduct && (
              <PDP
                product={activeProduct}
                categoryLabel={config.categories.find((c) => c.id === category)?.label || category}
                colorName={color?.name || "Standard"}
                brandName={store.name}
                wished={wished}
                onWish={() => setWished((w) => !w)}
                onBackToFits={categoryFits.length > 0 ? backToFits : goHome}
              />
            )}
          </div>
        </RbwJourneyShell>
      </div>
    </main>
  );
}
`;
await fs.writeFile(path.join(compDir, 'StoreFront.tsx'), storeFrontTsx, 'utf8');

// page.tsx in app/stores/<slug>/page.tsx
const pageTsx = `import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import StoreLoginGate from "@/component/store-front/StoreLoginGate";
import { activeStoreName, loadStorefront } from "@/lib/stores/storefront";
import { storeCookieName } from "@/lib/stores/session";
import StoreFront from "@/component/${slug}/StoreFront";

export const dynamic = "force-dynamic";

type SP = Promise<{ [k: string]: string | string[] | undefined }>;

export async function generateMetadata(): Promise<Metadata> {
  const robots = { index: false, follow: false };
  try {
    const name = await activeStoreName("${slug}");
    if (name) return { title: \`\${name} | ONLY DENIMS\`, robots };
  } catch {}
  return { title: "${storeName} | ONLY DENIMS", robots };
}

export default async function DedicatedBrandPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const slug = "${slug}";
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
`;
await fs.writeFile(path.join(pageDir, 'page.tsx'), pageTsx, 'utf8');

console.log(`Successfully scaffolded ${slug} at component/${slug} and app/stores/${slug}!`);
