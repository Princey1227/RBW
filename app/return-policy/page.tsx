"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import BackToHomeButton from "../../component/BackToHomeButton";

export default function ReturnPolicyPage() {
  const sections = [
    { id: "overview", label: "1. Policy Overview" },
    { id: "eligibility", label: "2. Return Eligibility" },
    { id: "process", label: "3. Step-by-Step Process" },
    { id: "exchanges", label: "4. Exchanges" },
    { id: "shipping", label: "5. Return Shipping Fees" },
    { id: "non-returnable", label: "6. Non-Returnable Items" },
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
        setActiveSection("non-returnable");
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
              Returns & Exchanges
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
              Our priority is helping you find the perfect fit. If you're not completely satisfied with your Only Denims purchase, we're here to help you get it sorted.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-8">
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1C1917] dark:bg-white text-white dark:text-black font-sans font-bold text-xs tracking-[2px] uppercase transition-all duration-300 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-xl"
              >
                INITIATE RETURN OR EXCHANGE &rarr;
              </Link>
            </motion.div>
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
                  1. Policy Overview
                </h2>
                <div className="space-y-4">
                  <p>
                    We offer returns and exchanges within <strong>30 days</strong> of your order's delivery date. Whether you need a different size, fit, or color, or want to return the product entirely, we make the process as straightforward as possible.
                  </p>
                  <p>
                    Please note that items must be returned in their original condition. See the next section for full details on eligibility.
                  </p>
                </div>
              </section>

              <section id="eligibility" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  2. Return Eligibility
                </h2>
                <div className="space-y-4">
                  <p>
                    To be eligible for a return or exchange, your items must meet the following strict conditions:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Unworn, unwashed, and undamaged.</li>
                    <li>Free from odors, makeup, deodorant stains, or pet hair.</li>
                    <li>Must have all original tags, paper labels, and packaging intact.</li>
                    <li>Must be accompanied by the original packing slip or receipt.</li>
                  </ul>
                  <p className="text-amber-600 dark:text-amber-500 font-medium">
                    Please test denim products indoors first before wearing them out. Any denim showing visible creases, wear marks, or alterations cannot be accepted.
                  </p>
                </div>
              </section>

              <section id="process" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  3. Step-by-Step Process
                </h2>
                <div className="space-y-4">
                  <p>
                    To initiate your return or exchange, follow these simple steps:
                  </p>
                  <ol className="list-decimal pl-5 space-y-4">
                    <li>
                      <strong>Start Your Request:</strong> Visit our online <Link href="/account/orders" className="underline cursor-pointer hover:text-amber-600 font-bold">Returns Portal</Link> and sign in to view your orders.
                    </li>
                    <li>
                      <strong>Select Option:</strong> Indicate which items you want to return or exchange, and select your reason for returning.
                    </li>
                    <li>
                      <strong>Print Shipping Label:</strong> Once approved, print the prepaid shipping label generated by our portal.
                    </li>
                    <li>
                      <strong>Package Items:</strong> Place the items securely in their original packaging, insert the packing slip, and attach the label to the outside of the package.
                    </li>
                    <li>
                      <strong>Drop Off:</strong> Drop off the package at your nearest courier point.
                    </li>
                  </ol>
                </div>
              </section>

              <section id="exchanges" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  4. Exchanges
                </h2>
                <div className="space-y-4">
                  <p>
                    We offer free exchanges for size or color variations within the same style, subject to availability.
                  </p>
                  <p>
                    If you choose to exchange an item, we will ship the replacement piece free of charge as soon as your return package is scanned by our carrier. This ensures you secure the replacement stock quickly.
                  </p>
                </div>
              </section>

              <section id="shipping" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  5. Return Shipping Fees
                </h2>
                <div className="space-y-4">
                  <p>
                    Shipping costs for returns are handled as follows:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Exchanges:</strong> Return shipping is entirely free.
                    </li>
                    <li>
                      <strong>Store Credit Returns:</strong> Return shipping is free, and we'll issue the full purchase amount to an e-gift card.
                    </li>
                    <li>
                      <strong>Refund to Original Payment Method:</strong> A flat return shipping fee of <strong>$7.50</strong> will be deducted from your final refund amount to cover return carriage.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="non-returnable" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  6. Non-Returnable Items
                </h2>
                <div className="space-y-4">
                  <p>
                    The following items are designated as final sale and cannot be returned, exchanged, or refunded:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Items marked as "Final Sale" or purchased during a Clearance event.</li>
                    <li>Customized, tailored, or hemmed denim pieces.</li>
                    <li>Only Denims gift cards.</li>
                    <li>Complimentary items or promotional free gifts.</li>
                  </ul>
                </div>
              </section>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
