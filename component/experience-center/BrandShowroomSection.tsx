"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
} from "lucide-react";
import { ExperienceProduct, BrandName } from "@/app/experience-center/page";

export interface BrandConfig {
  key: BrandName;
  name: string;
  tagline: string;
  description: string;
  storeLink: string;
  fontClass: string;
  accentColor: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  stageBg: string;
  stageBorder: string;
  pillColor?: string;
  showroomNumber: string;
  badgeText?: string;
  heroImage?: string;
  bgImage?: string;
  stageOverlay?: string;
  isDark?: boolean;
  headerTextColor?: string;
  taglineColor?: string;
  descColor?: string;
  glowColor?: string;
  ctaBg?: string;
  ctaTextColor?: string;
  ctaBorder?: string;
  navArrowBg?: string;
  navArrowColor?: string;
  navArrowBorder?: string;
  counterColor?: string;
  ctaButtonText?: string;
  composition?: "spotlight" | "trio" | "streetwear" | "energetic" | "utility";
}

interface BrandShowroomSectionProps {
  brand: BrandConfig;
  products: ExperienceProduct[];
  onAddToCart: (item: ExperienceProduct) => void;
  addingId: string | null;
  onQuickView: (item: ExperienceProduct) => void;
  allBrands?: { number: string; name: string; key: BrandName }[];
  onSelectBrand?: (brandKey: BrandName) => void;
}

export default function BrandShowroomSection({
  brand,
  products,
  onAddToCart,
  addingId,
  onQuickView,
}: BrandShowroomSectionProps) {
  const total = products.length;

  // Current sliding track index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;
  const [wishlistedIds, setWishlistedIds] = useState<Record<string, boolean>>({});
  const [reducedMotion, setReducedMotion] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1280);

  // Track window width for accurate responsive niche slotting
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const onResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, []);

  // Check user prefers-reduced-motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync index when products array changes (e.g. category filter applied)
  useEffect(() => {
    setCurrentIndex(0);
    setWithTransition(false);
  }, [total]);

  // Re-enable transition right after a wrap snap
  useEffect(() => {
    if (!withTransition) {
      const raf = requestAnimationFrame(() => {
        setWithTransition(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [withTransition]);

  const triggerPauseAndResume = useCallback(() => {
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  }, []);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setWithTransition(true);
    setCurrentIndex((prev) => prev + 1);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setWithTransition(true);
    setCurrentIndex((prev) => prev - 1);
  }, [total]);

  // Autoplay: slides gently every ~4.5s when not paused and tab is visible
  useEffect(() => {
    if (total <= 1) return;

    const intervalId = setInterval(() => {
      if (!isPausedRef.current && typeof document !== "undefined" && !document.hidden) {
        handleNext();
      }
    }, 4500);

    return () => clearInterval(intervalId);
  }, [total, handleNext]);

  // Pause when browser tab is hidden to save resources and prevent background drift
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    triggerPauseAndResume();
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setWithTransition(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchCurrentX.current !== null) {
      const diff = touchCurrentX.current - touchStartX.current;
      if (diff < -30) {
        handleNext();
      } else if (diff > 30) {
        handlePrev();
      }
    }
    setDragOffset(0);
    setWithTransition(true);
    touchStartX.current = null;
    touchCurrentX.current = null;
    triggerPauseAndResume();
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (total === 0) {
    return null;
  }

  // Active catalog index & center product
  const safeActiveIdx = total > 0 ? ((currentIndex % total) + total) % total : 0;
  const currentCenterItem = products[safeActiveIdx] || products[0];
  const brandDisplayName =
    currentCenterItem?.brand === "IJNS"
      ? "iJNS"
      : currentCenterItem?.brand || "ONLY DENIMS";
  const subBadge =
    currentCenterItem?.fitBadge || currentCenterItem?.category || "DENIM";

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Robust circular slot projection: ALWAYS guarantees visible items in slots [-3..+3]
  // This is completely immune to index drift, tab switching, or missed transitionend events!
  const visibleItemsWithSlots = useMemo(() => {
    if (total === 0) return [];
    if (total === 1) {
      return [{ item: products[0], idx: 0, slot: 0 }];
    }
    const slots = [-3, -2, -1, 0, 1, 2, 3];
    return slots.map((slot) => {
      const idx = currentIndex + slot;
      const safeItemIdx = ((idx % total) + total) % total;
      return { item: products[safeItemIdx], idx, slot };
    });
  }, [products, total, currentIndex]);

  return (
    <section
      id={`showroom-${brand.key.toLowerCase().replace(/\s+/g, "-")}`}
      className="relative w-full h-full min-h-[520px] flex-1 overflow-hidden select-none flex flex-col justify-between border-t border-[#DDD5C7]/70 bg-[#EFE9DF]"
    >
      {/* ─── 1. ARCHITECTURAL SHOWROOM WITH 5 ILLUMINATED DISPLAY LIGHTBOXES ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <Image
          src="/showroom_lightbox_bg.png"
          alt="Only Denims Architectural Showroom Lightbox"
          fill
          priority
          className="object-cover object-center pointer-events-none"
        />
        {/* Subtle warm atmospheric glow */}
        <div className="absolute inset-0 bg-[#EFE9DF]/10 pointer-events-none" />
      </div>

      {/* ─── 2. FLOATING SIDE NAVIGATION ARROWS (DESKTOP ONLY - CLEAN ON MOBILE) ─── */}
      <button
        onClick={() => {
          handlePrev();
          triggerPauseAndResume();
        }}
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-[#E0D9CC] items-center justify-center text-[#17140F] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        aria-label="Previous garment"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => {
          handleNext();
          triggerPauseAndResume();
        }}
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-[#E0D9CC] items-center justify-center text-[#17140F] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        aria-label="Next garment"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ─── 3. PHYSICAL LIGHTBOX NICHE STAGE (EXACTLY ALIGNED UNDER SPOTLIGHTS & ABOVE PODIUMS) ─── */}
      <div
        className="absolute inset-x-0 top-[18%] sm:top-[19%] h-[45%] sm:h-[47%] z-20 overflow-visible select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {visibleItemsWithSlots.map(({ item, idx, slot }) => {
          const isCenter = slot === 0;
          const pos = getSlotPosition(slot, isMobile, isTablet);

          return (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => {
                if (!isCenter) {
                  setWithTransition(true);
                  setCurrentIndex((prev) => prev + slot);
                  triggerPauseAndResume();
                }
              }}
              onMouseEnter={() => isCenter && setIsPaused(true)}
              onMouseLeave={() => isCenter && setIsPaused(false)}
              className="absolute flex items-center justify-center"
              style={{
                left: `calc(${pos.x}% + ${dragOffset}px)`,
                top: "50%",
                transform: `translate(-50%, -50%) scale(${pos.scale})`,
                opacity: pos.opacity,
                zIndex: pos.zIndex,
                width: isMobile ? "min(210px, 64vw)" : isTablet ? "220px" : "min(240px, 18.5vw)",
                height: "100%",
                transition: withTransition
                  ? reducedMotion
                    ? "transform 200ms ease, opacity 200ms ease, left 200ms ease"
                    : "transform 800ms cubic-bezier(0.22, 1, 0.36, 1), opacity 800ms cubic-bezier(0.22, 1, 0.36, 1), left 800ms cubic-bezier(0.22, 1, 0.36, 1)"
                  : "none",
                pointerEvents: pos.visible ? "auto" : "none",
                cursor: isCenter ? "default" : "pointer",
              }}
            >
              <PureProductCard
                item={item}
                isCenter={isCenter}
                onQuickView={() => onQuickView(item)}
                isWishlisted={!!wishlistedIds[item.id]}
                onToggleWishlist={(e) => toggleWishlist(item.id, e)}
              />
            </div>
          );
        })}
      </div>

      {/* ─── 4. PRODUCT DETAILS & CONTROLS (CLEARS MOBILE BOTTOM NAV VIA bottom-[74px]) ─── */}
      <div className="absolute inset-x-0 bottom-[74px] sm:bottom-4 z-30 pointer-events-auto px-2.5 sm:px-4">
        {currentCenterItem && (
          <div className="flex flex-col items-center max-w-[450px] mx-auto">
            {/* Mobile swipe hint */}
            <div className="flex sm:hidden items-center justify-center gap-1.5 mb-1.5 text-[8.5px] font-bold tracking-[0.2em] text-[#7A6E5D]/80 uppercase">
              <span>‹ SWIPE TO ROTATE ›</span>
            </div>

            <div
              className="relative w-full flex flex-col items-center px-3.5 sm:px-8 py-2.5 sm:py-3.5 rounded-[18px] sm:rounded-[26px] bg-[#FAF8F5]/96 backdrop-blur-md border border-[#E2DAD0] shadow-[0_16px_40px_rgba(25,20,12,0.12),0_2px_8px_rgba(25,20,12,0.04)] text-center transition-all duration-300 ring-1 ring-black/5"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Top Row: Brand Pill & Fit / Category Tag */}
              <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-[#17140F] text-white text-[9px] sm:text-[10px] font-extrabold tracking-[0.18em] uppercase font-sans">
                  {brandDisplayName}
                </span>
                <span className="text-[9.5px] sm:text-[11px] font-bold tracking-[0.16em] text-[#7A6E5D] uppercase font-sans">
                  {subBadge}
                </span>
              </div>

              {/* Product Title & Price Row */}
              <div className="flex items-baseline justify-center gap-2 sm:gap-3 w-full my-0.5">
                <h3 className="text-[14px] sm:text-[20px] font-bold text-[#17140F] tracking-tight font-sans truncate max-w-[180px] sm:max-w-[260px]">
                  {currentCenterItem.title}
                </h3>
                <span className="text-[13.5px] sm:text-[18px] font-extrabold text-[#17140F] font-mono tracking-tight shrink-0">
                  ₹{currentCenterItem.price.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Controls & Add to Bag Row */}
              <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 mt-2 sm:mt-2.5 w-full">
                {/* Sleek Carousel Counter Controls: ← 04 / 26 → */}
                <div className="flex items-center gap-1 sm:gap-2 bg-[#EFE9DF]/90 px-2 sm:px-2.5 py-1 rounded-full border border-[#DDD5C7] shrink-0">
                  <button
                    onClick={() => {
                      handlePrev();
                      triggerPauseAndResume();
                    }}
                    className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-white hover:bg-[#17140F] hover:text-white flex items-center justify-center text-[#17140F] transition-all cursor-pointer active:scale-90 shadow-2xs"
                    aria-label="Previous garment"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[10.5px] sm:text-[11.5px] font-bold text-[#17140F] tracking-wider select-none px-1">
                    {String(safeActiveIdx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => {
                      handleNext();
                      triggerPauseAndResume();
                    }}
                    className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-white hover:bg-[#17140F] hover:text-white flex items-center justify-center text-[#17140F] transition-all cursor-pointer active:scale-90 shadow-2xs"
                    aria-label="Next garment"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Premium Black ADD TO BAG Button */}
                <button
                  onClick={() => onAddToCart(currentCenterItem)}
                  disabled={addingId === currentCenterItem.id}
                  className="flex-1 sm:flex-initial px-4 sm:px-8 py-2 rounded-full bg-[#17140F] text-white text-[10.5px] sm:text-[12px] font-bold tracking-[0.14em] uppercase flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(23,20,15,0.25)] hover:bg-[#2B251D] active:scale-95 transition-all cursor-pointer"
                >
                  {addingId === currentCenterItem.id ? (
                    <>
                      <span>ADDED</span>
                      <Check className="w-3.5 h-3.5 text-white" />
                    </>
                  ) : (
                    <>
                      <span>ADD TO BAG</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E5C378]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── 5. FLOATING MINIMAL LEGAL & BRAND SIGNATURE (DESKTOP ONLY) ─── */}
      <div className="hidden xl:flex items-center gap-2 absolute bottom-3.5 left-8 z-30 pointer-events-auto text-[9.5px] font-bold tracking-[0.2em] uppercase text-[#635C52]/70 select-none">
        <span>© 2026 ONLY DENIMS</span>
        <span className="opacity-40">•</span>
        <span>DENIM A BETTER TOMORROW</span>
      </div>

      <div className="hidden xl:flex items-center gap-3 absolute bottom-3.5 right-8 z-30 pointer-events-auto text-[9.5px] font-bold tracking-[0.14em] uppercase text-[#635C52]/70 select-none">
        <Link href="/terms" className="hover:text-[#17140F] transition-colors">Terms</Link>
        <span className="opacity-40">•</span>
        <Link href="/privacy" className="hover:text-[#17140F] transition-colors">Privacy</Link>
        <span className="opacity-40">•</span>
        <Link href="/returns" className="hover:text-[#17140F] transition-colors">Returns</Link>
      </div>
    </section>
  );
}

// ─── NICHE POSITION CALCULATOR (MATCHING 5 PHYSICAL SHOWROOM LIGHTBOXES) ──────────

function getSlotPosition(slot: number, isMobile: boolean, isTablet: boolean) {
  if (isMobile) {
    // On mobile: center is dominant (50%), side products peek subtly from edges (-2% and 102%)
    if (slot === 0) return { x: 50.0, scale: 1.0, opacity: 1.0, zIndex: 30, visible: true };
    if (slot === -1) return { x: -2.0, scale: 0.72, opacity: 0.35, zIndex: 20, visible: true };
    if (slot === 1) return { x: 102.0, scale: 0.72, opacity: 0.35, zIndex: 20, visible: true };
    if (slot < -1) return { x: -35.0, scale: 0.55, opacity: 0, zIndex: 10, visible: false };
    return { x: 135.0, scale: 0.55, opacity: 0, zIndex: 10, visible: false };
  }

  if (isTablet) {
    // On tablet: 3 niches visible (26%, 50%, 74%)
    if (slot === 0) return { x: 50.0, scale: 1.04, opacity: 1.0, zIndex: 30, visible: true };
    if (slot === -1) return { x: 26.0, scale: 0.85, opacity: 0.75, zIndex: 20, visible: true };
    if (slot === 1) return { x: 74.0, scale: 0.85, opacity: 0.75, zIndex: 20, visible: true };
    if (slot === -2) return { x: 5.0, scale: 0.70, opacity: 0, zIndex: 10, visible: false };
    if (slot === 2) return { x: 95.0, scale: 0.70, opacity: 0, zIndex: 10, visible: false };
    if (slot < -2) return { x: -20.0, scale: 0.60, opacity: 0, zIndex: 5, visible: false };
    return { x: 120.0, scale: 0.60, opacity: 0, zIndex: 5, visible: false };
  }

  // Desktop: all 5 physical lightbox niches aligned with the background image!
  // Niche 1: 15.2% | Niche 2: 29.8% | Niche 3: 50.0% | Niche 4: 70.2% | Niche 5: 84.8%
  if (slot === 0) return { x: 50.0, scale: 1.05, opacity: 1.0, zIndex: 30, visible: true };
  if (slot === -1) return { x: 29.8, scale: 0.86, opacity: 0.78, zIndex: 20, visible: true };
  if (slot === 1) return { x: 70.2, scale: 0.86, opacity: 0.78, zIndex: 20, visible: true };
  if (slot === -2) return { x: 15.2, scale: 0.76, opacity: 0.58, zIndex: 10, visible: true };
  if (slot === 2) return { x: 84.8, scale: 0.76, opacity: 0.58, zIndex: 10, visible: true };
  if (slot < -2) return { x: 0.0, scale: 0.60, opacity: 0, zIndex: 5, visible: false };
  return { x: 100.0, scale: 0.60, opacity: 0, zIndex: 5, visible: false };
}

// ─── PURE PRODUCT IN ARCHITECTURAL LIGHTBOX (NO WHITE CARD, NATURAL DISPLAY) ─────

interface CategoryDimensions {
  heightPercent: string;
  maxWidthPercent: string;
  dropShadow: string;
  pedestalShadowWidth: string;
}

function getCategoryDimensions(category: string, isCenter: boolean): CategoryDimensions {
  switch (category) {
    case "JEANS":
      // Taller vertical presentation, centered vertically, ~70–85% of available lightbox height
      return {
        heightPercent: isCenter ? "85%" : "78%",
        maxWidthPercent: isCenter ? "90%" : "84%",
        dropShadow: isCenter
          ? "drop-shadow(0 18px 24px rgba(20, 15, 8, 0.16))"
          : "drop-shadow(0 12px 16px rgba(20, 15, 8, 0.10))",
        pedestalShadowWidth: isCenter ? "w-36 sm:w-44" : "w-24 sm:w-30",
      };
    case "JACKETS":
      // Slightly wider, ~65–80% of lightbox height
      return {
        heightPercent: isCenter ? "78%" : "70%",
        maxWidthPercent: isCenter ? "96%" : "90%",
        dropShadow: isCenter
          ? "drop-shadow(0 18px 24px rgba(20, 15, 8, 0.16))"
          : "drop-shadow(0 12px 16px rgba(20, 15, 8, 0.10))",
        pedestalShadowWidth: isCenter ? "w-40 sm:w-48" : "w-28 sm:w-34",
      };
    case "SHORTS":
      // Smaller vertical footprint, ~50–65% of lightbox height
      return {
        heightPercent: isCenter ? "62%" : "54%",
        maxWidthPercent: isCenter ? "86%" : "80%",
        dropShadow: isCenter
          ? "drop-shadow(0 14px 20px rgba(20, 15, 8, 0.13))"
          : "drop-shadow(0 10px 14px rgba(20, 15, 8, 0.08))",
        pedestalShadowWidth: isCenter ? "w-28 sm:w-36" : "w-20 sm:w-26",
      };
    case "ACCESSORIES":
      // Scaled appropriately without becoming tiny
      return {
        heightPercent: isCenter ? "54%" : "46%",
        maxWidthPercent: isCenter ? "75%" : "68%",
        dropShadow: isCenter
          ? "drop-shadow(0 12px 16px rgba(20, 15, 8, 0.14))"
          : "drop-shadow(0 8px 11px rgba(20, 15, 8, 0.08))",
        pedestalShadowWidth: isCenter ? "w-22 sm:w-28" : "w-16 sm:w-20",
      };
    default:
      return {
        heightPercent: isCenter ? "80%" : "74%",
        maxWidthPercent: isCenter ? "90%" : "84%",
        dropShadow: isCenter
          ? "drop-shadow(0 18px 24px rgba(20, 15, 8, 0.16))"
          : "drop-shadow(0 12px 16px rgba(20, 15, 8, 0.10))",
        pedestalShadowWidth: isCenter ? "w-36 sm:w-44" : "w-24 sm:w-30",
      };
  }
}

interface PureProductCardProps {
  item: ExperienceProduct;
  isCenter: boolean;
  onQuickView: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
}

function PureProductCard({
  item,
  isCenter,
  onQuickView,
  isWishlisted,
  onToggleWishlist,
}: PureProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const dims = getCategoryDimensions(item.category, isCenter);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onQuickView}
      className="relative w-full h-full flex flex-col items-center justify-center select-none cursor-pointer group"
    >
      {/* Subtle realistic grounding shadow over the stone pedestal */}
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${dims.pedestalShadowWidth} h-2.5 sm:h-3.5 rounded-[100%] bg-black/15 blur-[3px] pointer-events-none transition-all duration-700`}
      />

      {/* Heart Wishlist Icon */}
      {isCenter && (
        <button
          onClick={onToggleWishlist}
          className="absolute top-1 right-1 z-30 p-2 rounded-full bg-white/40 hover:bg-white/80 backdrop-blur-xs transition-all cursor-pointer active:scale-95 shadow-2xs text-[#17140F]"
          aria-label="Wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? "fill-[#D4503A] text-[#D4503A]" : "text-[#5C5346]"
              }`}
          />
        </button>
      )}

      {/* Garment Photography - Naturally Centered & Proportioned Inside Lightbox Niche */}
      <div
        className="relative flex items-center justify-center transition-all duration-700 ease-out mb-2"
        style={{
          height: dims.heightPercent,
          width: dims.maxWidthPercent,
          filter: dims.dropShadow,
        }}
      >
        <Image
          src={hovered && item.hoverImage ? item.hoverImage : item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 240px, 340px"
          className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          style={{
            mixBlendMode: "multiply",
            WebkitMaskImage: "radial-gradient(ellipse 72% 76% at 50% 50%, black 35%, rgba(0,0,0,0.7) 62%, transparent 90%)",
            maskImage: "radial-gradient(ellipse 72% 76% at 50% 50%, black 35%, rgba(0,0,0,0.7) 62%, transparent 90%)",
          }}
          unoptimized
        />
      </div>
    </div>
  );
}
