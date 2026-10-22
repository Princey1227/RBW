"use client";

import React from "react";
import Link from "next/link";

interface HomeFooterDockProps {
  maxWidth?: number;
}

export default function HomeFooterDock({ maxWidth = 1650 }: HomeFooterDockProps) {
  return (
    <section
      className="relative z-10 w-full mx-auto -mt-1 sm:mt-0.5 mb-2 sm:mb-1 shrink-0 px-3.5 sm:px-0"
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <div className="bg-[#FAF8F5]/90 backdrop-blur-md border border-[#EBE6DC] rounded-[16px] min-[390px]:rounded-[20px] sm:rounded-[24px] py-1.5 min-[390px]:py-2 sm:py-2.5 lg:py-3 px-3 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 min-[390px]:gap-1.5 text-[#6B655F] shadow-xs select-none text-center transition-all">
        {/* Policy Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 font-medium text-[9.5px] min-[370px]:text-[10px] xs:text-[11px] sm:text-xs text-center w-full sm:w-auto order-1 sm:order-2">
          <Link
            href="/terms-and-conditions"
            prefetch={false}
            className="hover:text-[#1C1917] transition-colors cursor-pointer whitespace-nowrap"
          >
            Terms &amp; Conditions
          </Link>
          <span className="text-[#D6D0C4]">|</span>
          <Link
            href="/privacy-policy"
            prefetch={false}
            className="hover:text-[#1C1917] transition-colors cursor-pointer whitespace-nowrap"
          >
            Privacy Policy
          </Link>
          <span className="text-[#D6D0C4]">|</span>
          <Link
            href="/return-policy"
            prefetch={false}
            className="hover:text-[#1C1917] transition-colors cursor-pointer whitespace-nowrap"
          >
            Returns &amp; Exchange
          </Link>
        </div>

        {/* Copyright notice */}
        <div className="font-medium text-[9.5px] xs:text-[10.5px] sm:text-xs text-[#6B655F] text-center w-full sm:w-auto order-2 sm:order-1 whitespace-nowrap">
          &copy; 2026 ONLY DENIMS. All rights reserved.
        </div>
      </div>
    </section>
  );
}
