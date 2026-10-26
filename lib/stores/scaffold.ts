import fs from "fs/promises";
import path from "path";

/**
 * Scaffolds an independent, fully-editable brand store folder:
 *   frontend/component/<slug>/
 *     Navbar.tsx
 *     StoreFront.tsx
 *     ShopByFit.tsx
 *     PDP.tsx
 *     brand.css
 *     3d/
 *       (complete 3D showroom stage, backdrop, carousel, and controls)
 *   frontend/app/stores/<slug>/
 *     page.tsx
 *
 * This gives the brand full isolation: editing its navbar, PDP, 3D stage,
 * or CSS will never touch RBW or any other store.
 */
export async function scaffoldBrandStore(slug: string, storeName: string) {
  const projectRoot = path.resolve(process.cwd());
  const compDir = path.join(projectRoot, "component", slug);
  const comp3dDir = path.join(compDir, "3d");
  const pageDir = path.join(projectRoot, "app", "stores", slug);
  const rbw3dDir = path.join(projectRoot, "component", "rbw", "3d");

  // 1. Ensure target directories exist
  await fs.mkdir(comp3dDir, { recursive: true });
  await fs.mkdir(pageDir, { recursive: true });

  // 2. Copy 3D showroom files from component/rbw/3d to component/<slug>/3d
  const rbwFiles = await fs.readdir(rbw3dDir);
  for (const file of rbwFiles) {
    const src = path.join(rbw3dDir, file);
    const dest = path.join(comp3dDir, file);
    try {
      let content = await fs.readFile(src, "utf8");
      // Replace rbw import aliases to point to this brand's 3d folder
      content = content.replace(/@\/component\/rbw\/3d\//g, `@/component/${slug}/3d/`);
      content = content.replace(/@\/component\/rbw\//g, `@/component/${slug}/`);
      await fs.writeFile(dest, content, "utf8");
    } catch (e) {
      console.warn(`[scaffold] Warning copying ${file}:`, e);
    }
  }

  // 3. Generate brand.css
  const brandCss = `/* ==========================================================================
   ${storeName} (${slug}) — Scoped Brand Styles
   Edit colors, logo sizes, typography, and card layouts for this store here.
   ========================================================================== */

.${slug}-store {
  --brand-accent: #c5a059;
  --brand-accent-glow: rgba(197, 160, 89, 0.25);
  --brand-bg-dark: #07080a;
  --brand-bg-light: #faf8f5;
}

/* Header & Navbar */
.${slug}-store .brand-head {
  position: absolute;
  inset: 0 0 auto 0;
  z-index: 70;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(7, 8, 10, 0.94);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}
.${slug}-store[data-theme="light"] .brand-head {
  background: rgba(245, 243, 239, 0.94);
  border-bottom-color: rgba(36, 31, 29, 0.1);
}

/* Brand Logo (Adjust size here!) */
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
  color: #12100a;
}

/* Background Watermark / Logo Size in 3D Stage */
.${slug}-store .brand-watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
}
.${slug}-store .brand-watermark img {
  width: min(60vw, 750px);
  max-height: 60vh;
  object-fit: contain;
  opacity: 0.05;
  filter: grayscale(1);
}
`;
  await fs.writeFile(path.join(compDir, "brand.css"), brandCss, "utf8");

  // 4. Generate Navbar.tsx
  const navbarTsx = `"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  LogOut,
  Sun,
  Moon,
  Search,
  ShoppingBag,
  ChevronDown,
  Gift,
  Truck,
  Star,
  RotateCcw,
} from "lucide-react";
import type { PublicStore, StoreCategory } from "@/lib/stores/types";
import { useCart } from "@/context/CartContext";

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

const promoMessages = [
  { icon: Gift, text: "10% OFF YOUR FIRST ORDER • USE CODE: ONLY10" },
  { icon: Truck, text: "FREE SHIPPING ON ORDERS ABOVE ₹1,500" },
  { icon: Star, text: "PREMIUM ARTISAN DENIM & UTILITY ESSENTIALS" },
  { icon: RotateCcw, text: "EASY RETURNS & EXCHANGES WITHIN 7 DAYS" },
];

/**
 * Dedicated Brand Header / Navbar matching RBW's premium styling:
 * Includes Top Announcement Bar, Brand Category Pills, Search, Theme Toggle, Cart with Subtotal, and Exit.
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
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % promoMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const { cart, setIsOpen: setCartOpen } = useCart();
  const totalCartItems = cart?.lines.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const subtotal = cart?.lines.reduce((acc, item) => {
    const price = parseFloat(item.merchandise.price?.amount || "0");
    return acc + price * item.quantity;
  }, 0) || 0;

  const filter =
    store.logoMode === "original"
      ? "none"
      : theme === "dark"
      ? "brightness(0) invert(1)"
      : "brightness(0)";

  const activeMsg = promoMessages[msgIdx];
  const ActiveIcon = activeMsg.icon;

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent("OPEN_SEARCH_OVERLAY"));
  };

  const isDark = theme === "dark";

  return (
    <header className="brand-head select-none" aria-label="\${store.name} navigation">
      {/* 1. Top Announcement Bar */}
      <div
        className={\`w-full h-[28px] sm:h-[34px] border-b flex items-center justify-center text-[9px] sm:text-[10px] font-bold tracking-[0.16em] uppercase transition-colors px-4 overflow-hidden \${
          isDark
            ? "bg-[#0b0c0e] border-white/10 text-white/90"
            : "bg-[#EFECE6] border-[#E2DDD5]/80 text-[#18181B]"
        }\`}
      >
        <div className="flex items-center justify-center gap-2 truncate">
          <ActiveIcon className="w-3.5 h-3.5 text-[#B9965A] shrink-0" strokeWidth={2.2} />
          <span className="truncate">{activeMsg.text}</span>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="w-full flex-1 grid grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-6 md:px-10 h-[47px] md:h-[51px] xl:h-[69px]">
        {/* Left: Back Link & Category Pills */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <a
            href="/"
            className={\`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] xl:text-[10.5px] font-bold tracking-wider uppercase border transition-all shadow-2xs whitespace-nowrap shrink-0 group \${
              isDark
                ? "border-zinc-700/60 hover:border-zinc-500 text-zinc-100 bg-white/5 hover:bg-white/10"
                : "border-zinc-300 hover:border-zinc-700 text-zinc-800 bg-white/80 hover:bg-white"
            }\`}
            title="Return to ONLY DENIMS Homepage"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform text-[#B9965A]" strokeWidth={2.2} />
            <span>ONLY DENIMS</span>
          </a>

          <div
            className={\`h-3.5 w-[1px] mx-0.5 shrink-0 hidden sm:block \${
              isDark ? "bg-white/20" : "bg-[#241F1D]/15"
            }\`}
          />

          <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {categories.map((c) => {
              const active = c.id === activeCategory;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={\`flex items-center gap-1 px-3 py-1 rounded-full text-[10.5px] font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer border \${
                    active
                      ? "bg-[#B9965A] text-black border-[#B9965A] shadow-xs"
                      : isDark
                      ? "bg-white/5 text-zinc-300 border-white/10 hover:border-white/25 hover:text-white"
                      : "bg-black/5 text-zinc-700 border-zinc-200 hover:border-zinc-400 hover:text-black"
                  }\`}
                  data-active={active}
                  onClick={() => onSelectCategory(c.id)}
                >
                  <span>{c.label}</span>
                  {active && <span className="opacity-75 text-[10px] ml-0.5 font-bold">✕</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Brand Logo */}
        <button
          type="button"
          onClick={onHomeClick}
          aria-label="\${store.name} home"
          className="cursor-pointer bg-transparent border-0 p-1 flex items-center justify-center justify-self-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={store.logoUrl}
            alt={store.name}
            className="brand-logo"
            style={{ filter }}
          />
        </button>

        {/* Right: Search, Theme Toggle, Cart, and Exit */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 justify-self-end">
          {/* Search Icon */}
          <button
            type="button"
            onClick={handleOpenSearch}
            aria-label="Search Products"
            className={\`relative transition-colors duration-300 p-1.5 sm:p-2 rounded-full cursor-pointer flex items-center justify-center shrink-0 \${
              isDark
                ? "text-white/80 hover:text-white"
                : "text-[#18181B] hover:text-black"
            }\`}
            title="Search Products"
          >
            <Search className="h-[18px] w-[18px] sm:h-[19px] sm:w-[19px]" />
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={\`relative transition-all duration-300 p-1.5 sm:p-2 rounded-full cursor-pointer flex items-center justify-center shrink-0 border \${
              isDark
                ? "border-white/15 bg-white/5 hover:bg-white/10 text-[#B9965A]"
                : "border-[#241F1D]/15 bg-black/5 hover:bg-black/10 text-[#18181B]"
            }\`}
          >
            {isDark ? (
              <Sun className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px] text-[#B9965A]" strokeWidth={1.8} />
            ) : (
              <Moon className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px] text-[#18181B]" strokeWidth={1.8} />
            )}
          </button>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Shopping Cart"
            className={\`flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:px-3.5 sm:py-2 rounded-full border transition-all duration-300 shadow-none cursor-pointer select-none shrink-0 \${
              isDark
                ? "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                : "border-[#241F1D]/15 bg-white/50 hover:bg-white/80 text-[#18181B]"
            }\`}
          >
            <div className="relative flex items-center justify-center pr-0 sm:pr-1">
              <ShoppingBag className="h-[18px] w-[18px] sm:h-[19px] sm:w-[19px]" />
              {totalCartItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 font-sans flex items-center justify-center rounded-full bg-[#B9965A] text-white"
                  style={{
                    width: "15px",
                    height: "15px",
                    fontSize: "8.5px",
                    fontWeight: "bold",
                  }}
                >
                  {totalCartItems}
                </span>
              )}
            </div>

            <div
              className={\`hidden sm:block w-[1px] h-6 \${
                isDark ? "bg-white/20" : "bg-[#241F1D]/15"
              }\`}
            />

            <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
              <span className="font-sans text-[11px] sm:text-[12px] font-extrabold">
                ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={\`font-sans text-[9px] sm:text-[9.5px] font-medium \${
                  isDark ? "text-neutral-300" : "text-[#71717A]"
                }\`}
              >
                {totalCartItems} {totalCartItems === 1 ? "item" : "items"}
              </span>
            </div>

            <ChevronDown
              className={\`hidden sm:block h-3.5 w-3.5 pl-0.5 \${
                isDark ? "text-neutral-300" : "text-[#71717A]"
              }\`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}

export default BrandNavbar;
`;
  await fs.writeFile(path.join(compDir, "Navbar.tsx"), navbarTsx, "utf8");

  // 5. Generate PDP.tsx
  const pdpTsx = `"use client";

import React, { useRef, useState } from "react";
import { Heart, X, ZoomIn, ShoppingBag, ShieldCheck, Truck, Loader2 } from "lucide-react";
import type { ClientProduct } from "@/lib/stores/types";
import { fmtPrice } from "@/component/store-front/brandItems";
import { useCart } from "@/context/CartContext";
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
 * Dedicated Product Detail Page for ${storeName}
 * Edit product layout, gallery, buy buttons, or specs here.
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
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
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

  const handleAddToBag = async () => {
    setIsAdding(true);
    try {
      await addToCart(
        product.id,
        qty,
        {
          title: \`\${product.name}\${size ? \` (\${size})\` : ""}\`,
          price: product.price || 0,
          image: product.imageUrls?.[0],
        },
        true
      );
    } catch (err) {
      console.error("Failed adding product to bag:", err);
    } finally {
      setIsAdding(false);
    }
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
            className="rbw-cta rbw-j-cta-block flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            onClick={handleAddToBag}
            disabled={isAdding}
          >
            {isAdding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
            <span>{isAdding ? "Adding..." : \`Add to Bag · \${product.price ? fmtPrice(product.price * qty) : "Buy"}\`}</span>
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
            <Truck size={14} className="text-[#c5a059]" />
            <span>Express domestic delivery across India (2–4 business days)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#c5a059]" />
            <span>100% Authentic brand guarantee directly from ${storeName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDP;
`;
  await fs.writeFile(path.join(compDir, "PDP.tsx"), pdpTsx, "utf8");

  // 6. Generate ShopByFit.tsx
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

export const getFitImage = (fitName: string): string => {
  let norm = (fitName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (norm.includes("loose") || norm.includes("wide")) norm = "baggy";
  else if (norm.includes("relax")) norm = "comfort";
  else if (norm.includes("skinny")) norm = "slim";
  else if (norm.includes("taper")) norm = "straight";

  return "/fits/black/b" + norm + ".png";
};

/**
 * Dedicated Shop By Fit Slide for ${storeName}
 * Displays visual denim cutouts standing on stage above the background color watermark.
 */
export function ShopByFit({
  fits,
  selectedFit,
  onSelectFit,
  onBack,
  colorName,
}: ShopByFitProps) {
  const displayColor = (colorName || "DENIM").toUpperCase();

  const gridColsClass =
    fits.length === 1
      ? "grid-cols-1 max-w-[340px]"
      : fits.length === 2
      ? "grid-cols-2 max-w-[680px]"
      : fits.length === 3
      ? "grid-cols-1 sm:grid-cols-3 max-w-[1020px]"
      : fits.length === 4
      ? "grid-cols-2 sm:grid-cols-4 max-w-[1240px]"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 max-w-[1440px]";

  return (
    <div className="flex-1 flex flex-col justify-start pt-3 sm:pt-6 pb-16 px-4 sm:px-8 max-w-[1500px] mx-auto w-full relative">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-6 sm:mb-10 relative z-10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase text-zinc-800 bg-white/90 hover:bg-white border border-zinc-300/80 shadow-xs transition-all cursor-pointer group"
        >
          <ArrowLeft size={13} className="text-[#B9965A] group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.2} />
          <span>Colors</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <h2 className="rbw-fit__heading">SELECT YOUR FIT</h2>
          <span className="rbw-fit__heading-accent" />
        </div>

        {/* Right balancing spacer so heading remains centered */}
        <div className="w-[80px]" aria-hidden="true" />
      </div>

      {/* Fits Grid */}
      <div
        className={"relative z-10 w-full mx-auto grid gap-6 sm:gap-8 justify-center items-end " + gridColsClass}
      >
        {fits.map((fitName, idx) => {
          let norm = fitName.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (norm.includes("loose") || norm.includes("wide")) norm = "baggy";
          else if (norm.includes("relax")) norm = "comfort";
          else if (norm.includes("skinny")) norm = "slim";
          else if (norm.includes("taper")) norm = "straight";

          const isSelected = (selectedFit || "").toLowerCase() === fitName.toLowerCase();
          const imgSrc = getFitImage(fitName);

          return (
            <div
              key={fitName}
              onClick={() => onSelectFit(fitName)}
              className="rbw-fit__item group cursor-pointer flex flex-col items-center"
            >
              <div
                className="rbw-fit__card w-full flex flex-col items-center"
                data-active={isSelected ? "true" : undefined}
              >
                {/* Silhouette Stage */}
                <div className="rbw-fit__stage h-[220px] sm:h-[300px] md:h-[360px] w-full flex items-end justify-center relative">
                  <span className="rbw-fit__shadow" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={fitName + " fit"}
                    className="rbw-fit__img h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 select-none"
                    draggable={false}
                    loading="lazy"
                    onError={(e) => {
                      const t = e.currentTarget;
                      if (!t.dataset.fallback) {
                        t.dataset.fallback = "1";
                        t.src = "/fits/black/b" + norm + ".png";
                      } else if (t.dataset.fallback === "1") {
                        t.dataset.fallback = "2";
                        t.src = "/fits/" + norm + ".png";
                      } else if (t.dataset.fallback === "2") {
                        t.dataset.fallback = "3";
                        t.src = "/fits/black/bstraight.png";
                      }
                    }}
                  />
                </div>

                {/* Metadata */}
                <div className="rbw-fit__meta mt-3 sm:mt-4 flex flex-col items-center text-center">
                  <span className="rbw-fit__idx text-[9px] font-mono tracking-widest text-[#B9965A] font-semibold">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="rbw-fit__name text-base sm:text-lg md:text-xl font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#B9965A] transition-colors mt-0.5">
                    {fitName}
                  </span>
                  <span className="rbw-fit__line w-6 h-[1.5px] bg-[#B9965A]/40 my-1.5 transition-all group-hover:w-10 group-hover:bg-[#B9965A]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 transition-colors">
                    Explore Fit →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ShopByFit;
`;
  await fs.writeFile(path.join(compDir, "ShopByFit.tsx"), fitTsx, "utf8");

  // 7. Generate StoreFront.tsx (the master landing component)
  const storeFrontTsx = `"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientProduct, ClientStoreConfig, PublicStore } from "@/lib/stores/types";
import { atmosphereFor, buildCarouselItems, colorsForCategory } from "@/component/store-front/brandItems";
import { RbwWashSelection3D } from "./3d/RbwWashSelection3D";
import { RbwJourneyShell, RbwJourneyBar } from "@/component/rbw/RbwJourneyShell";
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
 * Main Assembled Storefront Component for ${storeName}
 *
 * It manages the 3 cinematic slides:
 *   Slide 1: 3D Color Carousel & Showroom
 *   Slide 2: Shop by Fit
 *   Slide 3: Product Detail Page (PDP)
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
          ghostText={(fit || color?.name || store.name).toUpperCase()}
          ghost="soft"
          scrollRef={pdpRef}
          theme="light"
          bar={
            <RbwJourneyBar
              backLabel={categoryFits.length > 0 ? "Fits" : "Colors"}
              onBack={categoryFits.length > 0 ? backToFits : goHome}
              rightSlot={
                colors.length > 1 ? (
                  <div className="flex items-center bg-white/95 border border-zinc-300 rounded-full p-0.5 shadow-xs">
                    {colors.map((c) => {
                      const isCur = c.id === colorId;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => selectColor(c.id)}
                          title={\`Switch to \${c.name.toUpperCase()}\`}
                          className={\`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer \${
                            isCur
                              ? "bg-[#B9965A] text-black shadow-xs font-black"
                              : "text-zinc-600 hover:text-black hover:bg-zinc-100"
                          }\`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                ) : null
              }
            />
          }
        >
          <div className="flex-1 flex flex-col justify-start">
            {activeProduct && (
              <PDP
                product={activeProduct}
                categoryLabel={config.categories.find((c) => c.id === category)?.label || category}
                colorName={color?.name || "Standard"}
                brandName={store.name}
                fit={fit}
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
  await fs.writeFile(path.join(compDir, "StoreFront.tsx"), storeFrontTsx, "utf8");

  // 8. Generate dedicated app/stores/<slug>/page.tsx
  const pageTsx = `import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import StoreLoginGate from "@/component/store-front/StoreLoginGate";
import { activeStoreName, loadStorefront } from "@/lib/stores/storefront";
import { storeCookieName } from "@/lib/stores/session";
import StoreFront from "@/component/${slug}/StoreFront";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;
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
  await fs.writeFile(path.join(pageDir, "page.tsx"), pageTsx, "utf8");

  return {
    componentDir: `component/${slug}`,
    pageFile: `app/stores/${slug}/page.tsx`,
  };
}
