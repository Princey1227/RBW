"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight, ArrowRight, Check } from "lucide-react";
import { ExperienceProduct, BrandName } from "@/app/experience-center/page";
import {
  DESKTOP_SLOTS,
  STAGE_ART,
  STAGE_AR,
  getItemGeometry,
  getPresentation,
} from "./showroomPresentation";
import "./experience-center.css";

export interface BrandConfig {
  key: BrandName;
  name: string;
  tagline: string;
  description: string;
  storeLink: string;
  fontClass: string;
  accentColor: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  stageBg: string;
  stageBorder: string;
  pillColor?: string;
  showroomNumber: string;
  badgeText?: string;
  heroImage?: string;
  bgImage?: string;
  stageOverlay?: string;
  isDark?: boolean;
  headerTextColor?: string;
  taglineColor?: string;
  descColor?: string;
  glowColor?: string;
  ctaBg?: string;
  ctaTextColor?: string;
  ctaBorder?: string;
  navArrowBg?: string;
  navArrowColor?: string;
  navArrowBorder?: string;
  counterColor?: string;
  ctaButtonText?: string;
  composition?: "spotlight" | "trio" | "streetwear" | "energetic" | "utility";
}

interface BrandShowroomSectionProps {
  brand: BrandConfig;
  products: ExperienceProduct[];
  onAddToCart: (item: ExperienceProduct) => void;
  addingId: string | null;
  onQuickView: (item: ExperienceProduct) => void;
  allBrands?: { number: string; name: string; key: BrandName }[];
  onSelectBrand?: (brandKey: BrandName) => void;
  selectedBrands?: BrandName[];
  onClearBrands?: () => void;
}

const SLOT_ORDER = [-3, -2, -1, 0, 1, 2, 3];
const EASE = [0.22, 0.8, 0.24, 1] as const;

export default function BrandShowroomSection({
  brand,
  products,
  onAddToCart,
  addingId,
  onQuickView,
  allBrands = [],
  onSelectBrand,
  selectedBrands = [],
  onClearBrands,
}: BrandShowroomSectionProps) {
  const total = products.length;
  const signature = useMemo(() => products.map((p) => p.id).join("|"), [products]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [still, setStill] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;
  const [wishlistedIds, setWishlistedIds] = useState<Record<string, boolean>>({});
  const [reducedMotion, setReducedMotion] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // New product set (filter / brand switch): snap to the first piece, then re-enable motion.
  useEffect(() => {
    setCurrentIndex(0);
    setStill(true);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setStill(false)));
    return () => cancelAnimationFrame(raf);
  }, [signature]);

  useEffect(() => () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  const triggerPauseAndResume = useCallback(() => {
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), 6000);
  }, []);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setStill(false);
    setCurrentIndex((p) => p + 1);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setStill(false);
    setCurrentIndex((p) => p - 1);
  }, [total]);

  // Calm autoplay — slow, pauses on interaction/hover/hidden tab, off for reduced motion.
  useEffect(() => {
    if (total <= 1 || reducedMotion) return;
    const id = setInterval(() => {
      if (!isPausedRef.current && !document.hidden) handleNext();
    }, 7000);
    return () => clearInterval(id);
  }, [total, handleNext, reducedMotion]);

  // Keyboard: ← / → browse the showroom (ignored while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") {
        handleNext();
        triggerPauseAndResume();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
        triggerPauseAndResume();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNext, handlePrev, triggerPauseAndResume]);

  const handleTouchStart = (e: React.TouchEvent) => {
    triggerPauseAndResume();
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchCurrentX.current = e.touches[0].clientX;
    setDragOffset(Math.max(-60, Math.min(60, touchCurrentX.current - touchStartX.current)) * 0.25);
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchCurrentX.current !== null) {
      const diff = touchCurrentX.current - touchStartX.current;
      if (diff < -30) handleNext();
      else if (diff > 30) handlePrev();
    }
    setDragOffset(0);
    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Which slots are shown: never the same garment twice (small result sets).
  const visibleSlots = useMemo(() => {
    const out = new Set<number>();
    if (total === 0) return out;
    const used = new Set<number>();
    for (const s of [0, 1, -1, 2, -2]) {
      const idx = (((currentIndex + s) % total) + total) % total;
      if (used.has(idx)) continue;
      used.add(idx);
      out.add(s);
    }
    return out;
  }, [total, currentIndex]);

  if (total === 0) return null;

  const safeActiveIdx = ((currentIndex % total) + total) % total;
  const current = products[safeActiveIdx] || products[0];
  const brandDisplayName = current.brand === "IJNS" ? "iJNS" : current.brand;
  const subBadge = current.fitBadge || current.category;
  const isAdding = addingId === current.id;
  const isWishlisted = !!wishlistedIds[current.id];

  return (
    <section
      id={`showroom-${brand.key.toLowerCase().replace(/\s+/g, "-")}`}
      aria-label="ONLY DENIMS showroom"
      className="ec-section ec-section--desk"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ─── ARCHITECTURE & LIGHT ─── */}
      <div className="ec-stagewrap">
      <div className="ec-stage">
        <div className="ec-flank-fill ec-flank-fill--l" aria-hidden />
        <div className="ec-flank-fill ec-flank-fill--r" aria-hidden />
        <Image src={STAGE_ART} alt="" fill priority sizes="100vw" className="ec-bg" />
        <div className="ec-grade" />
        <div className="ec-pool ec-pool--hero" />
        {[11.7, 28.8, 71.2, 88.3].map((x) => (
          <div key={x} className="ec-pool ec-pool--side" style={{ left: `${x}%` }} />
        ))}
        <div className="ec-podium-glow" />
        <div className="ec-tint" style={{ ["--ec-tint" as string]: hexToRgba(brand.glowColor, 0.42) }} />
        <div className="ec-vignette" />

        {/* ─── PRODUCTS ─── */}
        <div key={signature} className={`ec-slots${still ? " ec-slots--still" : ""}`}>
          {SLOT_ORDER.map((slot) => {
            const idx = currentIndex + slot;
            const item = products[((idx % total) + total) % total];
            const spec = DESKTOP_SLOTS[slot];
            const isHero = slot === 0;
            const shown = visibleSlots.has(slot);
            const pres = getPresentation(item.image);
            const { h0, w0 } = getItemGeometry(pres);
            const scale = isHero ? 1 : Math.min(spec.s, spec.maxW / w0);
            const isPanel = pres.kind === "panel";
            const bh = pres.bbox[3] - pres.bbox[1];
            const boxH = isPanel ? h0 : h0 / bh;
            const boxW = isPanel ? h0 * (pres.frame ?? 0.74) : boxH * pres.ar;
            const cx = isPanel ? 0.5 : (pres.bbox[0] + pres.bbox[2]) / 2;
            const by = isPanel ? 1 : pres.bbox[3];
            const x = spec.x + (isHero ? dragOffset * 0.08 : 0);

            return (
              <div
                key={`${item.id}-${idx}`}
                className={`ec-slot ec-slot--${pres.kind}${isHero ? " ec-slot--hero" : ""}`}
                style={{
                  transform: `translate3d(${x}cqw, ${spec.y}cqh, 0) scale(${scale})`,
                  opacity: shown ? spec.opacity : 0,
                  zIndex: spec.z,
                  filter: shown ? (isPanel && !isHero ? "saturate(0.8) brightness(0.84)" : spec.filter) : "none",
                  pointerEvents: shown ? "auto" : "none",
                  ["--mask" as string]: pres.mask ? `url(${pres.mask})` : "none",
                }}
                onMouseEnter={() => isHero && setIsPaused(true)}
                onMouseLeave={() => isHero && setIsPaused(false)}
              >
                <span className="ec-shadow" style={{ ["--sw" as string]: (w0 * STAGE_AR * 0.92).toFixed(2) }} />
                <button
                  type="button"
                  className="ec-item"
                  tabIndex={shown ? 0 : -1}
                  aria-hidden={!shown}
                  aria-label={isHero ? `Quick view ${item.title}` : `Show ${item.title}`}
                  onClick={() => {
                    if (isHero) {
                      onQuickView(item);
                    } else {
                      setStill(false);
                      setCurrentIndex((p) => p + slot);
                      triggerPauseAndResume();
                    }
                  }}
                  style={{
                    width: `${boxW.toFixed(3)}cqh`,
                    height: `${boxH.toFixed(3)}cqh`,
                    ["--cx" as string]: cx,
                    ["--by" as string]: by,
                  }}
                >
                  <span className="ec-lift">
                    {isPanel ? (
                      <span className="ec-panel">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="360px"
                          unoptimized
                          style={{ objectPosition: `${pres.focusX ?? 50}% 50%` }}
                        />
                        {isHero && item.hoverImage && (
                          <Image
                            src={item.hoverImage}
                            alt=""
                            fill
                            sizes="360px"
                            unoptimized
                            className="ec-panel__alt"
                            style={{ objectPosition: `${getPresentation(item.hoverImage).focusX ?? 50}% 50%` }}
                          />
                        )}
                      </span>
                    ) : (
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={1024}
                        height={Math.round(1024 / pres.ar)}
                        unoptimized
                        priority={isHero}
                        className="ec-img"
                        draggable={false}
                      />
                    )}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      </div>

      {/* ─── SIDE ARROWS ─── */}
      {total > 1 && (
        <>
          <button
            type="button"
            className="ec-arrow ec-arrow--l"
            aria-label="Previous garment"
            onClick={() => {
              handlePrev();
              triggerPauseAndResume();
            }}
          >
            <ChevronLeft size={18} strokeWidth={1.4} />
          </button>
          <button
            type="button"
            className="ec-arrow ec-arrow--r"
            aria-label="Next garment"
            onClick={() => {
              handleNext();
              triggerPauseAndResume();
            }}
          >
            <ChevronRight size={18} strokeWidth={1.4} />
          </button>
        </>
      )}

      {/* ─── LABEL PLATE + EXHIBITION SELECTOR ─── */}
      <div className="ec-ui">
        <div
          className="ec-plate ec-glass"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >


          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              className="ec-info"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.42, ease: EASE }}
            >
              <div className="ec-kicker">
                {brandDisplayName}
              </div>
              <div className="ec-divider" />
              <h3 className="ec-name">{current.title}</h3>
            </motion.div>
          </AnimatePresence>

          <div className="ec-divider" style={{ marginLeft: "auto", marginRight: "24px" }} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${current.id}-price`}
              className="ec-price"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <small>₹</small>
              {current.price.toLocaleString("en-IN")}
            </motion.div>
          </AnimatePresence>

          <div className="ec-actions">
            <button
              type="button"
              className="ec-iconbtn ec-heart"
              aria-label="Wishlist"
              aria-pressed={isWishlisted}
              onClick={(e) => toggleWishlist(current.id, e)}
            >
              <Heart size={17} strokeWidth={1.4} />
            </button>
            <button type="button" className="ec-btn" onClick={() => onAddToCart(current)} disabled={isAdding}>
              {isAdding ? (
                <>
                  <span>Added</span>
                  <Check size={14} strokeWidth={1.8} />
                </>
              ) : (
                <>
                  <span>Add to bag</span>
                  <ArrowRight size={14} strokeWidth={1.5} />
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* ─── LEGAL MICRO-STRIP ─── */}
      <div className="ec-legal">
        <div className="ec-legal__left">
          <span>© 2026 ONLY DENIMS. All rights reserved.</span>
        </div>
        <div className="ec-legal__right">
          <Link href="/terms">Terms & Conditions</Link>
          <i />
          <Link href="/privacy">Privacy Policy</Link>
          <i />
          <Link href="/returns">Returns & Exchange</Link>
        </div>
      </div>
    </section>
  );
}

function hexToRgba(hex: string | undefined, alpha: number) {
  if (!hex || !/^#([0-9a-f]{6})$/i.test(hex)) return `rgba(185,150,90,${alpha})`;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
