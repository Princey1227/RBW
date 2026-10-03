"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Sparkles, CheckCircle2, Mail, Bell, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

export interface BrandModalInfo {
  name: string;
  tagline: string;
  image: string;
  fontStyle?: string;
}

interface BrandWaitlistModalProps {
  brand: BrandModalInfo | null;
  onClose: () => void;
}

export default function BrandWaitlistModal({
  brand,
  onClose,
}: BrandWaitlistModalProps) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast({
        title: "Invalid Email",
        message: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post("/api/newsletter/subscribe", {
        email,
        brand: brand?.name,
      });

      if (res.data?.success) {
        setSuccess(true);
        showToast({
          title: "You're on the Waitlist!",
          message: `We'll notify you as soon as ${brand?.name} drops.`,
          type: "success",
        });
        setTimeout(() => {
          handleClose();
        }, 2200);
      }
    } catch (err: any) {
      showToast({
        title: "Submission Failed",
        message:
          err.response?.data?.error ||
          "Unable to join waitlist right now. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {brand && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 selection:bg-[#B9965A] selection:text-black">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="relative w-full max-w-md bg-stone-950/95 border border-[#B9965A]/40 rounded-[24px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(185,150,90,0.2)] z-10 text-white"
          >
            {/* Top ambient gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#B9965A] to-transparent z-20" />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-black/70 hover:bg-white/20 border border-white/10 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Brand Header Banner */}
            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src={brand.image}
                alt={brand.name}
                fill
                sizes="450px"
                className="object-cover object-center brightness-75 filter"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />

              {/* Status Badge */}
              <div className="absolute top-3.5 left-4 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B9965A]/20 border border-[#B9965A]/50 backdrop-blur-md text-[#DFCFA8] text-[8.5px] font-black tracking-widest uppercase shadow-xs">
                  <Sparkles className="w-3 h-3 text-[#B9965A]" />
                  EXCLUSIVE EARLY ACCESS
                </span>
              </div>

              {/* Brand Titles overlaid on image */}
              <div className="absolute bottom-3 left-6 right-6 z-20">
                <h3
                  className={`uppercase text-white drop-shadow-lg ${
                    brand.fontStyle || "font-serif text-2xl font-bold"
                  }`}
                >
                  {brand.name}
                </h3>
                <p className="text-[10px] tracking-[0.18em] font-bold text-[#DFCFA8] uppercase mt-0.5 drop-shadow-md">
                  {brand.tagline}
                </p>
              </div>
            </div>

            {/* Modal Body & Form */}
            <div className="p-6 pt-3">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 flex flex-col items-center text-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold tracking-wide text-white">
                    You&apos;re On The List!
                  </h4>
                  <p className="text-xs text-stone-300 max-w-xs leading-relaxed">
                    We will notify you at{" "}
                    <span className="font-semibold text-[#DFCFA8]">{email}</span>{" "}
                    the moment{" "}
                    <span className="font-bold text-white">{brand.name}</span> goes
                    live.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-stone-300 leading-relaxed text-center">
                    Join the private waitlist to receive priority access, launch
                    perks, and instant notification when this collection drops.
                  </p>

                  <div className="space-y-2">
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-[#B9965A]/80 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full bg-stone-900/90 border border-stone-700/80 focus:border-[#B9965A] focus:ring-1 focus:ring-[#B9965A] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-stone-500 transition-all outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#D4B16A] via-[#B9965A] to-[#8C6B2F] hover:from-[#DFBF7A] hover:to-[#9B7A3D] text-black font-extrabold text-xs tracking-[0.18em] uppercase py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>JOINING WAITLIST...</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 text-black" />
                        <span>GET NOTIFIED ON LAUNCH</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-stone-500 text-center tracking-wide">
                    No spam, ever. Unsubscribe at any time.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
