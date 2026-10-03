"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  Search,
  ShoppingBag,
  Heart,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { ExperienceProduct, BrandName, CategoryType } from "@/app/experience-center/page";
import FilterBottomSheet from "./FilterBottomSheet";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<Record<string, boolean>>({});

  // Reset index when product list changes (e.g. filters changed)
  useEffect(() => {
    setCurrentIndex(0);
  }, [products]);

  // Total cart items count for top bag badge
  const totalCartCount = useMemo(() => {
    if (!cart || !Array.isArray(cart.lines)) return 0;
    return cart.lines.reduce((sum, item) => sum + (item?.quantity || 1), 0);
  }, [cart]);

  // Active filter count
  const activeFiltersCount =
    selectedBrands.length +
    selectedCategories.length +
    (sortBy !== "featured" ? 1 : 0);

  // Safe navigation handlers
  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Autoplay functionality: rotates smoothly every ~4.5 seconds
  useEffect(() => {
    if (total <= 1 || isPaused || isFilterOpen) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [total, isPaused, isFilterOpen, handleNext]);

  // Touch swipe support for natural mobile interaction
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);

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
      if (diff < -35) {
        handleNext();
      } else if (diff > 35) {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchCurrentX.current = null;
    setTimeout(() => setIsPaused(false), 3000);
  };

  // Toggle wishlist for current item
  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistedIds((prev) => {
      const nextState = !prev[id];
      showToast({
        title: nextState ? "Saved to Wishlist" : "Removed from Wishlist",
        message: nextState
          ? "Item has been added to your curated wishlist."
          : "Item removed from wishlist.",
        type: "success",
      });
      return { ...prev, [id]: nextState };
    });
  };

  // Active center item and neighbors
  const currentItem = products[currentIndex] || products[0];
  const prevItem = total > 1 ? products[(currentIndex - 1 + total) % total] : null;
  const nextItem = total > 1 ? products[(currentIndex + 1) % total] : null;

  // Optical category sizing helper (Jeans: taller; Jackets: wider; Shorts: compact; Accessories: balanced)
  const getProductSizing = (category: string) => {
    switch (category) {
      case "JEANS":
        return {
          height: "82%",
          maxWidth: "88%",
          shadowWidth: "w-36 sm:w-44",
        };
      case "JACKETS":
        return {
          height: "74%",
          maxWidth: "94%",
          shadowWidth: "w-40 sm:w-48",
        };
      case "SHORTS":
        return {
          height: "62%",
          maxWidth: "82%",
          shadowWidth: "w-28 sm:w-34",
        };
      case "ACCESSORIES":
        return {
          height: "54%",
          maxWidth: "72%",
          shadowWidth: "w-22 sm:w-28",
        };
      default:
        return {
          height: "80%",
          maxWidth: "88%",
          shadowWidth: "w-36 sm:w-44",
        };
    }
  };

  const centerSizing = currentItem ? getProductSizing(currentItem.category) : getProductSizing("JEANS");

  // Format brand and collection text (e.g. "WIDE BAGGY" or "RBW · SLIM FIT")
  const brandFitLabel = useMemo(() => {
    if (!currentItem) return "ONLY DENIMS";
    const brand = currentItem.brand === "IJNS" ? "iJNS" : currentItem.brand;
    const badge = currentItem.fitBadge || currentItem.category;
    return `${brand} ${badge}`;
  }, [currentItem]);

  if (!currentItem) {
    return (
      <div className="relative w-full h-[100dvh] min-h-[660px] bg-[#12100E] flex flex-col justify-between items-center text-white px-6">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <Image
            src="/exp-center-mobile.png"
            alt="Only Denims Mobile Experience Centre"
            fill
            priority
            className="object-cover object-top opacity-40"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <header className="relative z-30 w-full pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("TOGGLE_MOBILE_NAV"))}
            className="w-10 h-10 flex items-center justify-center text-white"
          >
            <Menu className="w-5.5 h-5.5 stroke-[1.8]" />
          </button>
          <span className="font-serif tracking-[0.26em] text-[16px] font-bold uppercase text-white">
            ONLY DENIMS
          </span>
          <div className="w-10" />
        </header>
        <div className="relative z-20 flex flex-col items-center justify-center text-center my-auto px-4">
          <span className="text-xs uppercase tracking-widest text-[#C5A870] font-semibold mb-2">
            NO PIECES FOUND
          </span>
          <p className="text-white/70 text-sm max-w-[280px] mb-6 font-sans">
            No garments match your active filters. Reset to view the complete showroom collection.
          </p>
          <button
            onClick={onResetAll}
            className="px-6 py-3 rounded-full bg-[#E5C378] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D4B267] transition-all cursor-pointer shadow-lg active:scale-95"
          >
            RESET ALL FILTERS
          </button>
        </div>
      </div>
    );
  }

  const isWishlisted = !!wishlistedIds[currentItem.id];
  const isAdding = addingId === currentItem.id;

  return (
    <div className="relative w-full h-[100dvh] min-h-[660px] max-h-[960px] bg-[#12100E] overflow-hidden select-none flex flex-col justify-between">
      {/* ─── 1. LUXURY ARCHITECTURAL SHOWROOM BACKGROUND ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <Image
          src="/exp-center-mobile.png"
          alt="Only Denims Mobile Experience Centre"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 450px"
          className="object-cover object-top pointer-events-none"
        />
        {/* Soft luxury vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75 pointer-events-none" />
      </div>

      {/* ─── 2. MINIMAL LUXURY TOP NAVIGATION OVERLAY ─── */}
      <header className="relative z-30 w-full pt-[max(0.75rem,env(safe-area-inset-top))] px-4 sm:px-6 flex items-center justify-between pointer-events-auto">
        {/* Left: Menu Icon */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("TOGGLE_MOBILE_NAV"));
          }}
          className="w-10 h-10 -ml-1.5 flex items-center justify-center text-white/90 hover:text-white cursor-pointer active:scale-95 transition-transform"
          aria-label="Menu"
        >
          <Menu className="w-5.5 h-5.5 stroke-[1.8]" />
        </button>

        {/* Center: ONLY DENIMS Brand Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-1.5 cursor-pointer text-white hover:opacity-90 transition-opacity"
        >
          <span className="font-serif tracking-[0.24em] sm:tracking-[0.28em] text-[15px] sm:text-[16px] font-bold uppercase text-white drop-shadow-sm">
            ONLY DENIMS
          </span>
        </Link>

        {/* Right: Search & Cart Bag with Badge */}
        <div className="flex items-center gap-2 -mr-1.5">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("OPEN_SEARCH_OVERLAY"));
            }}
            className="w-9 h-9 flex items-center justify-center text-white/90 hover:text-white cursor-pointer active:scale-95 transition-transform"
            aria-label="Search"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            onClick={() => setCartOpen(true)}
            className="relative w-9 h-9 flex items-center justify-center text-white/90 hover:text-white cursor-pointer active:scale-95 transition-transform"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {totalCartCount > 0 && (
              <span className="absolute top-1 right-0.5 w-4 h-4 rounded-full bg-[#E5C378] text-[#17140F] text-[9px] font-black flex items-center justify-center shadow-md">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ─── 3. SUB-HEADER: EDITORIAL TAGLINE & FLOATING FILTER PILL ─── */}
      <div className="relative z-30 w-full px-4 sm:px-6 pt-1 flex items-start justify-between pointer-events-auto">
        {/* Left: Editorial Tagline */}
        <div className="flex flex-col text-[7.5px] sm:text-[8.5px] font-mono tracking-[0.22em] uppercase text-white/65 leading-[1.35] select-none">
          <span>DENIM</span>
          <span>FOR A</span>
          <span>BETTER</span>
          <span>TOMORROW</span>
          <div className="w-6 h-[1.5px] bg-[#B9965A]/80 mt-1.5 rounded-full" />
        </div>

        {/* Right: Floating Filter Pill Button */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md border border-[#B9965A]/50 hover:border-[#B9965A] text-white transition-all active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.5)] cursor-pointer"
          aria-label="Open Filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#E5C378]" />
          <span className="text-[9.5px] font-extrabold tracking-[0.16em] uppercase font-mono">
            FILTER
          </span>
          {activeFiltersCount > 0 ? (
            <span className="w-2 h-2 rounded-full bg-[#E5C378] animate-pulse" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9965A]/60" />
          )}
        </button>
      </div>

      {/* ─── 4. PRODUCT SHOWROOM HERO STAGE WITH ADJACENT ITEMS ─── */}
      <div
        className="relative z-20 w-full flex-1 flex items-center justify-center overflow-visible select-none my-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Subtle Middle Height Navigation Arrows */}
        {total > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md border border-white/15 hover:border-white/40 flex items-center justify-center text-white active:scale-90 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.6)] cursor-pointer"
              aria-label="Previous garment"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2]" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md border border-white/15 hover:border-white/40 flex items-center justify-center text-white active:scale-90 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.6)] cursor-pointer"
              aria-label="Next garment"
            >
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </button>
          </>
        )}

        {/* Previous Product Peeking on Left Pedestal */}
        {prevItem && (
          <div
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[62%] w-[210px] h-[44vh] max-h-[380px] opacity-40 scale-[0.82] transition-all duration-700 ease-out pointer-events-auto cursor-pointer z-10 hidden min-[360px]:flex items-center justify-center"
          >
            <Image
              src={prevItem.image}
              alt={prevItem.title}
              fill
              sizes="180px"
              className="object-contain"
              unoptimized
            />
          </div>
        )}

        {/* Center Hero Product on Spotlight Pedestal */}
        <div
          onClick={() => onQuickView(currentItem)}
          className="relative w-full h-[44vh] min-h-[290px] max-h-[400px] flex flex-col items-center justify-end z-20 cursor-pointer group pointer-events-auto px-4"
        >
          {/* Subtle realistic grounding drop shadow over the illuminated stone pedestal */}
          <div
            className={`absolute bottom-[8%] left-1/2 -translate-x-1/2 ${centerSizing.shadowWidth} h-3 rounded-[100%] bg-black/35 blur-[4px] pointer-events-none transition-all duration-700`}
          />

          {/* Pure Garment Image (No White Card Box) */}
          <div
            className="relative flex items-center justify-center transition-all duration-700 ease-out mb-[10%]"
            style={{
              height: centerSizing.height,
              width: centerSizing.maxWidth,
              filter: "drop-shadow(0 20px 30px rgba(0, 0, 0, 0.45))",
            }}
          >
            <Image
              src={currentItem.image}
              alt={currentItem.title}
              fill
              priority
              sizes="(max-width: 640px) 320px, 420px"
              className="object-contain transition-transform duration-500 ease-out group-hover:scale-103"
              unoptimized
            />
          </div>
        </div>

        {/* Next Product Peeking on Right Pedestal */}
        {nextItem && (
          <div
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[62%] w-[210px] h-[44vh] max-h-[380px] opacity-40 scale-[0.82] transition-all duration-700 ease-out pointer-events-auto cursor-pointer z-10 hidden min-[360px]:flex items-center justify-center"
          >
            <Image
              src={nextItem.image}
              alt={nextItem.title}
              fill
              sizes="180px"
              className="object-contain"
              unoptimized
            />
          </div>
        )}
      </div>

      {/* ─── 5. PEDESTAL CONTROLS & PRODUCT INFORMATION ─── */}
      <div className="relative z-30 w-full px-4 sm:px-5 pb-[calc(5.2rem+env(safe-area-inset-bottom,0px))] flex flex-col items-center pointer-events-auto">
        {/* Dash Carousel Indicator & Numerical Counter */}
        <div className="w-full max-w-[360px] flex items-center justify-between mb-1 sm:mb-2 select-none">
          <div className="w-10" />

          {/* Center: 3-Segment Dash Pill Indicator */}
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10">
            <span
              className={`h-1 rounded-full transition-all duration-300 ${
                currentIndex % 3 === 0 ? "w-5 bg-white shadow-xs" : "w-2.5 bg-white/30"
              }`}
            />
            <span
              className={`h-1 rounded-full transition-all duration-300 ${
                currentIndex % 3 === 1 ? "w-5 bg-white shadow-xs" : "w-2.5 bg-white/30"
              }`}
            />
            <span
              className={`h-1 rounded-full transition-all duration-300 ${
                currentIndex % 3 === 2 ? "w-5 bg-white shadow-xs" : "w-2.5 bg-white/30"
              }`}
            />
          </div>

          {/* Right: Numerical Counter "10 / 26" */}
          <span className="font-mono text-[10.5px] sm:text-[11.5px] font-bold text-white/90 tracking-widest w-12 text-right">
            {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* Product Information Typography */}
        <div className="text-center w-full max-w-[340px] select-none my-0.5">
          {/* Brand & Fit Label (e.g. WIDE BAGGY) */}
          <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.24em] uppercase text-[#D8CEBE] font-sans block mb-0.5">
            {brandFitLabel}
          </span>

          {/* Product Title */}
          <h2
            onClick={() => onQuickView(currentItem)}
            className="text-[21px] sm:text-[24px] font-serif font-normal text-white tracking-tight leading-snug cursor-pointer truncate hover:text-[#E5C378] transition-colors"
          >
            {currentItem.title}
          </h2>

          {/* Price */}
          <div className="text-[16px] sm:text-[18px] font-mono font-bold text-white tracking-tight mt-0.5">
            ₹{currentItem.price.toLocaleString("en-IN")}
          </div>
        </div>

        {/* ─── 6. PRIMARY ACTION ROW: ♡  [ ADD TO BAG | ₹... → ]  ⛶ ─── */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 w-full max-w-[400px] mt-2 mb-0">
          {/* Left: Wishlist Circular Button */}
          <button
            onClick={(e) => toggleWishlist(currentItem.id, e)}
            className={`w-11 sm:w-12 h-11 sm:h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-95 shadow-lg cursor-pointer ${
              isWishlisted
                ? "bg-[#D4503A]/20 border-2 border-[#D4503A] text-[#D4503A]"
                : "bg-black/50 hover:bg-black/75 border border-[#B9965A]/40 hover:border-[#B9965A] text-white"
            }`}
            aria-label="Wishlist item"
          >
            <Heart
              className={`w-4.5 sm:w-5 h-4.5 sm:h-5 transition-transform ${
                isWishlisted ? "fill-current scale-110" : ""
              }`}
            />
          </button>

          {/* Center: Large Luxury ADD TO BAG Pill Button */}
          <button
            onClick={() => onAddToCart(currentItem)}
            disabled={isAdding}
            className="flex-1 h-11 sm:h-12 rounded-full bg-[#0E0D0B] hover:bg-[#1A1815] border border-[#C5A870]/80 shadow-[0_6px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(197,168,112,0.2)] flex items-center justify-between px-5 sm:px-6 text-white text-[10.5px] sm:text-[11.5px] font-black tracking-[0.16em] uppercase active:scale-[0.98] transition-all cursor-pointer disabled:opacity-75"
          >
            {isAdding ? (
              <div className="w-full flex items-center justify-center gap-2 text-white">
                <Check className="w-4 h-4 text-[#E5C378]" />
                <span>ADDED TO BAG</span>
              </div>
            ) : (
              <>
                <span>ADD TO BAG</span>
                <span className="text-white/30 font-normal select-none">|</span>
                <div className="flex items-center gap-1.5 text-white">
                  <span>₹{currentItem.price.toLocaleString("en-IN")}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E5C378] ml-0.5" />
                </div>
              </>
            )}
          </button>

          {/* Right: Fullscreen / Quick View Button */}
          <button
            onClick={() => onQuickView(currentItem)}
            className="w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md border border-white/20 hover:border-white/40 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg cursor-pointer"
            aria-label="Expand view"
          >
            <Maximize2 className="w-4.5 sm:w-5 h-4.5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* ─── 7. FILTER BOTTOM SHEET ─── */}
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
        onSortChange={(sort) => {
          onSortChange(sort);
        }}
        onResetAll={onResetAll}
        totalProductsCount={total}
      />
    </div>
  );
}
