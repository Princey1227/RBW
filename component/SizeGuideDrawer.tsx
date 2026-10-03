"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler, HelpCircle } from "lucide-react";
import { useTheme } from "../app/theme-provider";

interface SizeGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFit?: string;
}

interface SizingSpec {
  size: string;
  waist: number;
  inseam: number;
  frontRise: number;
  thigh: number;
  legOpening: number;
}

const sizingData: Record<string, SizingSpec[]> = {
  slim: [
    { size: "28", waist: 29.0, inseam: 32, frontRise: 9.5, thigh: 20.5, legOpening: 13.0 },
    { size: "30", waist: 31.0, inseam: 32, frontRise: 10.0, thigh: 21.5, legOpening: 13.5 },
    { size: "32", waist: 33.0, inseam: 32, frontRise: 10.5, thigh: 22.5, legOpening: 14.0 },
    { size: "34", waist: 35.0, inseam: 32, frontRise: 11.0, thigh: 23.5, legOpening: 14.5 },
    { size: "36", waist: 37.0, inseam: 32, frontRise: 11.5, thigh: 24.5, legOpening: 15.0 },
    { size: "38", waist: 39.0, inseam: 32, frontRise: 12.0, thigh: 25.5, legOpening: 15.5 },
    { size: "40", waist: 41.0, inseam: 32, frontRise: 12.5, thigh: 26.5, legOpening: 16.0 },
    { size: "42", waist: 43.0, inseam: 32, frontRise: 13.0, thigh: 27.5, legOpening: 16.5 },
  ],
  straight: [
    { size: "28", waist: 29.0, inseam: 32, frontRise: 10.0, thigh: 21.5, legOpening: 14.5 },
    { size: "30", waist: 31.0, inseam: 32, frontRise: 10.5, thigh: 22.5, legOpening: 15.0 },
    { size: "32", waist: 33.0, inseam: 32, frontRise: 11.0, thigh: 23.5, legOpening: 15.5 },
    { size: "34", waist: 35.0, inseam: 32, frontRise: 11.5, thigh: 24.5, legOpening: 16.0 },
    { size: "36", waist: 37.0, inseam: 32, frontRise: 12.0, thigh: 25.5, legOpening: 16.5 },
    { size: "38", waist: 39.0, inseam: 32, frontRise: 12.5, thigh: 26.5, legOpening: 17.0 },
    { size: "40", waist: 41.0, inseam: 32, frontRise: 13.0, thigh: 27.5, legOpening: 17.5 },
    { size: "42", waist: 43.0, inseam: 32, frontRise: 13.5, thigh: 28.5, legOpening: 18.0 },
  ],
  baggy: [
    { size: "28", waist: 30.0, inseam: 30, frontRise: 12.0, thigh: 24.5, legOpening: 18.0 },
    { size: "30", waist: 32.0, inseam: 30, frontRise: 12.5, thigh: 25.5, legOpening: 18.5 },
    { size: "32", waist: 34.0, inseam: 30, frontRise: 13.0, thigh: 26.5, legOpening: 19.0 },
    { size: "34", waist: 36.0, inseam: 30, frontRise: 13.5, thigh: 27.5, legOpening: 19.5 },
    { size: "36", waist: 38.0, inseam: 30, frontRise: 14.0, thigh: 28.5, legOpening: 20.0 },
    { size: "38", waist: 40.0, inseam: 30, frontRise: 14.5, thigh: 29.5, legOpening: 20.5 },
    { size: "40", waist: 42.0, inseam: 30, frontRise: 15.0, thigh: 30.5, legOpening: 21.0 },
    { size: "42", waist: 44.0, inseam: 30, frontRise: 15.5, thigh: 31.5, legOpening: 21.5 },
  ],
  comfort: [
    { size: "28", waist: 29.5, inseam: 31, frontRise: 10.75, thigh: 22.5, legOpening: 13.75 },
    { size: "30", waist: 31.5, inseam: 31, frontRise: 11.25, thigh: 23.5, legOpening: 14.25 },
    { size: "32", waist: 33.5, inseam: 31, frontRise: 11.75, thigh: 24.5, legOpening: 14.75 },
    { size: "34", waist: 35.5, inseam: 31, frontRise: 12.25, thigh: 25.5, legOpening: 15.25 },
    { size: "36", waist: 37.5, inseam: 31, frontRise: 12.75, thigh: 26.5, legOpening: 15.75 },
    { size: "38", waist: 39.5, inseam: 31, frontRise: 13.25, thigh: 27.5, legOpening: 16.25 },
    { size: "40", waist: 41.5, inseam: 31, frontRise: 13.75, thigh: 28.5, legOpening: 16.75 },
    { size: "42", waist: 43.5, inseam: 31, frontRise: 14.25, thigh: 29.5, legOpening: 17.25 },
  ],
  bootcut: [
    { size: "28", waist: 29.0, inseam: 33, frontRise: 9.75, thigh: 21.5, legOpening: 17.0 },
    { size: "30", waist: 31.0, inseam: 33, frontRise: 10.25, thigh: 22.5, legOpening: 17.5 },
    { size: "32", waist: 33.0, inseam: 33, frontRise: 10.75, thigh: 23.5, legOpening: 18.0 },
    { size: "34", waist: 35.0, inseam: 33, frontRise: 11.25, thigh: 24.5, legOpening: 18.5 },
    { size: "36", waist: 37.0, inseam: 33, frontRise: 11.75, thigh: 25.5, legOpening: 19.0 },
    { size: "38", waist: 39.0, inseam: 33, frontRise: 12.25, thigh: 26.5, legOpening: 19.5 },
    { size: "40", waist: 41.0, inseam: 33, frontRise: 12.75, thigh: 27.5, legOpening: 20.0 },
    { size: "42", waist: 43.0, inseam: 33, frontRise: 13.25, thigh: 28.5, legOpening: 20.5 },
  ],
  ankle: [
    { size: "28", waist: 29.0, inseam: 28, frontRise: 10.25, thigh: 21.5, legOpening: 12.75 },
    { size: "30", waist: 31.0, inseam: 28, frontRise: 10.75, thigh: 22.5, legOpening: 13.25 },
    { size: "32", waist: 33.0, inseam: 28, frontRise: 11.25, thigh: 23.5, legOpening: 13.75 },
    { size: "34", waist: 35.0, inseam: 28, frontRise: 11.75, thigh: 24.5, legOpening: 14.25 },
    { size: "36", waist: 37.0, inseam: 28, frontRise: 12.25, thigh: 25.5, legOpening: 14.75 },
    { size: "38", waist: 39.0, inseam: 28, frontRise: 12.75, thigh: 26.5, legOpening: 15.25 },
    { size: "40", waist: 41.0, inseam: 28, frontRise: 13.25, thigh: 27.5, legOpening: 15.75 },
    { size: "42", waist: 43.0, inseam: 28, frontRise: 13.75, thigh: 28.5, legOpening: 16.25 },
  ],
};

const fitDescriptions: Record<string, string> = {
  slim: "Tailored fit that contours the leg line. Slim through the hip and thigh, tapering slightly to a narrow leg opening. Crafted to sit comfortable at the waist with minimal excess fabric.",
  straight: "A timeless, classical silhouette. Cut straight from the hip down to the hem. Features a moderate rise and generous thigh profile to ensure natural ease of motion.",
  baggy: "Inspired by vintage loose silhouettes. Extremely relaxed through the hip, seat, thigh, and calf. Features a high-waisted rise and a wide leg profile for a statement drape.",
  comfort: "An ergonomic daily cut. Roomy through the thigh and hip, with a modern tapered finish from the knee down. Features a medium-high front rise for effortless comfort.",
  bootcut: "Classic boot silhouette. Snug through the seat and thighs, widening gradually below the knee to accommodate bulkier footwear. Slightly lower front rise.",
  ankle: "A modern cropped silhouette. Tapered leg profile designed to terminate cleanly right at the ankle. Features an optimal crop length to highlight sneakers and boots.",
};

export default function SizeGuideDrawer({
  isOpen,
  onClose,
  defaultFit = "straight",
}: SizeGuideDrawerProps) {
  const { theme } = useTheme();
  
  // Normalize default fit (in case of 'straight-fit' or 'straight denim')
  const cleanDefaultFit = defaultFit.toLowerCase().replace("-fit", "").replace(" fit", "").trim();
  const validFits = ["slim", "straight", "baggy", "comfort", "bootcut", "ankle"];
  const initialFit = validFits.includes(cleanDefaultFit) ? cleanDefaultFit : "straight";

  const [activeFit, setActiveFit] = useState<string>(initialFit);
  const [unit, setUnit] = useState<"in" | "cm">("in");

  // Sync active fit with defaultFit if drawer opens
  useEffect(() => {
    if (isOpen) {
      const cleanFit = defaultFit.toLowerCase().replace("-fit", "").replace(" fit", "").trim();
      if (validFits.includes(cleanFit)) {
        setActiveFit(cleanFit);
      }
    }
  }, [isOpen, defaultFit]);

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const activeSpecs = sizingData[activeFit] || sizingData.straight;

  const formatValue = (val: number) => {
    if (unit === "cm") {
      return (val * 2.54).toFixed(1);
    }
    return val.toFixed(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Slide-out Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className={`
              fixed
              top-0
              right-0
              bottom-0
              z-[260]
              w-full
              max-w-2xl
              shadow-2xl
              flex
              flex-col
              transition-colors
              duration-300
              ${theme === "light" ? "bg-white text-neutral-900" : "bg-[#0b0f16] text-white border-l border-[#d7a33c]/20"}
            `}
          >
            {/* Drawer Header */}
            <div className={`p-6 border-b flex items-center justify-between select-none ${
              theme === "light" ? "border-neutral-100" : "border-[#d7a33c]/10"
            }`}>
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#d7a33c]" />
                <h2 className="text-sm font-black tracking-[0.25em] uppercase font-serif">
                  FIT & SIZING DIRECTORY
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`
                  p-1.5
                  border
                  rounded-none
                  text-xs
                  font-bold
                  tracking-widest
                  transition-all
                  cursor-pointer
                  ${theme === "light"
                    ? "border-neutral-800 text-neutral-800 hover:bg-neutral-800 hover:text-white"
                    : "border-[#d7a33c]/40 text-[#d7a33c] hover:bg-[#d7a33c] hover:text-black"
                  }
                `}
              >
                CLOSE ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
              {/* Sizing Units Toggle & Fit Tabs */}
              <div className="flex flex-col gap-4 select-none">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] tracking-[0.2em] font-black uppercase text-neutral-400">
                    CHOOSE YOUR FIT:
                  </span>
                  
                  {/* Metric/Imperial Selector */}
                  <div className="flex items-center bg-foreground/[0.04] border border-foreground/10 px-1 py-1 rounded-full text-[10px] font-bold">
                    <button
                      onClick={() => setUnit("in")}
                      className={`px-3 py-1 rounded-full uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                        unit === "in"
                          ? "bg-foreground text-background font-black"
                          : "text-neutral-400 hover:text-foreground"
                      }`}
                    >
                      Inches (in)
                    </button>
                    <button
                      onClick={() => setUnit("cm")}
                      className={`px-3 py-1 rounded-full uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                        unit === "cm"
                          ? "bg-foreground text-background font-black"
                          : "text-neutral-400 hover:text-foreground"
                      }`}
                    >
                      Metric (cm)
                    </button>
                  </div>
                </div>

                {/* Sizing Tabs Selector */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {validFits.map((fit) => {
                    const isSelected = activeFit === fit;
                    return (
                      <button
                        key={fit}
                        onClick={() => setActiveFit(fit)}
                        className={`
                          py-2
                          text-[10px]
                          font-black
                          tracking-widest
                          uppercase
                          border
                          transition-all
                          cursor-pointer
                          ${isSelected
                            ? "bg-foreground text-background border-foreground font-black"
                            : `border-foreground/10 text-neutral-400 hover:border-foreground/50 hover:text-foreground`
                          }
                        `}
                      >
                        {fit}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizing description */}
              <div className="p-4 bg-foreground/[0.02] border-l-2 border-[#d7a33c]/50">
                <h4 className="text-[10px] tracking-widest font-black uppercase mb-1">
                  {activeFit} Fit Profile
                </h4>
                <p className={`text-xs leading-relaxed ${
                  theme === "light" ? "text-neutral-600" : "text-neutral-400"
                }`}>
                  {fitDescriptions[activeFit]}
                </p>
              </div>

              {/* Data Table */}
              <div className="w-full overflow-x-auto select-none">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${theme === "light" ? "border-neutral-100" : "border-[#d7a33c]/10"}`}>
                      <th className="py-3 font-black tracking-widest uppercase text-[#d7a33c] text-[10px]">TAG SIZE</th>
                      <th className="py-3 font-bold tracking-wider uppercase text-neutral-400 text-[10px]">WAIST</th>
                      <th className="py-3 font-bold tracking-wider uppercase text-neutral-400 text-[10px]">INSEAM</th>
                      <th className="py-3 font-bold tracking-wider uppercase text-neutral-400 text-[10px]">FRONT RISE</th>
                      <th className="py-3 font-bold tracking-wider uppercase text-neutral-400 text-[10px]">THIGH</th>
                      <th className="py-3 font-bold tracking-wider uppercase text-neutral-400 text-[10px]">LEG OPENING</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSpecs.map((row) => (
                      <tr
                        key={row.size}
                        className={`border-b transition-colors hover:bg-foreground/[0.02] ${
                          theme === "light" ? "border-neutral-100" : "border-[#d7a33c]/5"
                        }`}
                      >
                        <td className="py-3.5 font-black text-xs tracking-wider">{row.size}</td>
                        <td className="py-3.5 font-mono text-neutral-500 dark:text-neutral-400">{formatValue(row.waist)} {unit}</td>
                        <td className="py-3.5 font-mono text-neutral-500 dark:text-neutral-400">{formatValue(row.inseam)} {unit}</td>
                        <td className="py-3.5 font-mono text-neutral-500 dark:text-neutral-400">{formatValue(row.frontRise)} {unit}</td>
                        <td className="py-3.5 font-mono text-neutral-500 dark:text-neutral-400">{formatValue(row.thigh)} {unit}</td>
                        <td className="py-3.5 font-mono text-neutral-500 dark:text-neutral-400">{formatValue(row.legOpening)} {unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* How to Measure Section */}
              <div className="space-y-4 pt-4 border-t border-foreground/5 select-none">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#d7a33c]" />
                  <h3 className="text-[11px] font-black tracking-widest uppercase">
                    HOW TO MEASURE YOUR BEST-FITTING JEANS
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Sizing Diagram */}
                  <div className={`aspect-[4/3] rounded-lg relative overflow-hidden border p-4 flex flex-col justify-between ${
                    theme === "light" ? "bg-neutral-50 border-neutral-100" : "bg-neutral-900/40 border-[#d7a33c]/10"
                  }`}>
                    {/* Visual schematic of denim outline */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Ruler className="w-32 h-32" />
                    </div>
                    <div className="space-y-2.5 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="flex w-4 h-4 items-center justify-center rounded-full bg-[#d7a33c] text-[8px] font-bold text-black select-none">1</span>
                        <span className="text-[9px] font-black tracking-wider uppercase text-neutral-400">Waist:</span>
                        <span className="text-[9px] font-mono">Measure flat across back waistband, multiply by 2.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex w-4 h-4 items-center justify-center rounded-full bg-[#d7a33c] text-[8px] font-bold text-black select-none">2</span>
                        <span className="text-[9px] font-black tracking-wider uppercase text-neutral-400">Front Rise:</span>
                        <span className="text-[9px] font-mono">From crotch seam straight up to top of waistband.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex w-4 h-4 items-center justify-center rounded-full bg-[#d7a33c] text-[8px] font-bold text-black select-none">3</span>
                        <span className="text-[9px] font-black tracking-wider uppercase text-neutral-400">Thigh:</span>
                        <span className="text-[9px] font-mono">Flat across leg, 1 inch below the crotch seam.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex w-4 h-4 items-center justify-center rounded-full bg-[#d7a33c] text-[8px] font-bold text-black select-none">4</span>
                        <span className="text-[9px] font-black tracking-wider uppercase text-neutral-400">Inseam:</span>
                        <span className="text-[9px] font-mono">From crotch seam straight down inner leg to bottom hem.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex w-4 h-4 items-center justify-center rounded-full bg-[#d7a33c] text-[8px] font-bold text-black select-none">5</span>
                        <span className="text-[9px] font-black tracking-wider uppercase text-neutral-400">Leg Opening:</span>
                        <span className="text-[9px] font-mono">Measure flat across bottom hem opening.</span>
                      </div>
                    </div>
                  </div>

                  {/* Measuring Tips text block */}
                  <div className="space-y-4 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    <p>
                      For the most accurate fit, we recommend measuring a pair of your own favorite, non-stretch cotton denims rather than measuring your own body.
                    </p>
                    <p className="font-bold text-foreground">
                      Note on Selvedge Cotton:
                    </p>
                    <p>
                      Raw selvedge denim does not have elastane synthetic stretch. It will be rigid at first but will mold to your waist and shape over 15-20 wears. Choose a tag size closest to your actual waist measurement.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className={`p-6 border-t select-none flex items-center justify-between ${
              theme === "light" ? "bg-neutral-50 border-neutral-100" : "bg-[#080b12] border-[#d7a33c]/10"
            }`}>
              <span className="text-[9px] tracking-wider text-neutral-400 font-bold uppercase">
                Need sizing advice? Contact support for fit guidance.
              </span>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-foreground text-background hover:bg-[#d7a33c] hover:text-black rounded-none text-[10px] font-black tracking-[0.18em] uppercase transition-all duration-300 cursor-pointer"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
