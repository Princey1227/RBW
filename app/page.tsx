"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import BrandHeader from "../component/home/BrandHeader";
import BrandStoreCarousel, {
  BrandStore,
} from "../component/home/BrandStoreCarousel";
import BrandWaitlistModal from "../component/home/BrandWaitlistModal";
import HomeFooterDock from "../component/home/HomeFooterDock";

const BRANDS: BrandStore[] = [
  {
    name: "RBW",
    tagline: "PREMIUM EVERYDAY DENIM",
    image: "/brands/rbw_jeans.jpg",
    categories: [
      { label: "JEANS", image: "/brands/rbw_jeans.jpg", href: "/stores/rbw?wash=raw" },
      { label: "JACKETS", image: "/brands/rbw_jackets.jpg", href: "/stores/rbw/jackets" },
      { label: "SHORTS", image: "/brands/rbw_shorts.jpg", href: "/stores/rbw/shorts" },
      { label: "ACCESSORIES", image: "/brands/rbw_accessories_v2.jpg", href: "/accessories" },
    ],
    fontStyle: "font-serif text-lg sm:text-xl lg:text-2xl font-normal tracking-wider",
    href: "/stores/rbw?wash=raw",
    isLive: true,
    actionText: "ENTER THE STORE",
  },
  {
    name: "THINC",
    tagline: "MINIMAL. MODERN. MADE FOR YOU.",
    image: "/brands/thinc_v2.jpg",
    categories: [
      { label: "JEANS", image: "/brands/thinc_v2.jpg" },
      { label: "JACKETS", image: "/brands/thinc.jpg" },
      { label: "ESSENTIALS", image: "/brands/thinc_men.jpg" },
    ],
    fontStyle: "font-sans text-base sm:text-lg lg:text-xl font-bold tracking-[0.2em]",
    href: "#",
    isLive: false,
    actionText: "COMING SOON",
  },
  {
    name: "WIDE",
    tagline: "LOOSE FIT. BIG ATTITUDE.",
    image: "/brands/wide_v2.jpg",
    categories: [
      { label: "JEANS", image: "/brands/wide_v2.jpg" },
      { label: "STREETWEAR", image: "/brands/wide.jpg" },
      { label: "SKATE", image: "/brands/wide_men.jpg" },
    ],
    fontStyle: "font-sans text-base sm:text-lg lg:text-xl font-black tracking-[0.2em] italic",
    href: "#",
    isLive: false,
    actionText: "COMING SOON",
  },
  {
    name: "IJNS",
    tagline: "YOUNG. BOLD. EXPRESSIVE.",
    image: "/brands/ijns_v2.jpg",
    categories: [
      { label: "JEANS", image: "/brands/ijns_v2.jpg" },
      { label: "JACKETS", image: "/brands/ijns.jpg" },
      { label: "EXPRESSIVE", image: "/brands/ijns_men.jpg" },
    ],
    fontStyle: "font-sans text-base sm:text-lg lg:text-xl font-bold tracking-[0.18em]",
    href: "#",
    isLive: false,
    actionText: "COMING SOON",
  },
  {
    name: "SECOND ARMY",
    tagline: "UTILITY MEETS STREET.",
    image: "/brands/second_army_v2.jpg",
    categories: [
      { label: "JACKETS", image: "/brands/second_army_v2.jpg" },
      { label: "CARGOS", image: "/brands/second-army.jpg" },
      { label: "TACTICAL", image: "/brands/second-army_men.jpg" },
    ],
    fontStyle: "font-sans text-base sm:text-lg lg:text-xl font-bold tracking-widest",
    href: "#",
    isLive: false,
    actionText: "COMING SOON",
  },
];

export default function Home() {
  const [containerWidth, setContainerWidth] = useState(1650);
  const [waitlistBrand, setWaitlistBrand] = useState<BrandStore | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const isMob = w < 640;

      // Responsive side padding
      const padding = isMob
        ? 16
        : w < 768
          ? 48
          : w < 1024
            ? 64
            : w < 1360
              ? 110
              : 90;
      const maxWidth = 1650;
      const availableWidth = Math.min(w - padding, maxWidth);

      setContainerWidth(availableWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="relative w-full bg-[#F5F2EB] text-[#1C1917] px-3 sm:px-6 md:px-8 lg:px-10 pt-1 sm:pt-2.5 lg:pt-3.5 pb-12 sm:pb-2.5 lg:pb-3 flex flex-col justify-between selection:bg-[#1C1917] selection:text-[#EDE7DE] h-[calc(100dvh-54px)] sm:h-[calc(100vh-62px)] max-h-[calc(100dvh-54px)] sm:max-h-[calc(100vh-62px)] overflow-hidden box-border max-w-[100vw]">
      {/* Photorealistic Dual Brass Spotlights & Volumetric Stage Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <Image
          src="/spotlight_stage_bg.jpg"
          alt="Studio Spotlight Background"
          fill
          priority
          className="object-cover object-top pointer-events-none"
        />
        {/* Subtle warm ambient diffusion overlay */}
        <div className="absolute inset-0 bg-[#FAF8F5]/10 pointer-events-none" />
      </div>

      {/* 1. Tall Display Brand Showcase Header */}
      <BrandHeader />

      {/* 2. Interactive 3D Brand Stores Showcase */}
      <BrandStoreCarousel
        brands={BRANDS}
        onOpenWaitlist={(brand) => setWaitlistBrand(brand)}
        containerWidth={containerWidth}
      />

      {/* 3. Bottom Footer Dock */}
      <HomeFooterDock maxWidth={containerWidth} />

      {/* 4. Coming Soon Brand Waitlist Modal */}
      <BrandWaitlistModal
        brand={waitlistBrand}
        onClose={() => setWaitlistBrand(null)}
      />
    </main>
  );
}
