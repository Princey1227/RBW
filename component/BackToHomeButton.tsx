"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackToHomeButtonProps {
  className?: string;
}

export default function BackToHomeButton({ className = "" }: BackToHomeButtonProps) {
  return (
    <aside aria-label="Navigation" className={`fixed top-[82px] sm:top-[92px] left-4 sm:left-6 md:left-8 z-30 ${className}`}>
      <Link
        href="/"
        prefetch={false}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-[#E8E3DA] text-[#1C1917] shadow-sm hover:shadow-md hover:border-[#B9965A] text-[10px] sm:text-[11px] font-bold tracking-widest uppercase transition-all duration-200 group cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-[#B9965A] transition-transform duration-200 group-hover:-translate-x-1" />
        <span className="hidden sm:inline">BACK TO HOME</span>
        <span className="sm:hidden">HOME</span>
      </Link>
    </aside>
  );
}
