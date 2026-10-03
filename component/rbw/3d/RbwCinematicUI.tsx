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
  isInspecting?: boolean;
  onCloseInspect?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onShopItem?: (item: CarouselItemData) => void;
  /** Carousel index currently hovered in the 3D scene (side products only) */
  hoveredIndex?: number | null;
}

/** Title scales with word length so editorial phrases (RAW YOU NEVER SAW) never overflow */
function titleSize(name: string): string {
  const len = (name || "").length;
  if (len <= 5) return "clamp(2rem, min(3.7vw, 7.6vh), 4.2rem)";
  if (len <= 10) return "clamp(1.7rem, min(3.1vw, 6.4vh), 3.5rem)";
  if (len <= 15) return "clamp(1.35rem, min(2.5vw, 5.0vh), 2.7rem)";
  return "clamp(1.15rem, min(1.85vw, 3.8vh), 1.85rem)";
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
        className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 sm:gap-3 px-4 sm:px-8 pt-[88px] md:pt-[104px] xl:pt-[124px] rbw-fade"
        style={delay(700)}
      >
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
          {isInspecting && (
            <button
              type="button"
              onClick={onCloseInspect}
              aria-label="Exit 360 Inspection"
              className="rbw-glass-btn h-9 px-3.5 rounded-full text-[10px] tracking-[0.22em] uppercase"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Close 360</span>
            </button>
          )}
        </div>
      </header>

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
              className="rbw-glass-btn group w-11 h-11 rounded-full !text-[color:var(--rbw-ink)]"
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
              className="rbw-glass-btn group w-11 h-11 rounded-full !text-[color:var(--rbw-ink)]"
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
            className="rbw-glass-btn rbw-fade group absolute pointer-events-auto w-11 h-11 rounded-full !text-[color:var(--rbw-ink)] bottom-[45px] left-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-8"
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
            className="rbw-glass-btn rbw-fade group absolute pointer-events-auto w-11 h-11 rounded-full !text-[color:var(--rbw-ink)] bottom-[45px] right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-8"
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
          {/* title */}
          {(() => {
            const isPhrase = (activeItem?.name || "").includes(" ") || (activeItem?.name || "").length > 8;
            return (
              <h2
                className={`rbw-title rbw-in ${isPhrase ? "rbw-title--phrase" : ""}`}
                style={{ fontSize: titleSize(activeItem?.name || ""), ...(delay(550) || {}) }}
              >
                {activeItem?.name}
              </h2>
            );
          })()}

          {/* Price only — bold and bigger */}
          <div
            className="rbw-in mt-2.5 sm:mt-3 flex items-center justify-center"
            style={delay(700)}
          >
            <span className="text-[19px] sm:text-[21px] md:text-[23px] font-bold tracking-[0.12em] text-[color:var(--rbw-ink)]">
              {activeItem?.price}
            </span>
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
      {/* CORNER META — counter + progress (left), autoplay (right)    */}
      {/* ============================================================ */}
      {!isInspecting && itemCount > 1 && (
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

      {!isInspecting && (
        <div
          className="absolute right-8 bottom-7 hidden md:flex items-center gap-4 pointer-events-auto rbw-fade"
          style={delay(1000)}
        >
          <button
            type="button"
            onClick={onToggleAutoRotate}
            aria-label={autoRotate ? "Pause auto-rotation" : "Resume auto-rotation"}
            aria-pressed={autoRotate}
            className="rbw-glass-btn w-10 h-10 rounded-full !border-[color:var(--rbw-gold)]"
          >
            {autoRotate ? (
              <Pause className="w-3.5 h-3.5 text-[color:var(--rbw-ink)]" strokeWidth={1.5} />
            ) : (
              <Play className="w-3.5 h-3.5 text-[color:var(--rbw-ink)]" strokeWidth={1.5} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
