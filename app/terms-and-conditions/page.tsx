"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import BackToHomeButton from "../../component/BackToHomeButton";

const sections = [
  { id: "about", label: "1. About ONLY Denims" },
  { id: "eligibility", label: "2. Eligibility" },
  { id: "account", label: "3. User Account" },
  { id: "products", label: "4. Products & Brands" },
  { id: "payments", label: "5. Prices & Payments" },
  { id: "orders", label: "6. Orders & Acceptance" },
  { id: "shipping", label: "7. Shipping & Delivery" },
  { id: "returns", label: "8. Returns & Refunds" },
  { id: "cancellations", label: "9. Cancellations" },
  { id: "conduct", label: "10. User Conduct" },
  { id: "ip", label: "11. Intellectual Property" },
  { id: "reviews", label: "12. Reviews & Content" },
  { id: "third-party", label: "13. Third-Party Links" },
  { id: "disclaimers", label: "14. Disclaimers" },
  { id: "liability", label: "15. Limitation of Liability" },
  { id: "indemnity", label: "16. Indemnification" },
  { id: "privacy", label: "17. Privacy & Data" },
  { id: "force-majeure", label: "18. Force Majeure" },
  { id: "termination", label: "19. Termination" },
  { id: "grievance", label: "20. Grievance Redressal" },
  { id: "changes", label: "21. Changes to Terms" },
  { id: "governing-law", label: "22. Governing Law" },
  { id: "contact", label: "23. Contact Us" },
];

export default function TermsAndConditionsPage() {
  const [activeSection, setActiveSection] = useState("about");
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
              <FileText className="w-4 h-4 text-[#B9965A]" />
              LEGAL TERMS OF SERVICE
            </motion.p>

            <motion.h1
              variants={fadeInUp}
              className="font-serif font-normal text-3xl sm:text-4xl md:text-5xl tracking-wide text-foreground uppercase"
            >
              Terms &amp; Conditions
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
              <span>PLATFORM: <strong>ONLY DENIMS</strong></span>
              <span>•</span>
              <span>LAST UPDATED: MARCH 2026</span>
              <span>•</span>
              <span>EFFECTIVE DATE: MARCH 2026</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content with Sticky Sections Navigation */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="grid lg:grid-cols-[280px_1fr] gap-12 lg:gap-16 items-start">

            {/* Left Column: Fixed / Sticky Sections Navigation */}
            <aside className="hidden lg:block sticky top-[110px] self-start border-l border-foreground/10 pl-6 space-y-2.5 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 scrollbar-thin">
              <p className="text-foreground/45 uppercase tracking-[0.2em] text-[10px] font-bold mb-3">
                TERMS SECTIONS
              </p>
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`block text-left text-xs tracking-wider font-bold uppercase py-1 transition-all duration-300 relative group w-full cursor-pointer ${
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

            {/* Right Column: Terms Content */}
            <div className="space-y-10 text-foreground/80 font-sans leading-relaxed text-sm md:text-base">

              {/* Intro */}
              <div className="space-y-4">
                <p>
                  Welcome to <strong>ONLY Denims</strong>. These Terms &amp; Conditions govern your access to and use of the ONLY Denims website, mobile application, and related services (collectively, the <strong>“Platform”</strong>).
                </p>
                <p>
                  By accessing or using ONLY Denims, placing an order, creating an account, or purchasing any product through the Platform, you agree to be bound by these Terms &amp; Conditions. If you do not agree with these terms, please do not use the Platform.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 1. About ONLY Denims */}
              <div id="about" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  1. About ONLY Denims
                </h2>
                <p>
                  ONLY Denims is a multi-brand online fashion marketplace that allows customers to discover and purchase clothing and fashion products from multiple independent brands and sellers through one Platform.
                </p>
                <p>
                  Each brand or seller may have its own dedicated section or store on ONLY Denims. Products displayed on the Platform may therefore be supplied, sold, packaged, and/or fulfilled by the respective brand or seller.
                </p>
                <p>
                  ONLY Denims may provide services such as product discovery, ordering, payment processing, customer support, and coordination of delivery and returns, depending on the product and seller.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 2. Eligibility */}
              <div id="eligibility" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  2. Eligibility
                </h2>
                <p>To use ONLY Denims and place an order, you must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information when required.</li>
                  <li>Be legally capable of entering into a binding agreement.</li>
                  <li>Use the Platform only for lawful purposes.</li>
                  <li>Not use the Platform for fraudulent, abusive, or unauthorized activities.</li>
                </ul>
                <p>
                  If you are under the applicable legal age to enter into contracts, you may use the Platform only with the involvement and permission of your parent or legal guardian.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 3. User Account */}
              <div id="account" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  3. User Account
                </h2>
                <p>Certain features may require you to create an account.</p>
                <p>
                  You are responsible for maintaining the confidentiality of your account information and for all activities carried out through your account.
                </p>
                <p>
                  You agree to immediately inform ONLY Denims if you believe that your account has been accessed or used without authorization.
                </p>
                <p>
                  ONLY Denims reserves the right to suspend or terminate accounts that contain inaccurate information or are used in violation of these Terms &amp; Conditions.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 4. Products and Brand Information */}
              <div id="products" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  4. Products and Brand Information
                </h2>
                <p>ONLY Denims hosts products from multiple brands and sellers.</p>
                <p>
                  Product information, including images, descriptions, sizes, colours, materials, prices, availability, specifications, and other details, is provided by or on behalf of the respective brand or seller.
                </p>
                <p>
                  We make reasonable efforts to ensure that product information displayed on the Platform is accurate. However, minor differences in colour, appearance, packaging, or product presentation may occur due to photography, screen settings, manufacturing variations, or other factors.
                </p>
                <p>The availability of a product may change at any time.</p>
              </div>

              <hr className="border-foreground/10" />

              {/* 5. Prices and Payments */}
              <div id="payments" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  5. Prices and Payments
                </h2>
                <p>
                  All prices displayed on the Platform are determined by the respective brand or seller or in accordance with marketplace agreements. Prices are shown in Indian Rupees (INR) and are inclusive of applicable taxes, unless stated otherwise.
                </p>
                <p>
                  Delivery charges, convenience fees, or other applicable costs may be charged separately and will be displayed during checkout before an order is placed.
                </p>
                <p>
                  Payment methods may include credit cards, debit cards, UPI, net banking, digital wallets, Cash on Delivery (if available), or other supported options.
                </p>
                <p>
                  Payments made through the Platform are processed through secure third-party payment gateways. ONLY Denims does not store sensitive payment information such as full card numbers or banking passwords.
                </p>
                <p>
                  In the event of a technical pricing error, ONLY Denims and the respective brand or seller reserve the right to cancel the order and issue a full refund.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 6. Orders and Acceptance */}
              <div id="orders" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  6. Orders and Acceptance
                </h2>
                <p>Placing an order constitutes an offer to purchase the selected product(s).</p>
                <p>
                  Order confirmation received via email, SMS, or displayed on the Platform does not indicate final acceptance of the order. Order acceptance occurs when the product is packed, dispatched, or confirmed by the respective brand, seller, or ONLY Denims.
                </p>
                <p>ONLY Denims or the seller may decline or cancel an order in circumstances including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Unavailability of stock.</li>
                  <li>Incomplete, inaccurate, or unverifiable delivery details.</li>
                  <li>Pricing or product description errors.</li>
                  <li>Suspected fraud or unauthorized transactions.</li>
                  <li>Logistical limitations preventing delivery.</li>
                </ul>
                <p>If an order is cancelled after payment has been completed, a full refund will be processed.</p>
              </div>

              <hr className="border-foreground/10" />

              {/* 7. Shipping and Delivery */}
              <div id="shipping" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  7. Shipping and Delivery
                </h2>
                <p>
                  Products may be shipped directly by the respective brand or seller, or through courier partners coordinated by ONLY Denims.
                </p>
                <p>
                  Estimated delivery times displayed on the Platform are indicative only and may vary based on delivery destination, courier operations, weather conditions, holidays, or events beyond reasonable control.
                </p>
                <p>
                  Risk of loss and title for items purchased pass to the customer upon delivery by the courier partner.
                </p>
                <p>
                  Customers are responsible for providing correct contact and delivery information. ONLY Denims and the seller shall not be responsible for failed deliveries resulting from inaccurate customer information.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 8. Returns, Exchanges, and Refunds */}
              <div id="returns" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  8. Returns, Exchanges, and Refunds
                </h2>
                <p>
                  Return and exchange policies may vary depending on the product, brand, or seller. The return eligibility and terms applicable to each product will be displayed on the product page or provided in our Return Policy.
                </p>
                <p>To qualify for a return or exchange:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The product must be unused, unwashed, unaltered, and undamaged.</li>
                  <li>The original tags, packaging, brand boxes, labels, and accessories must be intact.</li>
                  <li>The return request must be submitted within the specified return window.</li>
                </ul>
                <p>Certain items may be designated as non-returnable for hygiene or safety reasons.</p>
                <p>
                  Refunds are processed after the returned item passes quality inspection by the brand, seller, or fulfillment centre. Approved refunds will be credited to the original payment method or issued as store credit, depending on the transaction type and return policy.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 9. Order Cancellations */}
              <div id="cancellations" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  9. Order Cancellations
                </h2>
                <p>
                  Customers may request cancellation of an order before it has been processed or dispatched by the brand or seller.
                </p>
                <p>
                  Once an order has been shipped, it cannot be cancelled directly and must be handled through the return process after delivery, if eligible.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 10. User Conduct */}
              <div id="conduct" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  10. User Conduct
                </h2>
                <p>When using ONLY Denims, you agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violate any applicable local, state, national, or international laws.</li>
                  <li>Attempt unauthorized access to any part of the Platform or connected systems.</li>
                  <li>Interfere with the normal operation, security, or integrity of the Platform.</li>
                  <li>Use automated tools, bots, crawlers, or scrapers to extract data without written consent.</li>
                  <li>Post misleading, offensive, defamatory, infringing, or unlawful content.</li>
                  <li>Engage in abusive behaviour toward customer support, sellers, or other users.</li>
                </ul>
              </div>

              <hr className="border-foreground/10" />

              {/* 11. Intellectual Property */}
              <div id="ip" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  11. Intellectual Property
                </h2>
                <p>
                  All content created and published by ONLY Denims, including website designs, logos, software, text, graphics, icons, images, and user interfaces, is the property of ONLY Denims or its licensors and is protected under intellectual property laws.
                </p>
                <p>
                  Brand names, logos, trademarks, and product designs belonging to individual brands and sellers remain the property of their respective owners.
                </p>
                <p>
                  Users may not copy, reproduce, distribute, modify, sell, or exploit any content from the Platform without prior written permission.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 12. Reviews and User Content */}
              <div id="reviews" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  12. Reviews and User Content
                </h2>
                <p>
                  Customers may be permitted to submit reviews, comments, ratings, and photographs related to products.
                </p>
                <p>By submitting content, you confirm that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You own or have the right to provide the content.</li>
                  <li>The content is accurate and reflects your genuine experience.</li>
                  <li>The content does not infringe the rights of third parties.</li>
                </ul>
                <p>
                  ONLY Denims reserves the right to moderate, edit, or remove content that violates these Terms &amp; Conditions.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 13. Third-Party Links */}
              <div id="third-party" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  13. Third-Party Links
                </h2>
                <p>
                  The Platform may contain links to third-party websites or services. ONLY Denims does not control and is not responsible for the content, policies, or practices of third-party websites.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 14. Disclaimers */}
              <div id="disclaimers" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  14. Disclaimers
                </h2>
                <p>
                  The Platform and all products and services provided through it are offered on an <strong>“as is”</strong> and <strong>“as available”</strong> basis.
                </p>
                <p>
                  To the fullest extent permitted by law, ONLY Denims disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 15. Limitation of Liability */}
              <div id="liability" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  15. Limitation of Liability
                </h2>
                <p>
                  As a multi-brand marketplace, ONLY Denims facilitates transactions between customers and independent brands and sellers.
                </p>
                <p>
                  To the maximum extent permitted by applicable law, ONLY Denims shall not be liable for indirect, incidental, special, punitive, or consequential damages.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 16. Indemnification */}
              <div id="indemnity" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  16. Indemnification
                </h2>
                <p>
                  You agree to indemnify and hold harmless ONLY Denims, its affiliates, directors, officers, employees, agents, and sellers from claims, damages, liabilities, costs, or expenses arising from your violation of these Terms or misuse of the Platform.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 17. Privacy */}
              <div id="privacy" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  17. Privacy
                </h2>
                <p>
                  Your privacy is important to us. Use of personal data is governed by our <a href="/privacy-policy" className="text-[#B9965A] hover:underline font-medium">Privacy Policy</a>.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 18. Force Majeure */}
              <div id="force-majeure" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  18. Force Majeure
                </h2>
                <p>
                  ONLY Denims and sellers shall not be liable for failure or delay in fulfilling obligations due to events beyond reasonable control, including natural disasters, acts of government, strikes, or transport disruptions.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 19. Termination */}
              <div id="termination" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  19. Termination
                </h2>
                <p>
                  ONLY Denims may suspend or terminate your access to the Platform if you breach these Terms &amp; Conditions or engage in unauthorized activity.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 20. Grievance Redressal */}
              <div id="grievance" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  20. Grievance Redressal
                </h2>
                <p>
                  ONLY Denims maintains an appropriate customer grievance mechanism as required under applicable law.
                </p>
                <p>For questions, complaints, returns, order issues, or other concerns, customers may contact:</p>
                <p className="font-medium text-foreground">
                  📧 Email: <a href="mailto:onlydenims26@gmail.com" className="text-foreground hover:underline">onlydenims26@gmail.com</a>
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 21. Changes to These Terms */}
              <div id="changes" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  21. Changes to These Terms
                </h2>
                <p>
                  ONLY Denims may update these Terms &amp; Conditions from time to time to reflect changes to the Platform, business practices, or applicable laws.
                </p>
                <p>
                  The updated version will be published on this page with the revised <strong>“Last Updated”</strong> date.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 22. Governing Law */}
              <div id="governing-law" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  22. Governing Law
                </h2>
                <p>
                  These Terms &amp; Conditions shall be governed by and interpreted in accordance with the laws of India.
                </p>
                <p>
                  Any disputes shall be subject to the jurisdiction of the courts having appropriate jurisdiction in India, subject to applicable consumer protection laws.
                </p>
              </div>

              <hr className="border-foreground/10" />

              {/* 23. Contact Us */}
              <div id="contact" className="space-y-4 pt-2">
                <h2 className="text-lg md:text-xl font-medium text-foreground">
                  23. Contact Us
                </h2>
                <p>If you have questions regarding these Terms &amp; Conditions, please contact:</p>
                <p className="font-medium text-foreground">
                  📧 Email: <a href="mailto:onlydenims26@gmail.com" className="text-foreground hover:underline">onlydenims26@gmail.com</a>
                </p>
                <p className="font-serif italic text-foreground pt-4">
                  Thank you for shopping with ONLY Denims.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
