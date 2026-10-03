"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BrandShowroomSection, {
  BrandConfig,
} from "./BrandShowroomSection";
import StickyShopFilters, { FilterOption } from "./StickyShopFilters";
import { ExperienceProduct, BrandName, CategoryType } from "@/app/experience-center/page";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface BrandShowroomExperienceProps {
  brandConfigs: BrandConfig[];
  getBrandProducts: (brandKey: BrandName) => ExperienceProduct[];
  onAddToCart: (item: ExperienceProduct) => void;
  addingId: string | null;
  onQuickView: (item: ExperienceProduct) => void;
  onActiveBrandChange?: (brandKey: BrandName) => void;
  targetBrand?: BrandName | null;
  onTargetBrandHandled?: () => void;
  // Filter Toolbar Props
  selectedBrands: BrandName[];
  onToggleBrand: (brand: BrandName) => void;
  onClearBrands: () => void;
  selectedCategories: CategoryType[];
  onToggleCategory: (category: CategoryType) => void;
  onClearCategories: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "featured" | "price-asc" | "price-desc";
  onSortChange: (sort: "featured" | "price-asc" | "price-desc") => void;
  onResetAll: () => void;
  brandsList: { label: string; value: BrandName }[];
  categoriesList: { label: string; value: CategoryType }[];
}

export default function BrandShowroomExperience({
  brandConfigs,
  getBrandProducts,
  onAddToCart,
  addingId,
  onQuickView,
  onActiveBrandChange,
  targetBrand,
  onTargetBrandHandled,
  selectedBrands,
  onToggleBrand,
  onClearBrands,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onResetAll,
  brandsList,
  categoriesList,
}: BrandShowroomExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Keep a stable ref for onActiveBrandChange to prevent timeline recreation during scroll
  const onActiveBrandChangeRef = useRef(onActiveBrandChange);
  useEffect(() => {
    onActiveBrandChangeRef.current = onActiveBrandChange;
  }, [onActiveBrandChange]);

  const activeIndexRef = useRef<number>(0);
  const isProgrammaticScrollingRef = useRef<boolean>(false);

  // Filter out any brand that has 0 products
  const activeConfigs = useMemo(() => {
    return brandConfigs.filter((c) => getBrandProducts(c.key).length > 0);
  }, [brandConfigs, getBrandProducts]);

  const totalPanels = activeConfigs.length;
  const brandKeys = useMemo(
    () => activeConfigs.map((c) => c.key).join(","),
    [activeConfigs]
  );

  // Timing constants for scrubbed timeline with dwell/resting states
  const DWELL_DURATION = 0.5;
  const SLIDE_DURATION = 1.0;
  const STEP_TOTAL = DWELL_DURATION + SLIDE_DURATION;
  const TOTAL_DURATION = Math.max(
    1,
    DWELL_DURATION + Math.max(0, totalPanels - 1) * STEP_TOTAL
  );

  // Handle programmatic smooth-scroll when user clicks a brand in the sticky filter bar
  const scrollToBrand = useCallback(
    (brandKey: BrandName) => {
      const idx = activeConfigs.findIndex((c) => c.key === brandKey);
      if (idx === -1 || !scrollTriggerRef.current) return;

      const st = scrollTriggerRef.current;
      let targetTime = DWELL_DURATION * 0.5;
      if (idx > 0) {
        targetTime =
          DWELL_DURATION + (idx - 1) * STEP_TOTAL + SLIDE_DURATION + DWELL_DURATION * 0.5;
      }
      const targetProgress = Math.min(1, Math.max(0, targetTime / TOTAL_DURATION));
      const targetScroll = st.start + targetProgress * (st.end - st.start);

      isProgrammaticScrollingRef.current = true;
      activeIndexRef.current = idx;

      window.scrollTo({
        top: Math.round(targetScroll),
        behavior: "smooth",
      });

      // Release programmatic flag once smooth scroll finishes
      setTimeout(() => {
        isProgrammaticScrollingRef.current = false;
      }, 750);
    },
    [activeConfigs, totalPanels, DWELL_DURATION, SLIDE_DURATION, STEP_TOTAL, TOTAL_DURATION]
  );

  // Watch for external targetBrand changes from filter clicks
  useEffect(() => {
    if (targetBrand) {
      scrollToBrand(targetBrand);
      if (onTargetBrandHandled) {
        onTargetBrandHandled();
      }
    }
  }, [targetBrand, scrollToBrand, onTargetBrandHandled]);

  // GSAP ScrollTrigger Overlapping Cards Animation
  useEffect(() => {
    if (totalPanels <= 1 || !containerRef.current || !stageRef.current) {
      return;
    }

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
      if (panels.length <= 1) return;

      // Set initial positions:
      // First panel starts at yPercent 0.
      // Subsequent panels start translated 100% down.
      panels.forEach((panel, i) => {
        gsap.set(panel, {
          yPercent: i === 0 ? 0 : 100,
          scale: 1,
          opacity: 1,
          zIndex: 10 + i * 10,
        });
      });

      // Master scrubbing timeline: Pins BOTH Filter Bar and Showrooms under Navbar
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: stageRef.current,
          start: () => {
            const navH = window.innerWidth >= 640 ? 58 : 48;
            return `top top+=${navH}`;
          },
          end: () => `+=${panels.length * window.innerHeight * 0.85}`,
          scrub: 0.6,
          anticipatePin: 1,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const curTime = progress * TOTAL_DURATION;

            // Calculate active index based on dwell + slide boundaries
            let stepIndex = 0;
            if (curTime < DWELL_DURATION + SLIDE_DURATION * 0.5) {
              stepIndex = 0;
            } else {
              for (let i = 1; i < panels.length; i++) {
                const boundaryStart = DWELL_DURATION + (i - 1) * STEP_TOTAL + SLIDE_DURATION * 0.5;
                const boundaryEnd = DWELL_DURATION + i * STEP_TOTAL + SLIDE_DURATION * 0.5;
                if (curTime >= boundaryStart && curTime < boundaryEnd) {
                  stepIndex = i;
                  break;
                }
              }
              if (curTime >= DWELL_DURATION + (panels.length - 1) * STEP_TOTAL) {
                stepIndex = panels.length - 1;
              }
            }

            if (
              stepIndex !== activeIndexRef.current &&
              !isProgrammaticScrollingRef.current
            ) {
              activeIndexRef.current = stepIndex;
              if (
                onActiveBrandChangeRef.current &&
                activeConfigs[stepIndex]
              ) {
                onActiveBrandChangeRef.current(activeConfigs[stepIndex].key);
              }
            }
          },
        },
      });

      scrollTriggerRef.current = tl.scrollTrigger || null;

      // Initial dwell pause on first card (RBW)
      tl.to({}, { duration: DWELL_DURATION });

      // Build sequential overlapping steps with resting states
      for (let i = 1; i < panels.length; i++) {
        const prevPanel = panels[i - 1];
        const currPanel = panels[i];
        const transitionLabel = `slide_${i}`;

        // Next panel slides in over previous panel
        tl.to(
          currPanel,
          {
            yPercent: 0,
            scale: 1,
            opacity: 1,
            ease: "none",
            duration: SLIDE_DURATION,
          },
          transitionLabel
        );

        // Previous panel subtly scales down and fades behind
        tl.to(
          prevPanel,
          {
            scale: 0.95,
            opacity: 0.70,
            ease: "none",
            duration: SLIDE_DURATION,
          },
          transitionLabel
        );

        // Resting dwell on current panel so user can browse products
        tl.to({}, { duration: DWELL_DURATION });
      }

      // Refresh ScrollTrigger after slight layout settling
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);

      return () => clearTimeout(timer);
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [brandKeys, totalPanels, activeConfigs, DWELL_DURATION, SLIDE_DURATION, STEP_TOTAL, TOTAL_DURATION]);

  if (activeConfigs.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-visible"
    >
      {/* ─── PINNED STAGE: LOCKS BOTH FILTER BAR AND SHOWROOM UNDER NAVBAR ─── */}
      <div
        ref={stageRef}
        className="w-full h-[calc(100vh-48px)] sm:h-[calc(100vh-58px)] flex flex-col justify-between overflow-hidden bg-[#F5F2EB]"
      >
        {/* 1. Filter Bar (Always visible at top of pinned stage, flush below Navbar) */}
        <div className="w-full shrink-0 z-40">
          <StickyShopFilters
            selectedBrands={selectedBrands}
            onToggleBrand={onToggleBrand}
            onClearBrands={onClearBrands}
            selectedCategories={selectedCategories}
            onToggleCategory={onToggleCategory}
            onClearCategories={onClearCategories}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            sortBy={sortBy}
            onSortChange={onSortChange}
            onResetAll={onResetAll}
            brandsList={brandsList}
            categoriesList={categoriesList}
          />
        </div>

        {/* 2. Showroom Stage (Fills the rest of the height with overlapping brand cards) */}
        <div className="relative w-full flex-1 overflow-hidden flex items-center justify-center">
          {activeConfigs.map((brandConfig, i) => {
            const products = getBrandProducts(brandConfig.key);
            return (
              <div
                key={brandConfig.key}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                className="absolute inset-0 w-full h-full flex items-center justify-center p-2 min-[390px]:p-3 sm:p-4 lg:p-6 select-none"
                style={{
                  zIndex: 10 + i * 10,
                  willChange: "transform",
                }}
              >
                <div className="w-full max-w-[1440px] h-full flex flex-col justify-between">
                  <BrandShowroomSection
                    brand={brandConfig}
                    products={products}
                    onAddToCart={onAddToCart}
                    addingId={addingId}
                    onQuickView={onQuickView}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
