"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import BackToHomeButton from "../../component/BackToHomeButton";
import { 
  Truck, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  Mail, 
  MapPin, 
  Compass, 
  PackageCheck,
  AlertTriangle
} from "lucide-react";

export default function ShippingPolicyPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const event = new CustomEvent("page_view_kp", {
      detail: {
        type: "other",
        data: {
          cart_id: ""
        }
      }
    });
    window.dispatchEvent(event);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-120px 0px -50% 0px",
      threshold: 0.05
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const sectionIds = ["overview", "processing", "rates-estimates", "tracking", "lost-damaged", "contact-support"];
    
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      if (isScrollingRef.current) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 30) {
        setActiveSection("contact-support");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  const sections = [
    { id: "overview", label: "1. Policy Overview" },
    { id: "processing", label: "2. Order Processing" },
    { id: "rates-estimates", label: "3. Rates & Timelines" },
    { id: "tracking", label: "4. Shipment Tracking" },
    { id: "lost-damaged", label: "5. Damaged & Lost Packages" },
    { id: "contact-support", label: "6. Support & Inquiries" },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      isScrollingRef.current = true;
      setActiveSection(id);

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      const offset = 120;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#1C1917] pb-24 relative overflow-x-clip">
      <BackToHomeButton />

      {/* Hero Header */}
      <section className="pt-[120px] md:pt-[130px] pb-16 border-b border-[#E8E3DA]">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F0E6] text-[#3C3835] border border-[#E6E1DA] text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9965A]" />
              ONLY DENIMS • CUSTOMER CARE &amp; LOGISTICS
            </motion.div>

            <motion.h1 variants={fadeInUp} className="font-serif font-bold leading-tight uppercase tracking-tight text-[#1C1917]" style={{ fontSize: "min(64px, 8vw)" }}>
              Shipping &amp; Delivery Policy
            </motion.h1>

            <motion.p variants={fadeInUp} className="mt-4 max-w-2xl text-[#57534E] text-base md:text-lg leading-relaxed font-sans font-medium">
              Direct mill packaging, processing schedules, nationwide delivery timelines, and courier tracking guidelines.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="grid lg:grid-cols-[260px_1fr] gap-16 items-start">
            {/* Left Column: Sticky Navigation */}
            <aside className="hidden lg:block sticky top-[110px] self-start border-l border-[#E8E3DA] pl-6 space-y-3">
              <p className="text-[#78716C] uppercase tracking-[0.2em] text-[10px] font-bold mb-4">
                POLICY SECTIONS
              </p>
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`block text-left text-xs tracking-wider font-bold uppercase py-1.5 transition-all duration-300 relative group w-full ${
                    activeSection === sec.id
                      ? "text-[#B9965A] translate-x-1"
                      : "text-[#78716C] hover:text-[#1C1917] hover:translate-x-1"
                  }`}
                >
                  <span className={`absolute left-[-25px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#B9965A] transition-all duration-300 ${
                    activeSection === sec.id ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  }`} />
                  {sec.label}
                </button>
              ))}
            </aside>

            {/* Right Column: Policy Content */}
            <div className="space-y-16 max-w-3xl text-[#57534E] font-sans leading-relaxed text-base">
              
              {/* Section 1: Overview */}
              <section id="overview" className="scroll-mt-[180px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#1C1917] text-white flex items-center justify-center">
                    <Compass size={16} className="text-[#B9965A]" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-serif font-bold uppercase tracking-wide text-[#1C1917]">
                    1. Policy Overview
                  </h2>
                </div>
                <div className="space-y-4 bg-[#FDFBF7] border border-[#E8E3DA] rounded-2xl p-6 sm:p-8 shadow-2xs">
                  <p className="text-[#1C1917] font-semibold leading-relaxed">
                    ONLY DENIMS ships garments directly from our Mumbai manufacturing and fulfillment facility to addresses across India. We partner with tier-1 logistics providers (Bluedart, Delhivery, Expressbees) to ensure secure, damage-free delivery.
                  </p>
                  <p className="text-xs text-[#78716C]">
                    All garments are sealed in protective eco-friendly denim boxes with tamper-evident tape.
                  </p>
                </div>
              </section>

              {/* Section 2: Order Processing */}
              <section id="processing" className="scroll-mt-[180px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#1C1917] text-white flex items-center justify-center">
                    <Clock size={16} className="text-[#B9965A]" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-serif font-bold uppercase tracking-wide text-[#1C1917]">
                    2. Order Processing
                  </h2>
                </div>
                <div className="grid gap-4">
                  <div className="p-5 rounded-2xl border border-[#E8E3DA] bg-[#FDFBF7]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1">
                      <Truck size={14} className="text-[#B9965A]" /> Standard Processing
                    </div>
                    <p className="text-xs sm:text-sm text-[#57534E]">Orders are verified, quality-inspected, and packed within <strong>1 to 2 business days</strong> (Monday through Saturday, excluding national holidays).</p>
                  </div>
                  <div className="p-5 rounded-2xl border border-[#E8E3DA] bg-[#FDFBF7]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1">
                      <Calendar size={14} className="text-[#B9965A]" /> Daily Cut-Off Time
                    </div>
                    <p className="text-xs sm:text-sm text-[#57534E]">Orders placed before <strong>12:00 PM IST</strong> begin fulfillment on the same business day.</p>
                  </div>
                </div>
              </section>

              {/* Section 3: Rates & Timelines */}
              <section id="rates-estimates" className="scroll-mt-[180px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#1C1917] text-white flex items-center justify-center">
                    <Truck size={16} className="text-[#B9965A]" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-serif font-bold uppercase tracking-wide text-[#1C1917]">
                    3. Rates &amp; Delivery Timelines
                  </h2>
                </div>
                <div className="border border-[#E8E3DA] bg-[#FDFBF7] rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[#E8E3DA] bg-[#F5F0E6]">
                        <th className="p-4 font-bold uppercase tracking-wider text-[#1C1917]">Order Value</th>
                        <th className="p-4 font-bold uppercase tracking-wider text-[#1C1917]">Service</th>
                        <th className="p-4 font-bold uppercase tracking-wider text-[#1C1917]">Timeline</th>
                        <th className="p-4 font-bold uppercase tracking-wider text-[#1C1917] text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E3DA]">
                      <tr>
                        <td className="p-4 font-semibold text-[#1C1917]">Under ₹1,500</td>
                        <td className="p-4 text-[#57534E]">Standard Delivery</td>
                        <td className="p-4 text-[#57534E]">3 - 5 Business Days</td>
                        <td className="p-4 font-semibold text-right text-[#1C1917]">₹100</td>
                      </tr>
                      <tr className="bg-[#FAF8F5]">
                        <td className="p-4 font-semibold text-[#1C1917]">₹1,500 &amp; Above</td>
                        <td className="p-4 text-[#57534E]">Free Shipping</td>
                        <td className="p-4 text-[#57534E]">3 - 5 Business Days</td>
                        <td className="p-4 font-bold text-right text-[#B9965A]">FREE</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-[#1C1917]">Any Order</td>
                        <td className="p-4 text-[#57534E]">Express Air Delivery</td>
                        <td className="p-4 text-[#57534E]">1 - 2 Business Days</td>
                        <td className="p-4 font-semibold text-right text-[#1C1917]">₹250</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Section 4: Tracking */}
              <section id="tracking" className="scroll-mt-[180px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#1C1917] text-white flex items-center justify-center">
                    <PackageCheck size={16} className="text-[#B9965A]" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-serif font-bold uppercase tracking-wide text-[#1C1917]">
                    4. Shipment Tracking
                  </h2>
                </div>
                <div className="p-6 bg-[#FDFBF7] border border-[#E8E3DA] rounded-2xl space-y-3">
                  <p className="text-xs sm:text-sm text-[#1C1917] font-semibold">
                    Upon dispatch from our Mumbai warehouse, you will receive an SMS and email notification containing your AWB tracking link.
                  </p>
                  <p className="text-xs text-[#78716C]">
                    You can also track orders directly via Gokwik or under your account order history. Tracking status updates within 12 hours of courier pickup.
                  </p>
                </div>
              </section>

              {/* Section 5: Damaged / Lost */}
              <section id="lost-damaged" className="scroll-mt-[180px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#1C1917] text-white flex items-center justify-center">
                    <ShieldAlert size={16} className="text-[#B9965A]" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-serif font-bold uppercase tracking-wide text-[#1C1917]">
                    5. Damaged &amp; Lost Packages
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-[#E8E3DA] bg-[#FDFBF7]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-2">
                      <AlertTriangle size={14} className="text-[#B9965A]" /> Damaged Package
                    </div>
                    <p className="text-xs text-[#57534E]">Inspect your package upon delivery. If damaged or tampered with, photograph the box and notify us within 48 hours for immediate replacement.</p>
                  </div>
                  <div className="p-5 rounded-2xl border border-[#E8E3DA] bg-[#FDFBF7]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-2">
                      <Compass size={14} className="text-[#B9965A]" /> Transit Delays
                    </div>
                    <p className="text-xs text-[#57534E]">In rare cases of courier delays due to weather or local restrictions, our support team actively coordinates with logistics partners to expedite delivery.</p>
                  </div>
                </div>
              </section>

              {/* Section 6: Support */}
              <section id="contact-support" className="scroll-mt-[180px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#1C1917] text-white flex items-center justify-center">
                    <Mail size={16} className="text-[#B9965A]" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-serif font-bold uppercase tracking-wide text-[#1C1917]">
                    6. Support &amp; Dispatch Center
                  </h2>
                </div>
                <div className="bg-[#1C1917] text-white rounded-2xl p-8 shadow-xl space-y-4">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#B9965A] uppercase block">FULFILLMENT CENTER</span>
                  <h3 className="text-xl font-serif font-bold uppercase tracking-wide">ONLY DENIMS Warehouse</h3>
                  <div className="text-xs space-y-2 text-stone-300 pt-2 border-t border-stone-800">
                    <p className="flex items-center gap-2"><Mail size={14} className="text-[#B9965A]" /> <strong>Email:</strong> onlydenims26@gmail.com</p>
                    <p className="flex items-start gap-2"><MapPin size={14} className="text-[#B9965A] shrink-0 mt-0.5" /> <strong>Address:</strong> Bonanza Industrial Estate, Ashok Chakravarti Road, Ashok Nagar, Kandivali East, Mumbai, Maharashtra, PIN - 400101</p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
