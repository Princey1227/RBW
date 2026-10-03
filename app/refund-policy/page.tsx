"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import BackToHomeButton from "../../component/BackToHomeButton";

export default function RefundPolicyPage() {
  const sections = [
    { id: "overview", label: "1. Overview" },
    { id: "processing", label: "2. Processing Timeline" },
    { id: "methods", label: "3. Refund Methods" },
    { id: "shipping", label: "4. Shipping Costs" },
    { id: "late-refunds", label: "5. Late or Missing Refunds" },
  ];

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

  // Intersection Observer to update active navigation item based on scroll position
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-120px 0px -50% 0px",
      threshold: 0.05
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      // If we are currently scrolling via sidebar click, do not let the observer overwrite the state
      if (isScrollingRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    
    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    // Automatically highlight the last section when reaching the bottom of the page
    const handleScroll = () => {
      if (isScrollingRef.current) return;
      
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 30) {
        setActiveSection("late-refunds");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // Temporarily disable the scroll observer to prevent active section jumping
      isScrollingRef.current = true;
      setActiveSection(id);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const offset = 120; // 120px height accounts for sticky navbar + spacing
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      // Re-enable scroll listener after the smooth scroll completes
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-foreground transition-colors duration-400 pb-24 relative overflow-x-clip">
      <BackToHomeButton />

      {/* Subtle Background Glow Elements */}
      <div className="absolute top-[10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-amber-500/5 dark:bg-amber-500/[0.02] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/5 dark:bg-blue-500/[0.015] blur-[150px] pointer-events-none" />

      {/* Hero Header */}
      <section className="relative pt-[130px] md:pt-[140px] pb-16 border-b border-foreground/10">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <motion.div
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.15 } }
            }}
          >
            <motion.p
              variants={fadeInUp}
              className="text-foreground/45 uppercase tracking-[0.6em] text-xs font-bold mb-6"
            >
              CUSTOMER CARE
            </motion.p>

            <motion.h1
              variants={fadeInUp}
              className="font-serif font-light leading-none text-foreground uppercase tracking-wide select-none"
              style={{ fontSize: "min(80px, 9vw)" }}
            >
              Refund Policy
            </motion.h1>

            <motion.div
              variants={fadeInUp}
              className="w-32 h-px bg-[var(--divider-color)] my-10 relative"
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.8)]" />
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="max-w-2xl text-foreground/70 text-base md:text-lg leading-relaxed font-sans"
            >
              Understanding our refund parameters. We strive to process your credit or refund efficiently while adhering to clear, transparent guidelines.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="grid lg:grid-cols-[250px_1fr] gap-16 items-start">

            {/* Left Column: Sticky Navigation */}
            <aside className="hidden lg:block sticky top-[110px] self-start border-l border-foreground/10 pl-6 space-y-3">
              <p className="text-foreground/45 uppercase tracking-[0.2em] text-[10px] font-bold mb-4">
                POLICY SECTIONS
              </p>
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`block text-left text-xs tracking-wider font-bold uppercase py-1.5 transition-all duration-300 relative group w-full cursor-pointer ${
                    activeSection === sec.id
                      ? "text-[#B9965A] translate-x-1"
                      : "text-foreground/50 hover:text-foreground hover:translate-x-1"
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
            <div className="space-y-16 max-w-3xl text-foreground/80 font-sans leading-relaxed text-base">

              <section id="overview" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  1. Overview
                </h2>
                <div className="space-y-4">
                  <p>
                    All refunds are issued in accordance with our return guidelines. Once a returned package reaches our warehouse, it must pass quality inspection before a refund or exchange can be processed.
                  </p>
                  <p>
                    Only Denims reserves the right to deny refunds for items that do not meet our eligibility criteria (e.g. worn, washed, or altered garments).
                  </p>
                </div>
              </section>

              <section id="processing" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  2. Processing Timeline
                </h2>
                <div className="space-y-4">
                  <p>
                    Our standard timeline for processing returns and issuing refunds comprises:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Transit Time:</strong> It may take 3 to 7 business days for your returned shipment to reach our facilities.
                    </li>
                    <li>
                      <strong>Inspection Window:</strong> Please allow 3 to 5 business days from arrival for our team to inspect the condition of the items.
                    </li>
                    <li>
                      <strong>Processing Status:</strong> Once approved, we will process your refund and send a confirmation email immediately.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="methods" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  3. Refund Methods
                </h2>
                <div className="space-y-4">
                  <p>
                    You can choose how you receive your refund at the time of your return request:
                  </p>
                  <ul className="list-disc pl-5 space-y-4">
                    <li>
                      <strong>Original Payment Method:</strong> Refunds issued to your credit card, debit card, or third-party processor (e.g., Apple Pay, Shop Pay, PayPal) typically take <strong>5 to 10 business days</strong> to show on your statement, depending on your financial institution. A flat return label fee of $7.50 is deducted from this option.
                    </li>
                    <li>
                      <strong>Store Credit (E-Gift Card):</strong> Instantly issued via email as soon as your return package is approved. Return shipping is completely free for store credit refunds, and the full purchase value is preserved.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="shipping" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  4. Shipping Costs
                </h2>
                <div className="space-y-4">
                  <p>
                    Please note that original shipping and handling charges paid at the time of order placement are <strong>non-refundable</strong>.
                  </p>
                  <p>
                    The only exception is if you received a defective, damaged, or incorrect product. In these cases, Only Denims will cover all standard shipping costs, and you will receive a full refund including the original shipping charges.
                  </p>
                </div>
              </section>

              <section id="late-refunds" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  5. Late or Missing Refunds
                </h2>
                <div className="space-y-4">
                  <p>
                    If you haven't received a refund within the specified timeline:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>First, double-check your bank account or credit card statement.</li>
                    <li>Contact your credit card issuer; it may take some time before your refund is officially posted.</li>
                    <li>Contact your bank, as processing times vary and a delay can often occur before a posting is final.</li>
                  </ol>
                  <p>
                    If you have done all of this and still have not received your refund, please reach out to us at <span className="underline font-bold">onlydenims26@gmail.com</span> with your order number.
                  </p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
