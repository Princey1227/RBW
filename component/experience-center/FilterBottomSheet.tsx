"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, RotateCcw } from "lucide-react";
import { BrandName, CategoryType } from "@/app/experience-center/page";

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBrands: BrandName[];
  onToggleBrand: (brand: BrandName) => void;
  onClearBrands: () => void;
  selectedCategories: CategoryType[];
  onToggleCategory: (category: CategoryType) => void;
  onClearCategories: () => void;
  sortBy: "featured" | "price-asc" | "price-desc";
  onSortChange: (sort: "featured" | "price-asc" | "price-desc") => void;
  onResetAll: () => void;
  totalProductsCount: number;
}

const BRANDS: { label: string; value: BrandName }[] = [
  { label: "RBW", value: "RBW" },
  { label: "THINC", value: "THINC" },
  { label: "WIDE", value: "WIDE" },
  { label: "iJNS", value: "IJNS" },
  { label: "SECOND ARMY", value: "SECOND ARMY" },
];

const CATEGORIES: { label: string; value: CategoryType }[] = [
  { label: "JEANS", value: "JEANS" },
  { label: "JACKETS", value: "JACKETS" },
  { label: "SHORTS", value: "SHORTS" },
  { label: "ACCESSORIES", value: "ACCESSORIES" },
];

const SORT_OPTIONS: { label: string; value: "featured" | "price-asc" | "price-desc" }[] = [
  { label: "FEATURED", value: "featured" },
  { label: "PRICE: LOW → HIGH", value: "price-asc" },
  { label: "PRICE: HIGH → LOW", value: "price-desc" },
];

export default function FilterBottomSheet({
  isOpen,
  onClose,
  selectedBrands,
  onToggleBrand,
  onClearBrands,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  sortBy,
  onSortChange,
  onResetAll,
  totalProductsCount,
}: FilterBottomSheetProps) {
  const activeCount =
    selectedBrands.length +
    selectedCategories.length +
    (sortBy !== "featured" ? 1 : 0);

  const isAllBrandsActive = selectedBrands.length === 0;
  const isAllCategoriesActive = selectedCategories.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex flex-col justify-end pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-xs"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full max-h-[85vh] overflow-y-auto bg-[#141210] border-t border-[#B9965A]/40 rounded-t-[28px] p-6 pb-8 shadow-[0_-16px_40px_rgba(0,0,0,0.8)] text-white select-none"
          >
            {/* Grab Handle */}
            <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-5" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-[0.2em] uppercase text-white font-sans">
                  FILTERS
                </span>
                {activeCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#B9965A] text-black text-[10px] font-black flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button
                    onClick={onResetAll}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#C5A870] hover:text-white tracking-wider uppercase transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>RESET</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Section 1: BRAND (Multi-select) */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#A69E92] uppercase font-mono">
                  BRAND {selectedBrands.length > 0 && `(${selectedBrands.length} selected)`}
                </span>
                {selectedBrands.length > 0 && (
                  <button
                    onClick={onClearBrands}
                    className="text-[9.5px] font-bold text-[#C5A870] hover:underline uppercase font-mono"
                  >
                    CLEAR
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {/* ALL BRANDS Chip */}
                <button
                  onClick={onClearBrands}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAllBrandsActive
                      ? "bg-[#C5A870] text-black shadow-[0_2px_10px_rgba(197,168,112,0.3)] border border-[#DFCFA8]"
                      : "bg-white/5 text-stone-300 border border-white/15 hover:border-white/30"
                  }`}
                >
                  {isAllBrandsActive && <Check className="w-3 h-3 text-black stroke-[3]" />}
                  <span>ALL BRANDS</span>
                </button>

                {BRANDS.map((b) => {
                  const active = selectedBrands.includes(b.value);
                  return (
                    <button
                      key={b.value}
                      onClick={() => onToggleBrand(b.value)}
                      className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? "bg-[#C5A870] text-black shadow-[0_2px_10px_rgba(197,168,112,0.3)] border border-[#DFCFA8]"
                          : "bg-white/5 text-stone-300 border border-white/15 hover:border-white/30"
                      }`}
                    >
                      {active ? (
                        <X className="w-3 h-3 text-black stroke-[2.5]" />
                      ) : null}
                      <span>{b.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: CATEGORY (Multi-select) */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#A69E92] uppercase font-mono">
                  CATEGORY {selectedCategories.length > 0 && `(${selectedCategories.length} selected)`}
                </span>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={onClearCategories}
                    className="text-[9.5px] font-bold text-[#C5A870] hover:underline uppercase font-mono"
                  >
                    CLEAR
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {/* ALL CATEGORIES Chip */}
                <button
                  onClick={onClearCategories}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAllCategoriesActive
                      ? "bg-[#C5A870] text-black shadow-[0_2px_10px_rgba(197,168,112,0.3)] border border-[#DFCFA8]"
                      : "bg-white/5 text-stone-300 border border-white/15 hover:border-white/30"
                  }`}
                >
                  {isAllCategoriesActive && <Check className="w-3 h-3 text-black stroke-[3]" />}
                  <span>ALL</span>
                </button>

                {CATEGORIES.map((c) => {
                  const active = selectedCategories.includes(c.value);
                  return (
                    <button
                      key={c.value}
                      onClick={() => onToggleCategory(c.value)}
                      className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? "bg-[#C5A870] text-black shadow-[0_2px_10px_rgba(197,168,112,0.3)] border border-[#DFCFA8]"
                          : "bg-white/5 text-stone-300 border border-white/15 hover:border-white/30"
                      }`}
                    >
                      {active ? (
                        <X className="w-3 h-3 text-black stroke-[2.5]" />
                      ) : null}
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: SORT */}
            <div className="mt-6">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#A69E92] uppercase font-mono block mb-3">
                SORT BY
              </span>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((s) => {
                  const active = sortBy === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => onSortChange(s.value)}
                      className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? "bg-[#C5A870] text-black shadow-[0_2px_10px_rgba(197,168,112,0.3)] border border-[#DFCFA8]"
                          : "bg-white/5 text-stone-300 border border-white/15 hover:border-white/30"
                      }`}
                    >
                      {active && <Check className="w-3 h-3 text-black stroke-[3]" />}
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apply Button */}
            <div className="mt-8 pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#D4B16A] via-[#B9965A] to-[#9C7A3F] text-black text-xs font-black tracking-[0.18em] uppercase shadow-[0_8px_24px_rgba(185,150,90,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>APPLY FILTERS</span>
                <span className="text-[11px] font-bold opacity-80">
                  ({totalProductsCount} {totalProductsCount === 1 ? "Piece" : "Pieces"})
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
