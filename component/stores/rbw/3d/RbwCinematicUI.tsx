"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { CategoryId } from "./RbwFilterPanel";
import { CarouselItemData } from "./RbwOrbitCarousel";
import "./rbw-showroom.css";

interface RbwCinematicUIProps {
  items: CarouselItemData[];
  activeItem: CarouselItemData;
  activeIndex: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  selectedCategories?: CategoryId[];
  onSelectCategory?: (cat: CategoryId) => void;
  onToggleFilterDrawer?: () => void;
  isFilterOpen?: boolean;
  activeFilterCount?: number;
  onShopItem?: (item: CarouselItemData) => void;
  /** Carousel index currently hovered in the 3D scene (side products only) */
  hoveredIndex?: number | null;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

/** Title scales with word length so long names never overflow */
function titleSize(name: string): string {
  const len = (name || "").length;
  if (len <= 5) return "clamp(2rem, min(3.7vw, 7.6vh), 4.2rem)";
  if (len <= 9) return "clamp(1.7rem, min(3.1vw, 6.4vh), 3.5rem)";
  return "clamp(1.4rem, min(2.5vw, 5.2vh), 2.8rem)";
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export function RbwCinematicUI({
  items,
  activeItem,
  activeIndex,
  totalItems,
  onPrev,
  onNext,
  onSelectIndex,
  autoRotate,
  onToggleAutoRotate,
  selectedCategories = ["jeans"],
  onSelectCategory,
  onToggleFilterDrawer,
  isFilterOpen = false,
  activeFilterCount = 0,
  onShopItem,
  hoveredIndex = null,
  theme = "dark",
  onToggleTheme,
}: RbwCinematicUIProps) {
  // ---- first-load choreography: reveals are staggered once, then product swaps are instant-ish
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setIntro(false), 1600);
    return () => window.clearTimeout(t);
  }, []);
  const delay = (ms: number): React.CSSProperties | undefined =>
    intro ? ({ ["--rbw-delay" as any]: `${ms}ms` } as React.CSSProperties) : undefined;

  // ---- subtle selection confirmation (hairline draws under the CTA)
  const [confirmTick, setConfirmTick] = useState(0);
  const confirmTimer = useRef<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const confirm = () => {
    setConfirmTick((n) => n + 1);
    setConfirming(true);
    if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
    confirmTimer.current = window.setTimeout(() => setConfirming(false), 1000);
  };
  useEffect(
    () => () => {
      if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
    },
    []
  );

  // ---- keyboard: ← → browse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        onPrev();
      } else if (e.key === "ArrowRight") {
        onNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPrev, onNext]);

  const itemCount = Math.max(1, items?.length || 1);
  const normalizedIndex = ((activeIndex % itemCount) + itemCount) % itemCount;


  const handleShop = () => {
    confirm();
    onShopItem?.(activeItem);
  };

  const shopLabel = `Shop ${activeItem?.name ?? ""}`.trim();

  const CtaInner = (
    <>
      <span>Shop now</span>
      <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
    </>
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-none">
      {/* ============================================================ */}
      {/* TOP — category navigation / filter / 360 status              */}
      {/* ============================================================ */}
      {/* ============================================================ */}
      {/* ARROWS — integrated glass controls                            */}
      {/* ============================================================ */}
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous Garment"
        style={delay(900)}
        className="rbw-glass-btn rbw-fade group absolute pointer-events-auto w-11 h-11 rounded-full !text-[color:var(--rbw-ink)] bottom-[45px] left-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-8 cursor-pointer"
      >
        <ChevronLeft
          className="w-[18px] h-[18px] transition-transform duration-300 group-hover:-translate-x-0.5"
          strokeWidth={1.5}
        />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next Garment"
        style={delay(900)}
        className="rbw-glass-btn rbw-fade group absolute pointer-events-auto w-11 h-11 rounded-full !text-[color:var(--rbw-ink)] bottom-[45px] right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-8 cursor-pointer"
      >
        <ChevronRight
          className="w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-0.5"
          strokeWidth={1.5}
        />
      </button>

      {/* ============================================================ */}
      {/* BOTTOM — editorial hierarchy: tagline → name → descriptor → CTA */}
      {/* ============================================================ */}
      <footer className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center px-16 md:px-8 pb-[34px] md:pb-7">
        <div key={activeItem?.id} className="flex flex-col items-center" aria-live="polite">
          {/* title */}
          <h2
            className="rbw-title rbw-in font-sans font-medium"
            style={{ fontSize: titleSize(activeItem?.name || ""), ...(delay(550) || {}) }}
          >
            {activeItem?.name}
          </h2>

          {/* Tagline below title (e.g. RAW YOU NEVER SAW, BOLD YOU NEVER KNEW, WHITE YOU NEVER WORE) */}
          {activeItem?.tagline && (
            <p
              className="rbw-in text-[10px] sm:text-[11px] font-mono font-medium tracking-[0.28em] uppercase text-[#A07F3C] mt-1 sm:mt-1.5"
              style={delay(650)}
            >
              {activeItem.tagline}
            </p>
          )}

          {/* Price only */}
          <div
            className="rbw-in mt-2 sm:mt-2.5 flex items-center justify-center"
            style={delay(750)}
          >
            <span className="text-[19px] sm:text-[21px] md:text-[23px] font-bold tracking-[0.12em] text-[color:var(--rbw-ink)]">
              {activeItem?.price}
            </span>
          </div>

          {/* CTA */}
          <div className="rbw-in mt-4 sm:mt-5 pointer-events-auto" style={delay(850)}>
            {onShopItem ? (
              <button type="button" onClick={handleShop} aria-label={shopLabel} className="rbw-cta cursor-pointer">
                {CtaInner}
              </button>
            ) : (
              <Link
                href={activeItem?.shopHref || "/stores/rbw"}
                onClick={confirm}
                aria-label={shopLabel}
                className="rbw-cta"
              >
                {CtaInner}
              </Link>
            )}
          </div>
        </div>

        {/* selection confirmation hairline */}
        <div className="h-px mt-2.5 w-full" aria-hidden="true">
          {confirming && <span key={confirmTick} className="rbw-confirm" />}
        </div>
      </footer>

      {/* ============================================================ */}
      {/* CORNER META — counter + progress (left), autoplay (right)    */}
      {/* ============================================================ */}
      {itemCount > 1 && (
        <div
          className="absolute pointer-events-auto flex items-center gap-3 left-1/2 -translate-x-1/2 bottom-[22px] md:left-8 md:translate-x-0 md:bottom-7 rbw-fade"
          style={delay(1000)}
        >
          <span className="hidden md:block text-[10px] tracking-[0.28em] text-[color:var(--rbw-ink-dim)] tabular-nums">
            {pad2(normalizedIndex + 1)}
          </span>
          <div className="flex items-center gap-1.5 w-[132px] md:w-[120px]">
            {items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                onClick={() => onSelectIndex(i)}
                aria-label={`Jump to ${it.name}`}
                className="flex-1 py-2.5 cursor-pointer"
              >
                <div className="rbw-seg" data-on={normalizedIndex === i} />
              </button>
            ))}
          </div>
        </div>
      )}

        <div
          className="absolute right-8 bottom-7 hidden md:flex items-center gap-4 pointer-events-auto rbw-fade"
          style={delay(1000)}
        >
          <button
            type="button"
            onClick={onToggleAutoRotate}
            aria-label={autoRotate ? "Pause auto-rotation" : "Resume auto-rotation"}
            aria-pressed={autoRotate}
            className="rbw-glass-btn w-10 h-10 rounded-full !border-[color:var(--rbw-gold)] cursor-pointer"
          >
            {autoRotate ? (
              <Pause className="w-3.5 h-3.5 text-[color:var(--rbw-ink)]" strokeWidth={1.5} />
            ) : (
              <Play className="w-3.5 h-3.5 text-[color:var(--rbw-ink)]" strokeWidth={1.5} />
            )}
          </button>
        </div>
    </div>
  );
}
