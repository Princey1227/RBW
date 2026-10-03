"use client";

import React from "react";
import { X } from "lucide-react";
import { CategoryId } from "./RbwFilterPanel";

interface RbwCategoryNavProps {
  selectedCategories: CategoryId[];
  onToggleCategory: (catId: CategoryId) => void;
}

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "jeans", label: "JEANS" },
  { id: "jackets", label: "JACKETS" },
  { id: "shorts", label: "SHORTS" },
  { id: "accessories", label: "ACCESSORIES" },
];

export function RbwCategoryNav({
  selectedCategories,
  onToggleCategory,
}: RbwCategoryNavProps) {
  return (
    <nav
      aria-label="Shop by category"
      className="fixed top-[103px] left-0 right-0 z-[80] bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E3DA] py-2 px-4 flex items-center justify-center gap-3.5 sm:gap-4.5 select-none pointer-events-auto transition-all duration-300"
    >
      <span className="text-[11px] sm:text-xs font-bold font-mono tracking-[0.22em] text-zinc-800 uppercase">
        SHOP BY
      </span>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggleCategory(cat.id)}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[10.5px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 focus:outline-none ${
                isSelected
                  ? "bg-[#18181B] text-white border border-[#18181B] shadow-xs"
                  : "bg-white/70 border border-zinc-400 text-zinc-800 hover:border-zinc-800 hover:bg-white"
              }`}
            >
              <span>{cat.label}</span>
              {isSelected && (
                <X className="w-3 h-3 stroke-[2.5] text-zinc-300 hover:text-white transition-colors" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
