"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Factory, Layers, ShieldCheck, ChevronRight, Sparkles, Store } from "lucide-react";

const ARCHIVE_SPECS = [
  {
    num: "01",
    title: "RAW & SELVEDGE ARCHIVE",
    subtitle: "UNALTERED. RIGID. CHRONOLOGICAL.",
    desc: "Sourced directly from our Mumbai textile mills. Spun on vintage shuttle looms and left completely untouched by chemical washes. Over time, our 14.5 oz selvedge conforms uniquely to your body, molding a personal archive of creases, folds, and natural high-contrast fades.",
    specWeight: "14.5 oz (Heavyweight)",
    specWeave: "Selvedge Shuttle Loom",
    specOrigin: "Mumbai, India",
    image: "/raw_wash_banner.png",
    link: "/shop?wash=raw",
    btnText: "EXPLORE RAW SELVEDGE →"
  },
  {
    num: "02",
    title: "PRODUCTION & MANUFACTURING",
    subtitle: "ARCHITECTURAL. PRECISION. INTEGRATED.",
    desc: "Over the last two decades, our garment manufacturing infrastructure has produced millions of pieces for globally recognized fashion labels. Every pattern cut, chainstitched hem, and copper rivet is executed under strict zero-defect quality standards.",
    specWeight: "13.0 oz - 14.5 oz",
    specWeave: "Right & Left Hand Twill",
    specOrigin: "Mumbai, India",
    image: "/black_wash_banner.png",
    link: "/stores/rbw",
    btnText: "VIEW PRODUCED COLLECTIONS →"
  },
  {
    num: "03",
    title: "THE BRAND PLATFORM",
    subtitle: "CURATED. DIRECT. UNIFIED.",
    desc: "ONLY DENIMS is both a premier denim label and a digital platform incubating independent clothing brands. Featuring live storefronts like RBW (Raw, Black, White), we provide direct manufacturer pricing, unified 1-click checkout, and instant nationwide shipping.",
    specWeight: "Multi-Brand Ecosystem",
    specWeave: "Curated Fashion House",
    specOrigin: "India",
    image: "/white_wash_banner.png",
    link: "/stores/rbw",
    btnText: "DISCOVER FEATURED BRANDS →"
  }
];

export default function AboutPage() {
  React.useEffect(() => {
    const event = new CustomEvent("page_view_kp", {
      detail: {
        type: "other",
        data: {
          cart_id: ""
        }
      }
    });
    console.log("Fired KwikPass page_view_kp other event (About):", event.detail);
    window.dispatchEvent(event);
  }, []);

  return (
    <main className="min-h-screen w-full bg-[#FAF8F5] text-[#1C1917] pb-24 relative overflow-x-hidden">
      {/* ---------------- 1. HERO CAMPAIGN BANNER ---------------- */}
      <section className="relative w-full pt-[115px] md:pt-[125px] pb-20 border-b border-[#E8E3DA] overflow-hidden bg-neutral-950 text-white">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/HERO_BGG.png"
            alt="Only Denims Showroom"
            fill
            priority
            className="object-cover object-center scale-105 filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-16 relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#B9965A] border border-[#B9965A]/40 text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9965A] animate-pulse" />
            ONLY DENIMS • FOUNDATION HOUSE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif font-extrabold uppercase leading-none tracking-tight text-white max-w-4xl"
            style={{ fontSize: "min(72px, 9vw)" }}
          >
            CRAFTING INDIAN DENIM <br />
            <span className="text-[#B9965A]">WITHOUT COMPROMISE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 max-w-2xl text-stone-300 text-sm sm:text-base font-sans font-medium leading-relaxed uppercase tracking-wider"
          >
            Four Decades of Textile Heritage. Two Decades of Manufacturing Mastery. <br className="hidden sm:inline" />
            One Direct Multi-Brand Denim Platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#our-story"
              className="px-8 py-3.5 bg-[#B9965A] hover:bg-[#a68249] text-black text-xs font-extrabold tracking-[0.2em] uppercase rounded-none transition-all shadow-lg hover:scale-105"
            >
              READ OUR STORY &rarr;
            </a>
            <Link
              href="/stores/rbw"
              prefetch={false}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-extrabold tracking-[0.2em] uppercase rounded-none transition-all"
            >
              EXPLORE RBW STORE
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ---------------- 2. PLATFORM FEATURES BANNER (ABOVE STORY) ---------------- */}
      <section className="w-full max-w-[1700px] mx-auto px-4 py-16 sm:py-20 text-center border-b border-[#E8E3DA]">
        {/* Header */}
        <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#B9965A] uppercase block mb-2">
          FOR BRANDS &amp; CLOTHING LABELS
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C1917] tracking-tight">
          Your Brand. Your Store. Our Platform.
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#78716C] font-medium max-w-xl mx-auto">
          Everything you need to launch, sell and grow your clothing brand online.
        </p>

        {/* 4 Feature Columns Grid with Vertical Dividers */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-[#E2DDD5]/70 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center px-4 sm:px-6">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#F4EFE6] flex items-center justify-center text-[#1C1917] mb-4 shadow-sm border border-[#EBE7DF]">
              <Store className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1917]">
              Open Your Store
            </h3>
            <p className="mt-1.5 text-xs text-[#78716C] leading-relaxed max-w-[220px]">
              Launch your brand on ONLY DENIMS in minutes.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center px-4 sm:px-6">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#F4EFE6] flex items-center justify-center text-[#1C1917] mb-4 shadow-sm border border-[#EBE7DF]">
              <Layers className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1917]">
              Sell Your Collection
            </h3>
            <p className="mt-1.5 text-xs text-[#78716C] leading-relaxed max-w-[220px]">
              Add your products and start selling easily.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center px-4 sm:px-6">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#F4EFE6] flex items-center justify-center text-[#1C1917] mb-4 shadow-sm border border-[#EBE7DF]">
              <Factory className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1917]">
              Reach More Customers
            </h3>
            <p className="mt-1.5 text-xs text-[#78716C] leading-relaxed max-w-[220px]">
              Get discovered by fashion lovers worldwide.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col items-center text-center px-4 sm:px-6">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#F4EFE6] flex items-center justify-center text-[#1C1917] mb-4 shadow-sm border border-[#EBE7DF]">
              <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1917]">
              We Handle the Tech
            </h3>
            <p className="mt-1.5 text-xs text-[#78716C] leading-relaxed max-w-[220px]">
              Focus on your clothing, we handle the platform.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- 3. ABOUT ONLY DENIMS: METRICS & HERITAGE ---------------- */}
      <section id="our-story" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          {/* Section Header */}
          <div className="flex items-center justify-center w-full gap-4 mb-16">
            <div className="flex-grow h-px bg-[#E8E3DA]" />
            <span className="text-[#B9965A] text-xs">♦</span>
            <h2 className="text-[#1C1917] font-serif uppercase tracking-[0.25em] font-bold text-xl sm:text-2xl md:text-3xl">
              ABOUT ONLY DENIMS
            </h2>
            <span className="text-[#B9965A] text-xs">♦</span>
            <div className="flex-grow h-px bg-[#E8E3DA]" />
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Story Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 space-y-6 text-[#57534E] leading-relaxed font-sans text-base"
            >
              <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#B9965A] uppercase block">
                FOUR DECADES OF EXCELLENCE
              </span>

              <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#1C1917] uppercase tracking-wide leading-tight">
                Crafted Through Generations
              </h3>

              <p className="text-[#1C1917] font-semibold text-lg leading-snug">
                Our roots trace back over 40 years in the textile industry, where yarn selection, weave density, and loom tension defined our craftsmanship.
              </p>

              <p>
                Over the last 20 years, our manufacturing facilities have produced garments for globally recognized fashion brands, refining every detail of denim construction — from heavy selvedge twills to precision washing.
              </p>

              <p>
                Today, <strong>ONLY DENIMS</strong> channels that direct manufacturer capability straight to consumers and clothing brands, offering uncompromised denim quality without middleman inflation.
              </p>
            </motion.div>

            {/* Metrics Display Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 bg-[#FDFBF7] border border-[#E8E3DA] rounded-2xl p-8 sm:p-10 shadow-md relative overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-8">
                <div className="border-b border-r border-[#E8E3DA] pb-6 pr-4">
                  <span className="text-4xl sm:text-5xl font-serif font-bold text-[#1C1917]">40+</span>
                  <p className="text-xs text-[#78716C] font-bold tracking-wider uppercase mt-2">Years Textile Weaving</p>
                </div>
                <div className="border-b border-[#E8E3DA] pb-6 pl-4">
                  <span className="text-4xl sm:text-5xl font-serif font-bold text-[#1C1917]">20+</span>
                  <p className="text-xs text-[#78716C] font-bold tracking-wider uppercase mt-2">Years Manufacturing</p>
                </div>
                <div className="border-r border-[#E8E3DA] pt-6 pr-4">
                  <span className="text-4xl sm:text-5xl font-serif font-bold text-[#B9965A]">1M+</span>
                  <p className="text-xs text-[#78716C] font-bold tracking-wider uppercase mt-2">Garments Built</p>
                </div>
                <div className="pt-6 pl-4">
                  <span className="text-4xl sm:text-5xl font-serif font-bold text-[#1C1917]">100%</span>
                  <p className="text-xs text-[#78716C] font-bold tracking-wider uppercase mt-2">Direct Manufacturer</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E8E3DA] flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#1C1917] uppercase">
                  FACILITIES • MUMBAI, INDIA
                </span>
                <span className="text-xs font-semibold text-[#B9965A] uppercase">
                  VERIFIED MILLS &rarr;
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------- 4. THE ARCHIVE NARRATIVE SERIES (OUR THREE PILLARS) ---------------- */}
      <section className="py-20 md:py-28 border-t border-[#E8E3DA] bg-[#F5F2EC]">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="text-center max-w-xl mx-auto mb-20">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-[#B9965A] text-xs">♦</span>
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#B9965A] uppercase">
                THE FOUNDATION SERIES
              </span>
              <span className="text-[#B9965A] text-xs">♦</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight uppercase font-bold text-[#1C1917]">
              OUR THREE PILLARS
            </h2>
          </div>

          <div className="space-y-24">
            {ARCHIVE_SPECS.map((spec, idx) => (
              <motion.div
                key={spec.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative group"
              >
                {/* Large Background Number */}
                <div className="absolute -top-16 right-4 hidden lg:block text-[180px] font-serif italic font-extralight text-black/[0.04] select-none pointer-events-none">
                  {spec.num}
                </div>

                {/* Text Content Block */}
                <div className={`lg:col-span-5 flex flex-col items-start space-y-5 ${idx % 2 === 1 ? "lg:order-2" : "lg:order-1"}`}>
                  <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#B9965A] uppercase block">
                    CHAPTER {spec.num}
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] uppercase tracking-wide">
                    {spec.title}
                  </h3>

                  <p className="text-xs font-bold tracking-[0.2em] text-[#78716C] uppercase">
                    {spec.subtitle}
                  </p>

                  <p className="text-[#57534E] text-sm leading-relaxed font-sans">
                    {spec.desc}
                  </p>

                  {/* Spec Sheet Table */}
                  <div className="w-full grid grid-cols-3 gap-2 py-4 border-y border-[#E8E3DA] text-[11px]">
                    <div>
                      <span className="text-[#78716C] block uppercase font-bold text-[9px] tracking-widest">Weight</span>
                      <span className="text-[#1C1917] font-semibold">{spec.specWeight}</span>
                    </div>
                    <div>
                      <span className="text-[#78716C] block uppercase font-bold text-[9px] tracking-widest">Weave</span>
                      <span className="text-[#1C1917] font-semibold">{spec.specWeave}</span>
                    </div>
                    <div>
                      <span className="text-[#78716C] block uppercase font-bold text-[9px] tracking-widest">Origin</span>
                      <span className="text-[#1C1917] font-semibold">{spec.specOrigin}</span>
                    </div>
                  </div>

                  <Link
                    href={spec.link}
                    prefetch={false}
                    className="mt-2 inline-flex items-center gap-2 px-7 py-3 bg-[#1C1917] hover:bg-black text-white text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-sm hover:scale-105"
                  >
                    <span>{spec.btnText}</span>
                  </Link>
                </div>

                {/* Banner Image Block */}
                <div className={`lg:col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border border-[#E8E3DA] ${idx % 2 === 1 ? "lg:order-1" : "lg:order-2"}`}>
                  <Image
                    src={spec.image}
                    alt={spec.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- 5. WHAT ARE YOU LOOKING FOR? ACTION CARDS (AT THE VERY LAST) ---------------- */}
      <section className="w-full max-w-[1700px] mx-auto px-4 py-20 text-center border-t border-[#E8E3DA]">
        {/* Header */}
        <span className="text-[10px] sm:text-[11px] tracking-[0.28em] font-bold text-[#78716C] uppercase">
          WHAT ARE YOU LOOKING FOR?
        </span>
        <h2 className="mt-1 font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C1917] tracking-tight">
          We’ve got you covered.
        </h2>

        {/* 3 Interactive Feature Cards Grid */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 text-left max-w-6xl mx-auto">
          {/* Card 1: FOR BRANDS */}
          <div className="group rounded-[22px] p-6 sm:p-7 bg-[#F7F2EC] border border-[#EFE6DB] hover:shadow-lg transition-all duration-300 flex items-start gap-4 sm:gap-5">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center text-[#1C1917] shrink-0 shadow-sm border border-black/5">
              <Store className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
              <div>
                <h3 className="font-sans text-xs sm:text-[13px] font-bold tracking-[0.2em] text-[#1C1917] uppercase">
                  FOR BRANDS
                </h3>
                <p className="mt-1.5 text-xs text-[#6B655F] leading-relaxed">
                  Get in touch with our team to onboard your brand and launch your store on ONLY DENIMS.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/contact"
                  prefetch={false}
                  className="inline-flex items-center gap-1.5 bg-[#1C1917] hover:bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.18em] uppercase transition-all shadow-sm group-hover:shadow-md"
                >
                  CONTACT TEAM TO OPEN STORE
                  <span aria-hidden className="text-xs transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: FOR SHOPPERS */}
          <div className="group rounded-[22px] p-6 sm:p-7 bg-[#F2F3F5] border border-[#E5E8EC] hover:shadow-lg transition-all duration-300 flex items-start gap-4 sm:gap-5">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center text-[#1C1917] shrink-0 shadow-sm border border-black/5">
              <Sparkles className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
              <div>
                <h3 className="font-sans text-xs sm:text-[13px] font-bold tracking-[0.2em] text-[#1C1917] uppercase">
                  FOR SHOPPERS
                </h3>
                <p className="mt-1.5 text-xs text-[#6B655F] leading-relaxed">
                  Explore independent brands, discover new collections and shop what you love.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/stores/rbw"
                  prefetch={false}
                  className="inline-flex items-center gap-1.5 bg-[#1C1917] hover:bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.18em] uppercase transition-all shadow-sm group-hover:shadow-md"
                >
                  SHOP RBW STORE
                  <span aria-hidden className="text-xs transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: NEED HELP? */}
          <div className="group rounded-[22px] p-6 sm:p-7 bg-[#F0F4FA] border border-[#E1E8F2] hover:shadow-lg transition-all duration-300 flex items-start gap-4 sm:gap-5">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center text-[#1C1917] shrink-0 shadow-sm border border-black/5">
              <ChevronRight className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
              <div>
                <h3 className="font-sans text-xs sm:text-[13px] font-bold tracking-[0.2em] text-[#1C1917] uppercase">
                  NEED HELP?
                </h3>
                <p className="mt-1.5 text-xs text-[#6B655F] leading-relaxed">
                  Questions about joining, selling or shopping? We're here to help you.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/contact"
                  prefetch={false}
                  className="inline-flex items-center gap-1.5 bg-[#1C1917] hover:bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.18em] uppercase transition-all shadow-sm group-hover:shadow-md"
                >
                  CONTACT US
                  <span aria-hidden className="text-xs transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
