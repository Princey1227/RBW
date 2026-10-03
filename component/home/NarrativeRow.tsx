"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "../../app/theme-provider";

export const washList = [
  {
    key: "raw",
    num: "01",
    title: "RAW INDIGO",
    motto: "Unaltered. Rigid. Chronological.",
    desc: "Sourced from the legendary mills of Mumbai, India. Spun on vintage shuttle looms and left completely untouched by water. Over time, the stiff 14.5 oz selvedge conforms uniquely to your body, molding a personal archive of creases, folds, and natural high-contrast fades.",
    weight: "14.5 oz (Heavyweight)",
    weave: "Selvedge",
    origin: "Mumbai, India",
    code: "DNM-RAW-145",
    image: "/raw_wash_banner.png",
    link: "/shop?wash=raw",
  },
  {
    key: "black",
    num: "02",
    title: "CARBON BLACK",
    motto: "Architectural. Saturated. Deep.",
    desc: "Double-dyed using sulfur black pigments for deep, long-lasting saturation. Engineered to retain its clean, stark silhouette without premature fading. A structured 13.0 oz twill designed as a versatile foundation for the modern uniform.",
    weight: "13.0 oz (Midweight)",
    weave: "Right Hand Twill",
    origin: "Mumbai, India",
    code: "DNM-BLK-130",
    image: "/black_wash_banner.png",
    link: "/shop?wash=black",
  },
  {
    key: "white",
    num: "03",
    title: "ALABASTER WHITE",
    motto: "Undyed. Minimalist. Raw.",
    desc: "Crafted from unbleached natural cotton canvas with tiny, organic seed flecks left intact. This light-mid 11.5 oz denim foregoes chemical bleach, celebrating the authentic warm-white texture of the raw cotton fibers.",
    weight: "11.5 oz (Lightweight)",
    weave: "Left Hand Twill",
    origin: "Mumbai, India",
    code: "DNM-WHT-115",
    image: "/white_wash_banner.png",
    link: "/shop?wash=white",
  },
];

interface NarrativeRowProps {
  wash: typeof washList[0];
  index: number;
}

export default function NarrativeRow({ wash, index }: NarrativeRowProps) {
  const { theme } = useTheme();
  const headingColorClass = "text-foreground";
  const bodyTextColorClass = "text-text-secondary";

  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-45, 45]);
  const isEven = index % 2 === 0;

  let imageColSpan = "lg:col-span-7";
  let textColSpan = "lg:col-span-5";
  let aspectClass = "aspect-[16/10]";

  if (index === 1) { // BLACK
    imageColSpan = "lg:col-span-6";
    textColSpan = "lg:col-span-5 lg:col-start-8";
    aspectClass = "aspect-[16/11]";
  } else if (index === 2) { // WHITE
    imageColSpan = "lg:col-span-8";
    textColSpan = "lg:col-span-4";
    aspectClass = "aspect-[16/8.5]";
  }

  return (
    <div
      ref={rowRef}
      className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center relative group min-h-[400px]"
    >
      {/* Big background number for styling */}
      <div
        className={`absolute -top-32 hidden lg:block text-[240px] font-serif italic font-extralight text-foreground/[0.03] select-none pointer-events-none transition-all duration-700 ease-out group-hover:scale-105 ${isEven ? "right-12" : "left-12"
          }`}
      >
        {wash.num}
      </div>

      {/* Text Block */}
      <div className={`${textColSpan} flex flex-col items-start space-y-6 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-black tracking-[0.18em] text-accent-gold uppercase block">
            {wash.motto}
          </span>
          <h3 className={`text-3xl sm:text-4xl font-serif font-black tracking-[0.08em] uppercase ${headingColorClass}`}>
            {wash.title}
          </h3>
        </div>

        <p className={`text-[15px] md:text-[16px] leading-[1.7] font-sans font-normal tracking-wide max-w-md ${bodyTextColorClass}`}>
          {wash.desc}
        </p>

        {/* Technical Specs callout row */}
        <div className={`flex flex-wrap gap-x-5 gap-y-2 font-mono font-normal text-[11px] tracking-[0.5px] uppercase select-none ${bodyTextColorClass}`}>
          <span>{`[ ORIGIN: ${wash.origin.toUpperCase()} ]`}</span>
          <span>{`[ WEIGHT: ${wash.weight.split(" ")[0]} ]`}</span>
          <span>{`[ CODE: ${wash.code} ]`}</span>
        </div>

        <div className="select-none pt-2">
          <Link
            href={wash.link}
            prefetch={false}
            className="px-6 py-3 bg-transparent border border-accent-gold text-accent-gold hover:bg-accent-gold-hover hover:text-[#FFFFFF] font-sans font-semibold text-[12px] tracking-[2px] uppercase transition-all duration-500 rounded-none cursor-pointer inline-flex items-center gap-2 group/btn"
          >
            SHOP {wash.key.toUpperCase()}
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Image Showcase Block */}
      <div
        className={`${imageColSpan} relative overflow-hidden ${aspectClass} bg-transparent border-0 rounded-none ${isEven ? "lg:order-2" : "lg:order-1"
          } group/img cursor-pointer`}
      >
        <motion.div style={{ y }} className="w-full h-[120%] absolute -top-[10%] left-0 right-0 bottom-0 will-change-transform transform-gpu">
          <img
            src={wash.image}
            alt={`${wash.title} Texture Detail`}
            className="w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform transform-gpu group-hover/img:scale-[1.03] shadow-sm"
          />
          <div className="animate-shine" />
          <div className="absolute inset-0 bg-neutral-950/5 pointer-events-none" />
        </motion.div>
      </div>
    </div>
  );
}
