"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Layers, Factory, ShoppingBag, Truck } from "lucide-react";

export default function HowItWorksPage() {
  React.useEffect(() => {
    const event = new CustomEvent("page_view_kp", {
      detail: { type: "other", data: { cart_id: "" } }
    });
    window.dispatchEvent(event);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#1C1917] pb-24 relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="pt-[120px] md:pt-[130px] pb-16 border-b border-[#E8E3DA]">
        <div className="max-w-7xl mx-auto px-4 md:px-16 text-center flex flex-col items-center">
          <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F0E6] text-[#3C3835] border border-[#E6E1DA] text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9965A]" />
              ONLY DENIMS • ARCHITECTURE &amp; PROCESS
            </motion.div>

            <motion.h1 variants={fadeInUp} className="font-serif font-bold leading-tight uppercase tracking-tight text-[#1C1917]" style={{ fontSize: "min(64px, 8vw)" }}>
              How ONLY DENIMS Works
            </motion.h1>

            <motion.p variants={fadeInUp} className="mt-4 max-w-2xl text-[#57534E] text-base md:text-lg leading-relaxed font-sans font-medium">
              Connecting denim craftsmanship, direct manufacturer pricing, and multi-brand retail stores into one seamless experience.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 4-Step Process Grid */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: Factory,
                title: "Textile Sourcing & Weaving",
                desc: "We craft raw 14.5oz selvedge twills on vintage shuttle looms in Mumbai, ensuring fabric weight, weave density, and raw cotton integrity."
              },
              {
                step: "02",
                icon: Layers,
                title: "Curated Brand Studios",
                desc: "Each featured brand (such as RBW - Raw, Black, White) designs dedicated silhouettes, custom hardware, and specialized washes."
              },
              {
                step: "03",
                icon: ShoppingBag,
                title: "1-Click Gokwik Checkout",
                desc: "Shoppers explore live brand stores, select fits & sizes, and check out instantly with Gokwik UPI, Cards, NetBanking, or COD."
              },
              {
                step: "04",
                icon: Truck,
                title: "Direct Warehouse Dispatch",
                desc: "Orders are packed in eco-conscious denim boxes and shipped nationwide directly from our Mumbai warehouse in 3 to 5 days."
              }
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <div key={item.step} className="bg-[#FDFBF7] border border-[#E8E3DA] rounded-2xl p-7 relative shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#1C1917] text-white flex items-center justify-center">
                        <IconComp className="w-5 h-5 text-[#B9965A]" />
                      </div>
                      <span className="text-3xl font-serif font-bold text-[#B9965A] opacity-60">{item.step}</span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#1C1917] uppercase tracking-wide mb-3">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-sans">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Link href="/stores/rbw" prefetch={false} className="inline-flex items-center gap-2 bg-[#1C1917] hover:bg-black text-white px-8 py-3.5 rounded-xl text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-md">
              <span>EXPERIENCE RBW STORE</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B9965A]" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
