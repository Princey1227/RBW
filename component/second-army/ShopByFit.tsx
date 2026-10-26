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
 * Resolves the silhouette image for a given fit name.
 * Exclusively loads black fit images from /fits/black/b*.png
 */
export const getFitImage = (fitName: string): string => {
  let norm = (fitName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (norm.includes("loose") || norm.includes("wide")) norm = "baggy";
  else if (norm.includes("relax")) norm = "comfort";
  else if (norm.includes("skinny")) norm = "slim";
  else if (norm.includes("taper")) norm = "straight";

  return `/fits/black/b${norm}.png`;
};

/**
 * Dedicated Shop By Fit Slide for Second army:
 * Displays visual denim cutouts standing on stage above the giant background color watermark,
 * dynamically filtered to the specific fits the brand sells.
 */
export function ShopByFit({
  fits,
  selectedFit,
  onSelectFit,
  onBack,
  colorName,
}: ShopByFitProps) {
  const displayColor = (colorName || "DENIM").toUpperCase();

  return (
    <div className="flex-1 flex flex-col justify-start pt-3 sm:pt-6 pb-16 px-4 sm:px-8 max-w-[1500px] mx-auto w-full relative">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-6 sm:mb-10 relative z-10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase text-zinc-800 bg-white/90 hover:bg-white border border-zinc-300/80 shadow-xs transition-all cursor-pointer group"
        >
          <ArrowLeft size={13} className="text-[#B9965A] group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.2} />
          <span>Colors</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <h2 className="rbw-fit__heading">SELECT YOUR FIT</h2>
          <span className="rbw-fit__heading-accent" />
        </div>

        {/* Right balancing spacer so heading remains centered */}
        <div className="w-[80px]" aria-hidden="true" />
      </div>

      {/* Fits Grid */}
      <div
        className={`relative z-10 w-full mx-auto grid gap-6 sm:gap-8 justify-center items-end ${
          fits.length === 1
            ? "grid-cols-1 max-w-[340px]"
            : fits.length === 2
            ? "grid-cols-2 max-w-[680px]"
            : fits.length === 3
            ? "grid-cols-1 sm:grid-cols-3 max-w-[1020px]"
            : fits.length === 4
            ? "grid-cols-2 sm:grid-cols-4 max-w-[1240px]"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 max-w-[1440px]"
        }`}
      >
        {fits.map((fitName, idx) => {
          let norm = fitName.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (norm.includes("loose") || norm.includes("wide")) norm = "baggy";
          else if (norm.includes("relax")) norm = "comfort";
          else if (norm.includes("skinny")) norm = "slim";
          else if (norm.includes("taper")) norm = "straight";

          const isSelected = (selectedFit || "").toLowerCase() === fitName.toLowerCase();
          const imgSrc = getFitImage(fitName);

          return (
            <div
              key={fitName}
              onClick={() => onSelectFit(fitName)}
              className="rbw-fit__item group cursor-pointer flex flex-col items-center"
            >
              <div
                className="rbw-fit__card w-full flex flex-col items-center"
                data-active={isSelected ? "true" : undefined}
              >
                {/* Silhouette Stage */}
                <div className="rbw-fit__stage h-[220px] sm:h-[300px] md:h-[360px] w-full flex items-end justify-center relative">
                  <span className="rbw-fit__shadow" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={`${fitName} fit`}
                    className="rbw-fit__img h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 select-none"
                    draggable={false}
                    loading="lazy"
                    onError={(e) => {
                      const t = e.currentTarget;
                      if (!t.dataset.fallback) {
                        t.dataset.fallback = "1";
                        t.src = `/fits/black/b${norm}.png`;
                      } else if (t.dataset.fallback === "1") {
                        t.dataset.fallback = "2";
                        t.src = `/fits/${norm}.png`;
                      } else if (t.dataset.fallback === "2") {
                        t.dataset.fallback = "3";
                        t.src = `/fits/black/bstraight.png`;
                      }
                    }}
                  />
                </div>

                {/* Metadata */}
                <div className="rbw-fit__meta mt-3 sm:mt-4 flex flex-col items-center text-center">
                  <span className="rbw-fit__idx text-[9px] font-mono tracking-widest text-[#B9965A] font-semibold">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="rbw-fit__name text-base sm:text-lg md:text-xl font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#B9965A] transition-colors mt-0.5">
                    {fitName}
                  </span>
                  <span className="rbw-fit__line w-6 h-[1.5px] bg-[#B9965A]/40 my-1.5 transition-all group-hover:w-10 group-hover:bg-[#B9965A]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 transition-colors">
                    Explore Fit →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ShopByFit;
