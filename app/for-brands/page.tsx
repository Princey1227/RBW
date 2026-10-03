"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Factory,
  Zap,
  TrendingUp,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function ForBrandsPage() {
  React.useEffect(() => {
    const event = new CustomEvent("page_view_kp", {
      detail: { type: "other", data: { cart_id: "" } },
    });
    window.dispatchEvent(event);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: "easeOut" },
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0A0A0A] text-[#1C1917] dark:text-[#F5F1E8] pb-24 relative overflow-x-hidden transition-colors duration-300">
      {/* Hero Section */}
      <section className="pt-[120px] md:pt-[130px] pb-16 border-b border-[#E8E3DA] dark:border-stone-800 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <motion.div
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F0E6] dark:bg-stone-900 text-[#3C3835] dark:text-[#E8CD97] border border-[#E6E1DA] dark:border-stone-800 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-[#B9965A]" />
              <span>ONLY DENIMS • BRAND PARTNERSHIP PLATFORM</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              style={{
                fontFamily: "var(--font-serif), Georgia, serif",
                fontSize: "min(64px, 8vw)",
              }}
              className="font-bold leading-tight uppercase tracking-tight text-[#1C1917] dark:text-[#F5F1E8]"
            >
              Launch &amp; Scale Your Clothing Brand <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B9965A] via-[#D4B16A] to-[#8C6B2F]">
                Direct From Mill To Market
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 max-w-2xl text-[#57534E] dark:text-[#A8A29E] text-base md:text-lg leading-relaxed font-sans font-medium"
            >
              We empower independent fashion labels, designers, and apparel founders with zero-middlemen garment manufacturing, digital storefront technology, and nationwide logistics.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/stores/template"
                prefetch={false}
                className="inline-flex items-center gap-2 bg-[#B9965A] hover:bg-[#A68349] text-black px-7 py-3.5 rounded-xl text-xs font-bold tracking-[0.18em] uppercase transition-all shadow-md group"
              >
                <span>EXPLORE LIVE STORE TEMPLATE</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                prefetch={false}
                className="inline-flex items-center gap-2 bg-[#1C1917] dark:bg-stone-800 hover:bg-black text-white px-7 py-3.5 rounded-xl text-xs font-bold tracking-[0.18em] uppercase transition-all shadow-md group border border-white/10"
              >
                <span>APPLY FOR ONBOARDING</span>
              </Link>
              <Link
                href="/how-it-works"
                prefetch={false}
                className="inline-flex items-center gap-2 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-[#1C1917] dark:text-white border border-[#E8E3DA] dark:border-stone-800 px-7 py-3.5 rounded-xl text-xs font-bold tracking-[0.18em] uppercase transition-all shadow-2xs"
              >
                HOW IT WORKS
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Platform Benefits Grid */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#78716C] dark:text-[#A8A29E] uppercase">
              WHY PARTNER WITH US
            </span>
            <h2
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
              className="text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-[#F5F1E8] uppercase tracking-wide mt-2"
            >
              Everything Your Brand Needs
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Factory,
                title: "Direct Mill Manufacturing",
                desc: "Access 40+ years of textile weaving and 20+ years of garment production. Low MOQs, premium selvedge twills, custom washes, and precision chainstitching.",
              },
              {
                icon: Zap,
                title: "Turnkey Digital Storefront",
                desc: "Get a dedicated brand store (experience our live demo at /stores/template) powered by Next.js, 3D garment visualization, Gokwik 1-click checkout, and Shopify syncing.",
              },
              {
                icon: TrendingUp,
                title: "Growth & Fulfilment Infrastructure",
                desc: "Leverage our Mumbai warehouse and pan-India shipping partners (3-5 day nationwide delivery) with zero overhead inventory risk.",
              },
            ].map((card) => {
              const IconComp = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-[#FDFBF7] dark:bg-stone-900/60 border border-[#E8E3DA] dark:border-stone-800 rounded-2xl p-8 shadow-xs hover:shadow-md hover:border-[#B9965A]/40 dark:hover:border-[#B9965A]/40 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1C1917] dark:bg-stone-800 text-white flex items-center justify-center mb-6 shadow-xs border border-white/10">
                    <IconComp className="w-6 h-6 text-[#B9965A]" />
                  </div>
                  <h3
                    style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                    className="text-lg font-bold text-[#1C1917] dark:text-[#F5F1E8] uppercase tracking-wide mb-3"
                  >
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] leading-relaxed font-sans">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Onboarding Checklist */}
      <section className="bg-[#FDFBF7] dark:bg-stone-900/40 border-y border-[#E8E3DA] dark:border-stone-800 py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#B9965A] uppercase block mb-2">
                BUILT FOR FOUNDERS
              </span>
              <h2
                style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                className="text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-[#F5F1E8] uppercase tracking-wide mb-6"
              >
                What We Provide To Onboarded Brands
              </h2>
              <div className="space-y-4">
                {[
                  "Dedicated custom brand storefront URL (e.g. onlydenims.com/stores/yourbrand)",
                  "Custom woven labels, leather waist patches, and hangtags",
                  "Gokwik 1-Click checkout & UPI payment gateway integration",
                  "Real-time inventory & order management dashboard",
                  "Direct production samples & fit iteration support",
                  "Packaging, unboxing collateral & nationwide shipping",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-xs sm:text-sm text-[#1C1917] dark:text-[#E8CD97] font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#B9965A] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1C1917] dark:bg-stone-900/90 text-white rounded-2xl p-8 sm:p-10 shadow-xl border border-white/10 dark:border-stone-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B9965A]/10 rounded-full blur-2xl pointer-events-none" />
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#B9965A] uppercase block mb-2">
                READY TO LAUNCH?
              </span>
              <h3
                style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                className="text-2xl font-bold uppercase tracking-wide mb-4"
              >
                Partner Application
              </h3>
              <p className="text-xs text-stone-300 dark:text-stone-400 mb-6 leading-relaxed">
                Submit your brand proposal or reach out to our partner team to discuss custom manufacturing and store onboarding.
              </p>
              <Link
                href="/contact"
                prefetch={false}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#B9965A] hover:bg-[#a68249] text-black py-3.5 rounded-xl text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-md cursor-pointer"
              >
                <span>TALK TO OUR PARTNER TEAM</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}