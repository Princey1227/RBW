"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { CategoryId, CATEGORY_DEFS } from "./RbwFilterPanel";
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
  isInspecting?: boolean;
  onCloseInspect?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onShopItem?: (item: CarouselItemData) => void;
  /** Carousel index currently hovered in the 3D scene (side products only) */
  hoveredIndex?: number | null;
}

/** Title scales with word length so long names (VINTAGE JACKET) never overflow */
function titleSize(name: string): string {
  const len = (name || "").length;
  if (len <= 5) return "clamp(3.2rem, min(10vw, 11vh), 7.5rem)";
  if (len <= 9) return "clamp(2.4rem, min(7.2vw, 8.4vh), 5.6rem)";
  return "clamp(1.9rem, min(5.4vw, 6.2vh), 4.2rem)";
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
  isInspecting = false,
  onCloseInspect,
  onRotateLeft,
  onRotateRight,
  onShopItem,
  hoveredIndex = null,
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

  // ---- keyboard: ← → browse (or rotate in 360), Esc leaves 360
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isInspecting) onCloseInspect?.();
      } else if (e.key === "ArrowLeft") {
        if (isInspecting) onRotateLeft?.();
        else onPrev();
      } else if (e.key === "ArrowRight") {
        if (isInspecting) onRotateRight?.();
        else onNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPrev, onNext, isInspecting, onCloseInspect, onRotateLeft, onRotateRight]);

  const itemCount = Math.max(1, items?.length || 1);
  const normalizedIndex = ((activeIndex % itemCount) + itemCount) % itemCount;

  // Neighbours shown as quiet name/price tags beneath the receding products
  const prevIdx = (normalizedIndex - 1 + itemCount) % itemCount;
  const nextIdx = (normalizedIndex + 1) % itemCount;
  const sideTags: { idx: number; side: "left" | "right" }[] =
    isInspecting || itemCount < 2
      ? []
      : itemCount === 2
        ? [{ idx: nextIdx, side: "right" }]
        : [
            { idx: prevIdx, side: "left" },
            { idx: nextIdx, side: "right" },
          ];

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
      {/* TOP — category navigation / 360 status                       */}
      {/* ============================================================ */}
      <header
        className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 sm:gap-3 px-4 sm:px-8 pt-[84px] md:pt-[98px] xl:pt-[120px] rbw-fade"
        style={delay(700)}
      >
        <div className="hidden sm:flex w-9 shrink-0 pointer-events-auto">
          <Link
            href="/stores/rbw"
            title="Exit Showroom"
            aria-label="Exit Showroom"
            className="rbw-glass-btn w-9 h-9 rounded-full group"
          >
            <ArrowLeft
              className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              strokeWidth={1.5}
            />
          </Link>
        </div>

        {isInspecting ? (
          <div className="flex-1 flex justify-center">
            <div className="rbw-glass-btn !cursor-default px-4 py-2 rounded-full rbw-eyebrow !text-[10px]">
              360° Denim Inspection
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex w-9 sm:w-auto shrink-0 justify-end pointer-events-auto">
          {isInspecting ? (
            <button
              type="button"
              onClick={onCloseInspect}
              aria-label="Exit 360 Inspection"
              className="rbw-glass-btn h-9 px-3.5 rounded-full text-[10px] tracking-[0.22em] uppercase"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Close 360</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleFilterDrawer}
              aria-label="Open filters"
              aria-pressed={isFilterOpen}
              className="rbw-glass-btn relative h-9 w-9 sm:w-auto sm:px-3.5 rounded-full text-[10px] tracking-[0.22em] uppercase"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-[#b9965a] text-[#0b0b0c] text-[9px] font-semibold leading-[15px] text-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/* SIDE PRODUCT TAGS — quiet names for receding products         */}
      {/* ============================================================ */}
      {sideTags.map(({ idx, side }) => {
        const it = items[idx];
        if (!it) return null;
        return (
          <button
            key={`${side}-${it.id}`}
            type="button"
            onClick={() => onSelectIndex(idx)}
            data-hot={hoveredIndex === idx}
            aria-label={`View ${it.name}`}
            className="rbw-side-tag pointer-events-auto hidden md:block bottom-[148px] rbw-fade"
            style={{ left: side === "left" ? "16%" : "84%", ...(delay(900) || {}) }}
          >
            <span className="block rbw-eyebrow !text-[10px] !tracking-[0.3em] !text-[color:var(--rbw-ink)]">
              {it.name}
            </span>
            <span className="block mt-1 text-[10px] tracking-[0.2em] text-[color:var(--rbw-ink-dim)]">
              {it.price}
            </span>
          </button>
        );
      })}

      {/* ============================================================ */}
      {/* ARROWS / 360 ROTATE — integrated glass controls              */}
      {/* ============================================================ */}
      {isInspecting ? (
        <>
          <div className="absolute pointer-events-auto bottom-[45px] left-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-8 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onRotateLeft}
              aria-label="Rotate Model Counter-Clockwise"
              className="rbw-glass-btn group w-11 h-11 rounded-full"
            >
              <RotateCcw
                className="w-[18px] h-[18px] transition-transform duration-500 group-hover:-rotate-45"
                strokeWidth={1.5}
              />
            </button>
            <span className="hidden md:block rbw-eyebrow !text-[9px] !text-[color:var(--rbw-ink-faint)]">Rotate</span>
          </div>
          <div className="absolute pointer-events-auto bottom-[45px] right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-8 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onRotateRight}
              aria-label="Rotate Model Clockwise"
              className="rbw-glass-btn group w-11 h-11 rounded-full"
            >
              <RotateCw
                className="w-[18px] h-[18px] transition-transform duration-500 group-hover:rotate-45"
                strokeWidth={1.5}
              />
            </button>
            <span className="hidden md:block rbw-eyebrow !text-[9px] !text-[color:var(--rbw-ink-faint)]">Rotate</span>
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous Garment"
            style={delay(900)}
            className="rbw-glass-btn rbw-fade group absolute pointer-events-auto w-11 h-11 rounded-full bottom-[45px] left-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-8"
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
            className="rbw-glass-btn rbw-fade group absolute pointer-events-auto w-11 h-11 rounded-full bottom-[45px] right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-8"
          >
            <ChevronRight
              className="w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </button>
        </>
      )}

      {/* ============================================================ */}
      {/* BOTTOM — editorial hierarchy: name → descriptor → price → CTA */}
      {/* ============================================================ */}
      <footer className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center px-16 md:px-8 pb-[34px] md:pb-7">
        <div key={activeItem?.id} className="flex flex-col items-center" aria-live="polite">
          {/* eyebrow: brand line */}
          {!isInspecting && (
            <p
              className="rbw-eyebrow rbw-in mb-2.5 sm:mb-3 max-w-[78vw] truncate"
              style={delay(500)}
            >
              {activeItem?.tagline}
            </p>
          )}

          {/* title */}
          <h2
            className="rbw-title rbw-in"
            style={{ fontSize: titleSize(activeItem?.name || ""), ...(delay(550) || {}) }}
          >
            {activeItem?.name}
          </h2>

          {/* descriptor + price / offer — quiet, one line */}
          <div
            className="rbw-in mt-3 sm:mt-3.5 flex items-center justify-center flex-wrap gap-x-3 gap-y-1"
            style={delay(700)}
          >
            <span className="rbw-descriptor text-[17px] sm:text-[19px]">{activeItem?.sublabel}</span>
            <span className="w-px h-3 bg-[color:var(--rbw-line)]" />
            <span className="text-[12px] sm:text-[13px] tracking-[0.14em] text-[color:var(--rbw-ink)]">
              {activeItem?.price}
            </span>
            {activeItem?.originalPrice && (
              <span className="text-[11px] tracking-[0.1em] text-[color:var(--rbw-ink-faint)] line-through">
                {activeItem.originalPrice}
              </span>
            )}
            {!!activeItem?.discountPct && activeItem.discountPct > 0 && (
              <span className="text-[9px] tracking-[0.22em] uppercase text-[color:var(--rbw-gold)] border border-[color:var(--rbw-gold)]/40 px-1.5 py-[3px]">
                {activeItem.discountPct}% off
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="rbw-in mt-4 sm:mt-5 pointer-events-auto" style={delay(850)}>
            {onShopItem ? (
              <button type="button" onClick={handleShop} aria-label={shopLabel} className="rbw-cta">
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
      {/* CORNER META — counter + progress (left), cue + autoplay (right) */}
      {/* ============================================================ */}
      {!isInspecting && itemCount > 1 && (
        <div
          className="absolute pointer-events-auto flex items-center gap-3 left-1/2 -translate-x-1/2 bottom-[22px] md:left-8 md:translate-x-0 md:bottom-7 rbw-fade"
          style={delay(1000)}
        >
          <span className="hidden md:block text-[10px] tracking-[0.28em] text-[color:var(--rbw-ink-dim)] tabular-nums">
            {pad2(normalizedIndex + 1)}
            <span className="text-[color:var(--rbw-ink-faint)]"> / {pad2(itemCount)}</span>
          </span>
          <div className="flex items-center gap-1.5 w-[132px] md:w-[104px]">
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

      {!isInspecting && (
        <div
          className="absolute right-8 bottom-7 hidden md:flex items-center gap-4 pointer-events-auto rbw-fade"
          style={delay(1000)}
        >
          <p className="text-[9px] tracking-[0.26em] uppercase text-[color:var(--rbw-ink-faint)]">
            Drag to browse · Click product to inspect 360°
          </p>
          <button
            type="button"
            onClick={onToggleAutoRotate}
            aria-label={autoRotate ? "Pause auto-rotation" : "Resume auto-rotation"}
            aria-pressed={autoRotate}
            className="rbw-glass-btn w-8 h-8 rounded-full"
          >
            {autoRotate ? (
              <Pause className="w-3 h-3" strokeWidth={1.5} />
            ) : (
              <Play className="w-3 h-3" strokeWidth={1.5} />
            )}
          </button>
        </div>
      )}

      {/* mobile-only cue (the desktop cue sits bottom-right) */}
      {!isInspecting && (
        <p className="md:hidden absolute inset-x-0 bottom-[8px] text-center text-[8px] tracking-[0.24em] uppercase text-[color:var(--rbw-ink-faint)]">
          Swipe · Tap product for 360°
        </p>
      )}
    </div>
  );
}
