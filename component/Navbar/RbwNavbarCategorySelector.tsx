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
  const [rbwTheme, setRbwTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rbw_theme") as "dark" | "light" | null;
      if (saved === "dark" || saved === "light") {
        setRbwTheme(saved);
      }
      const handleTheme = (e: any) => {
        if (e.detail === "dark" || e.detail === "light") {
          setRbwTheme(e.detail);
        }
      };
      window.addEventListener("RBW_THEME_CHANGED", handleTheme);
      return () => window.removeEventListener("RBW_THEME_CHANGED", handleTheme);
    }
  }, []);

  // Listen to category state updates from 3D showroom
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
      {/* Category Pills */}
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategories.includes(cat.id);

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleToggle(cat.id)}
            className={`flex items-center gap-1 px-3 xl:px-3.5 py-1 rounded-full text-[10px] xl:text-[10.5px] font-bold tracking-wider uppercase transition-all cursor-pointer shadow-2xs ${
              isSelected
                ? rbwTheme === "dark"
                  ? "bg-[#B9965A] text-[#07080a] border border-[#B9965A]"
                  : "bg-[#18181B] text-white border border-[#18181B]"
                : rbwTheme === "dark"
                  ? "bg-white/5 border border-white/20 hover:border-white/50 text-white/80 hover:bg-white/10"
                  : "bg-white/80 border border-zinc-300 hover:border-zinc-700 text-zinc-800 hover:bg-white"
            }`}
          >
            <span>{cat.label}</span>
            {isSelected && (
              <X className={`w-3 h-3 stroke-[2.5] ${rbwTheme === "dark" ? "text-[#07080a]" : "text-zinc-300 hover:text-white"} transition-colors`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
