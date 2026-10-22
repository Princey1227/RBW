"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader } from "lucide-react";

interface AuthSuccessProps {
  isSuccess: boolean;
  title?: string;
  message?: string;
}

export default function AuthSuccess({
  isSuccess,
  title = "WELCOME BACK",
  message = "Authentication successful. Elevating your shopping journey...",
}: AuthSuccessProps) {
  return (
    <AnimatePresence>
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center backdrop-blur-md"
        >
          {/* Animated Glow in the background */}
          <div className="absolute w-[300px] h-[300px] rounded-full bg-[#d7a33c]/10 blur-[100px] pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -15 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-[#0b0f16] border border-[#d7a33c]/30 p-10 rounded-lg flex flex-col items-center max-w-sm text-center relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(215,163,60,0.05)]"
          >
            {/* Denim stitching visual pattern overlay */}
            <div className="absolute inset-0 opacity-5 border border-dashed border-[#d7a33c] m-1 pointer-events-none rounded-md" />

            {/* Glowing success badge with rotating stitch ring */}
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              {/* Rotating stitching circle border */}
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#d7a33c"
                  strokeWidth="1.5"
                  strokeDasharray="6,4"
                  className="opacity-70"
                />
              </motion.svg>

              {/* Pulsing inner glow */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-16 h-16 bg-[#d7a33c]/10 rounded-full blur-md"
              />

              {/* Icon Container */}
              <div className="w-14 h-14 bg-[#d7a33c] text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(215,163,60,0.4)] relative z-10">
                <Check className="w-7 h-7 stroke-[3px]" />
              </div>
            </div>

            <h3 className="text-white text-lg font-serif tracking-[0.3em] uppercase mb-3 text-[#d7a33c]">
              {title}
            </h3>
            
            <p className="text-white/70 text-xs tracking-widest leading-relaxed mb-6 font-medium">
              {message}
            </p>

            {/* Micro loading bar */}
            <div className="w-24 h-[1px] bg-white/10 relative overflow-hidden">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 w-12 bg-[#d7a33c]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

