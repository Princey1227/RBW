"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useToast } from "../context/ToastContext";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { showToast } = useToast();

  if (
    pathname === "/" ||
    pathname?.startsWith("/shorts") ||
    pathname?.startsWith("/stores/rbw") ||
    pathname?.startsWith("/experience-center")
  ) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      showToast({
        title: "Invalid Email",
        message: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post("/api/newsletter/subscribe", { email });
      if (res.data?.success) {
        setIsSubscribed(true);
        showToast({
          title: "Subscribed Successfully!",
          message: "Thank you for subscribing to ONLY DENIMS updates.",
          type: "success",
        });
        setEmail("");
      }
    } catch (err: any) {
      showToast({
        title: "Subscription Failed",
        message: err.response?.data?.error || "Failed to submit subscription.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-[#FAF8F5] text-[#1C1917] border-t border-[#E8E3DA] pt-14 pb-8 select-none transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Main Grid: 2 Columns on Mobile, 5 Columns on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-8 pb-12">

          {/* Column 1: Brand Info (Spans 2 columns on mobile) */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1 flex flex-col justify-between">
            <div>
              {/* Brand Logo Image */}
              <Link href="/" prefetch={false} className="inline-block relative w-[240px] sm:w-[200px] lg:w-[170px] h-[36px] sm:h-[42px] lg:h-[48px] my-1">
                <Image
                  src="/OnlyDenims_cropped.png"
                  alt="ONLY DENIMS"
                  fill
                  sizes="320px"
                  className="object-contain object-left select-none brightness-0 scale-110 origin-left"
                />
              </Link>
              <p className="mt-3 text-xs sm:text-[13px] text-[#6B655F] leading-relaxed max-w-[240px]">
                A platform for clothing brands to launch, grow and succeed.
              </p>
            </div>

            {/* Social Icons: Instagram, Facebook, YouTube */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-[#E0D9CE] bg-white flex items-center justify-center text-[#1C1917] hover:bg-[#1C1917] hover:text-white hover:border-[#1C1917] transition-all duration-300 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-[#E0D9CE] bg-white flex items-center justify-center text-[#1C1917] hover:bg-[#1C1917] hover:text-white hover:border-[#1C1917] transition-all duration-300 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full border border-[#E0D9CE] bg-white flex items-center justify-center text-[#1C1917] hover:bg-[#1C1917] hover:text-white hover:border-[#1C1917] transition-all duration-300 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: PLATFORM */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.22em] text-[#1C1917] uppercase mb-4 sm:mb-5">
              PLATFORM
            </h3>
            <ul className="space-y-3 text-xs text-[#57534E]">
              <li>
                <Link href="/for-brands" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
                  For Brands
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/resources" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.22em] text-[#1C1917] uppercase mb-4 sm:mb-5">
              COMPANY
            </h3>
            <ul className="space-y-3 text-xs text-[#57534E]">
              <li>
                <Link href="/about" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/journey" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
                  Our Journey
                </Link>
              </li>
              <li>
                <Link href="/blog" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: HELP */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.22em] text-[#1C1917] uppercase mb-4 sm:mb-5">
              HELP
            </h3>
            <ul className="space-y-3 text-xs text-[#57534E]">
              <li>
                <Link href="/faq" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link href="/return-policy" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
                  Returns &amp; Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: SUBSCRIBE (Spans 2 columns on mobile) */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h3 className="text-xs font-bold tracking-[0.22em] text-[#1C1917] uppercase mb-2">
              EMAIL SUBSCRIBE
            </h3>
            <p className="text-xs text-[#6B655F] leading-relaxed mb-4">
              Get updates on new brands and collections.
            </p>
            {isSubscribed ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                <span className="text-base font-bold">✓</span>
                <span>Thank you! You are subscribed to updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                  className="w-full bg-white border border-[#E2DDD5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] placeholder-[#A8A29E] outline-none focus:border-[#1C1917] transition-all shadow-sm disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1C1917] hover:bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.18em] uppercase transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "..." : "SUBSCRIBE"}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Copyright & Policy Links Bar */}
        <div className="pt-6 border-t border-[#E8E3DA] flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-[#6B655F]">
          <div className="flex items-center gap-4 sm:gap-6 font-medium order-1 md:order-2">
            <Link href="/terms-and-conditions" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
              Terms &amp; Conditions
            </Link>
            <span className="text-[#D6D0C4]">|</span>
            <Link href="/privacy-policy" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
              Privacy Policy
            </Link>
            <span className="text-[#D6D0C4]">|</span>
            <Link href="/return-policy" prefetch={false} className="hover:text-[#1C1917] transition-colors cursor-pointer">
              Returns &amp; Exchange
            </Link>
          </div>
          <div className="font-medium text-[11px] text-[#6B655F] order-2 md:order-1">
            &copy; 2026 ONLY DENIMS. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
