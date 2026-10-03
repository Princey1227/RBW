"use client";

import React from "react";
import { motion } from "framer-motion";
import BackToHomeButton from "../../component/BackToHomeButton";

export default function AccessibilityPage() {
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

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const sections = [
    { id: "commitment", label: "1. Commitment" },
    { id: "standards", label: "2. Standards & Guidelines" },
    { id: "measures", label: "3. Implementation Measures" },
    { id: "feedback", label: "4. Feedback & Assistance" },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
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
              LEGAL & PRIVACY
            </motion.p>

            <motion.h1
              variants={fadeInUp}
              className="font-serif font-light leading-none text-foreground uppercase tracking-wide select-none"
              style={{ fontSize: "min(80px, 9vw)" }}
            >
              Accessibility
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
              Making our craftsmanship accessible to everyone. We are dedicated to ensuring a seamless digital experience for all users.
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
                  className="block text-left text-xs tracking-wider text-foreground/70 hover:text-foreground transition-colors duration-300 font-bold uppercase py-1"
                >
                  {sec.label}
                </button>
              ))}
            </aside>

            {/* Right Column: Policy Content */}
            <div className="space-y-16 max-w-3xl text-foreground/80 font-sans leading-relaxed text-base">

              <section id="commitment" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  1. Our Commitment
                </h2>
                <div className="space-y-4">
                  <p>
                    Only Denims is committed to ensuring digital accessibility for people with disabilities. We are continuously improving the user experience for everyone, and applying the relevant accessibility standards to guarantee that our digital storefront is fully accessible to all visitors.
                  </p>
                  <p>
                    We believe everyone has the right to live with dignity, equality, comfort, and independence, and we design our website features to reflect this belief.
                  </p>
                </div>
              </section>

              <section id="standards" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  2. Standards & Guidelines
                </h2>
                <div className="space-y-4">
                  <p>
                    To assist in making our website accessible, we refer to the Web Content Accessibility Guidelines (WCAG) 2.1 level AA. These guidelines explain how to make web content more accessible for people with a wide range of sensory, physical, cognitive, and learning disabilities.
                  </p>
                </div>
              </section>

              <section id="measures" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  3. Implementation Measures
                </h2>
                <div className="space-y-4">
                  <p>
                    To support accessibility, we have implemented the following features across our codebase:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Alternative Text:</strong> All meaningful image components include descriptive <code>alt</code> tags.
                    </li>
                    <li>
                      <strong>Contrast Ratio:</strong> We design colors and contrast elements carefully to comply with minimum visibility ratios.
                    </li>
                    <li>
                      <strong>Keyboard Navigation:</strong> The website interface can be navigated using only standard keyboard controls (Tab, Enter, Space).
                    </li>
                    <li>
                      <strong>Semantic Structure:</strong> Utilizing appropriate HTML5 tags (e.g. <code>main</code>, <code>nav</code>, <code>section</code>, headings) to facilitate screen readers.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="feedback" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  4. Feedback & Assistance
                </h2>
                <div className="space-y-4">
                  <p>
                    We welcome your feedback on the accessibility of onlydenims.com. If you experience difficulty in accessing any part of our website or require assistance with browsing or completing an order, please do not hesitate to contact us:
                  </p>
                  <div className="mt-4 p-6 border border-foreground/10 bg-foreground/[0.02] rounded-lg space-y-2">
                    <p className="font-bold text-foreground">Accessibility Support Team</p>
                    <p>Email: onlydenims26@gmail.com</p>
                    <p>We aim to respond to accessibility-related feedback within 2 business days.</p>
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
