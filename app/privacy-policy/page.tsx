"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, MapPin, Lock, FileText, UserCheck, Clock, CheckCircle2 } from "lucide-react";
import BackToHomeButton from "../../component/BackToHomeButton";

const sections = [
  { id: "entity", label: "1. Overview & Entity" },
  { id: "marketplace", label: "2. Marketplace Platform" },
  { id: "collection", label: "3. Information We Collect" },
  { id: "usage", label: "4. How We Use Data" },
  { id: "sharing", label: "5. Third-Party Sharing" },
  { id: "marketing", label: "6. Communication Consent" },
  { id: "cookies", label: "7. Cookies & Tracking" },
  { id: "security", label: "8. Security & Retention" },
  { id: "rights", label: "9. Your Rights (DPDPA)" },
  { id: "children", label: "10. Children's Privacy" },
  { id: "grievance", label: "11. Grievance Officer" },
  { id: "updates", label: "12. Policy Updates" },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("entity");
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

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      if (isScrollingRef.current) return;
      if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
        setActiveSection(sections[sections.length - 1].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-foreground transition-colors duration-300 pb-24 relative overflow-x-clip">
      <BackToHomeButton />

      {/* Subtle Background Glows */}
      <div className="absolute top-[8%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#B9965A]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      {/* Hero Header Section */}
      <section className="pt-[120px] md:pt-[130px] pb-12 border-b border-foreground/10 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <motion.div
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.12 } }
            }}
          >
            <motion.p
              variants={fadeInUp}
              className="text-[#B9965A] uppercase tracking-[0.4em] text-[11px] font-bold mb-3 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#B9965A]" />
              LEGAL & PRIVACY COMPLIANCE
            </motion.p>

            <motion.h1
              variants={fadeInUp}
              className="font-serif font-normal text-3xl sm:text-4xl md:text-5xl tracking-wide text-foreground uppercase"
            >
              Privacy Policy
            </motion.h1>

            <motion.div
              variants={fadeInUp}
              className="w-24 h-[1px] bg-foreground/20 my-6 relative"
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#B9965A]" />
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-foreground/60 font-mono"
            >
              <span>OPERATED BY: <strong>ONLY DENIMS APPARELS PVT. LTD.</strong></span>
              <span>•</span>
              <span>LAST UPDATED: MARCH 2026</span>
              <span>•</span>
              <span>EFFECTIVE DATE: MARCH 2026</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Body with Sticky Sidebar */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="grid lg:grid-cols-[260px_1fr] gap-12 lg:gap-16 items-start">

            {/* Left Column: Fixed / Sticky Sections Navigation */}
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
                  <span
                    className={`absolute left-[-25px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#B9965A] transition-all duration-300 ${
                      activeSection === sec.id ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                  />
                  {sec.label}
                </button>
              ))}
            </aside>

            {/* Right Column: Detailed Policy Content */}
            <div className="space-y-12 text-foreground/80 font-sans leading-relaxed text-sm md:text-base">

              {/* 1. Introduction & Overview */}
              <div id="entity" className="space-y-4 pt-2">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground tracking-wide flex items-center gap-2">
                  <span className="text-[#B9965A] font-sans font-bold text-sm">01.</span>
                  Introduction &amp; Legal Entity
                </h2>
                <p>
                  At <strong>ONLY Denims</strong>, operated by <strong>Only Denims Apparels Pvt. Ltd.</strong> (&quot;ONLY Denims&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we value the trust you place in us when sharing your personal information. We are committed to safeguarding your privacy and ensuring your personal data is handled responsibly, transparently, and in strict compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong>, the <strong>Information Technology Act, 2000</strong>, and applicable Indian data protection regulations.
                </p>
                <p>
                  This Privacy Policy describes how we collect, store, process, transfer, and protect your personal information when you visit our website, use our marketplace platform, make purchases, or interact with our services (collectively, the &quot;Platform&quot;).
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 2. Multi-Brand Marketplace Architecture */}
              <div id="marketplace" className="space-y-4 pt-2">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground tracking-wide flex items-center gap-2">
                  <span className="text-[#B9965A] font-sans font-bold text-sm">02.</span>
                  Multi-Brand Marketplace Platform
                </h2>
                <p>
                  ONLY Denims operates as a curated online fashion marketplace that enables consumers to discover and purchase denim and lifestyle merchandise from verified independent brands and partner sellers.
                </p>
                <div className="p-4 sm:p-5 rounded-xl bg-foreground/[0.03] border border-foreground/10 space-y-2">
                  <p className="font-medium text-foreground text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#B9965A]" /> Order Fulfillment Notice:
                  </p>
                  <p className="text-xs sm:text-sm text-foreground/70">
                    When you place an order for merchandise offered by an independent brand or seller on our Platform, essential fulfillment details (including your recipient name, shipping address, and telephone number) are shared with that respective brand and our third-party logistics/shipping partners strictly to process, pack, dispatch, and deliver your parcel.
                  </p>
                </div>
              </div>

              <hr className="border-foreground/10" />

              {/* 3. Information We Collect */}
              <div id="collection" className="space-y-4 pt-2">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground tracking-wide flex items-center gap-2">
                  <span className="text-[#B9965A] font-sans font-bold text-sm">03.</span>
                  Information We Collect
                </h2>
                <p>We collect only the data necessary to provide a smooth, secure, and personalized shopping experience:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] space-y-2">
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#B9965A]" /> Identity &amp; Contact Data
                    </h3>
                    <p className="text-xs text-foreground/70 leading-normal">
                      Full name, mobile phone number, email address, billing address, delivery address, and date of birth or gender (if voluntarily provided).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] space-y-2">
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#B9965A]" /> Transaction &amp; Payment Data
                    </h3>
                    <p className="text-xs text-foreground/70 leading-normal">
                      Order history, purchase details, cart items, invoice records, and masked payment tokens generated by certified PCI-DSS payment gateways.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] space-y-2">
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#B9965A]" /> Device &amp; Technical Data
                    </h3>
                    <p className="text-xs text-foreground/70 leading-normal">
                      IP address, browser type and version, device identifier, operating system, time zone, referral URLs, and interactions with our pages.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] space-y-2">
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#B9965A]" /> Communications &amp; Support
                    </h3>
                    <p className="text-xs text-foreground/70 leading-normal">
                      Records of your customer support requests, email queries, chat tickets, feedback, product reviews, and marketing preferences.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-foreground/60 italic pt-2">
                  * Note: ONLY Denims never collects, stores, or has access to your full credit/debit card numbers, CVVs, or net banking passwords. All payment transactions are encrypted and processed by RBI-licensed payment aggregators.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 4. How We Use Your Information */}
              <div id="usage" className="space-y-4 pt-2">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground tracking-wide flex items-center gap-2">
                  <span className="text-[#B9965A] font-sans font-bold text-sm">04.</span>
                  How We Use Your Information
                </h2>
                <p>Your information is used strictly for legitimate business purposes:</p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                  <li>Processing, managing, and fulfilling your orders, returns, and refunds.</li>
                  <li>Coordinating shipping and live delivery tracking with courier providers.</li>
                  <li>Authenticating accounts and enabling seamless one-click passwordless/OTP login via verified services (such as KwikPass).</li>
                  <li>Delivering transactional updates (order confirmations, dispatch notices, delivery alerts) via SMS, WhatsApp, and Email.</li>
                  <li>Providing responsive customer support and dispute resolution.</li>
                  <li>Detecting, preventing, and mitigating fraudulent transactions, security threats, and abuse of the Platform.</li>
                  <li>Analyzing site performance, product preferences, and user navigation to improve our collections and customer experience.</li>
                </ul>
              </div>

              <hr className="border-foreground/10" />

              {/* 5. Sharing with Third-Party Processors */}
              <div id="sharing" className="space-y-4 pt-2">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground tracking-wide flex items-center gap-2">
                  <span className="text-[#B9965A] font-sans font-bold text-sm">05.</span>
                  Third-Party Service Providers &amp; Integrations
                </h2>
                <p>
                  We do not sell, rent, or trade your personal data. We only share data with vetted third-party service providers bound by strict confidentiality and data protection obligations:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                  <li>
                    <strong>E-Commerce &amp; Cloud Infrastructure:</strong> Hosted on Shopify and secure cloud servers for product catalogs, checkout flows, and database hosting.
                  </li>
                  <li>
                    <strong>Authentication &amp; Checkout Optimization:</strong> KwikPass (for swift phone verification, OTP authentication, and unified checkout).
                  </li>
                  <li>
                    <strong>Payment Gateways:</strong> Certified aggregators (Razorpay, Cashfree, Stripe, UPI providers) for encrypted processing of monetary transactions.
                  </li>
                  <li>
                    <strong>Logistics &amp; Shipping Partners:</strong> Domestic courier aggregators (such as Shiprocket, Bluedart, Delhivery) for packaging pickup, transit, and doorstep delivery.
                  </li>
                  <li>
                    <strong>Legal &amp; Regulatory Authorities:</strong> When required by court order, law enforcement, or applicable Indian statutory regulations.
                  </li>
                </ul>
              </div>

              <hr className="border-foreground/10" />

              {/* 6. Communication Consent & Direct Marketing */}
              <div id="marketing" className="space-y-4 pt-2">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground tracking-wide flex items-center gap-2">
                  <span className="text-[#B9965A] font-sans font-bold text-sm">06.</span>
                  Communication Consent &amp; Marketing Choices
                </h2>
                <p>
                  By submitting your contact number or email during order placement or account registration, you consent to receive transactional and operational communications regarding your purchases, shipment status, and account safety.
                </p>
                <p>
                  If you have opted in to receive promotional updates, new drop previews, or brand discount alerts, you can easily opt out at any time by:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                  <li>Clicking the &quot;Unsubscribe&quot; link in any marketing email.</li>
                  <li>Replying &quot;STOP&quot; to promotional SMS or WhatsApp messages.</li>
                  <li>Emailing our support team at <a href="mailto:onlydenims26@gmail.com" className="text-foreground font-semibold hover:underline">onlydenims26@gmail.com</a>.</li>
                </ul>
                <p className="text-xs text-foreground/60 italic">
                  Please note that opting out of marketing communications will not prevent you from receiving vital transactional updates related to active orders or security alerts.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 7. Cookies & Tracking Technologies */}
              <div id="cookies" className="space-y-4 pt-2">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground tracking-wide flex items-center gap-2">
                  <span className="text-[#B9965A] font-sans font-bold text-sm">07.</span>
                  Cookies &amp; Tracking Technologies
                </h2>
                <p>
                  We use cookies, session tokens, and web analytics tools to remember your cart items, maintain secure login sessions, and understand how visitors interact with our platform.
                </p>
                <p>
                  You have the ability to accept or decline cookies through your browser settings. To learn more about the specific categories of cookies we utilize, please review our comprehensive <a href="/cookie-policy" className="text-[#B9965A] hover:underline font-medium">Cookie Policy</a>.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 8. Data Security & Storage */}
              <div id="security" className="space-y-4 pt-2">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground tracking-wide flex items-center gap-2">
                  <span className="text-[#B9965A] font-sans font-bold text-sm">08.</span>
                  Data Security &amp; Retention
                </h2>
                <p>
                  We implement industry-standard administrative, technical, and physical safeguards—including SSL/TLS 256-bit encryption for data in transit and restricted database access—to protect your personal information against unauthorized disclosure, alteration, loss, or destruction.
                </p>
                <p>
                  We retain personal data only for as long as is necessary to fulfill the purposes outlined in this policy, service active accounts, resolve disputes, or satisfy mandatory accounting, taxation, and regulatory audit periods prescribed under Indian law.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 9. Your Rights Under DPDP Act 2023 */}
              <div id="rights" className="space-y-4 pt-2">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground tracking-wide flex items-center gap-2">
                  <span className="text-[#B9965A] font-sans font-bold text-sm">09.</span>
                  Your Rights (DPDP Act, 2023)
                </h2>
                <p>As a data principal, you hold the following statutory rights regarding your personal information:</p>
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-lg border border-foreground/10 bg-foreground/[0.02]">
                    <strong className="text-foreground text-sm">1. Right to Access &amp; Summary:</strong>
                    <p className="text-xs sm:text-sm text-foreground/70 mt-0.5">Request a summary of personal data held about you and how it is being processed.</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-foreground/10 bg-foreground/[0.02]">
                    <strong className="text-foreground text-sm">2. Right to Correction &amp; Erasure:</strong>
                    <p className="text-xs sm:text-sm text-foreground/70 mt-0.5">Request correction of inaccurate or outdated details, or request deletion of your account and personal data (subject to statutory audit requirements).</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-foreground/10 bg-foreground/[0.02]">
                    <strong className="text-foreground text-sm">3. Right to Withdraw Consent:</strong>
                    <p className="text-xs sm:text-sm text-foreground/70 mt-0.5">Withdraw consent for marketing communications or optional cookies at any time.</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-foreground/10 bg-foreground/[0.02]">
                    <strong className="text-foreground text-sm">4. Right to Grievance Redressal:</strong>
                    <p className="text-xs sm:text-sm text-foreground/70 mt-0.5">Lodge a complaint or inquiry directly with our appointed Grievance Officer.</p>
                  </div>
                </div>
                <p className="text-xs text-foreground/70 pt-1">
                  To exercise any of these rights, please email us with your registered phone number or email address at <a href="mailto:onlydenims26@gmail.com" className="text-foreground font-semibold hover:underline">onlydenims26@gmail.com</a>.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 10. Children's Privacy */}
              <div id="children" className="space-y-4 pt-2">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground tracking-wide flex items-center gap-2">
                  <span className="text-[#B9965A] font-sans font-bold text-sm">10.</span>
                  Children&apos;s Privacy
                </h2>
                <p>
                  Our Platform is intended for individuals aged 18 years or older who are competent to enter into a legally binding contract under the Indian Contract Act, 1872. We do not knowingly collect personal information from minors without parental or legal guardian consent. If you believe a minor has shared personal data with us without appropriate consent, please contact us immediately for prompt deletion.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 11. Grievance Officer & Contact Information */}
              <div id="grievance" className="space-y-5 pt-2">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground tracking-wide flex items-center gap-2">
                  <span className="text-[#B9965A] font-sans font-bold text-sm">11.</span>
                  Grievance Officer &amp; Redressal Mechanism
                </h2>
                <p>
                  In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, the contact details of our designated Grievance Officer are provided below:
                </p>

                <div className="p-6 sm:p-7 rounded-2xl bg-foreground/[0.03] border border-foreground/10 space-y-4">
                  <div className="border-b border-foreground/10 pb-3">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-foreground uppercase tracking-wide">
                      Grievance Redressal Officer
                    </h3>
                    <p className="text-xs text-foreground/60 font-mono">
                      Only Denims Apparels Pvt. Ltd.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="space-y-1">
                      <p className="text-foreground/60 uppercase tracking-wider text-[10px] font-bold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#B9965A]" />
                        Email
                      </p>
                      <a
                        href="mailto:onlydenims26@gmail.com"
                        className="font-medium text-foreground hover:text-[#B9965A] transition-colors"
                      >
                        onlydenims26@gmail.com
                      </a>
                    </div>

                    <div className="space-y-1">
                      <p className="text-foreground/60 uppercase tracking-wider text-[10px] font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#B9965A]" />
                        Turnaround Time
                      </p>
                      <p className="font-medium text-foreground">
                        Acknowledgement: within 48 hours<br />
                        Resolution: within 30 days
                      </p>
                    </div>

                    <div className="sm:col-span-2 space-y-1 pt-1">
                      <p className="text-foreground/60 uppercase tracking-wider text-[10px] font-bold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#B9965A]" />
                        Registered Office Address
                      </p>
                      <p className="text-foreground/80 leading-relaxed">
                        <strong>Only Denims Apparels Pvt. Ltd.</strong><br />
                        Bonanza Industrial Estate, Ashok Chakravarti Road,<br />
                        Ashok Nagar, Kandivali East, Mumbai – 400101,<br />
                        Maharashtra, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-foreground/10" />

              {/* 12. Updates to this Policy */}
              <div id="updates" className="space-y-3 pb-8 pt-2">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground tracking-wide flex items-center gap-2">
                  <span className="text-[#B9965A] font-sans font-bold text-sm">12.</span>
                  Updates to this Privacy Policy
                </h2>
                <p>
                  We may review and update this Privacy Policy periodically to reflect changes in our operational procedures or statutory obligations. Any revisions will be published on this page with an updated &quot;Last Updated&quot; date. We encourage you to review this policy periodically.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
