"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  Palette,
  Edit3,
  ExternalLink,
  ArrowRight,
  Eye,
  Info,
} from "lucide-react";

interface TemplateBrandCustomizerBarProps {
  brandName: string;
  onChangeBrandName: (name: string) => void;
  accentColor: string;
  onChangeAccentColor: (color: string) => void;
  onOpenSimulation: () => void;
}

const PRESET_COLORS = [
  { name: "Signature Gold", hex: "#B9965A" },
  { name: "Royal Cobalt", hex: "#1E40AF" },
  { name: "Obsidian Noir", hex: "#18181B" },
  { name: "Crimson Selvedge", hex: "#991B1B" },
  { name: "Forest Olive", hex: "#166534" },
];

export default function TemplateBrandCustomizerBar({
  brandName,
  onChangeBrandName,
  accentColor,
  onChangeAccentColor,
  onOpenSimulation,
}: TemplateBrandCustomizerBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      aria-label="Brand Partner Live Preview Bar"
      className="fixed top-18 sm:top-20 right-3 sm:right-6 z-60 max-w-sm w-full select-none transition-all duration-300 pointer-events-auto"
    >
      {/* Minimized Pill */}
      {!isExpanded ? (
        <div className="flex justify-end">
          <button
            onClick={() => setIsExpanded(true)}
            className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#1C1917]/90 hover:bg-black text-white text-xs font-bold tracking-wider uppercase border border-white/20 shadow-2xl backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: `${accentColor}80`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: accentColor }}
            />
            <span className="font-mono text-[10px] text-stone-300">DEMO ATELIER:</span>
            <span className="text-[#F5F1E8] font-serif font-bold tracking-wide">
              {brandName || "YOUR BRAND"}
            </span>
            <Sliders className="w-3.5 h-3.5 text-[#B9965A] ml-1 group-hover:rotate-45 transition-transform" />
          </button>
        </div>
      ) : (
        /* Expanded Customizer Panel */
        <div className="bg-[#FAF8F5]/95 backdrop-blur-xl border border-stone-300/80 rounded-2xl p-4 sm:p-5 shadow-2xl text-[#1C1917] animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#B9965A]" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-stone-800 font-mono">
                BRAND PARTNER DEMO MODE
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-md hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
              title="Minimize panel"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-2 text-[11px] text-stone-600 leading-relaxed">
            See how your store looks on OnlyDenims. Change the brand name and palette to see live instant updates:
          </p>

          {/* Input Brand Name */}
          <div className="mt-3.5">
            <label className="text-[9.5px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
              Your Brand Name
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={brandName}
                onChange={(e) => onChangeBrandName(e.target.value)}
                placeholder="Enter Brand Name (e.g. STUDIO 99)"
                maxLength={26}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800 uppercase tracking-wider placeholder:text-stone-400"
              />
              <Edit3 className="w-3.5 h-3.5 text-stone-400 absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Color Presets */}
          <div className="mt-3.5">
            <label className="text-[9.5px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
              Brand Accent Palette
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => onChangeAccentColor(col.hex)}
                  title={col.name}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                    accentColor.toLowerCase() === col.hex.toLowerCase()
                      ? "scale-125 border-stone-900 shadow-md ring-2 ring-stone-400"
                      : "border-black/20 hover:scale-110"
                  }`}
                  style={{ backgroundColor: col.hex }}
                />
              ))}
            </div>
          </div>

          {/* Live Simulation Info Button */}
          <div className="mt-4 pt-3 border-t border-stone-200/80 flex flex-col gap-2">
            <button
              onClick={onOpenSimulation}
              className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-white text-[10.5px] font-black tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-98"
            >
              <Eye className="w-3.5 h-3.5 text-[#B9965A]" />
              <span>TEST ORDER WORKFLOW DEMO</span>
            </button>

            <Link
              href="/for-brands"
              className="w-full py-2 px-3 rounded-xl text-stone-900 hover:bg-stone-200/80 border border-stone-300 text-[10.5px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <span>PARTNER WITH ONLY DENIMS</span>
              <ArrowRight className="w-3 h-3 text-[#B9965A]" />
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
