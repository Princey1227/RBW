"use client";

import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingBag, Eye } from "lucide-react";

export interface DenimCardHandle {
  getImageRect: () => DOMRect | null;
}

interface DenimCardProps {
  title: string;
  imageSrc: string;
  secondaryImageSrc?: string;
  imageAlt: string;
  onExplore?: () => void;
  sizes?: string[];
  onSelectSize?: (size: string) => void;
  onAddToCart?: (size: string) => void;
}

const DenimCard = forwardRef<DenimCardHandle, DenimCardProps>(
  (
    {
      title,
      imageSrc,
      secondaryImageSrc,
      imageAlt,
      onExplore,
      sizes = ["28", "30", "32", "34", "36"],
      onSelectSize,
      onAddToCart,
    },
    ref
  ) => {
    const imageRef = useRef<HTMLDivElement>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [addedSize, setAddedSize] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
      getImageRect: () => {
        if (!imageRef.current) return null;
        return imageRef.current.getBoundingClientRect();
      },
    }));

    let cardStyle: React.CSSProperties = {};
    let titleColorClass = "";
    let buttonStyleClass = "";

    // Normalize and match closest denim wash theme, default to RAW
    const normalizedTitle = title.toUpperCase();
    let themeKey = "RAW";
    
    if (normalizedTitle.includes("RAW")) themeKey = "RAW";
    else if (normalizedTitle.includes("BLACK")) themeKey = "BLACK";
    else if (normalizedTitle.includes("WHITE")) themeKey = "WHITE";
    else if (normalizedTitle.includes("INDIGO")) themeKey = "INDIGO";
    else if (normalizedTitle.includes("VINTAGE")) themeKey = "VINTAGE";
    else if (normalizedTitle.includes("ECRU")) themeKey = "ECRU";
    else if (normalizedTitle.includes("OLIVE")) themeKey = "OLIVE";
    else if (normalizedTitle.includes("CAMO")) themeKey = "CAMO";
    else if (normalizedTitle.includes("DESERT") || normalizedTitle.includes("SAND") || normalizedTitle.includes("KHAKI")) themeKey = "DESERT";

    switch (themeKey) {
      case "RAW":
      case "INDIGO":
        cardStyle = {
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.02) 1px, transparent 1px), repeating-linear-gradient(45deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2.5px, rgba(255,255,255,0.01) 2.5px, rgba(255,255,255,0.01) 5px), #0b1931",
          backgroundSize: "3px 3px,3px 3px,auto,auto",
          border: "none",
        };
        titleColorClass = "text-white";
        buttonStyleClass =
          "border-white/40 text-white hover:bg-white hover:text-black hover:border-white transition-colors duration-300 shadow-lg";
        break;

      case "BLACK":
      case "VINTAGE":
        cardStyle = {
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.015) 1px, transparent 1px), #ffffff",
          backgroundSize: "4px 4px",
          border: "none",
        };
        titleColorClass = "text-slate-900";
        buttonStyleClass =
          "border-slate-900/40 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors duration-300 shadow-lg";
        break;

      case "WHITE":
      case "ECRU":
        cardStyle = {
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.01) 1px, transparent 1px), #060709",
          backgroundSize: "4px 4px",
          border: "none",
        };
        titleColorClass = "text-white";
        buttonStyleClass =
          "border-white/40 text-white hover:bg-white hover:text-black hover:border-white transition-colors duration-300 shadow-lg";
        break;

      case "OLIVE":
        cardStyle = {
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.02) 1px, transparent 1px), repeating-linear-gradient(45deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2.5px, rgba(255,255,255,0.01) 2.5px, rgba(255,255,255,0.01) 5px), #1e2912",
          backgroundSize: "3px 3px,3px 3px,auto,auto",
          border: "none",
        };
        titleColorClass = "text-white";
        buttonStyleClass =
          "border-white/40 text-white hover:bg-white hover:text-black hover:border-white transition-colors duration-300 shadow-lg";
        break;

      case "CAMO":
        cardStyle = {
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.01) 1px, transparent 1px), #0d120a",
          backgroundSize: "4px 4px",
          border: "none",
        };
        titleColorClass = "text-white";
        buttonStyleClass =
          "border-white/40 text-white hover:bg-white hover:text-black hover:border-white transition-colors duration-300 shadow-lg";
        break;

      case "DESERT":
        cardStyle = {
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.015) 1px, transparent 1px), #ebdcb9",
          backgroundSize: "4px 4px",
          border: "none",
        };
        titleColorClass = "text-slate-900";
        buttonStyleClass =
          "border-slate-900/40 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors duration-300 shadow-lg";
        break;
    }

    // Determine secondary preview image (or fallback to subtle alternate angle/zoom)
    const effectiveSecondaryImage = secondaryImageSrc || imageSrc;
    const hasSecondaryView = Boolean(secondaryImageSrc);

    const handleSizeClick = (sz: string) => {
      setSelectedSize(sz);
      setAddedSize(sz);
      if (onSelectSize) onSelectSize(sz);
      if (onAddToCart) onAddToCart(sz);

      setTimeout(() => {
        setAddedSize(null);
      }, 2000);
    };

    return (
      <>
        {/* Desktop Card (hidden on mobile, visible on tablet/desktop md+) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{
            y: -10,
            boxShadow: "0 35px 70px rgba(0,0,0,0.55)",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onExplore}
          style={cardStyle}
          className="
            hidden
            md:flex
            group
            relative
            overflow-hidden
            p-5
            sm:p-7
            flex-col
            justify-between
            items-center
            rounded-[26px]
            transition-all
            duration-300
            w-full
            max-w-[380px]
            md:max-w-[240px]
            lg:max-w-[300px]
            xl:max-w-[350px]
            2xl:max-w-[400px]
            h-[540px]
            md:h-[410px]
            lg:h-[450px]
            xl:h-[510px]
            2xl:h-[580px]
            cursor-pointer
          "
        >
          {/* Stitch Border */}
          <div
            className="
              absolute
              inset-3.5
              rounded-[20px]
              border-dashed
              border-[1.5px]
              border-[#d67b2a]
              pointer-events-none
              opacity-65
              group-hover:opacity-100
              transition-opacity
              duration-300
              z-10
            "
            style={{
              strokeDasharray: "7 5",
            }}
          />

          {/* Top Header & Wash Tag */}
          <div className="flex flex-col items-center z-20 mt-2 w-full">
            <div className="flex items-center justify-between w-full px-2 mb-1">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-500/90 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                {themeKey} WASH
              </span>
              <span className="text-[10px] font-medium tracking-[0.18em] uppercase opacity-65 text-current">
                PREMIUM SELVEDGE
              </span>
            </div>

            <h2
              className={`text-4xl md:text-2xl lg:text-3xl xl:text-5xl font-black tracking-tighter text-center select-none ${titleColorClass}`}
              style={{
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {title}
            </h2>
          </div>

          {/* Image Container with Dual-Image Preview */}
          <div
            ref={imageRef}
            className="
              relative
              w-full
              flex-1
              my-3
              flex
              items-center
              justify-center
              z-20
              overflow-hidden
              rounded-xl
            "
          >
            {/* Primary Image */}
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="(max-width:768px) 100vw, 400px"
              className={`
                object-contain
                drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)]
                group-hover:drop-shadow-[0_24px_40px_rgba(0,0,0,0.7)]
                transition-all
                duration-700
                ease-in-out
                ${hasSecondaryView ? "group-hover:opacity-0 group-hover:scale-95" : "group-hover:scale-105"}
              `}
            />

            {/* Secondary Image Preview (Back / Detail Angle) */}
            {hasSecondaryView && (
              <Image
                src={effectiveSecondaryImage}
                alt={`${imageAlt} - Alternate View`}
                fill
                sizes="(max-width:768px) 100vw, 400px"
                className="
                  object-contain
                  drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)]
                  group-hover:drop-shadow-[0_24px_40px_rgba(0,0,0,0.7)]
                  opacity-0
                  group-hover:opacity-100
                  transition-all
                  duration-700
                  ease-in-out
                  scale-95
                  group-hover:scale-105
                "
              />
            )}

            {/* View Angle Pill Badge */}
            {hasSecondaryView && (
              <div className="absolute top-2 left-2 z-30 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[9px] font-extrabold tracking-widest text-white uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                FRONT VIEW
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="relative z-30 w-full flex flex-col items-center gap-2 mt-auto">
            {/* Action CTA */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onExplore) {
                  onExplore();
                }
              }}
              className={`relative z-20 w-full py-2.5 border text-xs font-extrabold tracking-[0.15em] uppercase flex items-center justify-center gap-2 rounded-xl transition-all duration-300 ${buttonStyleClass}`}
              style={{
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              EXPLORE DENIM
              <span className="text-sm">→</span>
            </button>
          </div>
        </motion.div>

        {/* Mobile Card Layout (visible on mobile, hidden on tablet/desktop md+) */}
        <div
          onClick={onExplore}
          className="flex md:hidden flex-col w-full gap-2 text-left group relative cursor-pointer"
        >
          {/* Themed Card Frame with Aspect Ratio */}
          <div
            style={cardStyle}
            className="
              relative
              w-full
              aspect-[3/4]
              rounded-[22px]
              overflow-hidden
              p-3.5
              flex
              flex-col
              justify-between
              items-center
              transition-all
              duration-300
            "
          >
            {/* Inner Stitching Border */}
            <div
              className="
                absolute
                inset-2.5
                rounded-[16px]
                border-dashed
                border-[1px]
                border-[#d67b2a]
                pointer-events-none
                opacity-60
              "
              style={{
                strokeDasharray: "5 4",
              }}
            />

            {/* Title Inside Card */}
            <div className="flex flex-col items-center z-20 mt-1.5 select-none">
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-amber-500/90 mb-0.5">
                {themeKey}
              </span>
              <h2
                className={`text-xl sm:text-2xl font-extrabold tracking-tighter text-center uppercase ${titleColorClass}`}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {title}
              </h2>
            </div>

            {/* Image Container with Dual Image */}
            <div className="relative w-full flex-1 my-1 flex items-center justify-center z-20">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority
                sizes="(max-width: 768px) 50vw, 400px"
                className={`
                  object-contain
                  p-2
                  transition-all
                  duration-500
                  ${hasSecondaryView ? "group-active:opacity-0" : "group-hover:scale-[1.03]"}
                `}
              />
              {hasSecondaryView && (
                <Image
                  src={effectiveSecondaryImage}
                  alt={`${imageAlt} - Mobile Alternate View`}
                  fill
                  sizes="(max-width: 768px) 50vw, 400px"
                  className="
                    object-contain
                    p-2
                    opacity-0
                    group-active:opacity-100
                    transition-opacity
                    duration-300
                  "
                />
              )}
            </div>
          </div>

          {/* Explore Button below Card */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onExplore) {
                onExplore();
              }
            }}
            className="
              w-full
              py-2.5
              border
              border-foreground/30
              text-foreground
              bg-transparent
              text-[11px]
              uppercase
              font-bold
              tracking-widest
              transition-all
              duration-300
              flex
              items-center
              justify-center
              gap-1.5
              rounded-xl
              hover:bg-foreground/10
            "
            style={{
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            EXPLORE FITS →
          </button>
        </div>
      </>
    );
  }
);

DenimCard.displayName = "DenimCard";

export default DenimCard;

