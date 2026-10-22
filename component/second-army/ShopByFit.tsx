"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import "@/component/rbw/rbw-fit.css";
import "@/component/rbw/rbw-journey.css";

interface ShopByFitProps {
  fits: string[];
  selectedFit: string | null;
  onSelectFit: (fit: string) => void;
  onBack: () => void;
  colorName?: string;
}

/**
 * Dedicated Shop By Fit Slide for Second army
 * Edit fits presentation, silhouettes, and sizing cards here.
 */
export function ShopByFit({
  fits,
  selectedFit,
  onSelectFit,
  onBack,
  colorName,
}: ShopByFitProps) {
  return (
    <div className="flex-1 flex flex-col justify-start pt-3 sm:pt-6 pb-8 px-4 sm:px-8 max-w-[1400px] mx-auto w-full">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase text-zinc-800 bg-white hover:bg-zinc-100 border border-zinc-300 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft size={13} className="text-[#5A6E3E]" />
          <span>Colors</span>
        </button>

        <div className="text-center">
          <h2 className="rbw-fit__heading">SELECT YOUR FIT</h2>
          <span className="rbw-fit__heading-accent" />
        </div>

        <div className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">
          {colorName || "All Shades"}
        </div>
      </div>

      {/* Fits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {fits.map((fitName, idx) => (
          <div
            key={fitName}
            onClick={() => onSelectFit(fitName)}
            className="rbw-fit__card group cursor-pointer border border-zinc-200 hover:border-[#5A6E3E] rounded-lg p-5 bg-white/90 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-zinc-400">
              <span>{String(idx + 1).padStart(2, "0")}</span>
              <span className="text-[#5A6E3E] group-hover:translate-x-1 transition-transform">Explore →</span>
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#5A6E3E] transition-colors">
              {fitName}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Custom Second army silhouette tailored for tactical utility and comfort.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShopByFit;
