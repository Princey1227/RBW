"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  ShoppingBag,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Layers,
} from "lucide-react";

interface TemplateSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  accentColor: string;
  itemTitle?: string;
  actionType?: "cart" | "buy_now" | "info";
}

export default function TemplateSimulationModal({
  isOpen,
  onClose,
  brandName,
  accentColor,
  itemTitle,
  actionType = "buy_now",
}: TemplateSimulationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FAF8F5] text-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop accent */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-200/60 hover:bg-stone-300 text-stone-700 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase text-white shadow-2xs"
            style={{ backgroundColor: accentColor }}
          >
            <Sparkles className="w-3 h-3 text-white" />
            <span>MBO STOREFRONT DEMO SIMULATION</span>
          </span>
        </div>

        <h3
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#1C1917] leading-tight"
        >
          {brandName || "YOUR BRAND"} Storefront Ready
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans font-medium">
          {actionType === "cart" || actionType === "buy_now" ? (
            <>
              You just simulated purchasing{" "}
              <strong className="text-stone-900 font-bold">{itemTitle || "a custom denim garment"}</strong>. In your live branded store on OnlyDenims, this immediately triggers:
            </>
          ) : (
            <>
              This is a live preview of how your brand outlet operates on OnlyDenims:
            </>
          )}
        </p>

        {/* Feature Checkpoints */}
        <div className="mt-5 space-y-3 bg-white/70 rounded-2xl p-4 border border-stone-200/60 shadow-2xs">
          <div className="flex items-start gap-3">
            <Zap className="w-4 h-4 text-[#B9965A] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-stone-900 block">Gokwik 1-Click Fast Checkout</span>
              <span className="text-stone-500">Auto-filled addresses, UPI, Credit/Debit, and verified COD with 0 friction.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Layers className="w-4 h-4 text-[#B9965A] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-stone-900 block">Custom Brand Identity &amp; Woven Labels</span>
              <span className="text-stone-500">Your logo, leather waistband patches, wash tags, and packaging boxes.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-4 h-4 text-[#B9965A] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-stone-900 block">Turnkey Mumbai Warehouse Fulfilment</span>
              <span className="text-stone-500">Zero inventory headache. We stock, pick, pack, and ship nationwide in 2–4 days.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#B9965A] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-stone-900 block">Direct Mill Manufacturing</span>
              <span className="text-stone-500">Low minimum orders, authentic selvedge weaving, and world-class washes.</span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/for-brands"
            onClick={onClose}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-xl text-center text-xs font-bold tracking-[0.16em] uppercase text-white shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            <span>LAUNCH YOUR BRAND STORE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3.5 px-5 rounded-xl text-center text-xs font-bold tracking-wider uppercase text-stone-700 bg-stone-200/80 hover:bg-stone-300 transition-all cursor-pointer"
          >
            Keep Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
