"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Search,
  Mail,
  MessageSquare,
  Sparkles,
  Store,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackToHomeButton from "../../component/BackToHomeButton";

const FAQ_CATEGORIES = [
  {
    category: "For Brands & Sellers",
    icon: Store,
    questions: [
      {
        q: "How can I open my brand store on ONLY DENIMS?",
        a: "To open your store on ONLY DENIMS, get in touch with our team via our Contact page or click 'Contact Team to Open Store'. Our onboarding team will review your clothing brand, assist with store setup, and guide you through the process.",
      },
      {
        q: "How much does it cost to join ONLY DENIMS?",
        a: "Joining ONLY DENIMS is straightforward and transparent. Contact our partnership team for complete details on platform plans, commission structures, and brand growth benefits tailored to your catalog size.",
      },
      {
        q: "What do I need to get my brand listed?",
        a: "You need an active apparel brand, high-resolution product photos, accurate sizing charts, inventory details, and valid GST/business registration credentials.",
      },
      {
        q: "How do I add my products and collections?",
        a: "Once your store is approved, our onboarding team provides access to your dedicated seller dashboard where you can upload product imagery, descriptions, variants, and manage inventory seamlessly.",
      },
      {
        q: "How are orders and payments handled?",
        a: "Customer orders are routed to your dashboard instantly. Payments are processed securely via encrypted payment gateways and transferred directly to your bank account on a regular payout schedule.",
      },
    ],
  },
  {
    category: "For Shoppers & Orders",
    icon: ShoppingBag,
    questions: [
      {
        q: "How do I buy from a brand?",
        a: "Simply browse our featured brand stores (such as RBW), explore their clothing collections, select your fit/size, and check out securely through our unified cart system.",
      },
      {
        q: "Can I return or exchange an order?",
        a: "Yes! We accept returns and exchanges for unworn, unwashed items in original packaging within 30 days of delivery. Check our Return Policy page for details.",
      },
      {
        q: "How does shipping work?",
        a: "Orders ship via reliable courier partners across India. You will receive real-time SMS & email tracking updates as soon as your package leaves our fulfillment center.",
      },
      {
        q: "Are payments secure?",
        a: "Absolutely. All transactions are protected using industry-standard 256-bit SSL encryption. We accept UPI, major Credit/Debit Cards, Net Banking, and Wallets.",
      },
      {
        q: "How can I contact a brand about my order?",
        a: "You can reach out directly to customer support via email at onlydenims26@gmail.com or through our Contact page. Please mention your order number for fast assistance.",
      },
      {
        q: "How long does shipping take?",
        a: "Standard domestic delivery across India takes 3 to 5 business days. Express shipping option delivers within 1 to 2 business days.",
      },
    ],
  },
  {
    category: "Security & Guarantees",
    icon: ShieldCheck,
    questions: [
      {
        q: "Is ONLY DENIMS a verified platform?",
        a: "Yes. ONLY DENIMS is an authentic Indian multi-brand denim ecosystem. Every seller onboarded undergoes strict quality and manufacturing audits.",
      },
      {
        q: "What fabric quality can I expect?",
        a: "Our flagship brands (like RBW) use authentic selvedge twills sourced directly from top Indian textile mills, spun on vintage shuttle looms for maximum durability.",
      },
    ],
  },
];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const currentQuestions = FAQ_CATEGORIES[activeTab].questions.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#1C1917] pt-[120px] md:pt-[130px] pb-24 px-4 sm:px-8 select-none transition-colors duration-300">
      <BackToHomeButton />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1C1917] border border-[#B9965A]/40 text-white text-[10px] font-bold tracking-[0.2em] uppercase shadow-xs">
            <Sparkles className="w-3 h-3 text-[#B9965A]" />
            <span>HELP &amp; SUPPORT CENTER</span>
          </div>

          <h1
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1C1917]"
          >
            Frequently Asked Questions
          </h1>

          <p className="text-xs sm:text-sm text-[#78716C] max-w-xl mx-auto leading-relaxed">
            Find answers to common questions about opening a brand store, ordering collections, shipping, and returns.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto pt-2">
            <Search className="w-4 h-4 text-[#A8A29E] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers (e.g. shipping, store setup, returns)..."
              className="w-full bg-white border border-[#E2DDD5] focus:border-[#B9965A] focus:ring-1 focus:ring-[#B9965A] rounded-2xl pl-11 pr-4 py-3.5 text-xs text-[#1C1917] placeholder-[#A8A29E] outline-hidden shadow-xs transition-all"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {FAQ_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={cat.category}
                onClick={() => {
                  setActiveTab(idx);
                  setOpenIndex(0);
                }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1C1917] text-white shadow-md border border-transparent"
                    : "bg-white border border-[#E8E3DA] text-[#78716C] hover:text-[#1C1917]"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-[#B9965A]" : "text-[#78716C]"
                  }`}
                />
                <span>{cat.category}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 pt-2">
          {currentQuestions.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E8E3DA] rounded-2xl text-xs text-[#78716C]">
              No questions found matching &quot;{searchQuery}&quot;. Try searching another keyword or contact support.
            </div>
          ) : (
            currentQuestions.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-all duration-200 ${
                    isOpen
                      ? "border-[#B9965A]/60 ring-1 ring-[#B9965A]/20"
                      : "border-[#E8E3DA]"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-[#1C1917] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#78716C] shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#B9965A]" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-4 pt-1 text-xs text-[#6B655F] leading-relaxed border-t border-[#F0EBE1] bg-[#FDFBF7]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Support Banner */}
        <div className="p-6 sm:p-8 bg-[#F4EFE6] border border-[#E8E3DA] rounded-3xl text-center space-y-3 mt-8">
          <h3
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            className="text-xl sm:text-2xl font-bold text-[#1C1917]"
          >
            Still have questions?
          </h3>
          <p className="text-xs text-[#78716C] max-w-md mx-auto">
            Our support team is available to assist you with orders, sizing, or launching your clothing brand.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/contact"
              prefetch={false}
              className="inline-flex items-center gap-2 bg-[#1C1917] hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#B9965A]" />
              <span>CONTACT SUPPORT</span>
            </Link>
            <a
              href="mailto:onlydenims26@gmail.com"
              className="inline-flex items-center gap-2 bg-white border border-[#E8E3DA] text-[#1C1917] px-6 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-xs hover:bg-stone-50"
            >
              <Mail className="w-3.5 h-3.5 text-[#B9965A]" />
              <span>EMAIL US</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
