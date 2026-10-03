"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2, Sparkles, ArrowRight } from "lucide-react";

export default function SingleBlogPage() {
  const post = {
    title: "The Only Denims Revolution: Building India's Ultimate Multi-Brand Apparel Ecosystem",
    category: "BRAND STORY • OFFICIAL JOURNAL",
    date: "August 10, 2026",
    readTime: "5 Min Read",
    author: "ONLY DENIMS Editorial Board",
    image: "/HERO_BGG.png",
    quote:
      "ONLY DENIMS was founded on a singular conviction: every visionary clothing brand deserves its own authentic digital storefront without sacrificing technology or reach.",
    content: [
      "In the fast-evolving landscape of Indian fashion, independent clothing labels often face a dilemma: build an isolated storefront with high technical friction, or list on traditional mass marketplaces where brand identity gets diluted. ONLY DENIMS was created to eliminate that compromise.",
      "Conceived as a premium multi-brand outlet ecosystem, ONLY DENIMS brings together curated, independent fashion ateliers—such as our flagship live store RBW—under one unified, high-performance platform. Each brand retains its unique voice, typography, and aesthetic identity while benefiting from our enterprise-grade checkout, real-time inventory engine, and nation-wide fulfillment infrastructure.",
      "Our journey begins with RBW (Raw & Bold Wear), offering heavyweight selvedge denim jackets and everyday jeans engineered for durability. As we prepare to onboard upcoming brands—including THINC, WIDE, IJNS, and SECOND ARMY—ONLY DENIMS is setting a new benchmark for how modern apparel ecosystems operate in India.",
      "Whether you are a shopper seeking uncompromised denim craftsmanship or a brand founder ready to launch your standalone store, ONLY DENIMS is your gateway to forward fashion."
    ]
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#1C1917] pt-10 sm:pt-14 pb-24 px-4 sm:px-8 max-w-4xl mx-auto select-none">
      {/* Back Button */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-stone-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO JOURNAL
        </Link>
      </div>

      {/* Article Header */}
      <article className="space-y-6">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C1917] text-white text-[9.5px] font-bold tracking-[0.2em] uppercase">
            <Sparkles className="w-3 h-3" />
            {post.category}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C1917] leading-tight tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 font-semibold py-3 border-y border-stone-200">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#1C1917]" />
              {post.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#1C1917]" />
              {post.readTime}
            </span>
            <span>•</span>
            <span className="text-stone-800">{post.author}</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative w-full h-[280px] sm:h-[440px] rounded-[24px] overflow-hidden shadow-lg border border-stone-200">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Quote Highlight */}
        <blockquote className="p-6 sm:p-8 rounded-[20px] bg-[#F3EFE6] border-l-4 border-[#1C1917] font-serif text-base sm:text-xl italic text-[#292524] shadow-xs my-8">
          &ldquo;{post.quote}&rdquo;
        </blockquote>

        {/* Article Body */}
        <div className="space-y-6 text-sm sm:text-base text-stone-700 leading-relaxed font-sans pt-2">
          {post.content.map((paragraph, index) => (
            <p key={index} className="first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-[#1C1917]">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-10 mt-12 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#1C1917] hover:bg-black text-white px-7 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:scale-105"
          >
            EXPLORE ONLY DENIMS PLATFORM
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/blog"
            className="text-xs font-bold text-stone-600 hover:text-black uppercase tracking-wider flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            BACK TO ALL STORIES
          </Link>
        </div>
      </article>
    </main>
  );
}
