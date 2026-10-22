"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientProduct, ClientStoreConfig, PublicStore } from "@/lib/stores/types";
import { atmosphereFor, buildCarouselItems, colorsForCategory } from "@/component/store-front/brandItems";
import { RbwWashSelection3D } from "./3d/RbwWashSelection3D";
import { RbwJourneyShell } from "@/component/rbw/RbwJourneyShell";
import Navbar from "./Navbar";
import ShopByFit from "./ShopByFit";
import PDP from "./PDP";
import "./brand.css";
import "@/component/rbw/3d/rbw-showroom.css";
import "@/component/rbw/rbw-journey.css";

interface StoreFrontProps {
  store: PublicStore;
  config: ClientStoreConfig;
  products: ClientProduct[];
  initial?: { category?: string; color?: string; fit?: string };
}

/**
 * Main Dedicated Storefront for Second army
 *
 * It manages the 3 cinematic slides:
 *   Slide 1: 3D Color Carousel & Showroom
 *   Slide 2: Shop by Fit
 *   Slide 3: Product Detail View (PDP)
 *
 * You can freely customize or rearrange components in this folder.
 */
export default function StoreFront({
  store,
  config,
  products,
  initial = {},
}: StoreFrontProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const defaultCategory = config.categories[0]?.id || "jeans";
  const [category, setCategory] = useState<string>(initial.category || defaultCategory);
  const [colorId, setColorId] = useState<string | null>(initial.color || null);
  const [fit, setFit] = useState<string | null>(initial.fit || null);
  const [wished, setWished] = useState(false);

  const colors = useMemo(() => colorsForCategory(config, products, category), [config, products, category]);
  const color = useMemo(() => colors.find((c) => c.id === colorId) ?? null, [colors, colorId]);
  const items = useMemo(() => buildCarouselItems(config, products), [config, products]);

  const fitsRef = useRef<HTMLDivElement>(null);
  const pdpRef = useRef<HTMLDivElement>(null);

  const pushState = useCallback((cat: string, col: string | null, f: string | null) => {
    const sp = new URLSearchParams();
    if (cat) sp.set("category", cat);
    if (col) sp.set("color", col);
    if (f) sp.set("fit", f);
    const qs = sp.toString();
    const url = qs ? `/stores/${store.slug}?${qs}` : `/stores/${store.slug}`;
    window.history.replaceState(null, "", url);
  }, [store.slug]);

  const selectColor = (cId: string, cat?: string) => {
    const targetCat = cat ?? category;
    setCategory(targetCat);
    setColorId(cId);
    pushState(targetCat, cId, fit);
  };

  const selectFit = (fName: string) => {
    setFit(fName);
    pushState(category, colorId, fName);
  };

  const goHome = () => {
    setColorId(null);
    setFit(null);
    pushState(category, null, null);
  };

  const backToFits = () => {
    setFit(null);
    pushState(category, colorId, null);
  };

  const handleLogout = async () => {
    await fetch(`/api/stores/${store.slug}/login`, { method: "DELETE" }).catch(() => {});
    router.refresh();
  };

  const categoryFits = config.fits[category] || [];
  const fitOpen = Boolean(colorId && !fit && categoryFits.length > 0);
  const pdpOpen = Boolean(colorId && (fit || categoryFits.length === 0));

  const activeProduct = useMemo(() => {
    if (!pdpOpen) return null;
    return products.find((p) => p.categoryId === category && p.colorId === colorId && (!fit || p.fit === fit))
      ?? products.find((p) => p.categoryId === category && p.colorId === colorId)
      ?? products[0];
  }, [pdpOpen, products, category, colorId, fit]);

  const atm = color ? atmosphereFor(color.hex) : "raw";

  return (
    <main
      data-theme={theme}
      className={`${store.slug}-store fixed inset-0 z-[9000] w-full h-screen ${
        theme === "dark" ? "bg-[#07080a]" : "bg-[#faf8f5]"
      } overflow-hidden pt-[75px] md:pt-[85px] xl:pt-[103px] box-border`}
    >
      {/* 1. Dedicated Brand Navbar */}
      <Navbar
        store={store}
        categories={config.categories}
        activeCategory={category}
        onSelectCategory={(catId) => {
          setCategory(catId);
          setColorId(null);
          setFit(null);
          pushState(catId, null, null);
        }}
        onHomeClick={goHome}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="w-full h-full relative">
        {/* Slide 1: 3D Color Carousel & Showroom */}
        <div
          className={`absolute left-0 w-full h-[100dvh] top-[-75px] md:top-[-85px] xl:top-[-103px] shrink-0 overflow-hidden transition-all duration-500 ${
            colorId ? "scale-[0.98] brightness-75 filter blur-[0.5px]" : "scale-100 brightness-100"
          }`}
        >
          <RbwWashSelection3D
            items={items}
            controlledCategory={category}
            onWashSelect={(washKey, cat) => selectColor(washKey, cat ?? category)}
            theme={theme}
            onToggleTheme={toggleTheme}
            isPaused={!!colorId}
            selectedWash={colorId}
            selectedCategory={category}
          />
        </div>

        {/* Slide 2: Shop by Fit */}
        <RbwJourneyShell
          open={fitOpen}
          layerClass="z-50"
          washKey={atm}
          ghostText={color?.name || store.name}
          receded={!!fit}
          scrollRef={fitsRef}
          theme="light"
        >
          <ShopByFit
            fits={categoryFits}
            selectedFit={fit}
            onSelectFit={selectFit}
            onBack={goHome}
            colorName={color?.name}
          />
        </RbwJourneyShell>

        {/* Slide 3: Product Detail View (PDP) */}
        <RbwJourneyShell
          open={pdpOpen}
          layerClass="z-55"
          washKey={atm}
          ghostText={fit || color?.name || store.name}
          scrollRef={pdpRef}
          theme="light"
        >
          <div className="flex-1 flex flex-col justify-start">
            {activeProduct && (
              <PDP
                product={activeProduct}
                categoryLabel={config.categories.find((c) => c.id === category)?.label || category}
                colorName={color?.name || "Standard"}
                brandName={store.name}
                wished={wished}
                onWish={() => setWished((w) => !w)}
                onBackToFits={categoryFits.length > 0 ? backToFits : goHome}
              />
            )}
          </div>
        </RbwJourneyShell>
      </div>
    </main>
  );
}
