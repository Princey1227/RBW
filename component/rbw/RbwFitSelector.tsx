"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, ArrowLeft } from "lucide-react";
import { RbwSizeChartModal, RbwSizingSpec } from "@/component/rbw/RbwSizeChartModal";
import "@/component/rbw/3d/rbw-showroom.css";
import "@/component/rbw/rbw-journey.css";
import "@/component/rbw/rbw-fit.css";

export interface RbwFitItem {
  name: string;
  keySpec: string;
  description: string;
}

interface RbwFitSelectorProps {
  selectedWash: "raw" | "black" | "white" | "vintage" | null;
  selectedFit?: string | null;
  fits: RbwFitItem[];
  sizing: Record<string, RbwSizingSpec[]>;
  onFitClick?: (fitName: string) => void;
  /** Used only when no onFitClick handler is supplied (plain navigation) */
  hrefFor?: (fitName: string) => string;
  id?: string;
}

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

const fitImage = getFitImage;

const delayStyle = (ms: number, extra?: Record<string, string | number>): React.CSSProperties =>
  ({ ["--rbw-delay" as any]: `${ms}ms`, ...extra }) as React.CSSProperties;

/**
 * STEP 2 — FIT.
 * Premium Mobile Editorial Denim Showroom.
 */
export function RbwFitSelector({
  selectedWash,
  selectedFit,
  fits,
  sizing,
  onFitClick,
  hrefFor,
  id,
}: RbwFitSelectorProps) {
  const [modalFit, setModalFit] = useState<string | null>(null);
  const [unit, setUnit] = useState<"in" | "cm">("in");

  // deep link: ?fitModal=slim opens that fit's measurements
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fitParam = new URLSearchParams(window.location.search).get("fitModal");
    if (fitParam) setModalFit(fitParam);
  }, []);

  // Preload fit images for current wash so they appear seamlessly
  useEffect(() => {
    if (typeof window === "undefined") return;
    fits.forEach((item) => {
      const img = new window.Image();
      img.src = fitImage(item.name, selectedWash);
    });
  }, [selectedWash, fits]);

  const activeFit = modalFit ? fits.find((f) => f.name.toLowerCase() === modalFit.toLowerCase()) : null;
  const rows = modalFit ? sizing[modalFit.toLowerCase()] || [] : [];

  return (
    <section id={id} className="rbw-fit w-full flex flex-col items-center px-4 sm:px-12 md:px-16 lg:px-20 select-none">
      {/* ------------------------------------------------------------------ */}
      {/* Editorial heading                                                  */}
      {/* ------------------------------------------------------------------ */}
      <header className="relative z-10 w-full max-w-[1780px] mx-auto flex items-center justify-center pt-1 sm:pt-2 md:pt-3 mb-3 sm:mb-6 md:mb-8 px-2 sm:px-4">
        {/* Back to Select Wash button — positioned inline without adding vertical space */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("RESET_RBW_STOREFRONT"));
            }
          }}
          title="Back to Wash Selection"
          aria-label="Back to Wash Selection"
          className="absolute left-2 sm:left-4 flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9.5px] sm:text-[11px] font-mono font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer bg-white hover:bg-white text-zinc-800 hover:text-black border border-zinc-300 hover:border-zinc-600 shadow-xs group"
        >
          <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:-translate-x-0.5 transition-transform text-[#B9965A]" />
          <span>Washes</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <h2 className="rbw-fit__heading rbw-in" style={delayStyle(200)}>
            SELECT YOUR FIT
          </h2>
          <span className="rbw-fit__heading-accent rbw-in" style={delayStyle(320)} />
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Giant Dynamic Wash Typography (e.g. "BLACK") sitting behind Row 1  */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="rbw-fit__watermark select-none pointer-events-none"
        aria-hidden="true"
      >
        <span>{(selectedWash || "black").toUpperCase()}</span>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Garments (3-col mobile, 6-col desktop)                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="rbw-fit__grid relative z-10 w-full max-w-[1780px] mx-auto pl-6 pr-2 sm:px-4">
        {fits.map((item, idx) => {
          const isSelected = (selectedFit || "").toLowerCase() === item.name.toLowerCase();
          const open = (e?: React.SyntheticEvent) => {
            if (onFitClick) {
              e?.preventDefault();
              onFitClick(item.name);
            }
          };

          const card = (
            <div
              className="rbw-fit__card rbw-in"
              data-active={isSelected ? "true" : undefined}
              style={delayStyle(420 + idx * 80)}
            >
              <div className="rbw-fit__stage">
                <span className="rbw-fit__shadow" aria-hidden="true" />
                <img
                  src={fitImage(item.name, selectedWash)}
                  alt={`${item.name} fit (${selectedWash || "raw"})`}
                  className="rbw-fit__img"
                  draggable={false}
                  loading="lazy"
                />
              </div>

              <div className="rbw-fit__meta">
                <span className="rbw-fit__idx">{String(idx + 1).padStart(2, "0")}</span>
                <span className="rbw-fit__name">{item.name}</span>
                <span className="rbw-fit__line" aria-hidden="true" />
                <button
                  type="button"
                  className="rbw-fit__measure"
                  title={`View detailed measurements for ${item.name} jeans`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setModalFit(item.name);
                  }}
                >
                  <Tag className="w-2.5 h-2.5 text-[#B58A43]" strokeWidth={1.75} />
                  <span>MEASUREMENTS</span>
                  <span className="text-[#B58A43] font-normal text-[11px] leading-none ml-0.5">→</span>
                </button>
              </div>
            </div>
          );

          return onFitClick ? (
            <div
              key={item.name}
              role="button"
              tabIndex={0}
              aria-label={`Select ${item.name} fit`}
              onClick={open}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  open();
                }
              }}
              className="rbw-fit__item"
            >
              {card}
            </div>
          ) : (
            <Link
              key={item.name}
              href={hrefFor ? hrefFor(item.name) : `/shop?fit=${item.name.toLowerCase()}`}
              prefetch={false}
              className="rbw-fit__item"
            >
              {card}
            </Link>
          );
        })}
      </div>

      {modalFit && activeFit && (
        <RbwSizeChartModal
          kicker={`${activeFit.name} fit`}
          title="Measurements"
          subtitle={activeFit.description}
          rows={rows}
          unit={unit}
          onUnitChange={setUnit}
          onClose={() => setModalFit(null)}
          note={`Measurements are in ${unit === "in" ? "inches" : "centimetres"}. Raw selvedge denim is rigid at first and relaxes to your body over 10–15 wears.`}
          cta={
            onFitClick
              ? {
                label: `Select ${activeFit.name}`,
                onClick: () => {
                  const name = modalFit;
                  setModalFit(null);
                  onFitClick(name);
                },
              }
              : undefined
          }
        />
      )}
    </section>
  );
}
