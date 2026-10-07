"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, ArrowRight, ChevronLeft, ChevronRight, Bell } from "lucide-react";

export interface BrandCategory {
  label: string;
  image: string;
  href?: string;
}

export interface BrandStore {
  name: string;
  tagline: string;
  image: string;
  categories: BrandCategory[];
  fontStyle: string;
  href: string;
  isLive: boolean;
  actionText: string;
}

interface BrandStoreCarouselProps {
  brands: BrandStore[];
  onOpenWaitlist: (brand: BrandStore) => void;
  containerWidth: number;
}

export default function BrandStoreCarousel({
  brands,
  onOpenWaitlist,
  containerWidth,
}: BrandStoreCarouselProps) {
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [prevActiveIndex, setPrevActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(250);
  const [isMobile, setIsMobile] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Active category index per brand store
  const [categoryIndices, setCategoryIndices] = useState<number[]>(() =>
    brands.map(() => 0)
  );

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);
  const hasDragged = useRef(false);
  const wheelCooldown = useRef(false);

  // Auto-cycle categories and product images periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setCategoryIndices((prev) =>
        prev.map((catIdx, bIdx) => {
          const brand = brands[bIdx];
          if (!brand?.categories || brand.categories.length <= 1) return catIdx;
          return (catIdx + 1) % brand.categories.length;
        })
      );
    }, 3800);
    return () => clearInterval(timer);
  }, [brands]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const isMob = w < 640;
      setIsMobile(isMob);

      if (w >= 1024) {
        setCardWidth(containerWidth * 0.182);
      } else if (w >= 768) {
        setCardWidth(270);
      } else {
        setCardWidth(w < 380 ? 205 : 220);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [containerWidth]);

  const slide = (direction: "left" | "right") => {
    setPrevActiveIndex(activeIndex);
    if (direction === "left") {
      setActiveIndex((prev) => (prev === 0 ? brands.length - 1 : prev - 1));
    } else {
      setActiveIndex((prev) => (prev === brands.length - 1 ? 0 : prev + 1));
    }
  };

  const handleDragStart = (clientX: number) => {
    isDragging.current = true;
    dragStartX.current = clientX;
    dragCurrentX.current = clientX;
    hasDragged.current = false;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging.current) return;
    dragCurrentX.current = clientX;
    const diff = Math.abs(dragCurrentX.current - dragStartX.current);
    if (diff > 12) {
      hasDragged.current = true;
    }
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsMouseDown(false);
    const diff = dragStartX.current - dragCurrentX.current;
    const threshold = 40;
    if (diff > threshold) {
      slide("right");
    } else if (diff < -threshold) {
      slide("left");
    }
    setTimeout(() => {
      hasDragged.current = false;
    }, 120);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsMouseDown(true);
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      handleDragEnd();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 18 || wheelCooldown.current) return;

    if (delta > 0) {
      slide("right");
    } else {
      slide("left");
    }

    wheelCooldown.current = true;
    setTimeout(() => {
      wheelCooldown.current = false;
    }, 350);
  };

  const handleCardInteraction = (brand: BrandStore, idx: number) => {
    if (hasDragged.current) return;
    if (activeIndex !== idx) {
      setPrevActiveIndex(activeIndex);
      setActiveIndex(idx);
    } else {
      if (brand.isLive) {
        const activeCat = brand.categories?.[categoryIndices[idx] || 0];
        const targetUrl =
          activeCat?.label === "JEANS"
            ? "/stores/rbw?wash=raw"
            : (activeCat?.href || brand.href);
        router.push(targetUrl);
      } else {
        onOpenWaitlist(brand);
      }
    }
  };

  const getSlotOffset = (slotIndex: number, currentCardWidth: number) => {
    if (isMobile) {
      const mobileSpacing = 160;
      if (slotIndex === 0) return 0;
      if (slotIndex === -1) return -mobileSpacing;
      if (slotIndex === 1) return mobileSpacing;
      if (slotIndex === -2) return -mobileSpacing * 2;
      if (slotIndex === 2) return mobileSpacing * 2;
      return 0;
    }

    const scale = 0.92;
    const visualCardWidth = currentCardWidth * scale;
    if (slotIndex === 0) return 0;

    if (slotIndex === -2) return -containerWidth / 2 + visualCardWidth / 2;
    if (slotIndex === 2) return containerWidth / 2 - visualCardWidth / 2;

    if (slotIndex === -1) return (-containerWidth / 2 + visualCardWidth / 2) / 2;
    if (slotIndex === 1) return (containerWidth / 2 - visualCardWidth / 2) / 2;

    return 0;
  };

  return (
    <div
      id="explore-brands"
      className="relative z-10 w-full mx-auto flex flex-col my-auto py-0 shrink overflow-visible"
      style={{ maxWidth: `${containerWidth}px` }}
    >
      {/* Section Header Bar */}
      <div className="flex items-center justify-between px-2 shrink-0 mb-1 mt-0 sm:mt-1 z-20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#B9965A]/15 border border-[#B9965A]/40 flex items-center justify-center">
            <Store className="w-3.5 h-3.5 text-[#8C6B2F] stroke-[2.2]" />
          </div>
          <h2 className="font-sans text-[11px] sm:text-xs tracking-[0.25em] font-extrabold text-[#1C1917] uppercase whitespace-nowrap">
            STORES SHOWCASE
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#8C827A] tracking-wider uppercase font-semibold">
          <span>Swipe or click to browse</span>
        </div>
      </div>

      {/* Carousel Wrapper */}
      <div className="relative w-full pt-1 sm:pt-2 pb-0 overflow-visible">
        {/* Golden Floor Light Stage Pools */}
        <div className="absolute -bottom-8 sm:-bottom-10 inset-x-0 pointer-events-none z-20 flex items-center justify-center">
          {/* Left light pool */}
          <div className="hidden sm:block absolute left-1/4 -translate-x-1/2 w-48 h-8 rounded-[100%] bg-gradient-to-r from-transparent via-[#E5C378]/30 to-transparent blur-lg" />
          {/* Center intersection light pool */}
          <div className="relative w-56 sm:w-80 h-7 sm:h-9 flex items-center justify-center">
            <div className="absolute w-full h-full rounded-[100%] bg-gradient-to-r from-transparent via-[#E5C378]/60 to-transparent blur-xl" />
            <div className="relative w-44 sm:w-64 h-4 sm:h-5 rounded-[100%] bg-gradient-to-r from-transparent via-[#FFF4D0]/85 to-transparent border-t border-[#FFFDF0]/90 shadow-[0_0_25px_rgba(245,215,127,0.85)]" />
          </div>
          {/* Right light pool */}
          <div className="hidden sm:block absolute right-1/4 translate-x-1/2 w-48 h-8 rounded-[100%] bg-gradient-to-r from-transparent via-[#E5C378]/30 to-transparent blur-lg" />
        </div>

        {/* Interactive Cards Container */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          className={`relative flex items-center justify-center w-full h-[325px] min-[390px]:h-[375px] min-[430px]:h-[415px] sm:h-[370px] md:h-[395px] lg:h-[415px] xl:h-[430px] 2xl:h-[475px] select-none touch-pan-y ${
            isMouseDown ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {brands.map((brand, idx) => {
            const isActive = idx === activeIndex;
            const slot = ((idx - activeIndex + 7) % 5) - 2;
            const prevSlot = ((idx - prevActiveIndex + 7) % 5) - 2;
            const isWrapping = Math.abs(slot - prevSlot) > 1;
            const offset = getSlotOffset(slot, cardWidth);

            const CardContent = (
              <div
                className={`group relative h-[305px] min-[390px]:h-[355px] min-[430px]:h-[395px] sm:h-[350px] md:h-[370px] lg:h-[390px] xl:h-[405px] 2xl:h-[445px] rounded-[22px] overflow-hidden transition-all duration-500 flex flex-col justify-between cursor-pointer border shadow-xl w-full transform-gpu will-change-transform ${
                  isActive
                    ? "bg-stone-950 border-[#B9965A] scale-100 sm:scale-104 md:scale-106 z-30 opacity-100 shadow-[0_25px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(185,150,90,0.35)] ring-2 ring-[#B9965A]/70"
                    : Math.abs(slot) === 1
                    ? "bg-stone-950/95 border-stone-800/80 scale-[0.84] sm:scale-[0.88] z-10 opacity-90 hover:opacity-100 brightness-100"
                    : "bg-stone-950/90 border-stone-800/60 scale-[0.7] sm:scale-[0.88] z-0 opacity-0 pointer-events-none sm:opacity-85 sm:pointer-events-auto brightness-95"
                }`}
              >
                {/* Denim Stitch Perimeter Accent */}
                <div className="absolute inset-[3px] rounded-[19px] border border-dashed border-white/10 group-hover:border-[#B9965A]/40 transition-colors pointer-events-none z-20" />

                {/* Card Background Images with smooth slide-in insert */}
                {brand.categories && brand.categories.length > 0 ? (
                  brand.categories.map((cat, catIdx) => {
                    const currentIdx = categoryIndices[idx] || 0;
                    const len = brand.categories.length;
                    const offset = (catIdx - currentIdx + len) % len;
                    const isCurrent = offset === 0;
                    const isExiting = offset === len - 1;

                    let transformClass = "translate-x-full";
                    if (isCurrent) {
                      transformClass = "translate-x-0";
                    } else if (isExiting) {
                      transformClass = "-translate-x-full";
                    }

                    return (
                      <div
                        key={cat.label}
                        className={`absolute inset-0 transform-gpu will-change-transform ${transformClass} ${
                          isCurrent
                            ? "z-10 opacity-100 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            : isExiting
                            ? "z-5 opacity-40 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            : "z-0 opacity-0 pointer-events-none duration-0"
                        } transition-all`}
                      >
                        <Image
                          src={cat.image}
                          alt={`${brand.name} ${cat.label}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={catIdx === 0}
                          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108 brightness-[1.05] group-hover:brightness-110 will-change-transform transform-gpu"
                        />
                      </div>
                    );
                  })
                ) : (
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={true}
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108 brightness-[1.05] group-hover:brightness-110 will-change-transform transform-gpu"
                  />
                )}

                {/* Top Status Badge & Category Text */}
                <div className="relative z-20 p-2.5 sm:p-3.5 flex items-start justify-between w-full pointer-events-none">
                  {brand.isLive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#B9965A]/95 sm:bg-[#059669] border border-[#DFCFA8]/80 sm:border-[#10B981]/80 text-white text-[7.5px] sm:text-[8.5px] font-extrabold tracking-widest uppercase shadow-md backdrop-blur-md whitespace-nowrap pointer-events-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE STORE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-black/70 border border-white/20 backdrop-blur-md text-stone-200 text-[7.5px] sm:text-[8px] font-bold tracking-widest uppercase shadow-xs whitespace-nowrap pointer-events-auto">
                      COMING SOON
                    </span>
                  )}

                  {/* Active Category Text on Top Right Corner */}
                  {brand.categories && brand.categories.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasDragged.current) return;
                        const cat = brand.categories?.[categoryIndices[idx] || 0];
                        if (brand.isLive) {
                          const targetUrl =
                            cat?.label === "JEANS"
                              ? "/stores/rbw?wash=raw"
                              : (cat?.href || brand.href);
                          router.push(targetUrl);
                        } else {
                          onOpenWaitlist(brand);
                        }
                      }}
                      className="pointer-events-auto inline-flex items-center px-2.5 py-1 rounded-full bg-black/70 hover:bg-black border border-white/20 hover:border-[#B9965A] backdrop-blur-md text-[#DFCFA8] hover:text-white text-[7.5px] sm:text-[8.5px] font-bold tracking-widest uppercase shadow-xs whitespace-nowrap transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                      title={brand.categories[categoryIndices[idx] || 0]?.label === "JEANS" ? "Shop Jeans (Select Your Fit)" : undefined}
                    >
                      {brand.categories[categoryIndices[idx] || 0]?.label}
                    </button>
                  )}
                </div>

                {/* Smooth Gradient Vignette */}
                <div className="absolute inset-0 z-15 bg-gradient-to-t from-black/95 via-black/35 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-85" />

                {/* Bottom Card Info */}
                <div className="relative z-20 flex flex-col items-center justify-end text-center p-3 sm:p-4 text-white select-none w-full transition-all duration-300">
                  <h3
                    className={`uppercase text-white drop-shadow-md tracking-wider ${brand.fontStyle}`}
                  >
                    {brand.name}
                  </h3>

                  <p className="mt-0.5 text-[8px] sm:text-[9.5px] tracking-[0.16em] font-bold text-[#DFCFA8] sm:text-stone-300 sm:group-hover:text-[#DFCFA8] max-w-[92%] leading-tight uppercase drop-shadow-xs transition-colors">
                    {brand.tagline}
                  </p>

                  <div className="w-6 h-[1.5px] bg-[#B9965A] my-2 transition-all duration-300 group-hover:w-14" />

                  {/* Category Selection Pills */}
                  {brand.categories && brand.categories.length > 0 && (
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 my-2 flex-wrap max-w-full px-1 z-30">
                      {brand.categories.map((c, cIdx) => {
                        const isCatActive = (categoryIndices[idx] || 0) === cIdx;
                        return (
                          <button
                            key={c.label}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (hasDragged.current) return;
                              if (brand.isLive) {
                                const targetUrl =
                                  c.label === "JEANS"
                                    ? "/stores/rbw?wash=raw"
                                    : (c.href || brand.href);
                                router.push(targetUrl);
                              } else {
                                onOpenWaitlist(brand);
                              }
                            }}
                            onMouseEnter={() => {
                              setCategoryIndices((prev) => {
                                const next = [...prev];
                                next[idx] = cIdx;
                                return next;
                              });
                            }}
                            className={`px-2 py-0.5 rounded-full text-[7px] sm:text-[8px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                              isCatActive
                                ? "bg-[#B9965A] text-black border border-[#DFCFA8] shadow-xs font-black scale-105"
                                : "bg-black/50 hover:bg-black/80 text-stone-300 hover:text-white border border-white/10 hover:border-white/30"
                            }`}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {brand.isLive ? (
                    (() => {
                      const activeCat = brand.categories?.[categoryIndices[idx] || 0];
                      const targetUrl =
                        activeCat?.label === "JEANS"
                          ? "/stores/rbw?wash=raw"
                          : (activeCat?.href || brand.href);

                      return (
                        <Link
                          href={targetUrl}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className={`inline-flex items-center justify-center gap-1.5 text-[8.5px] sm:text-[10.5px] tracking-[0.18em] font-black px-4 py-2 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300 uppercase hover:scale-105 cursor-pointer whitespace-nowrap shrink-0 ${
                            isActive
                              ? "bg-gradient-to-r from-[#D4B16A] via-[#B9965A] to-[#8C6B2F] text-black font-extrabold border border-[#DFCFA8]"
                              : "bg-white border border-stone-200 text-[#1C1917]"
                          }`}
                        >
                          <span>{brand.actionText}</span>
                          <ArrowRight className="w-3 h-3 text-current transition-transform duration-300 group-hover:translate-x-1.5 shrink-0" />
                        </Link>
                      );
                    })()
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasDragged.current) return;
                        onOpenWaitlist(brand);
                      }}
                      className="inline-flex items-center gap-1.5 text-[8px] sm:text-[9px] tracking-[0.16em] font-extrabold text-[#DFCFA8] bg-black/80 hover:bg-black hover:text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-md border border-[#B9965A]/40 hover:border-[#B9965A] shadow-md transition-all duration-300 uppercase cursor-pointer whitespace-nowrap shrink-0 hover:scale-105 active:scale-95 group/btn"
                    >
                      <Bell className="w-3 h-3 text-[#B9965A] animate-pulse group-hover/btn:rotate-12 transition-transform" />
                      <span>NOTIFY ME</span>
                    </button>
                  )}
                </div>
              </div>
            );

            const isVisibleSlot = !isMobile || Math.abs(slot) <= 1;

            return (
              <div
                key={brand.name}
                onClick={() => handleCardInteraction(brand, idx)}
                className={`absolute left-1/2 top-1/2 shrink-0 transform-gpu will-change-transform cursor-pointer ${
                  isVisibleSlot
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none hidden"
                }`}
                style={{
                  width: `${cardWidth}px`,
                  transform: `translate(calc(-50% + (${offset}px)), -50%)`,
                  display: isVisibleSlot ? "block" : "none",
                  transition: isWrapping
                    ? "opacity 500ms ease-in-out"
                    : "transform 650ms cubic-bezier(0.25, 1, 0.5, 1), opacity 500ms ease-in-out, border-color 300ms ease, box-shadow 300ms ease",
                  zIndex: isActive ? 30 : Math.abs(slot) === 1 ? 10 : 0,
                }}
              >
                {CardContent}
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => slide("left")}
          className="absolute -left-2 sm:-left-4 md:-left-6 lg:-left-7 xl:-left-8 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/95 dark:bg-stone-900/95 backdrop-blur-md hover:bg-white border border-stone-300 dark:border-stone-700 hover:border-[#B9965A] text-stone-800 dark:text-stone-200 transition-all duration-300 shadow-xl cursor-pointer group active:scale-95"
          aria-label="Previous Brand"
        >
          <ChevronLeft className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-stone-800 dark:text-stone-200 group-hover:text-[#B9965A] transition-colors" />
        </button>

        <button
          onClick={() => slide("right")}
          className="absolute -right-2 sm:-right-4 md:-right-6 lg:-right-7 xl:-right-8 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/95 dark:bg-stone-900/95 backdrop-blur-md hover:bg-white border border-stone-300 dark:border-stone-700 hover:border-[#B9965A] text-stone-800 dark:text-stone-200 transition-all duration-300 shadow-xl cursor-pointer group active:scale-95"
          aria-label="Next Brand"
        >
          <ChevronRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-stone-800 dark:text-stone-200 group-hover:text-[#B9965A] transition-colors" />
        </button>
      </div>

      {/* Pagination Dots (Mobile) */}
      <div className="flex sm:hidden items-center justify-center gap-2 mt-1 mb-1">
        {brands.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrevActiveIndex(activeIndex);
              setActiveIndex(idx);
            }}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              activeIndex === idx
                ? "w-2.5 h-2.5 bg-[#B9965A] scale-110 shadow-xs"
                : "w-2 h-2 bg-[#D6D3D1] hover:bg-stone-400"
            }`}
            aria-label={`Go to brand ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
