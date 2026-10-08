"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  ShoppingBag,
  Heart,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { ExperienceProduct, BrandName, CategoryType } from "@/app/experience-center/page";
import FilterBottomSheet from "./FilterBottomSheet";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { STAGE_AR, STAGE_ART, getItemGeometry, getPresentation } from "./showroomPresentation";
import { useElementSize } from "./useElementSize";
import "./experience-center.css";

interface MobileShowroomExperienceProps {
  products: ExperienceProduct[];
  onAddToCart: (item: ExperienceProduct) => void;
  addingId: string | null;
  onQuickView: (item: ExperienceProduct) => void;
  selectedBrands: BrandName[];
  onToggleBrand: (brand: BrandName) => void;
  onClearBrands: () => void;
  selectedCategories: CategoryType[];
  onToggleCategory: (category: CategoryType) => void;
  onClearCategories: () => void;
  sortBy: "featured" | "price-asc" | "price-desc";
  onSortChange: (sort: "featured" | "price-asc" | "price-desc") => void;
  onResetAll: () => void;
}

const BRANDS: { number: string; label: string; value: BrandName }[] = [
  { number: "01", label: "RBW", value: "RBW" },
  { number: "02", label: "THINC", value: "THINC" },
  { number: "03", label: "WIDE", value: "WIDE" },
  { number: "04", label: "iJNS", value: "IJNS" },
  { number: "05", label: "SECOND ARMY", value: "SECOND ARMY" },
];

const SLOTS = [-2, -1, 0, 1, 2];
const EASE = [0.22, 0.8, 0.24, 1] as const;

export default function MobileShowroomExperience({
  products,
  onAddToCart,
  addingId,
  onQuickView,
  selectedBrands,
  onToggleBrand,
  onClearBrands,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  sortBy,
  onSortChange,
  onResetAll,
}: MobileShowroomExperienceProps) {
  const { cart, setIsOpen: setCartOpen } = useCart();
  const { showToast } = useToast();

  const total = products.length;
  const signature = useMemo(() => products.map((p) => p.id).join("|"), [products]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [still, setStill] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<Record<string, boolean>>({});
  const [sectionRef, size] = useElementSize<HTMLElement>({ w: 390, h: 787 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  // Reset when the product set changes (filters / brand switch)
  useEffect(() => {
    setCurrentIndex(0);
    setStill(true);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setStill(false)));
    return () => cancelAnimationFrame(raf);
  }, [signature]);

  const totalCartCount = useMemo(() => {
    if (!cart || !Array.isArray(cart.lines)) return 0;
    return cart.lines.reduce((sum, item) => sum + (item?.quantity || 1), 0);
  }, [cart]);

  const activeFiltersCount =
    selectedBrands.length + selectedCategories.length + (sortBy !== "featured" ? 1 : 0);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setStill(false);
    setCurrentIndex((p) => p - 1);
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setStill(false);
    setCurrentIndex((p) => p + 1);
  }, [total]);

  // Calm autoplay (paused while interacting / filter open; off for reduced motion)
  useEffect(() => {
    if (total <= 1 || isPaused || isFilterOpen || reducedMotion) return;
    const id = setInterval(() => {
      if (!document.hidden) handleNext();
    }, 7000);
    return () => clearInterval(id);
  }, [total, isPaused, isFilterOpen, reducedMotion, handleNext]);

  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (resumeRef.current) clearTimeout(resumeRef.current);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setIsPaused(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchCurrentX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchCurrentX.current !== null) {
      const diff = touchCurrentX.current - touchStartX.current;
      if (diff < -35) handleNext();
      else if (diff > 35) handlePrev();
    }
    touchStartX.current = null;
    touchCurrentX.current = null;
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => setIsPaused(false), 5000);
  };

  const toggleWishlist = (id: string) => {
    const next = !wishlistedIds[id];
    setWishlistedIds((prev) => ({ ...prev, [id]: next }));
    showToast({
      title: next ? "Saved to Wishlist" : "Removed from Wishlist",
      message: next ? "Item has been added to your curated wishlist." : "Item removed from wishlist.",
      type: "success",
    });
  };

  // How much of the (rigid) stage is on screen, in % of stage width
  const visPct = Math.min(100, (size.w / (size.h * STAGE_AR)) * 100);
  const heroMaxW = Math.min(21.8, visPct * 0.66);

  const visible = useMemo(() => {
    const out = new Set<number>();
    if (total === 0) return out;
    const used = new Set<number>();
    for (const s of [0, 1, -1]) {
      const idx = (((currentIndex + s) % total) + total) % total;
      if (used.has(idx)) continue;
      used.add(idx);
      out.add(s);
    }
    return out;
  }, [total, currentIndex]);

  const brandBar = (
    <div className="ec-mbar">
      <div className="ec-mbar__scroll" role="group" aria-label="Showroom brands">
        <button
          type="button"
          className="ec-brand"
          aria-pressed={selectedBrands.length === 0}
          onClick={onClearBrands}
        >
          All
        </button>
        {BRANDS.map((b) => (
          <button
            key={b.value}
            type="button"
            className="ec-brand"
            aria-pressed={selectedBrands.includes(b.value)}
            onClick={() => onToggleBrand(b.value)}
          >
            <i>{b.number}</i>
            {b.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="ec-mfilter"
        onClick={() => setIsFilterOpen(true)}
        aria-label="Open filters"
      >
        <SlidersHorizontal size={13} strokeWidth={1.6} />
        Filter
        {activeFiltersCount > 0 && <b>{activeFiltersCount}</b>}
      </button>
    </div>
  );

  const header = (
    <header className="ec-mhead">
      <div className="ec-mhead__side">
        <button
          type="button"
          className="ec-mhead__btn"
          onClick={() => window.dispatchEvent(new CustomEvent("TOGGLE_MOBILE_NAV"))}
          aria-label="Menu"
        >
          <Menu size={21} strokeWidth={1.5} />
        </button>
      </div>
      <Link href="/" className="ec-mhead__word">
        Only Denims
      </Link>
      <div className="ec-mhead__side ec-mhead__side--r">
        <button
          type="button"
          className="ec-mhead__btn"
          onClick={() => window.dispatchEvent(new CustomEvent("OPEN_SEARCH_OVERLAY"))}
          aria-label="Search"
        >
          <Search size={20} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="ec-mhead__btn"
          onClick={() => setCartOpen(true)}
          aria-label="Shopping Bag"
        >
          <ShoppingBag size={20} strokeWidth={1.5} />
          {totalCartCount > 0 && <span className="ec-mhead__badge">{totalCartCount}</span>}
        </button>
      </div>
    </header>
  );

  const sheet = (
    <FilterBottomSheet
      isOpen={isFilterOpen}
      onClose={() => setIsFilterOpen(false)}
      selectedBrands={selectedBrands}
      onToggleBrand={onToggleBrand}
      onClearBrands={onClearBrands}
      selectedCategories={selectedCategories}
      onToggleCategory={onToggleCategory}
      onClearCategories={onClearCategories}
      sortBy={sortBy}
      onSortChange={onSortChange}
      onResetAll={onResetAll}
      totalProductsCount={total}
    />
  );

  const current = total > 0 ? products[((currentIndex % total) + total) % total] : null;

  // ── empty state ──
  if (!current) {
    return (
      <>
      <section ref={sectionRef} className="ec-section ec-m">
        <div className="ec-stage">
          <Image src={STAGE_ART} alt="" fill priority sizes="100vw" className="ec-bg" />
          <div className="ec-grade" />
          <div className="ec-vignette" />
        </div>
        {header}
        {brandBar}
        <div className="ec-empty">
          <div className="ec-empty__card ec-glass">
            <p className="ec-empty__eyebrow">The showroom is quiet</p>
            <p className="ec-empty__title">No pieces on display</p>
            <p className="ec-empty__text">No garments match your active filters. Reset to view the complete showroom.</p>
            <div className="ec-empty__actions">
              <button type="button" className="ec-btn" onClick={onResetAll}>
                Reset all filters
              </button>
            </div>
          </div>
        </div>
      </section>
      {sheet}
      </>
    );
  }

  const safeIdx = ((currentIndex % total) + total) % total;
  const brandName = current.brand === "IJNS" ? "iJNS" : current.brand;
  const subBadge = current.fitBadge || current.category;
  const isWishlisted = !!wishlistedIds[current.id];
  const isAdding = addingId === current.id;

  return (
    <>
    <section
      ref={sectionRef}
      className="ec-section ec-m"
      aria-label="ONLY DENIMS showroom"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ─── ARCHITECTURE & LIGHT ─── */}
      <div className="ec-stage">
        <Image src={STAGE_ART} alt="" fill priority sizes="100vw" className="ec-bg" />
        <div className="ec-grade" />
        <div className="ec-pool ec-pool--hero" />
        <div className="ec-podium-glow" />
        <div className="ec-vignette" />

        {/* ─── PRODUCTS: hero on the podium, neighbours on the plinth at depth ─── */}
        <div key={signature} className={`ec-slots${still ? " ec-slots--still" : ""}`}>
          {SLOTS.map((slot) => {
            const idx = currentIndex + slot;
            const item = products[((idx % total) + total) % total];
            const isHero = slot === 0;
            const shown = visible.has(slot);
            const pres = getPresentation(item.image);
            const { h0, w0 } = getItemGeometry(pres, heroMaxW, size.w >= 600 ? 50 : 40);
            const isPanel = pres.kind === "panel";
            const bh = pres.bbox[3] - pres.bbox[1];
            const boxH = isPanel ? h0 : h0 / bh;
            const boxW = isPanel ? h0 * (pres.frame ?? 0.74) : boxH * pres.ar;
            const cx = isPanel ? 0.5 : (pres.bbox[0] + pres.bbox[2]) / 2;
            const by = isPanel ? 1 : pres.bbox[3];

            const sideScale = isPanel ? 0.32 : 0.38;
            const half = visPct / 2;
            const wSide = w0 * sideScale;
            let x = 50;
            let y = 78.8;
            let scale = 1;
            let opacity = 1;
            let z = 30;
            let filter = "none";
            if (!isHero) {
              const dir = Math.sign(slot);
              const near = Math.abs(slot) === 1;
              x = near ? 50 + dir * Math.max(half * 0.45, half - wSide / 2 - 1.0) : 50 + dir * (half + 14);
              y = 77.6;
              scale = sideScale;
              opacity = near ? 0.9 : 0;
              z = 20;
              filter = isPanel ? "saturate(0.8) brightness(0.84)" : "saturate(0.92) brightness(0.96)";
            }

            return (
              <div
                key={`${item.id}-${idx}`}
                className={`ec-slot ec-slot--${pres.kind}${isHero ? " ec-slot--hero" : ""}`}
                style={{
                  transform: `translate3d(${x}cqw, ${y}cqh, 0) scale(${scale})`,
                  opacity: shown ? opacity : 0,
                  zIndex: z,
                  filter: shown ? filter : "none",
                  pointerEvents: shown ? "auto" : "none",
                  ["--mask" as string]: pres.mask ? `url(${pres.mask})` : "none",
                }}
              >
                <span className="ec-shadow" style={{ ["--sw" as string]: (w0 * STAGE_AR * 0.92).toFixed(2) }} />
                <button
                  type="button"
                  className="ec-item"
                  tabIndex={shown ? 0 : -1}
                  aria-hidden={!shown}
                  aria-label={isHero ? `Quick view ${item.title}` : `Show ${item.title}`}
                  onClick={() => {
                    if (isHero) onQuickView(item);
                    else {
                      setStill(false);
                      setCurrentIndex((p) => p + slot);
                    }
                  }}
                  style={{
                    width: `${boxW.toFixed(3)}cqh`,
                    height: `${boxH.toFixed(3)}cqh`,
                    ["--cx" as string]: cx,
                    ["--by" as string]: by,
                  }}
                >
                  <span className="ec-lift">
                    {isPanel ? (
                      <span className="ec-panel">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="260px"
                          unoptimized
                          style={{ objectPosition: `${pres.focusX ?? 50}% 50%` }}
                        />
                      </span>
                    ) : (
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={1024}
                        height={Math.round(1024 / pres.ar)}
                        unoptimized
                        priority={isHero}
                        className="ec-img"
                        draggable={false}
                      />
                    )}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {header}
      {brandBar}

      {/* ─── LABEL CARD ─── */}
      <div className="ec-mui">
        <div className="ec-mcard ec-glass">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="ec-mrow">
                <div className="ec-kicker">
                  {brandName}
                  <b />
                  <span>{subBadge}</span>
                </div>
                <span className="ec-counter__num" aria-live="polite">
                  {String(safeIdx + 1).padStart(2, "0")} <i>/</i> {String(total).padStart(2, "0")}
                </span>
                <span className="ec-mprice-narrow">₹{current.price.toLocaleString("en-IN")}</span>
              </div>
              <div className="ec-mrow">
                <button type="button" className="ec-mname" onClick={() => onQuickView(current)} aria-label={`Quick view ${current.title}`}>
                  <span>{current.title}</span>
                  <Maximize2 size={13} strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="ec-mactions">
            <button type="button" className="ec-iconbtn" aria-label="Previous garment" disabled={total <= 1} onClick={handlePrev}>
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="ec-iconbtn ec-heart"
              aria-label="Wishlist item"
              aria-pressed={isWishlisted}
              onClick={() => toggleWishlist(current.id)}
            >
              <Heart size={17} strokeWidth={1.4} />
            </button>
            <button type="button" className="ec-btn" onClick={() => onAddToCart(current)} disabled={isAdding}>
              {isAdding ? (
                <>
                  <Check size={14} strokeWidth={1.8} />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <span>Add to bag</span>
                  <span className="ec-btn__price">₹{current.price.toLocaleString("en-IN")}</span>
                </>
              )}
            </button>
            <button type="button" className="ec-iconbtn" aria-label="Next garment" disabled={total <= 1} onClick={handleNext}>
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

    </section>
    {/* rendered outside the section: it is position:fixed and must escape its containment */}
    {sheet}
    </>
  );
}
