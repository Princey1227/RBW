"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../app/theme-provider";
import { usePathname } from "next/navigation";

// Configuration types
type MetalType = "brassGold" | "silver" | "roseGold" | "rawCopper" | "copperGold";
type FabricType = "rawIndigo" | "charcoalBlack" | "minimalMatte";
type StitchType = "copper" | "yellow" | "blackout";

interface MetalThemeConfig {
  name: string;
  highlightColor: string;
  stops: { offset: string; color: string }[];
  lightStops?: { offset: string; color: string }[];
}

const METAL_THEMES: Record<MetalType, MetalThemeConfig> = {
  brassGold: {
    name: "Brass Gold",
    highlightColor: "#fef08a",
    stops: [
      { offset: "0%", color: "#fef08a" },
      { offset: "35%", color: "#eab308" },
      { offset: "65%", color: "#ca8a04" },
      { offset: "100%", color: "#854d0e" },
    ]
  },
  silver: {
    name: "Silver / Chrome",
    highlightColor: "#ffffff",
    stops: [
      { offset: "0%", color: "#f8fafc" },
      { offset: "25%", color: "#cbd5e1" },
      { offset: "50%", color: "#94a3b8" },
      { offset: "75%", color: "#475569" },
      { offset: "100%", color: "#1e293b" },
    ]
  },
  roseGold: {
    name: "Rose Gold",
    highlightColor: "#fbcfe8",
    stops: [
      { offset: "0%", color: "#fbcfe8" },
      { offset: "35%", color: "#f472b6" },
      { offset: "65%", color: "#db2777" },
      { offset: "100%", color: "#881337" },
    ]
  },
  rawCopper: {
    name: "Raw Copper",
    highlightColor: "#ffedd5",
    stops: [
      { offset: "0%", color: "#ffedd5" },
      { offset: "35%", color: "#f97316" },
      { offset: "65%", color: "#ea580c" },
      { offset: "100%", color: "#7c2d12" },
    ]
  },
  copperGold: {
    name: "Copper Gold",
    highlightColor: "#ffe3a8",
    stops: [
      { offset: "0%", color: "#ffe3a8" },
      { offset: "35%", color: "#ff9d43" },
      { offset: "65%", color: "#d97706" },
      { offset: "100%", color: "#7c2d12" },
    ]
  }
};

const FABRIC_THEMES = {
  rawIndigo: {
    name: "Raw Indigo",
    bg: "#06080c",
    pageBgClass: "bg-denim-luxury"
  },
  charcoalBlack: {
    name: "Charcoal Black",
    bg: "#18181b",
    pageBgClass: "bg-charcoal-denim"
  },
  minimalMatte: {
    name: "Minimal Matte",
    bg: "#000000",
    pageBgClass: "bg-matte-black"
  }
};

const STITCH_THEMES = {
  copper: {
    name: "Copper Stitch",
    stops: [
      { offset: "0%", color: "#b45309" },
      { offset: "50%", color: "#d97706" },
      { offset: "100%", color: "#b45309" },
    ]
  },
  yellow: {
    name: "Yellow Stitch",
    stops: [
      { offset: "0%", color: "#fef08a" },
      { offset: "50%", color: "#eab308" },
      { offset: "100%", color: "#fef08a" },
    ]
  },
  blackout: {
    name: "Blackout Stitch",
    stops: [
      { offset: "0%", color: "#1e293b" },
      { offset: "50%", color: "#0f172a" },
      { offset: "100%", color: "#1e293b" },
    ]
  }
};

export default function ZipperScrollbar() {
  const { theme } = useTheme();
  const pathname = usePathname();

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Customizer Configuration State (Finalized Defaults)
  const [metal] = useState<MetalType>("rawCopper");
  const [fabric] = useState<FabricType>("rawIndigo");
  const [stitch] = useState<StitchType>("copper");
  const [width] = useState<20 | 24 | 32>(32);
  const [density] = useState<10 | 16>(10);

  // Raw scroll progress and track height states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [trackHeight, setTrackHeight] = useState(800);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isPastHero, setIsPastHero] = useState(false);

  // Update overall page background class when fabric theme or page route changes,
  // and dynamically set background CSS variables on html root to keep everything (header, main, footer) in sync
  useEffect(() => {
    if (!pathname || !pathname.startsWith("/stores/rbw") || pathname === "/stores/rbw" || pathname === "/stores/rbw/") return;

    const mainEl = document.querySelector("main");
    if (mainEl) {
      // Remove all background classes
      mainEl.classList.remove("bg-denim-luxury", "bg-charcoal-denim", "bg-matte-black");
      // Add the active theme class
      mainEl.classList.add(FABRIC_THEMES[fabric].pageBgClass);
    }

    const isLight = theme === "light";
    let activeBg = "#06080c"; // default rawIndigo dark

    if (isLight) {
      if (fabric === "rawIndigo") activeBg = "#f5f6f9";
      else if (fabric === "charcoalBlack") activeBg = "#e5e7eb";
      else if (fabric === "minimalMatte") activeBg = "#ffffff";
    } else {
      if (fabric === "rawIndigo") activeBg = "#06080c";
      else if (fabric === "charcoalBlack") activeBg = "#0d0f14";
      else if (fabric === "minimalMatte") activeBg = "#111111";
    }

    // Set variable on html root to change all bg-background components dynamically
    document.documentElement.style.setProperty("--background", activeBg);
    document.documentElement.style.setProperty("--page-bg", activeBg);

    // Keep vignette-end aligned (rgb conversion)
    let r = 6, g = 8, b = 12;
    if (activeBg === "#06080c") { r = 6; g = 8; b = 12; }
    else if (activeBg === "#0d0f14") { r = 13; g = 15; b = 20; }
    else if (activeBg === "#111111") { r = 17; g = 17; b = 17; }
    else if (activeBg === "#f5f6f9") { r = 245; g = 246; b = 249; }
    else if (activeBg === "#e5e7eb") { r = 229; g = 231; b = 235; }
    else if (activeBg === "#ffffff") { r = 255; g = 255; b = 255; }
    document.documentElement.style.setProperty("--vignette-end", `rgba(${r}, ${g}, ${b}, 0.98)`);
  }, [fabric, pathname, theme]);

  // Scroll and dimensions listener
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!pathname || !pathname.startsWith("/stores/rbw") || pathname === "/stores/rbw" || pathname === "/stores/rbw/") return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setTrackHeight(containerRef.current.getBoundingClientRect().height);
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 50);

      // Hero section takes full window height (minus header offset of 103px)
      const heroThreshold = window.innerHeight - 103;
      setIsPastHero(currentScrollY >= heroThreshold);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollProgress(0);
      } else {
        setScrollProgress(currentScrollY / docHeight);
      }
    };

    updateDimensions();
    handleScroll();

    window.addEventListener("resize", updateDimensions);
    window.addEventListener("scroll", handleScroll);

    // Track height updates when layout changes dynamically
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", handleScroll);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [pathname]);

  // Custom silky-smooth LERP easing for scroll transitions
  const [smoothProgress, setSmoothProgress] = useState(0);
  useEffect(() => {
    if (!pathname || !pathname.startsWith("/stores/rbw") || pathname === "/stores/rbw" || pathname === "/stores/rbw/") return;

    let frameId: number;
    const step = () => {
      setSmoothProgress((prev) => {
        const diff = scrollProgress - prev;
        if (Math.abs(diff) < 0.0001) return scrollProgress;
        // 0.12 coefficient gives a premium, controlled glide
        return prev + diff * 0.12;
      });
      frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [scrollProgress, pathname]);

  // Only render zipper scrollbar UI for scrollable RBW pages (/stores/rbw/jackets, /stores/rbw/shorts), NOT for 3D showroom or main ONLY DENIMS pages
  if (!pathname || !pathname.startsWith("/stores/rbw") || pathname === "/stores/rbw" || pathname === "/stores/rbw/") {
    return null;
  }

  // Use instant response when dragging, smooth ease when scrolling
  const activeProgress = isDragging ? scrollProgress : smoothProgress;

  // Dynamic pixel dimensions for patterns and elements
  const usableHeight = trackHeight - 28;
  const currentPullerY = activeProgress * usableHeight + 2;
  const limitTeethHeight = trackHeight - density * 2;
  const currentUnzippedHeight = activeProgress * limitTeethHeight;
  const currentZippedY = currentUnzippedHeight;
  const currentZippedHeight = trackHeight - currentZippedY;

  // Calculate coordinates based on the selected width parameter
  const midX = width / 2;
  const leftTapeWidth = midX - 4;
  const rightTapeWidth = midX - 4;
  const leftTapeX = 1;
  const rightTapeX = midX + 3;
  const zippedTapeWidth = width - 8;
  const zippedTapeX = 4;

  // Scale calculations for SVG teeth patterns
  const zippedScaleX = zippedTapeWidth / 12;
  const leftScaleX = leftTapeWidth / 6;
  const rightScaleX = rightTapeWidth / 6;
  const scaleY = density / 10;

  // Teeth path coordinates optimized for density
  const teethPaths = density === 10 ? {
    weave1: 2,
    weave2: 7,
    leftTooth: "M 2 1.5 L 6.5 1.5 C 7.5 1.5, 7.5 4.5, 6.5 4.5 L 2 4.5 Z",
    leftHighlight: "M 2.5 2 L 6 2",
    rightTooth: "M 10 6.5 L 5.5 6.5 C 4.5 6.5, 4.5 9.5, 5.5 9.5 L 10 9.5 Z",
    rightHighlight: "M 9.5 7 L 6 7",
    leftSplit1: "M 2 1.5 L 5.5 1.5 C 6 1.5, 6 4.5, 5.5 4.5 L 2 4.5 Z",
    leftSplit2: "M 2 6.5 L 5.5 6.5 C 6 6.5, 6 9.5, 5.5 9.5 L 2 9.5 Z",
    rightSplit1: "M 4 1.5 L 0.5 1.5 C 0 1.5, 0 4.5, 0.5 4.5 L 4 4.5 Z",
    rightSplit2: "M 4 6.5 L 0.5 6.5 C 0 6.5, 0 9.5, 0.5 9.5 L 4 9.5 Z"
  } : {
    weave1: 3,
    weave2: 11,
    leftTooth: "M 1.5 2 L 7.5 2 C 8.8 2, 8.8 7, 7.5 7 L 1.5 7 Z",
    leftHighlight: "M 2 2.8 L 7 2.8",
    rightTooth: "M 10.5 10 L 4.5 10 C 3.2 10, 3.2 15, 4.5 15 L 10.5 15 Z",
    rightHighlight: "M 10 10.8 L 5 10.8",
    leftSplit1: "M 1.5 2 L 6.5 2 C 7.2 2, 7.2 7, 6.5 7 L 1.5 7 Z",
    leftSplit2: "M 1.5 10 L 6.5 10 C 7.2 10, 7.2 15, 6.5 15 L 1.5 15 Z",
    rightSplit1: "M 4.5 2 L 0.5 2 C 0 2, 0 7, 0.5 7 L 4.5 7 Z",
    rightSplit2: "M 4.5 10 L 0.5 10 C 0 10, 0 15, 0.5 15 L 4.5 15 Z"
  };

  // Set page scroll position based on drag coordinates
  const updateScroll = (clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;

    // Center cursor on the puller
    const usableHt = rect.height - 28;
    const clampedY = Math.max(0, Math.min(usableHt, relativeY - 13));
    const percent = clampedY / usableHt;

    window.scrollTo({
      top: percent * (document.documentElement.scrollHeight - window.innerHeight),
      behavior: "auto"
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateScroll(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateScroll(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const isDarkRender = theme === "dark";

  return (
    <>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex fixed right-0 z-[150] cursor-pointer flex-col items-center select-none touch-none transition-all duration-300 ${isDarkRender
            ? "border-l border-white/5 shadow-[-4px_0_12px_rgba(0,0,0,0.55)]"
            : "border-0 shadow-none"
          } ${isScrolled
            ? "top-[52px] h-[calc(100vh-52px)]"
            : "top-[103px] h-[calc(100vh-103px)]"
          }`}
        style={{
          width: `${width}px`,
          backgroundColor: "var(--color-zip-bg)",
          "--color-zip-bg": isDarkRender
            ? (fabric === "rawIndigo" ? "#101726" : fabric === "charcoalBlack" ? "#1e1e24" : "#121214")
            : "#ffffff",
          "--color-zip-weave": isDarkRender
            ? "#1a263d"
            : "#e2e8f0"
        } as React.CSSProperties}
        aria-label="Denim Zipper Scrollbar"
      >
        {/* SVG Canvas for Track Patterns */}
        <svg width={width} className="absolute inset-y-0 top-0 bottom-0 h-full pointer-events-none">
          <defs>
            {/* Drop shadow filter to make metal teeth look 3D */}
            <filter id="teethShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="0.4" floodColor="#000000" floodOpacity={isDarkRender ? 0.8 : 0.5} />
            </filter>

            {/* Dynamic Metal Option Gradient */}
            <linearGradient id={`selectedMetal-${metal}`} x1="0" y1="0" x2="0" y2="1">
              {((!isDarkRender && METAL_THEMES[metal]?.lightStops
                ? METAL_THEMES[metal]?.lightStops
                : METAL_THEMES[metal]?.stops) || []
              ).map((stop, i) => (
                <stop key={i} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>

            {/* Dynamic Metal Puller Gradient (combines sideways reflection) */}
            <linearGradient id={`selectedPuller-${metal}`} x1="0" y1="0" x2="1" y2="1">
              {((!isDarkRender && METAL_THEMES[metal]?.lightStops
                ? METAL_THEMES[metal]?.lightStops
                : METAL_THEMES[metal]?.stops) || []
              ).map((stop, i) => (
                <stop key={i} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>

            {/* Dynamic Stitching Gradient */}
            <linearGradient id={`selectedStitch-${stitch}`} x1="0" y1="0" x2="1" y2="0">
              {STITCH_THEMES[stitch].stops.map((stop, i) => (
                <stop key={i} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>

            {/* Zipped Closed Teeth Pattern */}
            <pattern
              id={`zippedTeeth-${density}-${width}-${stitch}-${metal}`}
              width="12"
              height={density}
              patternUnits="userSpaceOnUse"
              patternTransform={`scale(${zippedScaleX}, 1)`}
            >
              {/* Blends with denim background using active fabric theme */}
              <rect x="0" y="0" width="12" height={density} fill="var(--color-zip-bg)" />
              {/* Fine fabric weave lines */}
              <line x1="0" y1={teethPaths.weave1} x2="12" y2={teethPaths.weave1} stroke="var(--color-zip-weave)" strokeWidth="0.4" />
              <line x1="0" y1={teethPaths.weave2} x2="12" y2={teethPaths.weave2} stroke="var(--color-zip-weave)" strokeWidth="0.4" />

              {/* Outer stitching on left */}
              <line x1="0.5" y1="0" x2="0.5" y2={density} stroke={`url(#selectedStitch-${stitch})`} strokeWidth="0.5" strokeDasharray="2 1" />
              <line x1="1.5" y1="0" x2="1.5" y2={density} stroke={`url(#selectedStitch-${stitch})`} strokeWidth="0.3" />

              {/* Outer stitching on right */}
              <line x1="10.5" y1="0" x2="10.5" y2={density} stroke={`url(#selectedStitch-${stitch})`} strokeWidth="0.3" />
              <line x1="11.5" y1="0" x2="11.5" y2={density} stroke={`url(#selectedStitch-${stitch})`} strokeWidth="0.5" strokeDasharray="2 1" />

              {/* Center crease shadow */}
              <rect x="5.5" y="0" width="1" height={density} fill="#000000" opacity={isDarkRender ? 0.45 : 0.22} />

              {/* Alternating interlocking metal teeth */}
              <g filter="url(#teethShadow)">
                {/* Left Tooth */}
                <path d={teethPaths.leftTooth} fill={`url(#selectedMetal-${metal})`} stroke={isDarkRender ? "none" : "#7c2d12"} strokeWidth="0.2" />
                <path d={teethPaths.leftHighlight} stroke={METAL_THEMES[metal].highlightColor} strokeWidth="0.4" opacity="0.8" />
              </g>

              <g filter="url(#teethShadow)">
                {/* Right Tooth */}
                <path d={teethPaths.rightTooth} fill={`url(#selectedMetal-${metal})`} stroke={isDarkRender ? "none" : "#7c2d12"} strokeWidth="0.2" />
                <path d={teethPaths.rightHighlight} stroke={METAL_THEMES[metal].highlightColor} strokeWidth="0.4" opacity="0.8" />
              </g>
            </pattern>

            {/* Left Split Pattern */}
            <pattern
              id={`leftTeeth-${density}-${width}-${stitch}-${metal}`}
              width="6"
              height={density}
              patternUnits="userSpaceOnUse"
              patternTransform={`scale(${leftScaleX}, 1)`}
            >
              <rect x="0" y="0" width="6" height={density} fill="var(--color-zip-bg)" />
              <line x1="0" y1={teethPaths.weave1} x2="6" y2={teethPaths.weave1} stroke="var(--color-zip-weave)" strokeWidth="0.4" />
              <line x1="0" y1={teethPaths.weave2} x2="6" y2={teethPaths.weave2} stroke="var(--color-zip-weave)" strokeWidth="0.4" />

              {/* Stitch left edge */}
              <line x1="0.5" y1="0" x2="0.5" y2={density} stroke={`url(#selectedStitch-${stitch})`} strokeWidth="0.5" strokeDasharray="2 1" />
              <line x1="1.5" y1="0" x2="1.5" y2={density} stroke={`url(#selectedStitch-${stitch})`} strokeWidth="0.3" />

              {/* Teeth pointing right */}
              <g filter="url(#teethShadow)">
                <path d={teethPaths.leftSplit1} fill={`url(#selectedMetal-${metal})`} stroke={isDarkRender ? "none" : "#7c2d12"} strokeWidth="0.2" />
                <path d={teethPaths.leftSplit2} fill={`url(#selectedMetal-${metal})`} stroke={isDarkRender ? "none" : "#7c2d12"} strokeWidth="0.2" />
              </g>
            </pattern>

            {/* Right Split Pattern */}
            <pattern
              id={`rightTeeth-${density}-${width}-${stitch}-${metal}`}
              width="6"
              height={density}
              patternUnits="userSpaceOnUse"
              patternTransform={`scale(${rightScaleX}, 1)`}
            >
              <rect x="0" y="0" width="6" height={density} fill="var(--color-zip-bg)" />
              <line x1="0" y1={teethPaths.weave1} x2="6" y2={teethPaths.weave1} stroke="var(--color-zip-weave)" strokeWidth="0.4" />
              <line x1="0" y1={teethPaths.weave2} x2="6" y2={teethPaths.weave2} stroke="var(--color-zip-weave)" strokeWidth="0.4" />

              {/* Stitch right edge */}
              <line x1="4.5" y1="0" x2="4.5" y2={density} stroke={`url(#selectedStitch-${stitch})`} strokeWidth="0.3" />
              <line x1="5.5" y1="0" x2="5.5" y2={density} stroke={`url(#selectedStitch-${stitch})`} strokeWidth="0.5" strokeDasharray="2 1" />

              {/* Teeth pointing left */}
              <g filter="url(#teethShadow)">
                <path d={teethPaths.rightSplit1} fill={`url(#selectedMetal-${metal})`} stroke={isDarkRender ? "none" : "#7c2d12"} strokeWidth="0.2" />
                <path d={teethPaths.rightSplit2} fill={`url(#selectedMetal-${metal})`} stroke={isDarkRender ? "none" : "#7c2d12"} strokeWidth="0.2" />
              </g>
            </pattern>
          </defs>

          {/* Vertical seam stitching line on the left border */}
          <line x1="0" y1="0" x2="0" y2="100%" stroke={`url(#selectedStitch-${stitch})`} strokeWidth="1" />

          {/* UNZIPPED REGION (Above current progress) */}
          {/* Left unzipped tape */}
          <motion.rect
            x={leftTapeX}
            y="0"
            width={leftTapeWidth}
            fill={`url(#leftTeeth-${density}-${width}-${stitch}-${metal})`}
            className="transition-opacity duration-300"
            style={{ opacity: isHovered || isDragging ? 1 : 0.8 }}
            height={currentUnzippedHeight}
          />
          {/* Right unzipped tape */}
          <motion.rect
            x={rightTapeX}
            y="0"
            width={rightTapeWidth}
            fill={`url(#rightTeeth-${density}-${width}-${stitch}-${metal})`}
            className="transition-opacity duration-300"
            style={{ opacity: isHovered || isDragging ? 1 : 0.8 }}
            height={currentUnzippedHeight}
          />

          {/* ZIPPED REGION (Below current progress) */}
          <motion.rect
            x={zippedTapeX}
            width={zippedTapeWidth}
            fill={`url(#zippedTeeth-${density}-${width}-${stitch}-${metal})`}
            className="transition-opacity duration-300"
            style={{ opacity: isHovered || isDragging ? 1 : 0.8 }}
            y={currentZippedY}
            height={currentZippedHeight}
          />
        </svg>

        {/* Zipper Pull Head Slider (YKK Denim Style Tab) */}
        <motion.div
          className="absolute z-10 pointer-events-none"
          style={{
            top: `${currentPullerY}px`,
            left: `calc(50% - 8px)`
          }}
        >
          <svg
            width="16"
            height="26"
            viewBox="0 0 16 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`drop-shadow-[0_2px_5px_rgba(0,0,0,0.85)] transition-transform duration-200 ${isHovered || isDragging ? "scale-105" : "scale-100"
              }`}
          >
            {/* Slider body (tapered YKK style) */}
            <path d="M2 1 L14 1 C15 1, 15 3, 14 5 L10 10 L6 10 L2 5 C1 3, 1 1, 2 1 Z" fill={`url(#selectedPuller-${metal})`} stroke="#1e293b" strokeWidth="0.4" />

            {/* Hanging Pull Tab */}
            <g transform="translate(0, 2)">
              {/* Premium tab contour */}
              <path d="M5 10 C5 9, 11 9, 11 10 L10 24 C10 25.5, 6 25.5, 6 24 Z" fill={`url(#selectedPuller-${metal})`} stroke="#0f172a" strokeWidth="0.4" />
              {/* Detailed grab slot cutout */}
              <rect x="7.5" y="12" width="1" height="6" rx="0.5" fill="#020611" />
            </g>
          </svg>
        </motion.div>
      </div>
    </>
  );
}
