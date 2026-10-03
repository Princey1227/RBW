"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

export type CategoryId = "jeans" | "jackets" | "shorts" | "accessories";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "jeans", label: "JEANS" },
  { id: "jackets", label: "JACKETS" },
  { id: "shorts", label: "SHORTS" },
  { id: "accessories", label: "ACCESSORIES" },
];

export default function RbwNavbarCategorySelector() {
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>(["jeans"]);

  // Listen to state updates from preview-3d page
  useEffect(() => {
    const handleStateUpdate = (e: any) => {
      if (e.detail?.selectedCategories) {
        setSelectedCategories(e.detail.selectedCategories);
      }
    };
    window.addEventListener("RBW_PREVIEW_CATEGORIES_STATE", handleStateUpdate);
    return () =>
      window.removeEventListener("RBW_PREVIEW_CATEGORIES_STATE", handleStateUpdate);
  }, []);

  const handleToggle = (catId: CategoryId) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("RBW_PREVIEW_TOGGLE_CATEGORY", { detail: catId })
      );
    }
  };

  const handleToggleFilter = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("RBW_PREVIEW_TOGGLE_FILTER"));
    }
  };

  return (
    <div className="flex items-center gap-1.5 xl:gap-2 select-none pointer-events-auto">
      {/* SHOP BY Button with dropdown chevron */}
      <button
        type="button"
        onClick={handleToggleFilter}
        className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] xl:text-[10.5px] font-bold tracking-wider uppercase border border-zinc-300 hover:border-zinc-700 text-zinc-800 bg-white/80 hover:bg-white transition-all cursor-pointer shadow-2xs"
        title="Open filter panel"
      >
        <span>SHOP BY</span>
        <ChevronDown className="w-3 h-3 text-zinc-600" />
      </button>

      {/* Category Pills */}
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategories.includes(cat.id);

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleToggle(cat.id)}
            className={`flex items-center gap-1 px-3 xl:px-3.5 py-1 rounded-full text-[10px] xl:text-[10.5px] font-bold tracking-wider uppercase transition-all cursor-pointer shadow-2xs ${isSelected
                ? "bg-[#18181B] text-white border border-[#18181B]"
                : "bg-white/80 border border-zinc-300 hover:border-zinc-700 text-zinc-800 hover:bg-white"
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
  );
}
