"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from "lucide-react";
import { CategoryId } from "./RbwFilterPanel";

export interface ShowcaseProduct {
  id: string;
  name: string;
  tagline: string;
  image: string;
  price: string;
  accentHex: string;
  shopHref: string;
  btnText: string;
  btnBg: string;
  btnHover: string;
  btnTextColor: string;
  textStyle: string;
  fit: string;
  weight: string;
}

export const JACKETS_DATA: ShowcaseProduct[] = [
  {
    id: "raw",
    name: "RAW",
    tagline: "14.5 OZ RIGID SELVEDGE JACKET",
    image: "/raw_denim_jacket.png",
    price: "₹3,490",
    accentHex: "#C59B27",
    shopHref: "/stores/rbw/jackets?wash=raw",
    btnText: "SHOP RAW JACKET →",
    btnBg: "bg-[#C59B27]",
    btnHover: "hover:bg-[#A8821B]",
    btnTextColor: "text-black",
    textStyle: "text-raw-textured",
    fit: "BOX CUT SELVEDGE",
    weight: "14.5 OZ RIGID",
  },
  {
    id: "black",
    name: "BLACK",
    tagline: "BLACK WARP & WEFT SELVEDGE",
    image: "/black_denim_jacket.png",
    price: "₹3,490",
    accentHex: "#801818",
    shopHref: "/stores/rbw/jackets?wash=black",
    btnText: "SHOP BLACK JACKET →",
    btnBg: "bg-[#801818]",
    btnHover: "hover:bg-[#661212]",
    btnTextColor: "text-white",
    textStyle: "text-black-textured",
    fit: "SIGNATURE TRUCKER",
    weight: "14.0 OZ SULFUR DYED",
  },
  {
    id: "white",
    name: "WHITE",
    tagline: "ARTISAN WHITE SELVEDGE JACKET",
    image: "/vintage_denim_jacket.png",
    price: "₹3,490",
    accentHex: "#0A2A5E",
    shopHref: "/stores/rbw/jackets?wash=white",
    btnText: "SHOP WHITE JACKET →",
    btnBg: "bg-[#0A2A5E]",
    btnHover: "hover:bg-[#061c40]",
    btnTextColor: "text-white",
    textStyle: "text-white-textured",
    fit: "VINTAGE BOOT TRUCKER",
    weight: "13.8 OZ ECRU BULL",
  },
];

export const SHORTS_DATA: ShowcaseProduct[] = [
  {
    id: "raw",
    name: "RAW",
    tagline: "14.5 OZ RIGID SELVEDGE SHORTS",
    image: "/raw_denim_shorts.png",
    price: "₹1,499",
    accentHex: "#C59B27",
    shopHref: "/stores/rbw/shorts?wash=raw",
    btnText: "SHOP RAW SHORTS →",
    btnBg: "bg-[#C59B27]",
    btnHover: "hover:bg-[#A8821B]",
    btnTextColor: "text-black",
    textStyle: "text-raw-textured",
    fit: "RELAXED JORT CUT",
    weight: "14.5 OZ SELVEDGE",
  },
  {
    id: "black",
    name: "BLACK",
    tagline: "CARBON BLACK OBSIDIAN SHORTS",
    image: "/black_denim_shorts.png",
    price: "₹1,599",
    accentHex: "#801818",
    shopHref: "/stores/rbw/shorts?wash=black",
    btnText: "SHOP BLACK SHORTS →",
    btnBg: "bg-[#801818]",
    btnHover: "hover:bg-[#661212]",
    btnTextColor: "text-white",
    textStyle: "text-black-textured",
    fit: "SULFUR DYED LOOSE",
    weight: "14.0 OZ SOLID",
  },
  {
    id: "white",
    name: "WHITE",
    tagline: "ARTISAN BLEACHED ECRU BULL SHORTS",
    image: "/white_denim_shorts.png",
    price: "₹1,499",
    accentHex: "#0A2A5E",
    shopHref: "/stores/rbw/shorts?wash=white",
    btnText: "SHOP WHITE SHORTS →",
    btnBg: "bg-[#0A2A5E]",
    btnHover: "hover:bg-[#061c40]",
    btnTextColor: "text-white",
    textStyle: "text-white-textured",
    fit: "RAW CUT CONTEMPORARY",
    weight: "13.8 OZ BULL DENIM",
  },
];

interface RbwImageShowcaseProps {
  category: CategoryId;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
}

export function RbwImageShowcase({
  category,
  autoRotate,
  onToggleAutoRotate,
}: RbwImageShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);

  const items: ShowcaseProduct[] =
    category === "jackets" ? JACKETS_DATA : SHORTS_DATA;

  const activeItem = items[activeIndex % items.length];

  // Auto rotation loop
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoRotate, items.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length]);

  // Touch / Drag slide handler
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (delta > 50) handlePrev();
    else if (delta < -50) handleNext();
    dragStartX.current = null;
  };

  if (category === "accessories") {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 select-none">
        <div className="p-8 max-w-md rounded-3xl bg-black/60 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#B9965A]/20 border border-[#B9965A]/40 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#B9965A]" />
          </div>
          <h3 className="text-xl font-serif uppercase tracking-[0.25em] text-[#B9965A] font-bold">
            Atelier Accessories
          </h3>
          <p className="text-xs font-mono text-zinc-300 leading-relaxed">
            Upcoming drop featuring handcrafted Japanese brass belt buckles, raw indigo caps, and vegetable-tanned leather tags.
          </p>
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            COMING IN NEXT DROP
          </div>
        </div>
      </div>
    );
  }

  const leftIndex = (activeIndex - 1 + items.length) % items.length;
  const rightIndex = (activeIndex + 1) % items.length;

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none flex flex-col justify-between pt-28 pb-6"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* Dynamic Lighting Glow behind Active Item */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[540px] h-[420px] sm:h-[540px] rounded-full pointer-events-none blur-[120px] transition-colors duration-700 opacity-30"
        style={{ backgroundColor: activeItem.accentHex }}
      />

      {/* Floating 3D Showcase Stage: 3 Products in Space */}
      <div className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center px-4">
        
        {/* Left Item (Positioned under Left Spotlight) */}
        <div
          onClick={handlePrev}
          className="hidden md:flex absolute left-8 lg:left-16 flex-col items-center cursor-pointer transition-all duration-700 ease-out transform scale-75 opacity-40 hover:opacity-80 hover:scale-80 z-0"
        >
          <div className="relative w-56 h-64 lg:w-64 lg:h-80 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <Image
              src={items[leftIndex].image}
              alt={items[leftIndex].name}
              fill
              className="object-contain pointer-events-none"
            />
          </div>
          <span className="mt-2 text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
            {items[leftIndex].name}
          </span>
        </div>

        {/* Center Floating Active Item (Hero 3D Simulation) */}
        <div className="relative flex flex-col items-center z-10">
          
          {/* Main Floating Garment */}
          <div
            className="relative w-72 h-80 sm:w-88 sm:h-96 md:w-[420px] md:h-[440px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.45)] transition-all duration-700 ease-out"
            style={{
              animation: "rbwFloat 5s ease-in-out infinite",
            }}
          >
            <Image
              src={activeItem.image}
              alt={activeItem.name}
              fill
              priority
              className="object-contain pointer-events-none drop-shadow-2xl"
            />
          </div>

          {/* Dynamic Floor Shadow beneath garment */}
          <div
            className="w-48 sm:w-64 h-5 rounded-full bg-black/40 blur-md mt-2 transition-all"
            style={{
              animation: "rbwFloatShadow 5s ease-in-out infinite",
            }}
          />

          {/* Mode Pill */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-[10px] font-mono tracking-[0.2em] text-[#B9965A] uppercase">
            <Sparkles className="w-3 h-3 text-[#B9965A]" />
            <span>Floating High-Res Preview</span>
          </div>
        </div>

        {/* Right Item (Positioned under Right Spotlight) */}
        <div
          onClick={handleNext}
          className="hidden md:flex absolute right-8 lg:right-16 flex-col items-center cursor-pointer transition-all duration-700 ease-out transform scale-75 opacity-40 hover:opacity-80 hover:scale-80 z-0"
        >
          <div className="relative w-56 h-64 lg:w-64 lg:h-80 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <Image
              src={items[rightIndex].image}
              alt={items[rightIndex].name}
              fill
              className="object-contain pointer-events-none"
            />
          </div>
          <span className="mt-2 text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
            {items[rightIndex].name}
          </span>
        </div>
      </div>

      {/* Navigation Chevrons on sides */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none px-4 md:px-12 z-20">
        <button
          onClick={handlePrev}
          aria-label="Previous Item"
          className="pointer-events-auto p-3 md:p-4 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 hover:border-[#B9965A]/60 backdrop-blur-xl transition-all shadow-2xl active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-zinc-300 hover:text-white" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Item"
          className="pointer-events-auto p-3 md:p-4 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 hover:border-[#B9965A]/60 backdrop-blur-xl transition-all shadow-2xl active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-zinc-300 hover:text-white" />
        </button>
      </div>

      {/* Center Bottom Showcase Typography & Actions */}
      <div
        role="region"
        aria-label="Product details"
        className="flex flex-col items-center justify-center text-center pointer-events-auto pb-4 z-20 select-none"
      >
        {/* Dynamic Textured Wash / Title */}
        <h2
          className={`text-5xl sm:text-6xl md:text-7xl font-black tracking-wider uppercase leading-none select-none drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)] ${activeItem.textStyle}`}
        >
          {activeItem.name}
        </h2>

        {/* Dynamic Tagline */}
        <p className="text-xs sm:text-sm font-extrabold tracking-[0.22em] text-zinc-900 uppercase select-none mt-2 drop-shadow-sm">
          {activeItem.tagline}
        </p>

        {/* Call to Action Button */}
        <Link
          href={activeItem.shopHref}
          className={`mt-3 px-6 py-2.5 ${activeItem.btnBg} ${activeItem.btnHover} ${activeItem.btnTextColor} font-black text-xs sm:text-sm tracking-wider uppercase inline-flex items-center justify-center gap-1.5 shadow-xl hover:brightness-110 active:scale-95 transition-all`}
        >
          <span>{activeItem.btnText}</span>
        </Link>

        {/* Minimal 3-Segment Progress Scrubber */}
        <div className="w-56 sm:w-64 flex items-center justify-center gap-2 mt-3.5">
          {items.map((item, i) => {
            const isCurrent = (activeIndex % items.length) === i;
            return (
              <button
                key={item.id}
                onClick={() => setActiveIndex(i)}
                className="flex-1 py-1.5 group cursor-pointer"
                aria-label={`Jump to ${item.name}`}
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? "bg-[#5B5BFF] shadow-sm"
                      : "bg-[#B0B0B8]/60 group-hover:bg-[#8E8E98]"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Interactive Tip */}
        <p className="text-[10px] text-zinc-700 tracking-widest uppercase mt-1.5 font-mono font-medium drop-shadow-xs">
          DRAG OR CLICK CHEVRONS TO SLIDE • HIGH RESOLUTION TEXTURE
        </p>
      </div>
    </div>
  );
}
