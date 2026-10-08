"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, RotateCcw } from "lucide-react";
import { BrandName, CategoryType } from "@/app/experience-center/page";
import "./experience-center.css";

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
        <div className="ec-root ec-sheet-wrap" role="dialog" aria-modal="true" aria-label="Filters">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="ec-sheet-back"
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 320 }}
            className="ec-sheet"
          >
            <div className="ec-sheet__grab" />

            <div className="ec-sheet__head">
              <div className="ec-sheet__title">
                Filters
                {activeCount > 0 && <b>{activeCount}</b>}
              </div>
              <div className="ec-sheet__tools">
                {activeCount > 0 && (
                  <button type="button" onClick={onResetAll} className="ec-reset">
                    <RotateCcw size={12} strokeWidth={1.7} />
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="ec-iconbtn ec-sheet__x"
                  aria-label="Close filters"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Brand (multi-select) */}
            <div className="ec-sheet__label">
              <span>Brand {selectedBrands.length > 0 && `· ${selectedBrands.length} selected`}</span>
              {selectedBrands.length > 0 && (
                <button type="button" onClick={onClearBrands}>
                  Clear
                </button>
              )}
            </div>
            <div className="ec-chips">
              <button type="button" onClick={onClearBrands} aria-pressed={isAllBrandsActive} className="ec-chip">
                {isAllBrandsActive && <Check size={12} strokeWidth={2} />}
                All brands
              </button>
              {BRANDS.map((b) => {
                const active = selectedBrands.includes(b.value);
                return (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => onToggleBrand(b.value)}
                    aria-pressed={active}
                    className="ec-chip"
                  >
                    {active && <Check size={12} strokeWidth={2} />}
                    {b.label}
                  </button>
                );
              })}
            </div>

            {/* Category (multi-select) */}
            <div className="ec-sheet__label">
              <span>Category {selectedCategories.length > 0 && `· ${selectedCategories.length} selected`}</span>
              {selectedCategories.length > 0 && (
                <button type="button" onClick={onClearCategories}>
                  Clear
                </button>
              )}
            </div>
            <div className="ec-chips">
              <button type="button" onClick={onClearCategories} aria-pressed={isAllCategoriesActive} className="ec-chip">
                {isAllCategoriesActive && <Check size={12} strokeWidth={2} />}
                All
              </button>
              {CATEGORIES.map((c) => {
                const active = selectedCategories.includes(c.value);
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => onToggleCategory(c.value)}
                    aria-pressed={active}
                    className="ec-chip"
                  >
                    {active && <Check size={12} strokeWidth={2} />}
                    {c.label}
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <div className="ec-sheet__label">
              <span>Sort by</span>
            </div>
            <div className="ec-chips">
              {SORT_OPTIONS.map((o) => {
                const active = sortBy === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => onSortChange(o.value)}
                    aria-pressed={active}
                    className="ec-chip"
                  >
                    {active && <Check size={12} strokeWidth={2} />}
                    {o.label}
                  </button>
                );
              })}
            </div>

            {/* Apply */}
            <div className="ec-sheet__apply">
              <button type="button" onClick={onClose} className="ec-btn">
                <span>View showroom</span>
                <small>
                  ({totalProductsCount} {totalProductsCount === 1 ? "piece" : "pieces"})
                </small>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
