"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";

interface CheckoutTransitionProps {
  isVisible: boolean;
  message?: string;
}

export function CheckoutTransition({
  isVisible,
  message = "ENTERING SECURE 1-CLICK CHECKOUT...",
}: CheckoutTransitionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1], // Smooth luxury ease-out cubic
          }}
          className="fixed inset-0 z-[999999] bg-[#0A0A0A] flex flex-col items-center justify-center text-white px-6 text-center select-none"
        >
          {/* Ambient Glow */}
          <div className="absolute w-80 h-80 rounded-full bg-[#C59B27]/10 blur-3xl pointer-events-none" />

          {/* Secure Seal Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
            className="relative w-18 h-18 rounded-full border border-[#C59B27]/40 bg-[#C59B27]/10 flex items-center justify-center mb-6 shadow-[0_0_35px_rgba(197,155,39,0.25)]"
          >
            <Lock className="w-7 h-7 text-[#C59B27]" />
          </motion.div>

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.35, ease: "easeOut" }}
          >
            <h3 className="text-sm uppercase font-mono tracking-[0.3em] text-[#C59B27] font-bold mb-2">
              ONLY DENIMS ATELIER
            </h3>
            <p className="text-xs font-mono tracking-widest text-zinc-400 mb-6">
              {message}
            </p>
          </motion.div>

          {/* Luxury Gold Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.3 }}
            className="w-56 h-0.5 bg-zinc-800 rounded-full overflow-hidden relative mb-5"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut",
              }}
              className="w-full h-full bg-gradient-to-r from-transparent via-[#C59B27] to-transparent"
            />
          </motion.div>

          {/* Security Subtext */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-zinc-500"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-BIT ENCRYPTED GATEWAY</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
