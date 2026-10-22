"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowRight, UserX, Sparkles, Building2, ArrowLeft } from "lucide-react";

export default function CareersPage() {
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
            <div className="mb-6">
              <Link
                href="/"
                prefetch={false}
                className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#78716C] hover:text-[#1C1917] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-[#B9965A]" />
                BACK TO HOME
              </Link>
            </div>

            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F0E6] text-[#3C3835] border border-[#E6E1DA] text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9965A]" />
              ONLY DENIMS • CAREERS &amp; CULTURE
            </motion.div>

            <motion.h1 variants={fadeInUp} className="font-serif font-bold leading-tight uppercase tracking-tight text-[#1C1917]" style={{ fontSize: "min(64px, 8vw)" }}>
              Careers at Only Denims
            </motion.h1>

            <motion.p variants={fadeInUp} className="mt-4 max-w-2xl text-[#57534E] text-base md:text-lg leading-relaxed font-sans font-medium mx-auto">
              Building the future of Indian denim and multi-brand clothing platforms.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Currently Not Required / No Active Openings Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="bg-[#FDFBF7] border border-[#E8E3DA] rounded-3xl p-8 sm:p-12 text-center shadow-sm relative overflow-hidden"
          >
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 text-[#78716C] border border-stone-200 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              CURRENTLY NOT HIRING
            </div>

            <div className="w-16 h-16 rounded-2xl bg-[#1C1917] text-white flex items-center justify-center mx-auto mb-6 shadow-md">
              <UserX className="w-8 h-8 text-[#B9965A]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] uppercase tracking-wide mb-4">
              No Open Positions Currently Required
            </h2>

            <p className="text-sm text-[#57534E] leading-relaxed font-sans max-w-xl mx-auto mb-8">
              We do not have any active job openings at our Mumbai headquarters or textile mills at this time. However, our talent bank is always open for exceptional apparel designers, denim craftspeople, and software engineers.
            </p>

            <div className="p-6 bg-[#FAF8F5] border border-[#E8E3DA] rounded-2xl mb-8 text-left space-y-2">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#B9965A] uppercase block">
                TALENT BANK SUBMISSION
              </span>
              <p className="text-xs text-[#57534E] leading-relaxed font-sans">
                Want us to keep your profile on file? Email your portfolio or resume to our HR team and we will reach out when a relevant position opens up.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:onlydenims26@gmail.com?subject=Talent%20Bank%20Application%20-%20Only%20Denims"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-black text-white px-7 py-3.5 rounded-xl text-xs font-bold tracking-[0.18em] uppercase transition-all shadow-md group"
              >
                <Mail className="w-4 h-4 text-[#B9965A]" />
                <span>SEND RESUME TO TALENT BANK</span>
              </a>

              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-100 text-[#1C1917] border border-[#E8E3DA] px-7 py-3.5 rounded-xl text-xs font-bold tracking-[0.18em] uppercase transition-all"
              >
                <span>CONTACT US</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
