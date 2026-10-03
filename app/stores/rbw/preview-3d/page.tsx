"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { RbwShowroomUI } from "@/component/rbw/3d/RbwShowroomUI";
import {
  ALL_SHOWROOM_ITEMS,
  CarouselItemData,
} from "@/component/rbw/3d/RbwOrbitCarousel";
import {
  RbwFilterPanel,
  CategoryId,
  CATEGORY_DEFS,
} from "@/component/rbw/3d/RbwFilterPanel";

const RbwCanvas = dynamic(
  () => import("@/component/rbw/3d/RbwCanvas"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function RBWStorefrontPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isInspecting, setIsInspecting] = useState(false);
  const [rotationStep, setRotationStep] = useState(0);

  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([
    "jeans",
  ]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  // URL query param support for wash and category
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

  useEffect(() => {
    const handleExtToggle = (e: any) => {
      const catId = e.detail as CategoryId;
      if (catId && ["jeans", "jackets", "shorts", "accessories"].includes(catId)) {
        handleToggleCategory(catId);
      }
    };
    const handleToggleFilter = () => {
      setIsFilterOpen((prev) => !prev);
    };

    window.addEventListener("RBW_PREVIEW_TOGGLE_CATEGORY", handleExtToggle);
    window.addEventListener("RBW_PREVIEW_TOGGLE_FILTER", handleToggleFilter);
    return () => {
      window.removeEventListener("RBW_PREVIEW_TOGGLE_CATEGORY", handleExtToggle);
      window.removeEventListener("RBW_PREVIEW_TOGGLE_FILTER", handleToggleFilter);
    };
  }, [selectedCategories]);

  const handleToggleCategory = (catId: CategoryId) => {
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
  };

  const handleSelectCategory = (catId: CategoryId) => {
    setSelectedCategories([catId]);
    setActiveIndex(0);
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

  const ambientTint = activeItem?.accentHex || "#C59B27";

  return (
    <main className="relative w-full h-screen overflow-hidden select-none bg-[#EAE6DF]">
      <link rel="preload" href="/rbwstore/raw.png" as="image" />
      <link rel="preload" href="/rbwstore/black.png" as="image" />
      <link rel="preload" href="/rbwstore/white.png" as="image" />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <Image
          src="/preview_3d_bg.png"
          alt="Architectural Showroom Background"
          fill
          priority
          className="object-cover object-center pointer-events-none"
        />
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-700 mix-blend-multiply"
          style={{
            backgroundColor: `${ambientTint}0a`,
          }}
        />
      </div>

      <div className="relative w-full h-full overflow-hidden z-10">
        <div className="absolute inset-0">
          <RbwCanvas
            items={filteredItems}
            activeItem={activeItem}
            activeIndex={activeIndex}
            onSelectIndex={setActiveIndex}
            autoRotate={autoRotate}
            isInspecting={isInspecting}
            setIsInspecting={setIsInspecting}
            rotationStep={rotationStep}
          />
        </div>

        <RbwShowroomUI
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
          activeCategory={selectedCategories[0]}
          onToggleCategory={handleToggleCategory}
          onSelectCategory={handleSelectCategory}
          onToggleFilterDrawer={() => setIsFilterOpen((prev) => !prev)}
          isFilterOpen={isFilterOpen}
          isInspecting={isInspecting}
          onToggleInspect={handleToggleInspect}
          onCloseInspect={handleCloseInspect}
          onRotateLeft={handleRotateLeft}
          onRotateRight={handleRotateRight}
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
    </main>
  );
}
