"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";

const SINGLE_BLOG_POST = {
  id: "1",
  slug: "only-denims-story",
  title: "The Only Denims Revolution: Building India's Ultimate Multi-Brand Apparel Ecosystem",
  category: "BRAND STORY • OFFICIAL JOURNAL",
  date: "August 10, 2026",
  readTime: "5 Min Read",
  author: "ONLY DENIMS Editorial Board",
  image: "/HERO_BGG.png",
  excerpt:
    "From raw selvedge weaves to streetwear utility outerwear, discover how ONLY DENIMS empowers independent apparel brands to launch dedicated digital stores and connect directly with denim enthusiasts nationwide.",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#1C1917] pt-8 sm:pt-12 pb-20 px-4 sm:px-8 max-w-5xl mx-auto select-none">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto pt-4 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C1917]/5 border border-[#1C1917]/10 text-[#1C1917] text-[10px] font-bold tracking-[0.22em] uppercase mb-3">
          <Sparkles className="w-3 h-3" />
          ONLY DENIMS JOURNAL
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1C1917] tracking-tight">
          Brand Story &amp; Vision
        </h1>
      </div>

      {/* Clean Single Article Card linking to full page */}
      <Link href="/blog/only-denims-story" prefetch={false} className="block w-full max-w-3xl mx-auto group">
        <div className="w-full rounded-[22px] bg-[#F4EFE6] border border-[#E5DFD3] p-5 sm:p-7 shadow-md group-hover:shadow-xl transition-all duration-300 grid md:grid-cols-12 gap-6 items-center">
          {/* Image */}
          <div className="md:col-span-5 relative h-[180px] sm:h-[220px] rounded-[16px] overflow-hidden shadow-xs">
            <Image
              src={SINGLE_BLOG_POST.image}
              alt={SINGLE_BLOG_POST.title}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Info */}
          <div className="md:col-span-7 flex flex-col justify-between h-full space-y-3">
            <div>
              <div className="flex items-center gap-2 text-[10.5px] text-[#78716C] font-semibold mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#1C1917]" />
                  {SINGLE_BLOG_POST.date}
                </span>
                <span>•</span>
                <span>{SINGLE_BLOG_POST.readTime}</span>
              </div>

              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917] leading-snug group-hover:text-black transition-colors">
                {SINGLE_BLOG_POST.title}
              </h2>

              <p className="mt-2 text-xs text-[#57534E] leading-relaxed line-clamp-3 font-sans">
                {SINGLE_BLOG_POST.excerpt}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E0D8CA] flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 bg-[#1C1917] group-hover:bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.16em] uppercase transition-all shadow-sm">
                READ FULL ARTICLE
                <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
              </span>

              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                {SINGLE_BLOG_POST.author}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </main>
  );
}
