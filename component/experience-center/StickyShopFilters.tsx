"use client";

import React, { useState } from "react";
import { Search, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandName, CategoryType } from "@/app/experience-center/page";

export interface FilterOption<T> {
  label: string;
  value: T;
}

interface StickyShopFiltersProps {
  selectedBrands: BrandName[];
  onToggleBrand: (brand: BrandName) => void;
  onClearBrands: () => void;
  selectedCategories: CategoryType[];
  onToggleCategory: (category: CategoryType) => void;
  onClearCategories: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "featured" | "price-asc" | "price-desc";
  onSortChange: (sort: "featured" | "price-asc" | "price-desc") => void;
  onResetAll: () => void;
  brandsList: { label: string; value: BrandName }[];
  categoriesList: { label: string; value: CategoryType }[];
}

export default function StickyShopFilters({
  selectedBrands,
  onToggleBrand,
  onClearBrands,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onResetAll,
  brandsList,
  categoriesList,
}: StickyShopFiltersProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedCategories.length > 0 ||
    searchQuery.trim() !== "" ||
    sortBy !== "featured";

  const isAllBrandsActive = selectedBrands.length === 0;
  const isAllCategoriesActive = selectedCategories.length === 0;

  return (
    <div
      id="filter-bar"
      className="sticky top-[48px] sm:top-[58px] z-40 w-full px-2.5 sm:px-8 xl:px-12 py-1.5 sm:py-2.5 transition-all bg-[#FAF8F5]/98 sm:bg-[#F5F2EB]/95 backdrop-blur-md border-b border-[#E2DAD0] shadow-xs"
    >
      <div className="w-full max-w-[1440px] mx-auto sm:rounded-[16px] sm:bg-[#FCFAF6] sm:p-2.5 sm:px-5 sm:border sm:border-[#E7E1D4] sm:shadow-2xs">
        {/* ─── DESKTOP TOOLBAR LAYOUT (STREAMLINED SINGLE ROW MATCHING MOCKUP) ─── */}
        <div className="hidden lg:flex items-center justify-between gap-3 xl:gap-4 flex-wrap xl:flex-nowrap">
          {/* Left Section: SHOP BY BRAND */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#78716C] font-sans flex-shrink-0">
              SHOP BY BRAND
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-nowrap whitespace-nowrap">
              {/* ALL BRANDS Button */}
              <button
                type="button"
                onClick={onClearBrands}
                className={`px-3 py-1 rounded-full text-[9.5px] font-bold tracking-[0.08em] uppercase transition-all cursor-pointer font-sans flex-shrink-0 active:scale-95 ${
                  isAllBrandsActive
                    ? "bg-[#17140F] text-white border border-[#17140F] shadow-xs"
                    : "bg-white text-[#17140F] border border-[#DED7CA] hover:border-[#17140F]"
                }`}
              >
                ALL BRANDS
              </button>

              {/* Brand Chips */}
              {brandsList.map((b) => {
                const isSelected = selectedBrands.includes(b.value);
                return (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => onToggleBrand(b.value)}
                    className={`px-3 py-1 rounded-full text-[9.5px] font-bold tracking-[0.08em] uppercase transition-all cursor-pointer font-sans flex items-center gap-1.5 flex-shrink-0 active:scale-95 ${
                      isSelected
                        ? "bg-[#17140F] text-white border border-[#17140F] shadow-xs"
                        : "bg-white text-[#17140F] border border-[#DED7CA] hover:border-[#17140F]"
                    }`}
                  >
                    <span>{b.label}</span>
                    {isSelected && (
                      <X className="w-3 h-3 stroke-[2.5] text-zinc-300 hover:text-white transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden xl:block w-px h-5 bg-[#E2DCD0] flex-shrink-0" />

          {/* Middle Section: CATEGORY */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#78716C] font-sans flex-shrink-0">
              CATEGORY
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-nowrap whitespace-nowrap">
              {/* ALL CATEGORIES Button */}
              <button
                type="button"
                onClick={onClearCategories}
                className={`px-3 py-1 rounded-full text-[9.5px] font-bold tracking-[0.08em] uppercase transition-all cursor-pointer font-sans flex-shrink-0 active:scale-95 ${
                  isAllCategoriesActive
                    ? "bg-[#17140F] text-white border border-[#17140F] shadow-xs"
                    : "bg-white text-[#17140F] border border-[#DED7CA] hover:border-[#17140F]"
                }`}
              >
                ALL
              </button>

              {/* Category Chips */}
              {categoriesList.map((c) => {
                const isSelected = selectedCategories.includes(c.value);
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => onToggleCategory(c.value)}
                    className={`px-3 py-1 rounded-full text-[9.5px] font-bold tracking-[0.08em] uppercase transition-all cursor-pointer font-sans flex items-center gap-1.5 flex-shrink-0 active:scale-95 ${
                      isSelected
                        ? "bg-[#17140F] text-white border border-[#17140F] shadow-xs"
                        : "bg-white text-[#17140F] border border-[#DED7CA] hover:border-[#17140F]"
                    }`}
                  >
                    <span>{c.label}</span>
                    {isSelected && (
                      <X className="w-3 h-3 stroke-[2.5] text-zinc-300 hover:text-white transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Section: Search + Sort Dropdown */}
          <div className="flex items-center gap-2.5 flex-shrink-0 font-sans ml-auto">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#DED7CA] w-[180px] xl:w-[210px]">
              <Search className="w-3.5 h-3.5 text-[#8A857C] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search products, brands or styles..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-transparent text-[10.5px] text-[#17140F] placeholder-[#9E9788] outline-none w-full font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="text-[#8A857C] hover:text-[#17140F] text-xs px-0.5 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSortMenu((v) => !v);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9.5px] font-bold tracking-[0.06em] uppercase border border-[#DED7CA] bg-white text-[#17140F] cursor-pointer hover:border-[#17140F] transition-all"
              >
                <span>Sort:</span>
                <span className="font-extrabold">
                  {sortBy === "featured"
                    ? "Featured"
                    : sortBy === "price-asc"
                      ? "Price ↑"
                      : "Price ↓"}
                </span>
                <ChevronDown className="w-3 h-3 text-[#78716C]" />
              </button>

              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-1 w-[160px] bg-white border border-[#ECE7DC] rounded-[10px] shadow-lg z-50 overflow-hidden"
                  >
                    {[
                      { label: "Featured", value: "featured" as const },
                      { label: "Price: Low → High", value: "price-asc" as const },
                      { label: "Price: High → Low", value: "price-desc" as const },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSortChange(opt.value);
                          setShowSortMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-[10.5px] font-semibold text-[#17140F] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {hasActiveFilters && (
              <button
                onClick={onResetAll}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9.5px] font-bold tracking-[0.06em] uppercase border border-[#DED7CA] bg-white text-[#17140F] cursor-pointer hover:bg-[#17140F] hover:text-white transition-all active:scale-95"
              >
                <SlidersHorizontal className="w-3 h-3 text-current" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ─── MOBILE / TABLET (< lg) COMPACT SCROLLABLE TOOLBAR ─── */}
        <div className="flex lg:hidden flex-col gap-1.5 py-0.5">
          {/* Row 1: Search + Sort + Reset */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#DED7CA] h-7">
              <Search className="w-3 h-3 text-[#8A857C] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search styles..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-transparent text-[10px] text-[#17140F] placeholder-[#9E9788] outline-none w-full font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="text-[#8A857C] text-xs px-0.5"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSortMenu((v) => !v);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[8.5px] font-bold uppercase border border-[#DED7CA] bg-white text-[#17140F] h-7 cursor-pointer active:scale-95"
              >
                <span>
                  {sortBy === "featured"
                    ? "Featured"
                    : sortBy === "price-asc"
                      ? "Price ↑"
                      : "Price ↓"}
                </span>
                <ChevronDown className="w-3 h-3 text-[#78716C]" />
              </button>

              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-1 w-[150px] bg-white border border-[#ECE7DC] rounded-[10px] shadow-lg z-50 overflow-hidden"
                  >
                    {[
                      { label: "Featured", value: "featured" as const },
                      { label: "Price: Low → High", value: "price-asc" as const },
                      { label: "Price: High → Low", value: "price-desc" as const },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSortChange(opt.value);
                          setShowSortMenu(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-[10px] font-semibold text-[#17140F] hover:bg-[#F5F2EB]"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {hasActiveFilters && (
              <button
                onClick={onResetAll}
                className="px-2 py-1 rounded-full text-[8.5px] font-bold uppercase bg-[#17140F] text-white shrink-0 h-7 active:scale-95"
              >
                Reset
              </button>
            )}
          </div>

          {/* Row 2: Scrollable Brand Chips */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-nowrap whitespace-nowrap">
            <button
              type="button"
              onClick={onClearBrands}
              className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase transition-all font-sans shrink-0 active:scale-95 cursor-pointer ${
                isAllBrandsActive
                  ? "bg-[#17140F] text-white border border-[#17140F]"
                  : "bg-white text-[#17140F] border border-[#DED7CA]"
              }`}
            >
              ALL BRANDS
            </button>
            {brandsList.map((b) => {
              const isSelected = selectedBrands.includes(b.value);
              return (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => onToggleBrand(b.value)}
                  className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase transition-all font-sans flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer ${
                    isSelected
                      ? "bg-[#17140F] text-white border border-[#17140F]"
                      : "bg-white text-[#17140F] border border-[#DED7CA]"
                  }`}
                >
                  <span>{b.label}</span>
                  {isSelected && (
                    <X className="w-2.5 h-2.5 stroke-[2.5] text-zinc-300" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Row 3: Scrollable Category Chips */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-nowrap whitespace-nowrap">
            <button
              type="button"
              onClick={onClearCategories}
              className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase transition-all font-sans shrink-0 active:scale-95 cursor-pointer ${
                isAllCategoriesActive
                  ? "bg-[#17140F] text-white border border-[#17140F]"
                  : "bg-white text-[#17140F] border border-[#DED7CA]"
              }`}
            >
              ALL
            </button>
            {categoriesList.map((c) => {
              const isSelected = selectedCategories.includes(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onToggleCategory(c.value)}
                  className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase transition-all font-sans flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer ${
                    isSelected
                      ? "bg-[#17140F] text-white border border-[#17140F]"
                      : "bg-white text-[#17140F] border border-[#DED7CA]"
                  }`}
                >
                  <span>{c.label}</span>
                  {isSelected && (
                    <X className="w-2.5 h-2.5 stroke-[2.5] text-zinc-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
