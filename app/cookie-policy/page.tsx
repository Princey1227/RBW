"use client";

import React from "react";
import { motion } from "framer-motion";
import BackToHomeButton from "../../component/BackToHomeButton";

export default function CookiePolicyPage() {
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
    { id: "overview", label: "1. Overview" },
    { id: "what-are-cookies", label: "2. What Are Cookies" },
    { id: "how-we-use-them", label: "3. How We Use Cookies" },
    { id: "cookie-types", label: "4. Types of Cookies Used" },
    { id: "managing-cookies", label: "5. Managing Cookies" },
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
              Cookie Policy
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
              How we use tracking technology. This policy details how and why cookies and similar mechanisms are utilized on onlydenims.com.
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

              <section id="overview" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  1. Overview
                </h2>
                <div className="space-y-4">
                  <p>
                    Only Denims uses cookies and other tracing technologies on our website (onlydenims.com) to improve user experience, store shopping cart status, analyze web traffic, and coordinate marketing actions.
                  </p>
                  <p>
                    By continuing to browse our website, you agree to the storing of cookies on your device.
                  </p>
                </div>
              </section>

              <section id="what-are-cookies" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  2. What Are Cookies
                </h2>
                <div className="space-y-4">
                  <p>
                    A cookie is a small text file containing a string of alphanumeric characters that is sent to and stored on your browser or device when you visit a webpage.
                  </p>
                  <p>
                    Cookies allow the website to recognize your device and remember critical information, such as your user preferences, login session state, and items in your shopping bag.
                  </p>
                </div>
              </section>

              <section id="how-we-use-them" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  3. How We Use Cookies
                </h2>
                <div className="space-y-4">
                  <p>
                    We use cookies to enhance and personalize your shopping experience. Specifically:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>To remember the items you add to your shopping bag or wishlist as you navigate between pages.</li>
                    <li>To authenticate your login session when you log into your Only Denims account.</li>
                    <li>To remember your theme preference (light vs. dark theme).</li>
                    <li>To analyze how our site is used, allowing us to perform performance optimization.</li>
                  </ul>
                </div>
              </section>

              <section id="cookie-types" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  4. Types of Cookies Used
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-2">Essential Cookies</h3>
                    <p>
                      These cookies are strictly necessary to enable core site functionality (such as secure checkout, item retention in the cart, and account logins). The site cannot function properly without them.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-2">Analytics & Performance Cookies</h3>
                    <p>
                      These cookies collect information about how visitors interact with our website, such as which pages are visited most frequently. This data is aggregated and anonymous, used strictly to improve website performance.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-2">Functional Cookies</h3>
                    <p>
                      These cookies allow our website to remember choices you make (such as your regional preferences, currency, or theme settings) to provide a more personalized experience.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-2">Marketing Cookies</h3>
                    <p>
                      These cookies are used to track visitor activity across websites. They allow advertising platforms (e.g. Google, Meta) to deliver targeted ads relevant to your interests.
                    </p>
                  </div>
                </div>
              </section>

              <section id="managing-cookies" className="scroll-mt-[180px]">
                <h2 className="text-xl md:text-2xl font-serif font-light uppercase tracking-wider text-foreground mb-6">
                  5. Managing Cookies
                </h2>
                <div className="space-y-4">
                  <p>
                    Most web browsers automatically accept cookies, but you can modify your browser setting to decline cookies if you prefer.
                  </p>
                  <p>
                    Instructions for managing cookies on popular browsers:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><span className="font-bold">Google Chrome:</span> Settings &gt; Privacy and security &gt; Third-party cookies</li>
                    <li><span className="font-bold">Apple Safari:</span> Settings &gt; Privacy &gt; Block all cookies</li>
                    <li><span className="font-bold">Mozilla Firefox:</span> Settings &gt; Privacy & Security &gt; Cookies and Site Data</li>
                  </ul>
                  <p className="text-amber-600 dark:text-amber-500 font-medium">
                    Please note: Disabling cookies entirely may prevent you from placing orders or utilizing key elements of Only Denims, such as preserving cart items.
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
