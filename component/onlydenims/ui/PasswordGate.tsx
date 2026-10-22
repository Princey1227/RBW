"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, KeyRound, Eye, EyeOff, ShieldAlert, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

const VALID_PASSWORD = "punitdenimking";

export default function PasswordGate() {
  const [mounted, setMounted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true); // default true to avoid SSR mismatch, set properly in useEffect
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const isQueryUnlocked = typeof window !== "undefined" && (window.location.search.includes("preview=true") || window.location.search.includes("unlock=true"));
      const storedUnlocked = localStorage.getItem("onlydenims_gate_unlocked");
      if (storedUnlocked === "true" || isQueryUnlocked) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }
    } catch {
      setIsUnlocked(false);
    }
  }, []);

  // Prevent background scrolling when locked
  useEffect(() => {
    if (mounted && !isUnlocked) {
      document.body.style.overflow = "hidden";
    } else if (mounted && isUnlocked) {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted, isUnlocked]);

  if (!mounted || isUnlocked) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = password.trim().toLowerCase();

    if (cleanPassword === VALID_PASSWORD) {
      setError("");
      setIsSuccess(true);
      setTimeout(() => {
        try {
          localStorage.setItem("onlydenims_gate_unlocked", "true");
        } catch { }
        setIsUnlocked(true);
      }, 700);
    } else {
      setError("Access Denied: Incorrect Password");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <AnimatePresence>
      {!isUnlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 selection:bg-amber-500 selection:text-black overflow-y-auto"
        >
          {/* Ambient Glowing Background Elements */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-900/30 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-amber-900/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Main Password Card */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={
              isShaking
                ? {
                  x: [-10, 10, -8, 8, -4, 4, 0],
                  transition: { duration: 0.4 },
                }
                : { scale: 1, y: 0 }
            }
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full max-w-md bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden"
          >
            {/* Top Glowing Edge Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            {/* Header Icon */}
            <div className="flex flex-col items-center text-center space-y-4 mb-6">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-800/80 border border-neutral-700/50 shadow-inner">
                {isSuccess ? (
                  <motion.div
                    initial={{ scale: 0.5, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-emerald-400"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                ) : (
                  <div className="relative">
                    <Lock className="w-7 h-7 text-neutral-300" />
                    <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-2 animate-pulse" />
                  </div>
                )}
              </div>

              <div>
                <div className="inline-flex items-center justify-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full mb-3">
                  <span className="text-sm">🚧</span>
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-400">
                    Under Development
                  </span>
                  <span className="text-sm">🚧</span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  ONLY DENIMS
                </h1>
                <p className="text-sm text-neutral-400 mt-1.5">
                  Site is currently under construction. Enter password to preview.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-300 tracking-wide uppercase">
                  Passcode Required
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter password..."
                    autoFocus
                    className={`w-full bg-neutral-950/80 border ${error
                        ? "border-red-500/80 focus:ring-red-500/30"
                        : isSuccess
                          ? "border-emerald-500/80 focus:ring-emerald-500/30"
                          : "border-neutral-800 focus:border-amber-500/80 focus:ring-amber-500/20"
                      } text-white text-sm rounded-xl pl-10 pr-10 py-3.5 outline-none transition-all placeholder:text-neutral-600 font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-1.5 text-xs text-red-400 mt-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSuccess || !password.trim()}
                className={`w-full relative group overflow-hidden flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${isSuccess
                    ? "bg-emerald-600 text-white cursor-default"
                    : password.trim()
                      ? "bg-white hover:bg-neutral-200 text-black shadow-lg shadow-white/10 active:scale-[0.98]"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }`}
              >
                <span>{isSuccess ? "Access Granted" : "Unlock Website"}</span>
                {!isSuccess && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
