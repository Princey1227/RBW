"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers, ShieldCheck, Sparkles, HelpCircle } from "lucide-react";

export default function ResourcesPage() {
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
              ONLY DENIMS • KNOWLEDGE &amp; GUIDES
            </motion.div>

            <motion.h1 variants={fadeInUp} className="font-serif font-bold leading-tight uppercase tracking-tight text-[#1C1917]" style={{ fontSize: "min(64px, 8vw)" }}>
              Denim Resources &amp; Guides
            </motion.h1>

            <motion.p variants={fadeInUp} className="mt-4 max-w-2xl text-[#57534E] text-base md:text-lg leading-relaxed font-sans font-medium mx-auto">
              Everything you need to know about raw selvedge denim care, fit guides, fabric weights, and brand onboarding.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Resources Cards Grid */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Raw Denim Care Guide",
                category: "DENIM CARE",
                desc: "How to break in 14.5oz raw indigo selvedge. Washing schedules, cold soaking, hang drying, and avoiding streak lines.",
                link: "/blog"
              },
              {
                title: "Denim Fit & Silhouette Dictionary",
                category: "FIT GUIDE",
                desc: "Understanding Straight, Ankle, Comfort, Baggy, Slim, and Bootcut fits. Choosing the perfect rise and leg opening.",
                link: "/shop"
              },
              {
                title: "Brand Partner Onboard Manual",
                category: "BRAND GUIDE",
                desc: "Technical specs for apparel founders: fabric selection, MOQ guidelines, woven label templates, and storefront setup.",
                link: "/for-brands"
              }
            ].map((res) => (
              <div key={res.title} className="bg-[#FDFBF7] border border-[#E8E3DA] rounded-2xl p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#B9965A] uppercase">{res.category}</span>
                  <h3 className="text-xl font-serif font-bold text-[#1C1917] uppercase tracking-wide mt-2 mb-3">{res.title}</h3>
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-sans">{res.desc}</p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#E8E3DA]">
                  <Link href={res.link} prefetch={false} className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#1C1917] hover:text-[#B9965A] uppercase">
                    <span>READ GUIDE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
