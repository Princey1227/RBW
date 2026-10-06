"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Ruler, X, ArrowRight, Check } from "lucide-react";
import { RbwFitSelector } from "@/component/rbw/RbwFitSelector";

interface ShopByFitProps {
  selectedWash: "raw" | "black" | "white" | "vintage" | null;
  selectedFit?: string | null;
  isInsideViewport: boolean;
  onFitClick?: (fitName: string) => void;
  /** Opt-in showroom styling (used by /stores/rbw). Default keeps the original look. */
  variant?: "default" | "showroom";
}

interface SizingSpec {
  size: string;
  waist: number;
  inseam: number;
  frontRise: number;
  thigh: number;
  legOpening: number;
}

const JEANS_SIZING_DATA: Record<string, SizingSpec[]> = {
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
};

const fitItems = [
  {
    name: "Ankle",
    image: "/fits/ankle.png",
    keySpec: "Inseam: 28\" • Leg: 13\"",
    description: "Cropped length with a modern taper above the shoes. Ideal for showing sneakers or boots.",
  },
  {
    name: "Slim",
    image: "/fits/slim.png",
    keySpec: "Inseam: 32\" • Leg: 14\"",
    description: "Tailored silhouette close through the thigh and calf with a clean, streamlined leg line.",
  },
  {
    name: "Comfort",
    image: "/fits/comfort.png",
    keySpec: "Inseam: 31\" • Leg: 15\"",
    description: "Roomier through the seat and thighs with a slight, comfortable taper toward the hem.",
  },
  {
    name: "Straight",
    image: "/fits/straight.png",
    keySpec: "Inseam: 32\" • Leg: 16\"",
    description: "Classic regular heritage cut, parallel from the thigh straight down to the leg opening.",
  },
  {
    name: "Baggy",
    image: "/fits/baggy.png",
    keySpec: "Inseam: 30\" • Leg: 19\"",
    description: "Wide-leg relaxed street style with generous proportions and effortless natural stacking.",
  },
  {
    name: "Bootcut",
    image: "/fits/bootcut.png",
    keySpec: "Inseam: 33\" • Leg: 18\"",
    description: "Fitted through the thigh and gently opening below the knee to drape perfectly over boots.",
  },
];

const getProductUrlForWashAndFit = (wash: "raw" | "black" | "white" | "vintage", fitName: string) => {
  const normFit = fitName.toLowerCase();

  if (wash === "raw") {
    if (normFit === "slim") return "/product/raw-slim-denims";
    if (normFit === "straight") return "/product/raw-straight-denims";
    if (normFit === "baggy") return "/product/raw-baggy-denims";
    if (normFit === "bootcut") return "/product/raw-bootcut-denims";
    if (normFit === "ankle") return "/product/raw-ankle-denims";
    if (normFit === "comfort") return "/product/raw-comfort-denims";
  } else if (wash === "black") {
    if (normFit === "slim") return "/product/black-slim-denims";
    if (normFit === "straight") return "/product/black-straight-denims";
    if (normFit === "baggy") return "/product/black-baggy-denims";
    if (normFit === "bootcut") return "/product/black-bootcut-denims";
    if (normFit === "ankle") return "/product/black-ankle-denims";
    if (normFit === "comfort") return "/product/black-comfort-denims";
  } else if (wash === "white" || wash === "vintage") {
    if (normFit === "slim") return "/product/white-slim-denim";
    if (normFit === "straight") return "/product/white-straight-denim";
    if (normFit === "baggy") return "/product/white-baggy-denim";
    if (normFit === "bootcut") return "/product/white-bootcut-denim";
    if (normFit === "ankle") return "/product/white-ankle-denim";
    if (normFit === "comfort") return "/product/white-comfort-denim";
  }
  return `/shop?wash=${wash}&fit=${normFit}`;
};

export const getFitImage = (
  fitName: string,
  wash?: "raw" | "black" | "white" | "vintage" | string | null
): string => {
  const normFit = (fitName || "").toLowerCase().trim();
  const normWash = (wash || "raw").toLowerCase().trim();

  if (normWash === "black") {
    return `/fits/black/b${normFit}.png`;
  }
  if (normWash === "white" || normWash === "vintage") {
    return `/fits/white/w${normFit}.png`;
  }
  // Default to raw:
  return `/fits/${normFit}.png`;
};

/**
 * `variant="showroom"` (used by /stores/rbw) is rendered by RbwFitSelector, which
 * shares Step 1's visual system. Every other caller keeps the original layout below.
 */
export default function ShopByFit(props: ShopByFitProps) {
  if (props.variant === "showroom") {
    return (
      <RbwFitSelector
        id={props.isInsideViewport ? "shop-by-fit-viewport" : "shop-by-fit-scroll"}
        selectedWash={props.selectedWash}
        selectedFit={props.selectedFit}
        fits={fitItems}
        sizing={JEANS_SIZING_DATA}
        onFitClick={props.onFitClick}
        hrefFor={(fitName) =>
          props.selectedWash
            ? getProductUrlForWashAndFit(props.selectedWash, fitName)
            : `/shop?fit=${fitName.toLowerCase()}`
        }
      />
    );
  }
  return <ShopByFitClassic {...props} />;
}

function ShopByFitClassic({ selectedWash, isInsideViewport, onFitClick }: ShopByFitProps) {
  const sv = false; // the showroom variant is delegated to RbwFitSelector above
  const ghostWord = (selectedWash || "").toUpperCase();
  const ghostSize =
    ghostWord.length <= 5 ? "min(20vw, 34vh)" : "min(14vw, 24vh)";
  const [modalFit, setModalFit] = useState<string | null>(null);
  const [unit, setUnit] = useState<"in" | "cm">("in");

  // Lock body scroll when measurement modal is open & listen to Escape
  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const fitParam = p.get("fitModal");
      if (fitParam) {
        setModalFit(fitParam);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalFit) {
        setModalFit(null);
      }
    };
    if (modalFit) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalFit]);

  const activeModalData = modalFit ? JEANS_SIZING_DATA[modalFit.toLowerCase()] || [] : [];
  const activeFitItem = modalFit ? fitItems.find((f) => f.name.toLowerCase() === modalFit.toLowerCase()) : null;

  const formatVal = (valInInches: number) => {
    if (unit === "cm") {
      return (valInInches * 2.54).toFixed(1);
    }
    return valInInches.toString();
  };

  return (
    <div
      id={isInsideViewport ? "shop-by-fit-viewport" : "shop-by-fit-scroll"}
      className={`${sv ? "rbw-fit " : ""}w-full flex flex-col items-start px-6 sm:px-12 md:px-16 lg:px-20 select-none z-20 transition-colors duration-500 ease-in-out bg-transparent text-[var(--foreground)] ${isInsideViewport
        ? "opacity-100 h-auto py-2 sm:py-4 pointer-events-auto"
        : "pt-2 pb-6 sm:pt-4 sm:pb-6 md:pt-5 md:pb-8 border-b border-foreground/5"
        }`}
    >
      {sv && (
        <div className="rbw-fit__bd" aria-hidden="true">
          <div className="rbw-fit__floor" />
          {ghostWord && (
            <div className="rbw-fit__ghost" style={{ fontSize: ghostSize }}>
              <span>{ghostWord}</span>
            </div>
          )}
          <div className="rbw-fit__fabric" />
          <div className="rbw-fit__vignette" />
        </div>
      )}

      {/* Centered Select Your Fit Heading */}
      <div className={`w-full flex flex-col items-center justify-center mb-8 select-none ${sv ? "relative z-10 mt-4 sm:mt-6 mb-6 sm:mb-10" : ""}`}>
        <h2
          className={
            sv
              ? "rbw-fit__title text-[22px] sm:text-[30px] md:text-[38px]"
              : "font-serif font-normal text-[24px] sm:text-[30px] md:text-[36px] uppercase tracking-wide leading-none text-[var(--foreground)]"
          }
        >
          SELECT YOUR FIT
        </h2>
        {sv && <span className="rbw-fit__rule" />}
      </div>

      {/* Horizontal grid of fits */}
      <div className={`w-full grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-2.5 sm:gap-4 md:gap-6 mt-0 max-w-[1600px] mx-auto pb-12 md:pb-4 ${sv ? "relative z-10" : ""}`}>
        {fitItems.map((item, idx) => {
          const fitHref = selectedWash
            ? getProductUrlForWashAndFit(selectedWash, item.name)
            : `/shop?fit=${item.name.toLowerCase()}`;
          const fitImage = getFitImage(item.name, selectedWash);

          const handleCardClick = (e?: React.MouseEvent | React.KeyboardEvent) => {
            if (onFitClick) {
              e?.preventDefault();
              onFitClick(item.name);
            }
          };

          const handleMeasurementsClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setModalFit(item.name);
          };

          const content = (
            <div
              className={`relative w-full flex flex-col items-center justify-start ${sv ? "rbw-fit__card" : ""}`}
              style={sv ? ({ ["--i" as any]: idx } as React.CSSProperties) : undefined}
            >
              {/* Image Container */}
              <div className="relative w-full h-[125px] min-[375px]:h-[140px] min-[410px]:h-[155px] sm:h-[260px] md:h-[300px] lg:h-[340px] xl:h-[360px] flex items-start justify-center overflow-visible">
                {sv && <span className="rbw-fit__shadow" aria-hidden="true" />}
                <img
                  src={fitImage}
                  alt={`${item.name} Fit`}
                  className={
                    sv
                      ? "rbw-fit__img h-full w-auto max-w-none object-contain object-top mix-blend-multiply"
                      : "h-full w-auto max-w-none object-contain object-top mix-blend-multiply filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-transform duration-300 group-hover:scale-[1.02]"
                  }
                />
              </div>

              {/* Details Container */}
              <div className="w-full flex flex-col items-center text-center mt-1.5 sm:mt-4">
                {/* Fit Name */}
                {sv && <span className="rbw-fit__idx font-sans">{String(idx + 1).padStart(2, "0")}</span>}
                <span
                  className={
                    sv
                      ? "rbw-fit__name text-[10.5px] sm:text-[12px] uppercase mb-1 sm:mb-2"
                      : "text-[10.5px] sm:text-[13px] font-black tracking-[0.18em] sm:tracking-[0.25em] uppercase font-sans text-[var(--foreground)] opacity-95 mb-1 sm:mb-2.5"
                  }
                >
                  {item.name}
                </span>

                {/* Measurements Action Button */}
                <button
                  type="button"
                  onClick={handleMeasurementsClick}
                  className={`${sv ? "rbw-fit__measure " : ""}flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-black tracking-[0.2em] uppercase text-stone-500 group-hover:text-stone-900 hover:!text-[#8C6B2F] transition-colors duration-300 select-none group/btn cursor-pointer`}
                  title={`View detailed measurements for ${item.name} Jeans`}
                >
                  <Ruler className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#B9965A] group-hover/btn:scale-110 transition-transform" />
                  <span className="underline decoration-transparent hover:decoration-[#B9965A] underline-offset-4 transition-all">
                    MEASUREMENTS
                  </span>
                  <span className="font-sans group-hover/btn:translate-x-0.5 transition-transform duration-300 text-[#B9965A]">
                    &rarr;
                  </span>
                </button>
              </div>
            </div>
          );

          if (onFitClick) {
            return (
              <div
                key={item.name}
                role="button"
                tabIndex={0}
                aria-label={`Select ${item.name} fit`}
                onClick={handleCardClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick();
                  }
                }}
                className="group flex flex-col items-center justify-start cursor-pointer select-none focus:outline-hidden focus-visible:ring-1 focus-visible:ring-[#C59B27] rounded-lg"
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={fitHref}
              prefetch={false}
              className="group flex flex-col items-center justify-start cursor-pointer select-none"
            >
              {content}
            </Link>
          );
        })}
      </div>

      {/* ----------------- DEDICATED MEASUREMENT CHART MODAL FOR EACH FIT ----------------- */}
      {modalFit && activeFitItem && (
        <div
          role="dialog"
          aria-modal="true"
          className={`${sv ? "rbw-fit-modal " : ""}fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200`}
          onClick={() => setModalFit(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${sv ? "rbw-fit-panel " : ""}relative w-full max-w-[620px] bg-[#FAF8F5] dark:bg-[#12100E] text-[#1C1917] dark:text-[#F5F1E8] border border-[#E8E3DA] dark:border-[#2A2418] rounded-2xl shadow-2xl p-5 sm:p-7 flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto`}
          >
            {/* Modal Header */}
            <div className={`${sv ? "rbw-fit-head " : ""}flex items-start justify-between border-b border-[#E8E3DA] dark:border-[#2A2418] pb-4 mb-4`}>
              <div className="flex items-center gap-2.5">
                <div className={`${sv ? "rbw-fit-badge " : ""}w-8 h-8 rounded-full bg-[#D4B16A]/15 flex items-center justify-center`}>
                  <Ruler className="w-4 h-4 text-[#B9965A]" />
                </div>
                <div>
                  <h3 className={`${sv ? "rbw-fit-title " : ""}font-serif text-base sm:text-xl font-bold tracking-wide uppercase`}>
                    {modalFit} Fit Measurements
                  </h3>
                  <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {activeFitItem.description}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setModalFit(null)}
                className={`${sv ? "rbw-fit-glass " : ""}w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 flex items-center justify-center transition-colors cursor-pointer active:scale-95 shrink-0 ml-2`}
                aria-label="Close modal"
              >
                <X className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              </button>
            </div>

            {/* Unit Switcher & Fit Badge */}
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[9.5px] sm:text-[10.5px] font-black tracking-widest text-[#B9965A] uppercase">
                {activeFitItem.keySpec}
              </span>

              {/* Unit Toggle */}
              <div className={`${sv ? "rbw-fit-toggle " : ""}flex items-center rounded-lg border border-[#E8E3DA] dark:border-[#2A2418] bg-white dark:bg-stone-900 p-0.5 text-[9.5px] font-bold`}>
                <button
                  type="button"
                  onClick={() => setUnit("in")}
                  data-on={unit === "in"}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${unit === "in"
                    ? "bg-[#1C1917] text-white dark:bg-white dark:text-black shadow-2xs"
                    : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                    }`}
                >
                  INCHES (")
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("cm")}
                  data-on={unit === "cm"}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${unit === "cm"
                    ? "bg-[#1C1917] text-white dark:bg-white dark:text-black shadow-2xs"
                    : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                    }`}
                >
                  CM
                </button>
              </div>
            </div>

            {/* Measurements Table */}
            <div className={`${sv ? "rbw-fit-table " : ""}w-full overflow-x-auto rounded-xl border border-[#E8E3DA] dark:border-[#2A2418] bg-white dark:bg-stone-950/60 shadow-xs mb-4`}>
              <table className="w-full text-center text-[11px] sm:text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E3DA] dark:border-[#2A2418] bg-stone-100/60 dark:bg-stone-900/60">
                    <th className="py-2 px-2 font-black tracking-wider text-[9px] sm:text-[10px] text-neutral-600 dark:text-neutral-300 uppercase">
                      SIZE
                    </th>
                    <th className="py-2 px-2 font-bold tracking-wider text-[9px] sm:text-[10px] text-neutral-500 uppercase">
                      WAIST ({unit.toUpperCase()})
                    </th>
                    <th className="py-2 px-2 font-bold tracking-wider text-[9px] sm:text-[10px] text-neutral-500 uppercase">
                      INSEAM ({unit.toUpperCase()})
                    </th>
                    <th className="py-2 px-2 font-bold tracking-wider text-[9px] sm:text-[10px] text-neutral-500 uppercase">
                      FRONT RISE
                    </th>
                    <th className="py-2 px-2 font-bold tracking-wider text-[9px] sm:text-[10px] text-neutral-500 uppercase">
                      THIGH
                    </th>
                    <th className="py-2 px-2 font-bold tracking-wider text-[9px] sm:text-[10px] text-neutral-500 uppercase">
                      LEG OPENING
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3DA]/60 dark:divide-[#2A2418]">
                  {activeModalData.map((row) => (
                    <tr
                      key={row.size}
                      className="hover:bg-[#D4B16A]/10 dark:hover:bg-[#D4B16A]/10 transition-colors"
                    >
                      <td className="py-1.5 px-2 font-black text-black dark:text-white">
                        {row.size}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-neutral-700 dark:text-neutral-300">
                        {formatVal(row.waist)}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-neutral-700 dark:text-neutral-300">
                        {formatVal(row.inseam)}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-neutral-700 dark:text-neutral-300">
                        {formatVal(row.frontRise)}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-neutral-700 dark:text-neutral-300">
                        {formatVal(row.thigh)}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-neutral-700 dark:text-neutral-300">
                        {formatVal(row.legOpening)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sizing Tip */}
            <p className="text-[9.5px] sm:text-[10.5px] text-neutral-500 dark:text-neutral-400 mb-4 leading-relaxed">
              * Measurements are in {unit === "in" ? "inches" : "centimeters"}. Raw selvedge denim is rigid initially and will gently relax and conform to your body shape after 10–15 wears.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalFit(null)}
                className={`${sv ? "rbw-fit-btn-ghost " : ""}w-1/3 py-3 rounded-xl border border-[#E8E3DA] dark:border-[#2A2418] hover:bg-stone-100 dark:hover:bg-stone-900 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer`}
              >
                Close
              </button>

              {onFitClick && (
                <button
                  type="button"
                  onClick={() => {
                    const fitName = modalFit;
                    setModalFit(null);
                    onFitClick(fitName);
                  }}
                  className={`${sv ? "rbw-fit-btn-cta " : ""}w-2/3 py-3 rounded-xl bg-[#1C1917] hover:bg-black dark:bg-[#D4B16A] dark:hover:bg-[#B9965A] text-white dark:text-black text-xs font-black tracking-[0.2em] uppercase transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2`}
                >
                  <span>Select {modalFit} Fit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}