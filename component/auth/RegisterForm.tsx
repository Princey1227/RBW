"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../app/theme-provider";
import { Phone, User, ShieldCheck } from "lucide-react";

interface RegisterFormProps {
  onSubmit: (e: React.FormEvent, data: any) => void;
  isLoading: boolean;
}

export default function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const { theme } = useTheme();

  // Common states
  const [name, setName] = useState("");

  // Mobile states
  const [phone, setPhone] = useState("");
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Theme-aware styles
  const labelText = theme === "light" ? "text-slate-500" : "text-white/40";
  const inputText = theme === "light"
    ? "text-slate-800 bg-slate-50 border-slate-200 focus:bg-white"
    : "text-white bg-[#090e16]/80 border-white/10 focus:bg-[#0c131e]/90";
  const buttonStyle = theme === "light"
    ? "bg-slate-900 text-white hover:bg-slate-800"
    : "bg-[#d7a33c] text-black hover:bg-[#eec061]";

  const handleSendOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!phone || !name) return;
    setIsSendingOtp(true);
    // Simulate OTP generation
    setTimeout(() => {
      setIsSendingOtp(false);
      setIsOtpSent(true);
      // Auto focus first OTP input after render
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 1200);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.substring(value.length - 1);
    setOtpValues(newOtp);

    // Auto focus next field
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (pasteData.length === 6 && !isNaN(Number(pasteData))) {
      const pasteArray = pasteData.split("");
      setOtpValues(pasteArray);
      otpRefs.current[5]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, { method: "mobile", name, phone, otp: otpValues.join("") });
  };

  const isSubmitDisabled =
    isLoading || !name || !phone || !isOtpSent || otpValues.some(val => val === "");

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-1.5 group">
          <label className={`text-[9px] font-bold tracking-[0.2em] uppercase ${labelText} group-focus-within:text-[#d7a33c] transition-colors`}>
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              required
              disabled={isOtpSent}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className={`w-full py-3.5 px-4 pl-10 text-xs border rounded-md focus:outline-none focus:border-[#d7a33c] focus:ring-1 focus:ring-[#d7a33c]/30 transition-all ${inputText} ${isOtpSent ? "opacity-50" : ""
                }`}
            />
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-foreground/30 group-focus-within:text-[#d7a33c] transition-colors" />
          </div>
        </div>

        {/* Mobile Number */}
        <div className="space-y-1.5 group">
          <label className={`text-[9px] font-bold tracking-[0.2em] uppercase ${labelText} group-focus-within:text-[#d7a33c] transition-colors`}>
            Mobile Number
          </label>
          <div className="relative flex">
            <div className="relative flex-1">
              <input
                type="tel"
                required
                disabled={isOtpSent}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className={`w-full py-3.5 px-4 pl-10 text-xs border rounded-md focus:outline-none focus:border-[#d7a33c] focus:ring-1 focus:ring-[#d7a33c]/30 transition-all ${inputText} ${isOtpSent ? "opacity-50" : ""
                  }`}
              />
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-foreground/30 group-focus-within:text-[#d7a33c] transition-colors" />
            </div>
            {!isOtpSent && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!phone || !name || isSendingOtp}
                className="ml-2 px-5 py-3 border border-[#d7a33c] text-[#d7a33c] hover:bg-[#d7a33c] hover:text-black disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#d7a33c] transition-all text-[10px] font-black tracking-widest rounded-md whitespace-nowrap"
              >
                {isSendingOtp ? "SENDING..." : "SEND OTP"}
              </button>
            )}
          </div>
        </div>

        {/* 6-Digit OTP */}
        <AnimatePresence>
          {isOtpSent && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-center">
                <label className={`text-[9px] font-bold tracking-[0.2em] uppercase ${labelText}`}>
                  Security Passcode (OTP)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtpValues(Array(6).fill(""));
                  }}
                  className="text-[9px] text-[#d7a33c] font-bold hover:underline uppercase tracking-wider"
                >
                  Change Details
                </button>
              </div>
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otpValues.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    required
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-12 h-12 text-center text-lg font-bold border rounded-md focus:outline-none focus:border-[#d7a33c] focus:ring-2 focus:ring-[#d7a33c]/20 transition-all ${inputText}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-white/40 tracking-wider">
                <ShieldCheck className="w-3 h-3 text-[#d7a33c]" />
                <span>Secure temporary passcode active for 5 minutes.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`
            w-full
            py-4
            rounded-md
            text-[10px]
            font-black
            tracking-[0.3em]
            uppercase
            transition-all
            duration-300
            flex
            items-center
            justify-center
            gap-2
            disabled:opacity-40
            disabled:cursor-not-allowed
            shadow-[0_10px_25px_rgba(0,0,0,0.2)]
            hover:shadow-[0_12px_30px_rgba(215,163,60,0.15)]
            active:scale-[0.99]
            ${buttonStyle}
          `}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
          ) : (
            "SIGNUP"
          )}
        </button>
      </form>
    </div>
  );
}
