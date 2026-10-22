"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function BrandHeader() {
  return (
    <section className="relative z-10 w-full max-w-[1200px] mx-auto text-center pt-2 sm:pt-3 lg:pt-4 pb-1 shrink-0 flex flex-col items-center justify-center select-none">
      {/* Luxury Pill Badge */}
      <div className="inline-flex items-center justify-center gap-1.5 bg-[#DFCFA8] border border-[#D0C097] px-3.5 sm:px-4 py-1 rounded-full mb-1.5 sm:mb-2 shadow-xs select-none">
        <Sparkles className="w-2.5 h-2.5 text-[#8C6B2F]" />
        <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] font-black tracking-[0.24em] text-[#2F2A1E] uppercase">
          ONLINE MBO • MULTI-BRAND OUTLET
        </span>
        <Sparkles className="w-2.5 h-2.5 text-[#8C6B2F]" />
      </div>

      {/* Main Headline */}
      <h1
        style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        className="mt-0 text-[20px] xs:text-[23px] sm:text-3xl md:text-4xl lg:text-[44px] xl:text-[48px] leading-tight sm:leading-none font-bold tracking-[0.03em] uppercase select-none px-3 mx-auto text-center w-full max-w-full flex flex-col sm:flex-row items-center justify-center sm:gap-3"
      >
        <span className="text-[#0D0B0A] whitespace-nowrap">
          EXPLORE OUR
        </span>
        <span className="text-[#B9965A] sm:text-[#0D0B0A] tracking-wider mt-0.5 sm:mt-0 whitespace-nowrap">
          BRAND STORES
        </span>
      </h1>

      {/* Gold Flourish Divider */}
      <div className="flex items-center justify-center gap-2.5 my-1 sm:my-1.5 w-full max-w-[160px] sm:max-w-[200px] mx-auto">
        <div className="h-[1px] flex-1 bg-[#D9CBAD]" />
        <span className="text-[#B9965A] text-[9px] select-none">❖</span>
        <div className="h-[1px] flex-1 bg-[#D9CBAD]" />
      </div>

      {/* Subtitle */}
      <p className="text-[10px] sm:text-xs text-[#57534E] font-medium tracking-wide max-w-[320px] xs:max-w-[360px] sm:max-w-md mx-auto text-center leading-normal px-3 mt-0.5">
        Curated multi-brand destination featuring exclusive labels, authentic washes, and iconic silhouettes.
      </p>
    </section>
  );
}
