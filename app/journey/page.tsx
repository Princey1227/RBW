"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Award, Factory, Layers } from "lucide-react";

export default function JourneyPage() {
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
      <section className="pt-[120px] md:pt-[130px] pb-16 border-b border-[#E8E3DA] text-center flex flex-col items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F0E6] text-[#3C3835] border border-[#E6E1DA] text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9965A]" />
              ONLY DENIMS • OUR EVOLUTION
            </motion.div>

            <motion.h1 variants={fadeInUp} className="font-serif font-bold leading-tight uppercase tracking-tight text-[#1C1917]" style={{ fontSize: "min(64px, 8vw)" }}>
              The Journey of Only Denims
            </motion.h1>

            <motion.p variants={fadeInUp} className="mt-4 max-w-2xl text-[#57534E] text-base md:text-lg leading-relaxed font-sans font-medium mx-auto">
              From a modest cotton weaving unit in Mumbai to a powerhouse denim manufacturer and multi-brand clothing platform.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Milestones */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="space-y-12 max-w-4xl mx-auto">
            {[
              {
                year: "1984",
                title: "Cotton Weaving Origin",
                desc: "Founded in Mumbai, India as a specialized textile unit focused on raw cotton yarn, warp sizing, and heavy shuttle loom weaving."
              },
              {
                year: "2004",
                title: "Garment Manufacturing Expansion",
                desc: "Transitioned into full garment manufacturing, building high-capacity sewing and washing mills supplying top domestic and international labels."
              },
              {
                year: "2018",
                title: "Selvedge & Sustainable Dyeing R&D",
                desc: "Invested in vintage shuttle looms and eco-friendly indigo dyeing processes, perfecting 14.5oz raw selvedge twills."
              },
              {
                year: "2026",
                title: "ONLY DENIMS Direct & Brand Platform",
                desc: "Launched ONLY DENIMS direct-to-consumer store and incubator platform, introducing brand stores like RBW (Raw, Black, White)."
              }
            ].map((milestone) => (
              <div key={milestone.year} className="bg-[#FDFBF7] border border-[#E8E3DA] rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="text-4xl sm:text-5xl font-serif font-bold text-[#B9965A] shrink-0 w-28">
                  {milestone.year}
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#1C1917] uppercase tracking-wide mb-2">{milestone.title}</h3>
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-sans">{milestone.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/about" prefetch={false} className="inline-flex items-center gap-2 bg-[#1C1917] hover:bg-black text-white px-8 py-3.5 rounded-xl text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-md">
              <span>LEARN MORE ABOUT US</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B9965A]" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
