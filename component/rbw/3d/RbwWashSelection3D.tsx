"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { RbwCinematicUI } from "@/component/rbw/3d/RbwCinematicUI";
import {
  RbwShowroomBackdrop,
  toAtmosphere,
  useRbwReducedMotion,
} from "@/component/rbw/3d/RbwShowroomBackdrop";
import { ALL_SHOWROOM_ITEMS, CarouselItemData } from "@/component/rbw/3d/RbwOrbitCarousel";
import { RbwFilterPanel, CategoryId } from "@/component/rbw/3d/RbwFilterPanel";
import "@/component/rbw/3d/rbw-showroom.css";

const RbwCanvas = dynamic(
  () => import("@/component/rbw/3d/RbwCanvas"),
  {
    ssr: false,
    loading: () => null,
  }
);

interface RbwWashSelection3DProps {
  onWashSelect: (washKey: "raw" | "black" | "white" | string, category?: string, defaultFit?: string) => void;
}

export function RbwWashSelection3D({ onWashSelect }: RbwWashSelection3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isInspecting, setIsInspecting] = useState(false);
  const [rotationStep, setRotationStep] = useState(0);

  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>(["jeans"]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Cinematic showroom state (visual only — no business logic)
  const reducedMotion = useRbwReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const pendingSwitches = useRef(0);

  /**
   * Category changes dip the stage (≈240ms), swap the garments while it is dark,
   * then bring the new set up — a showroom transition instead of a hard cut.
   * Every call is queued, so rapid clicks are never dropped.
   */
  const runWithSwitch = useCallback(
    (apply: () => void) => {
      if (reducedMotion || typeof window === "undefined") {
        apply();
        return;
      }
      pendingSwitches.current += 1;
      setIsSwitching(true);
      window.setTimeout(() => {
        apply();
        window.setTimeout(() => {
          pendingSwitches.current = Math.max(0, pendingSwitches.current - 1);
          if (pendingSwitches.current === 0) setIsSwitching(false);
        }, 60);
      }, 240);
    },
    [reducedMotion]
  );

  const filteredItems = useMemo(() => {
    let result = ALL_SHOWROOM_ITEMS;

    if (selectedCategories.length > 0) {
      result = result.filter((item) => selectedCategories.includes(item.category));
    }

    if (selectedColors.length > 0) {
      result = result.filter(
        (item) =>
          selectedColors.includes(item.washKey) ||
          (item.colorName &&
            selectedColors.some((c) =>
              item.colorName?.toLowerCase().includes(c.toLowerCase())
            ))
      );
    }

    if (selectedSizes.length > 0) {
      result = result.filter((item) =>
        item.availableSizes?.some((sz) => selectedSizes.includes(sz))
      );
    }

    if (selectedFits.length > 0) {
      result = result.filter((item) =>
        item.fitType &&
        selectedFits.some((fit) =>
          item.fitType?.toLowerCase().includes(fit.toLowerCase())
        )
      );
    }

    if (selectedDiscount !== null && selectedDiscount > 0) {
      result = result.filter((item) => (item.discountPct || 0) >= selectedDiscount);
    }
    if (priceRange[0] > 0 || priceRange[1] < 5000) {
      result = result.filter((item) => {
        const numeric = parseInt(item.price.replace(/[^\d]/g, ""), 10) || 0;
        return numeric >= priceRange[0] && numeric <= priceRange[1];
      });
    }

    if (result.length === 0) {
      const catFallback = ALL_SHOWROOM_ITEMS.filter((item) =>
        selectedCategories.includes(item.category)
      );
      return catFallback.length > 0 ? catFallback : ALL_SHOWROOM_ITEMS;
    }

    return result;
  }, [
    selectedCategories,
    selectedColors,
    selectedSizes,
    selectedFits,
    selectedDiscount,
    priceRange,
  ]);

  const totalItems = filteredItems.length;
  const activeItem =
    filteredItems[((activeIndex % totalItems) + totalItems) % totalItems] ||
    filteredItems[0];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalItems);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const handleSelectIndex = (idx: number) => {
    setActiveIndex(idx);
  };

  const handleRotateLeft = () => {
    setRotationStep((prev) => prev - 1);
  };

  const handleRotateRight = () => {
    setRotationStep((prev) => prev + 1);
  };

  const handleToggleInspect = () => {
    setIsInspecting((prev) => {
      const next = !prev;
      if (next) setIsFilterOpen(false);
      return next;
    });
  };

  const handleCloseInspect = () => {
    setIsInspecting(false);
  };

  const handleToggleCategory = (catId: CategoryId) => {
    // re-picking the only active category changes nothing visible: no transition, same reset as before
    if (selectedCategories.length === 1 && selectedCategories[0] === catId) {
      setActiveIndex(0);
      return;
    }
    runWithSwitch(() => {
      setSelectedCategories((prev) => {
        const exists = prev.includes(catId);
        if (exists) {
          if (prev.length === 1) return prev;
          return prev.filter((id) => id !== catId);
        } else {
          return [...prev, catId];
        }
      });
      setActiveIndex(0);
    });
  };

  // URL query param support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category") as CategoryId;
      if (cat && ["jeans", "jackets", "shorts", "accessories"].includes(cat)) {
        setSelectedCategories([cat]);
      }

      const w = params.get("wash");
      if (w) {
        const foundIdx = ALL_SHOWROOM_ITEMS.findIndex((item) => item.washKey === w);
        if (foundIdx !== -1) setActiveIndex(foundIdx);
      }
    }
  }, []);

  // Broadcast state to Navbar
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("RBW_PREVIEW_CATEGORIES_STATE", {
          detail: {
            selectedCategories,
            activeCategory: selectedCategories[0] || "jeans",
          },
        })
      );
    }
  }, [selectedCategories]);

  // Listen for actions from Navbar
  useEffect(() => {
    const handleExtToggle = (e: any) => {
      const catId = e.detail as CategoryId;
      if (catId && ["jeans", "jackets", "shorts", "accessories"].includes(catId)) {
        handleToggleCategory(catId);
        window.dispatchEvent(new CustomEvent("RESET_RBW_STOREFRONT"));
      }
    };
    const handleToggleFilter = () => {
      setIsFilterOpen((prev) => !prev);
      window.dispatchEvent(new CustomEvent("RESET_RBW_STOREFRONT"));
    };

    window.addEventListener("RBW_PREVIEW_TOGGLE_CATEGORY", handleExtToggle);
    window.addEventListener("RBW_PREVIEW_TOGGLE_FILTER", handleToggleFilter);
    return () => {
      window.removeEventListener("RBW_PREVIEW_TOGGLE_CATEGORY", handleExtToggle);
      window.removeEventListener("RBW_PREVIEW_TOGGLE_FILTER", handleToggleFilter);
    };
  }, [selectedCategories]);


  const handleSelectCategory = (catId: CategoryId) => {
    if (selectedCategories.length === 1 && selectedCategories[0] === catId) {
      setActiveIndex(0);
      return;
    }
    runWithSwitch(() => {
      setSelectedCategories([catId]);
      setActiveIndex(0);
    });
  };

  const handleToggleColor = (colorId: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorId) ? prev.filter((c) => c !== colorId) : [...prev, colorId]
    );
    setActiveIndex(0);
  };

  const handleToggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setActiveIndex(0);
  };

  const handleToggleFit = (fit: string) => {
    setSelectedFits((prev) =>
      prev.includes(fit) ? prev.filter((f) => f !== fit) : [...prev, fit]
    );
    setActiveIndex(0);
  };

  const handleSelectDiscount = (discount: number | null) => {
    setSelectedDiscount(discount);
    setActiveIndex(0);
  };

  const handleResetFilters = () => {
    setSelectedCategories(["jeans"]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedFits([]);
    setSelectedDiscount(null);
    setPriceRange([0, 5000]);
    setActiveIndex(0);
  };

  const activeFilterCount =
    (selectedCategories.length > 0 &&
      !(selectedCategories.length === 1 && selectedCategories[0] === "jeans")
      ? selectedCategories.length
      : 0) +
    selectedColors.length +
    selectedSizes.length +
    selectedFits.length +
    (selectedDiscount && selectedDiscount > 0 ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0);

  const atmosphere = toAtmosphere(activeItem?.washKey);
  // first word only for the oversized ghost lettering ("RAW JACKET" → "RAW")
  const ghostWord = (activeItem?.name || "").split(" ")[0];

  return (
    <div className="rbw-showroom relative w-full h-full overflow-hidden select-none bg-[#07080a]">
      <link rel="preload" href="/rbwstore/raw.png" as="image" />
      <link rel="preload" href="/rbwstore/black.png" as="image" />
      <link rel="preload" href="/rbwstore/white.png" as="image" />

      {/* Cinematic studio environment (DOM layers behind the canvas) */}
      <RbwShowroomBackdrop washKey={activeItem?.washKey} ghostText={ghostWord} />

      <div className="relative w-full h-full overflow-hidden z-10">
        <div className="absolute inset-0 rbw-stage" data-switching={isSwitching}>
          <RbwCanvas
            items={filteredItems}
            activeItem={activeItem}
            activeIndex={activeIndex}
            onSelectIndex={setActiveIndex}
            autoRotate={autoRotate}
            isInspecting={isInspecting}
            setIsInspecting={setIsInspecting}
            rotationStep={rotationStep}
            cinematic
            atmosphere={atmosphere}
            reducedMotion={reducedMotion}
            onHoverIndex={setHoveredIndex}
          />
        </div>

        <RbwCinematicUI
          items={filteredItems}
          activeItem={activeItem}
          activeIndex={activeIndex}
          totalItems={totalItems}
          onPrev={handlePrev}
          onNext={handleNext}
          onSelectIndex={handleSelectIndex}
          autoRotate={autoRotate}
          onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
          selectedCategories={selectedCategories}
          onSelectCategory={handleSelectCategory}
          onToggleFilterDrawer={() => setIsFilterOpen((prev) => !prev)}
          isFilterOpen={isFilterOpen}
          activeFilterCount={activeFilterCount}
          hoveredIndex={hoveredIndex}
          isInspecting={isInspecting}
          onCloseInspect={handleCloseInspect}
          onRotateLeft={handleRotateLeft}
          onRotateRight={handleRotateRight}
          onShopItem={(item) => {
            onWashSelect(item.washKey, item.category, item.fitType);
          }}
        />

        <RbwFilterPanel
          isOpen={isFilterOpen}
          onToggleOpen={() => setIsFilterOpen((prev) => !prev)}
          selectedCategories={selectedCategories}
          activeCategory={selectedCategories[0]}
          onToggleCategory={handleToggleCategory}
          onSelectCategory={handleSelectCategory}
          selectedColors={selectedColors}
          onToggleColor={handleToggleColor}
          selectedSizes={selectedSizes}
          onToggleSize={handleToggleSize}
          selectedFits={selectedFits}
          onToggleFit={handleToggleFit}
          priceRange={priceRange}
          onChangePrice={setPriceRange}
          selectedDiscount={selectedDiscount}
          onSelectDiscount={handleSelectDiscount}
          onResetFilters={handleResetFilters}
          onApplyFilters={() => setIsFilterOpen(false)}
          activeFilterCount={activeFilterCount}
          isInspecting={isInspecting}
        />
      </div>
    </div>
  );
}
