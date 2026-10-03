"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Check,
  SlidersHorizontal,
} from "lucide-react";

export type CategoryId = "jeans" | "jackets" | "shorts" | "accessories";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  image: string;
}

export const CATEGORY_DEFS: CategoryDef[] = [
  {
    id: "jeans",
    label: "JEANS",
    image: "/raw_jeans_v2.png",
  },
  {
    id: "jackets",
    label: "JACKETS",
    image: "/vintage_denim_jacket.png",
  },
  {
    id: "shorts",
    label: "SHORTS",
    image: "/raw_denim_shorts.png",
  },
  {
    id: "accessories",
    label: "ACCESSORIES",
    image: "/rbw_cap.jpg",
  },
];

export interface ColorOption {
  id: string;
  label: string;
  colorHex: string;
  border?: boolean;
}

// Exactly 3 core colors: Raw, Black, White
export const COLOR_OPTIONS: ColorOption[] = [
  { id: "raw", label: "RAW", colorHex: "#1C2841" },
  { id: "black", label: "BLACK", colorHex: "#18181B" },
  { id: "white", label: "WHITE", colorHex: "#FFFFFF", border: true },
];

export const SIZE_OPTIONS_ROW_1 = ["28", "30", "32", "34", "36", "38", "40", "42"];
export const SIZE_OPTIONS_ROW_2 = ["S", "M", "L", "XL", "XXL"];

export interface FitDef {
  id: string;
  label: string;
}

// Fits: Clean text labels only to ensure full visibility without truncation
export const FIT_DEFS: FitDef[] = [
  { id: "Ankle", label: "ANKLE" },
  { id: "Slim", label: "SLIM" },
  { id: "Comfort", label: "COMFORT" },
  { id: "Baggy", label: "BAGGY" },
  { id: "Straight", label: "STRAIGHT" },
  { id: "Bootcut", label: "BOOTCUT" },
];

export const FIT_OPTIONS_ROW_1 = ["Ankle", "Slim", "Comfort", "Baggy"];
export const FIT_OPTIONS_ROW_2 = ["Straight", "Bootcut", "Shorts"];

export interface RbwFilterPanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  // 1. Categories
  selectedCategories: CategoryId[];
  activeCategory: CategoryId;
  onToggleCategory: (cat: CategoryId) => void;
  onSelectCategory?: (cat: CategoryId) => void;
  // 2. Color
  selectedColors?: string[];
  onToggleColor?: (colorId: string) => void;
  // 3. Size
  selectedSizes?: string[];
  onToggleSize?: (size: string) => void;
  // 4. Fits
  selectedFits?: string[];
  onToggleFit?: (fit: string) => void;
  // 5. Price
  priceRange?: [number, number];
  onChangePrice?: (range: [number, number]) => void;
  // 6. Discount (optional legacy)
  selectedDiscount?: number | null;
  onSelectDiscount?: (discount: number | null) => void;
  // Reset & Apply
  onResetFilters: () => void;
  onApplyFilters?: () => void;
  activeFilterCount?: number;
  isInspecting?: boolean;
}

export function RbwFilterPanel({
  isOpen,
  onToggleOpen,
  selectedCategories,
  activeCategory,
  onToggleCategory,
  onSelectCategory,
  selectedColors = [],
  onToggleColor = () => { },
  selectedSizes = [],
  onToggleSize = () => { },
  selectedFits = [],
  onToggleFit = () => { },
  priceRange = [0, 5000],
  onChangePrice = () => { },
  selectedDiscount = null,
  onSelectDiscount = () => { },
  onResetFilters,
  onApplyFilters,
  activeFilterCount,
  isInspecting = false,
}: RbwFilterPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Collapsible section toggles
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    category: false,
    color: false,
    size: false,
    fit: false,
    price: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Compute total active filters count
  const computedCount =
    (selectedCategories.length > 0 &&
      !(selectedCategories.length === 1 && selectedCategories[0] === "jeans")
      ? selectedCategories.length
      : 0) +
    selectedColors.length +
    selectedSizes.length +
    selectedFits.length +
    (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0);

  const displayCount =
    typeof activeFilterCount === "number" ? activeFilterCount : computedCount;

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Soft blur & dim backdrop overlay when drawer is open */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/35 backdrop-blur-[3px] z-[99990] transition-opacity duration-300 pointer-events-auto"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Full-Height Filter Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-[99999] w-[92vw] max-w-[420px] sm:w-[420px] h-screen flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${isOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"
          }`}
      >
        {/* Main Panel Content Container */}
        <div className="relative flex-1 flex flex-col h-full bg-[#FAF9F5] border-r border-[#E6E1D7] shadow-[24px_0_60px_rgba(0,0,0,0.18)] text-zinc-900 overflow-hidden pointer-events-auto">

          {/* Header */}
          <div className="px-6 sm:px-7 pt-7 pb-4 border-b border-[#ECE7DE] bg-[#FAF9F5]">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl sm:text-[28px] font-normal tracking-[0.14em] text-zinc-950 uppercase leading-none">
                FILTERS
              </h2>
              <button
                type="button"
                onClick={onToggleOpen}
                className="p-1.5 rounded-full text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/60 transition-colors cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5 stroke-[1.75]" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <p className="text-[10px] sm:text-[11px] tracking-[0.24em] font-sans text-zinc-400 uppercase font-medium">
                REFINE YOUR STYLE
              </p>
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs tracking-wider text-[#8F6F18] hover:text-[#6E5511] font-medium underline underline-offset-4 cursor-pointer transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Scrollable Filter Facets */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-7 py-6 space-y-6 sm:space-y-7 scrollbar-thin scrollbar-thumb-zinc-300">

            {/* 1. CATEGORY */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => toggleSection("category")}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-zinc-900">
                  CATEGORY
                </span>
                {collapsedSections.category ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                )}
              </button>

              {!collapsedSections.category && (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-0.5">
                  {CATEGORY_DEFS.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => onToggleCategory(cat.id)}
                        className={`group relative rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-3 text-left flex items-center gap-2 transition-all duration-150 cursor-pointer border ${isSelected
                            ? "bg-[#18181B] text-white border-[#18181B] shadow-xs"
                            : "bg-white text-zinc-900 border-[#E8E3D8] hover:border-zinc-400 hover:shadow-xs"
                          }`}
                      >
                        <div className="relative w-7 h-9 sm:w-8 sm:h-10 shrink-0 flex items-center justify-center overflow-hidden">
                          <Image
                            src={cat.image}
                            alt={cat.label}
                            fill
                            sizes="36px"
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1 flex items-center justify-between">
                          <span
                            className={`text-[11px] sm:text-xs font-bold uppercase tracking-normal truncate ${isSelected ? "text-white" : "text-zinc-900"
                              }`}
                          >
                            {cat.label}
                          </span>
                          {isSelected && (
                            <div className="w-3.5 h-3.5 rounded-full bg-[#FAF9F5] text-zinc-950 flex items-center justify-center shrink-0 ml-1">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="h-[1px] bg-[#ECE7DE]/80 w-full" />

            {/* 2. COLOR (Only 3 Core Colors: RAW, BLACK, WHITE) */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => toggleSection("color")}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-zinc-900">
                  COLOR
                </span>
                {collapsedSections.color ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                )}
              </button>

              {!collapsedSections.color && (
                <div className="grid grid-cols-3 gap-4 pt-1 justify-items-center">
                  {COLOR_OPTIONS.map((c) => {
                    const isSelected = selectedColors.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onToggleColor(c.id)}
                        className="flex flex-col items-center group cursor-pointer text-center"
                      >
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-150 flex items-center justify-center shadow-xs ${c.border ? "border border-zinc-300" : ""
                            } ${isSelected
                              ? "ring-2 ring-[#C59B27] ring-offset-2 scale-105"
                              : "hover:scale-105"
                            }`}
                          style={{ backgroundColor: c.colorHex }}
                        >
                          {isSelected && (
                            <Check
                              className={`w-4 h-4 stroke-[2.5] ${c.id === "white" ? "text-zinc-950" : "text-white"
                                }`}
                            />
                          )}
                        </div>
                        <span
                          className={`text-xs mt-2 font-bold tracking-wider uppercase ${isSelected ? "text-zinc-950" : "text-zinc-600 group-hover:text-zinc-900"
                            }`}
                        >
                          {c.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="h-[1px] bg-[#ECE7DE]/80 w-full" />

            {/* 3. SIZE (Includes 42) */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => toggleSection("size")}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-zinc-900">
                  SIZE
                </span>
                {collapsedSections.size ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                )}
              </button>

              {!collapsedSections.size && (
                <div className="space-y-2 pt-0.5">
                  {/* Row 1: Numeric sizes including 42 */}
                  <div className="grid grid-cols-8 gap-1 sm:gap-1.5">
                    {SIZE_OPTIONS_ROW_1.map((sz) => {
                      const isSelected = selectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => onToggleSize(sz)}
                          className={`py-2 sm:py-2.5 text-center text-xs font-medium rounded-lg border transition-all cursor-pointer ${isSelected
                              ? "bg-zinc-950 text-white border-zinc-950 font-bold shadow-xs"
                              : "bg-white border-[#E5DFD4] text-zinc-700 hover:border-zinc-400 hover:text-zinc-950"
                            }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                  {/* Row 2: Letter sizes */}
                  <div className="grid grid-cols-8 gap-1 sm:gap-1.5">
                    {SIZE_OPTIONS_ROW_2.map((sz) => {
                      const isSelected = selectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => onToggleSize(sz)}
                          className={`py-2 sm:py-2.5 text-center text-xs font-medium rounded-lg border transition-all cursor-pointer ${isSelected
                              ? "bg-zinc-950 text-white border-zinc-950 font-bold shadow-xs"
                              : "bg-white border-[#E5DFD4] text-zinc-700 hover:border-zinc-400 hover:text-zinc-950"
                            }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="h-[1px] bg-[#ECE7DE]/80 w-full" />

            {/* 4. FIT (Names only, fully visible without truncation) */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => toggleSection("fit")}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-zinc-900">
                  FIT
                </span>
                {collapsedSections.fit ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                )}
              </button>

              {!collapsedSections.fit && (
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-0.5">
                  {FIT_DEFS.map((fit) => {
                    const isSelected = selectedFits.some(
                      (f) => f.toLowerCase() === fit.id.toLowerCase()
                    );
                    return (
                      <button
                        key={fit.id}
                        type="button"
                        onClick={() => onToggleFit(fit.id)}
                        className={`py-2.5 px-2 rounded-xl border text-center transition-all duration-150 cursor-pointer flex items-center justify-center ${isSelected
                            ? "bg-[#18181B] text-white border-[#18181B] shadow-xs font-bold"
                            : "bg-white text-zinc-900 border-[#E8E3D8] hover:border-zinc-400 hover:shadow-xs font-semibold"
                          }`}
                      >
                        <span
                          className={`text-xs sm:text-[13px] uppercase tracking-wider ${isSelected ? "text-white" : "text-zinc-900"
                            }`}
                        >
                          {fit.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="h-[1px] bg-[#ECE7DE]/80 w-full" />

            {/* 5. PRICE */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => toggleSection("price")}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-zinc-900">
                  PRICE
                </span>
                {collapsedSections.price ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                )}
              </button>

              {!collapsedSections.price && (
                <div className="space-y-3 pt-1 pb-1">
                  <div className="relative flex items-center w-full px-1">
                    {/* Dual visual track */}
                    <div className="relative w-full h-1.5 bg-[#E8E3D8] rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 bottom-0 bg-[#C59B27] rounded-full"
                        style={{
                          left: `${(priceRange[0] / 5000) * 100}%`,
                          right: `${100 - (priceRange[1] / 5000) * 100}%`,
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5000}
                      step={100}
                      value={priceRange[1]}
                      onChange={(e) =>
                        onChangePrice([priceRange[0], parseInt(e.target.value, 10)])
                      }
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 z-10"
                      aria-label="Price range filter"
                    />
                    {/* Custom visual thumb */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-zinc-950 border-2 border-[#FAF9F5] shadow-xs pointer-events-none transition-all"
                      style={{
                        left: `calc(${Math.min(100, Math.max(0, (priceRange[1] / 5000) * 100))}% - 8px)`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-800 font-sans font-semibold">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer Action: APPLY FILTERS (N) → */}
          <div className="px-6 sm:px-7 py-5 border-t border-[#ECE7DE] bg-[#FAF9F5]">
            <button
              type="button"
              onClick={() => {
                if (onApplyFilters) onApplyFilters();
                else onToggleOpen();
              }}
              className="w-full bg-[#18181B] hover:bg-black text-white font-sans text-xs sm:text-sm tracking-[0.2em] font-bold uppercase py-4 px-6 rounded-full flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <span>APPLY FILTERS ({displayCount})</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Outer Door Handle / Vertical Luxury Filter Tab docked to Stage (Positioned above left arrow) */}
        <button
          type="button"
          onClick={onToggleOpen}
          aria-label="Open category filters"
          className={`absolute top-[28%] -translate-y-1/2 left-full flex items-center focus:outline-none z-[260] transition-all duration-300 ${isOpen || isInspecting
              ? "opacity-0 pointer-events-none scale-95 invisible"
              : "opacity-100 pointer-events-auto cursor-pointer group scale-100 visible"
            }`}
        >
          <div
            className="relative flex flex-col items-center justify-center py-4 px-2.5 rounded-r-2xl border border-l-0 shadow-[6px_0_24px_rgba(0,0,0,0.12)] transition-all duration-300 backdrop-blur-md select-none group-hover:translate-x-1 bg-[#FAF9F5]/95 hover:bg-white border-[#E6E1D7] hover:border-[#B9965A] text-zinc-800 hover:text-zinc-950 shadow-md hover:shadow-xl"
          >
            {/* Subtle Selvedge Gold Accent Line along docked edge */}
            <span
              className="absolute left-0 top-3 bottom-3 w-[2.5px] rounded-r transition-colors duration-200 bg-[#B9965A]/70 group-hover:bg-[#B9965A]"
            />

            {/* Filter Slider Icon */}
            <div className="relative p-1 rounded-md transition-colors group-hover:bg-zinc-100/80">
              <SlidersHorizontal
                className="w-3.5 h-3.5 transition-transform duration-200 text-zinc-800 group-hover:text-zinc-950 group-hover:scale-110"
              />
            </div>

            {/* Active Filter Count Badge */}
            {displayCount > 0 && (
              <span className="my-1 flex items-center justify-center min-w-[17px] h-[17px] px-1 rounded-full bg-[#B9965A] text-white text-[9px] font-sans font-bold leading-none shadow-xs">
                {displayCount}
              </span>
            )}

            {/* Vertical Luxury Text Label (Clean Sans-Serif, Natural Top-to-Bottom Flow) */}
            <div
              className="relative z-10 my-2.5 text-[10px] tracking-[0.28em] font-sans uppercase font-bold text-zinc-800 group-hover:text-zinc-950 select-none [writing-mode:vertical-rl]"
            >
              FILTERS
            </div>

            {/* Direction Arrow */}
            <div className="relative p-0.5 transition-transform duration-200">
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-950 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </button>
      </aside>
    </>,
    document.body
  );
}
