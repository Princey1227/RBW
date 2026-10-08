"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, RotateCcw, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandName, CategoryType } from "@/app/experience-center/page";
import "./experience-center.css";

export interface FilterOption<T> {
  label: string;
  value: T;
}

type SortKey = "featured" | "price-asc" | "price-desc";

interface StickyShopFiltersProps {
  selectedBrands: BrandName[];
  onToggleBrand: (brand: BrandName) => void;
  onClearBrands: () => void;
  selectedCategories: CategoryType[];
  onToggleCategory: (category: CategoryType) => void;
  onClearCategories: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortKey;
  onSortChange: (sort: SortKey) => void;
  onResetAll: () => void;
  brandsList: { label: string; value: BrandName }[];
  categoriesList: { label: string; value: CategoryType }[];
  /** number of pieces currently on display (purely informational) */
  resultCount?: number;
}

const SORT_OPTIONS: { label: string; short: string; value: SortKey }[] = [
  { label: "Featured", short: "Featured", value: "featured" },
  { label: "Price: Low → High", short: "Price ↑", value: "price-asc" },
  { label: "Price: High → Low", short: "Price ↓", value: "price-desc" },
];

/**
 * Desktop showroom navigation bar. Brand selection lives in the exhibition
 * selector at the foot of the showroom (same handlers, passed down by the page),
 * so this bar carries category, search, sort and reset.
 */
export default function StickyShopFilters({
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onResetAll,
  selectedBrands,
  onToggleBrand,
  onClearBrands,
  brandsList,
  categoriesList,
  resultCount,
}: StickyShopFiltersProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedCategories.length > 0 ||
    searchQuery.trim() !== "" ||
    sortBy !== "featured";

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showSortMenu && sortRef.current && !sortRef.current.contains(target)) setShowSortMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [showSortMenu]);

  const sortShort = SORT_OPTIONS.find((o) => o.value === sortBy)?.short ?? "Featured";

  return (
    <div id="filter-bar" className="ec-bar">
      <div className="ec-tabs" role="group" aria-label="Filters">
        <div className="ec-bar__label">Shop by brand</div>
        <button
          type="button"
          className="ec-tab"
          aria-pressed={selectedBrands.length === 0}
          onClick={onClearBrands}
        >
          All
        </button>
        {brandsList.map((b) => (
          <button
            key={b.value}
            type="button"
            className="ec-tab"
            aria-pressed={selectedBrands.includes(b.value)}
            onClick={() => onToggleBrand(b.value)}
          >
            {b.label}
          </button>
        ))}

        <span className="ec-bar__sep" aria-hidden style={{ margin: "0 10px" }} />

        <div className="ec-bar__label">Shop by category</div>
        <button
          type="button"
          className="ec-tab"
          aria-pressed={selectedCategories.length === 0}
          onClick={onClearCategories}
        >
          All
        </button>
        {categoriesList.map((c) => (
          <button
            key={c.value}
            type="button"
            className="ec-tab"
            aria-pressed={selectedCategories.includes(c.value)}
            onClick={() => onToggleCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="ec-bar__tools">
        <label className="ec-search">
          <Search size={14} strokeWidth={1.5} aria-hidden />
          <input
            type="text"
            placeholder="Search the showroom"
            aria-label="Search products, brands or styles"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button type="button" aria-label="Clear search" onClick={() => onSearchChange("")}>
              <X size={13} strokeWidth={1.6} />
            </button>
          )}
        </label>

        <div className="ec-sort" ref={sortRef}>
          <button
            type="button"
            className="ec-sort__btn"
            aria-haspopup="menu"
            aria-expanded={showSortMenu}
            onClick={(e) => {
              e.stopPropagation();
              setShowSortMenu((v) => !v);
            }}
          >
            Sort <b>{sortShort}</b>
            <ChevronDown size={13} strokeWidth={1.6} />
          </button>
          <AnimatePresence>
            {showSortMenu && (
              <motion.div
                role="menu"
                className="ec-sort__menu"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.22, 0.8, 0.24, 1] }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={sortBy === opt.value}
                    className="ec-sort__opt"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSortChange(opt.value);
                      setShowSortMenu(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {hasActiveFilters && (
          <button type="button" className="ec-reset" onClick={onResetAll}>
            <RotateCcw size={12} strokeWidth={1.7} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
