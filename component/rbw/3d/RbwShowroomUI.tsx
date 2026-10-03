"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  RotateCw,
  X,
} from "lucide-react";
import { CategoryId, CATEGORY_DEFS } from "./RbwFilterPanel";
import { CarouselItemData } from "./RbwOrbitCarousel";

export interface WashItem {
  id: "raw" | "black" | "white" | string;
  name: string;
  label: string;
  sublabel: string;
  tagline: string;
  modelPath?: string;
  imagePath?: string;
  title: string;
  weight: string;
  fit: string;
  price: string;
  description: string;
  badge: string;
  accentHex: string;
  swatchClass: string;
  btnText: string;
  btnBg: string;
  btnHover: string;
  btnTextColor: string;
  textStyle: string;
  shopHref: string;
}

export const WASHES: WashItem[] = [
  {
    id: "raw",
    name: "RAW",
    label: "RAW",
    sublabel: "Zero Wash Rigid",
    tagline: "RAW YOU NEVER SAW",
    imagePath: "/rbwstore/raw.png",
    title: "RAW INDIGO SELVEDGE",
    weight: "14.5 OZ RIGID DENIM",
    fit: "WIDE LEG RELAXED",
    price: "₹1,900",
    description: "Unwashed deep indigo weave crafted from long-staple cotton.",
    badge: "SIGNATURE PIECE",
    accentHex: "#C59B27",
    swatchClass: "bg-amber-950 border-amber-500",
    btnText: "SHOP RAW →",
    btnBg: "bg-[#C59B27]",
    btnHover: "hover:bg-[#A8821B]",
    btnTextColor: "text-black",
    textStyle: "text-raw-textured",
    shopHref: "/stores/rbw/product/raw-straight-denims",
  },
  {
    id: "black",
    name: "BLACK",
    label: "BLACK",
    sublabel: "Sulfur Dyed Obsidian",
    tagline: "BOLD YOU NEVER KNEW",
    imagePath: "/rbwstore/black.png",
    title: "SULFUR BLACK SELVEDGE",
    weight: "14.0 OZ JET BLACK",
    fit: "SIGNATURE LOOSE FIT",
    price: "₹1,900",
    description: "Deep sulfur-dyed black warp and weft spun on vintage looms.",
    badge: "BESTSELLER",
    accentHex: "#8B0015",
    swatchClass: "bg-zinc-950 border-red-700",
    btnText: "SHOP BLACK →",
    btnBg: "bg-[#8B0015]",
    btnHover: "hover:bg-[#660010]",
    btnTextColor: "text-white",
    textStyle: "text-black-textured",
    shopHref: "/stores/rbw/product/black-straight-denims",
  },
  {
    id: "white",
    name: "WHITE",
    label: "WHITE",
    sublabel: "Ecru Bull Denim",
    tagline: "WHITE YOU NEVER WORE",
    imagePath: "/rbwstore/white.png",
    title: "CHALK WHITE BOOTCUT",
    weight: "13.8 OZ ECRU BULL",
    fit: "CONTEMPORARY FLARE",
    price: "₹1,900",
    description: "Bleached un-dyed ecru denim featuring visible yarn grain.",
    badge: "LIMITED DROP",
    accentHex: "#0A2A5E",
    swatchClass: "bg-neutral-100 border-blue-900",
    btnText: "SHOP WHITE →",
    btnBg: "bg-[#0A2A5E]",
    btnHover: "hover:bg-[#061c40]",
    btnTextColor: "text-white",
    textStyle: "text-white-textured",
    shopHref: "/stores/rbw/product/white-straight-denims",
  },
];

interface RbwShowroomUIProps {
  items: CarouselItemData[];
  activeItem: CarouselItemData;
  activeIndex: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  selectedCategories?: CategoryId[];
  activeCategory?: CategoryId;
  onToggleCategory?: (cat: CategoryId) => void;
  onSelectCategory?: (cat: CategoryId) => void;
  onToggleFilterDrawer?: () => void;
  isFilterOpen?: boolean;
  isInspecting?: boolean;
  onToggleInspect?: () => void;
  onCloseInspect?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onShopItem?: (item: CarouselItemData) => void;
}

export function RbwShowroomUI({
  items,
  activeItem,
  activeIndex,
  totalItems,
  onPrev,
  onNext,
  onSelectIndex,
  autoRotate,
  onToggleAutoRotate,
  selectedCategories = ["jeans"],
  activeCategory = "jeans",
  onToggleCategory,
  onSelectCategory,
  onToggleFilterDrawer,
  isFilterOpen = false,
  isInspecting = false,
  onToggleInspect,
  onCloseInspect,
  onRotateLeft,
  onRotateRight,
  onShopItem,
}: RbwShowroomUIProps) {
  // Arrow key and Escape key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isInspecting) onCloseInspect?.();
      } else if (e.key === "ArrowLeft") {
        if (isInspecting) onRotateLeft?.();
        else onPrev();
      } else if (e.key === "ArrowRight") {
        if (isInspecting) onRotateRight?.();
        else onNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPrev, onNext, isInspecting, onCloseInspect, onRotateLeft, onRotateRight]);

  const itemCount = Math.max(1, items?.length || 1);
  const normalizedIndex = ((activeIndex % itemCount) + itemCount) % itemCount;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pt-20 sm:pt-28 pb-3 sm:pb-6 px-3 sm:px-6 md:px-8 z-10 select-none">
      {/* ============================================================ */}
      {/* 1. TOP HEADER BAR (Clean Minimalist Overlay)                 */}
      {/* ============================================================ */}
      <header className="flex items-center justify-between pointer-events-auto gap-2">
        {/* Exit Showroom Button */}
        <Link
          href="/stores/rbw"
          className="group flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 hover:border-white/40 backdrop-blur-md transition-all text-zinc-300 hover:text-white shrink-0"
          title="Exit Showroom"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-[#B9965A]" />
        </Link>

        {/* Center mode indicator shown only when actively inspecting 360 */}
        {isInspecting ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] text-[#B9965A] uppercase font-serif font-medium shadow-lg">
            <Sparkles className="w-3 h-3 text-[#B9965A]" />
            <span>360° Denim Inspection</span>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right Actions: Close 360 when actively inspecting */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isInspecting && (
            <button
              onClick={onCloseInspect}
              aria-label="Exit 360 Inspection"
              className="group flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/80 hover:bg-black border border-white/20 hover:border-[#B9965A]/60 backdrop-blur-md text-xs font-semibold text-white transition-all shadow-xl active:scale-95 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-[#B9965A] group-hover:rotate-90 transition-transform duration-200" />
              <span>Close 360</span>
            </button>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. FLOATING LEFT & RIGHT CONTROLS                           */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between pointer-events-none px-1 sm:px-6 md:px-12 w-full">
        {isInspecting ? (
          <>
            {/* Left Rotate 360 Indicator & Button */}
            <div className="pointer-events-auto flex flex-col items-center gap-2">
              <button
                onClick={onRotateLeft}
                aria-label="Rotate Model Counter-Clockwise"
                className="group relative p-3 md:p-4 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 hover:border-[#B9965A] backdrop-blur-xl transition-all shadow-2xl active:scale-90 cursor-pointer"
              >
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-[#B9965A]/10 blur-sm" />
                <RotateCcw className="relative w-5 h-5 md:w-6 md:h-6 text-[#B9965A] group-hover:-rotate-45 transition-transform duration-300" />
              </button>
              <div className="flex flex-col items-center bg-black/60 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
                <span className="text-[9px] md:text-[10px] tracking-wider uppercase font-mono font-semibold text-zinc-200">
                  ROTATE
                </span>
                <span className="text-[8px] tracking-widest text-[#B9965A] font-mono">
                  ↺ 360°
                </span>
              </div>
            </div>

            {/* Right Rotate 360 Indicator & Button */}
            <div className="pointer-events-auto flex flex-col items-center gap-2">
              <button
                onClick={onRotateRight}
                aria-label="Rotate Model Clockwise"
                className="group relative p-3 md:p-4 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 hover:border-[#B9965A] backdrop-blur-xl transition-all shadow-2xl active:scale-90 cursor-pointer"
              >
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-[#B9965A]/10 blur-sm" />
                <RotateCw className="relative w-5 h-5 md:w-6 md:h-6 text-[#B9965A] group-hover:rotate-45 transition-transform duration-300" />
              </button>
              <div className="flex flex-col items-center bg-black/60 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
                <span className="text-[9px] md:text-[10px] tracking-wider uppercase font-mono font-semibold text-zinc-200">
                  ROTATE
                </span>
                <span className="text-[8px] tracking-widest text-[#B9965A] font-mono">
                  360° ↻
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Carousel Left Arrow */}
            <button
              onClick={onPrev}
              aria-label="Previous Garment"
              className="pointer-events-auto group p-2 sm:p-3 md:p-4 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 hover:border-[#B9965A]/60 backdrop-blur-xl transition-all shadow-2xl active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-zinc-300 group-hover:text-white transition-colors group-hover:-translate-x-0.5" />
            </button>

            {/* Carousel Right Arrow */}
            <button
              onClick={onNext}
              aria-label="Next Garment"
              className="pointer-events-auto group p-2 sm:p-3 md:p-4 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 hover:border-[#B9965A]/60 backdrop-blur-xl transition-all shadow-2xl active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-zinc-300 group-hover:text-white transition-colors group-hover:translate-x-0.5" />
            </button>
          </>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. CENTERED BOTTOM SHOWCASE BLOCK                            */}
      {/* ============================================================ */}
      <footer className="flex flex-col items-center justify-center text-center pointer-events-auto pb-2 sm:pb-4 z-20">
        {isInspecting ? (
          /* ========================================================== */
          /* 3A. INSPECTION MODE ACTIVE: SHOP WASH & EXIT CONTROLS       */
          /* ========================================================== */
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            {/* Dynamic Textured Brand Title */}
            <h2
              className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-wider uppercase leading-none select-none drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)] ${activeItem?.textStyle || ""}`}
            >
              {activeItem?.name}
            </h2>

            {/* ACTION BUTTONS: SHOP & EXIT */}
            <div className="flex items-center gap-3 mt-3 sm:mt-3.5">
              {onShopItem ? (
                <button
                  onClick={() => onShopItem(activeItem)}
                  className={`px-6 sm:px-8 py-2.5 sm:py-3 ${activeItem?.btnBg || "bg-[#C59B27]"} ${activeItem?.btnHover || "hover:bg-[#A8821B]"} ${activeItem?.btnTextColor || "text-black"} font-black text-xs sm:text-sm tracking-widest uppercase inline-flex items-center justify-center gap-1.5 shadow-2xl hover:brightness-110 active:scale-95 transition-all cursor-pointer`}
                >
                  <span>{activeItem?.btnText || "SHOP PIECE →"}</span>
                </button>
              ) : (
                <Link
                  href={activeItem?.shopHref || "/stores/rbw"}
                  className={`px-6 sm:px-8 py-2.5 sm:py-3 ${activeItem?.btnBg || "bg-[#C59B27]"} ${activeItem?.btnHover || "hover:bg-[#A8821B]"} ${activeItem?.btnTextColor || "text-black"} font-black text-xs sm:text-sm tracking-widest uppercase inline-flex items-center justify-center gap-1.5 shadow-2xl hover:brightness-110 active:scale-95 transition-all`}
                >
                  <span>{activeItem?.btnText || "SHOP PIECE →"}</span>
                </Link>
              )}

              {/* EXIT 360 BUTTON */}
              <button
                onClick={onCloseInspect}
                aria-label="Exit 360 Inspection"
                className="px-4 sm:px-5 py-2.5 sm:py-3 bg-black/75 hover:bg-black text-white border border-white/20 hover:border-white/40 font-black text-xs sm:text-sm tracking-wider uppercase inline-flex items-center justify-center gap-1.5 backdrop-blur-md shadow-xl active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-[#B9965A]" />
                <span>EXIT</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================== */
          /* 3B. STANDARD CAROUSEL MODE                                  */
          /* ========================================================== */
          <>
            {/* Dynamic Textured Brand Title (RAW / BLACK / WHITE / JACKETS / SHORTS) */}
            <h2
              className={`text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-black tracking-wider uppercase leading-none select-none drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)] ${activeItem?.textStyle || ""}`}
            >
              {activeItem?.name}
            </h2>

            {/* Dynamic Tagline */}
            <p className="text-[11px] sm:text-xs md:text-sm font-extrabold tracking-[0.16em] sm:tracking-[0.22em] text-zinc-900 uppercase select-none mt-1 sm:mt-2 drop-shadow-xs max-w-xs sm:max-w-lg">
              {activeItem?.tagline}
            </p>

            {/* Call to Action Button */}
            {onShopItem ? (
              <button
                onClick={() => onShopItem(activeItem)}
                className={`mt-2 sm:mt-3 px-6 sm:px-8 py-2 sm:py-2.5 ${activeItem?.btnBg || "bg-[#C59B27]"} ${activeItem?.btnHover || "hover:bg-[#A8821B]"} ${activeItem?.btnTextColor || "text-black"} font-black text-xs sm:text-sm tracking-wider uppercase inline-flex items-center justify-center gap-1.5 shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer`}
              >
                <span>{activeItem?.btnText || "EXPLORE PIECE →"}</span>
              </button>
            ) : (
              <Link
                href={activeItem?.shopHref || "/stores/rbw"}
                className={`mt-2 sm:mt-3 px-6 sm:px-8 py-2 sm:py-2.5 ${activeItem?.btnBg || "bg-[#C59B27]"} ${activeItem?.btnHover || "hover:bg-[#A8821B]"} ${activeItem?.btnTextColor || "text-black"} font-black text-xs sm:text-sm tracking-wider uppercase inline-flex items-center justify-center gap-1.5 shadow-xl hover:brightness-110 active:scale-95 transition-all`}
              >
                <span>{activeItem?.btnText || "EXPLORE PIECE →"}</span>
              </Link>
            )}

            {/* Tap cue for entering inspection */}
            <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-mono tracking-widest text-zinc-800 uppercase font-semibold drop-shadow-xs">
              DRAG HORIZONTALLY TO SLIDE • CLICK MODEL TO INSPECT 360°
            </p>

            {/* Dynamic Multi-Segment Progress Scrubber */}
            <div className="w-48 sm:w-64 flex items-center justify-center gap-1.5 mt-2.5 sm:mt-3.5">
              {items.map((item, i) => {
                const isCurrent = normalizedIndex === i;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectIndex(i)}
                    className="flex-1 py-1.5 group cursor-pointer"
                    aria-label={`Jump to ${item.name}`}
                  >
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isCurrent
                          ? "bg-[#5B5BFF] shadow-sm"
                          : "bg-[#B0B0B8]/60 group-hover:bg-[#8E8E98]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </footer>
    </div>
  );
}
