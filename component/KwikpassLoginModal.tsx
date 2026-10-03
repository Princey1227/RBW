"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import Image from "next/image";
import Logo from "./Logo";
import { useTheme } from "../app/theme-provider";
import { useCart } from "../context/CartContext";

interface KwikpassLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: any) => void;
}

export default function KwikpassLoginModal({
  isOpen,
  onClose,
  onSuccess,
}: KwikpassLoginModalProps) {
  let theme = "dark";
  try {
    const themeContext = useTheme();
    if (themeContext?.theme) theme = themeContext.theme;
  } catch (e) {
    theme = "dark";
  }

  const { updateBuyerIdentity } = useCart();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Timer countdown for resend OTP
  useEffect(() => {
    let timer: any;
    if (step === "otp" && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // Handle SSO button initialization and auto-focus when modal opens
  useEffect(() => {
    if (!isOpen) {
      setStep("phone");
      setPhone("");
      setOtp("");
      setError(null);
      return;
    }

    const focusTimer = setTimeout(() => {
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
      }
    }, 150);

    const timer = setTimeout(() => {
      const inst = (window as any).__KP_LOGIN_SDK_INSTANCE__ || (window as any).KP_LOGIN_SDK_INSTANCE;
      if (inst && typeof inst.handleKpSSOButton === "function") {
        try {
          inst.handleKpSSOButton();
        } catch (e) {
          console.warn("Error triggering handleKpSSOButton in modal:", e);
        }
      }
    }, 150);

    return () => {
      clearTimeout(focusTimer);
      clearTimeout(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    const inst = (window as any).__KP_LOGIN_SDK_INSTANCE__ || (window as any).KP_LOGIN_SDK_INSTANCE;

    if (inst && typeof inst.kpSendOTP === "function") {
      try {
        console.log("[KwikPass Headless] Calling kpSendOTP with phone:", cleanedPhone);
        const res: any = await inst.kpSendOTP(cleanedPhone);
        console.log("[KwikPass Headless] kpSendOTP response:", res);

        setLoading(false);
        if (res && (res.status === 200 || res.status === "200")) {
          setStep("otp");
          setResendTimer(30);
          setCanResend(false);
        } else {
          setError(res?.message || "Failed to send OTP. Please try again.");
        }
      } catch (err: any) {
        setLoading(false);
        console.error("[KwikPass Headless] Error in kpSendOTP:", err);
        setError("An error occurred while sending OTP. Please try again.");
      }
    } else {
      setLoading(false);
      onClose();
      if (inst && typeof inst.kwikForm === "function") {
        inst.kwikForm();
      } else if (inst && typeof inst.handleKpLogin === "function") {
        inst.handleKpLogin();
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedOtp = otp.trim();
    if (cleanedOtp.length !== 4) {
      setError("Please enter the 4-digit OTP code");
      return;
    }

    setLoading(true);
    const cleanedPhone = phone.replace(/\D/g, "");
    const otpNumber = parseInt(cleanedOtp, 10);

    const inst = (window as any).__KP_LOGIN_SDK_INSTANCE__ || (window as any).KP_LOGIN_SDK_INSTANCE;

    if (inst && typeof inst.kpVerifyOTP === "function") {
      try {
        console.log("[KwikPass Headless] Calling kpVerifyOTP with:", { phone: cleanedPhone, otp: otpNumber });
        let res: any = await inst.kpVerifyOTP({ phone: cleanedPhone, otp: otpNumber });
        console.log("[KwikPass Headless] kpVerifyOTP response:", res);

        if (res && (res.status === 200 || res.status === "200")) {
          const kpToken = res.body?.data?.kpToken || res.body?.kpToken;
          const userEmail = res.body?.data?.email || "";

          if (kpToken) {
            localStorage.setItem("kpToken", kpToken);
          }

          const response = await fetch("/api/auth/kwikpass-verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kpToken: kpToken || "",
              phone: `+91${cleanedPhone}`,
              email: userEmail,
            }),
          });
          const verifyData = await response.json();

          setLoading(false);
          if (verifyData?.success) {
            localStorage.setItem("shopifyCustomer", JSON.stringify(verifyData.customer));
            if (typeof updateBuyerIdentity === "function") {
              updateBuyerIdentity(verifyData.customer);
            }
            onSuccess(verifyData.customer);
            onClose();
          } else {
            setError("Authentication failed. Please try again.");
          }
        } else {
          setLoading(false);
          setError(res?.message || "Invalid OTP. Please try again.");
        }
      } catch (err: any) {
        setLoading(false);
        console.error("[KwikPass Headless] Error in kpVerifyOTP:", err);
        setError("Verification error. Please check your OTP and try again.");
      }
    } else {
      setLoading(false);
      setError("Verification service unavailable. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setError(null);
    setLoading(true);
    const cleanedPhone = phone.replace(/\D/g, "");
    const inst = (window as any).__KP_LOGIN_SDK_INSTANCE__ || (window as any).KP_LOGIN_SDK_INSTANCE;

    if (inst && typeof inst.kpSendOTP === "function") {
      try {
        const res: any = await inst.kpSendOTP(cleanedPhone);
        setLoading(false);
        if (res && (res.status === 200 || res.status === "200")) {
          setResendTimer(30);
          setCanResend(false);
        } else {
          setError(res?.message || "Failed to resend OTP");
        }
      } catch (e) {
        setLoading(false);
        setError("Failed to resend OTP");
      }
    }
  };

  // Fixed Dark Mode default for luxury login modal
  const isLight = false;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && step === "phone") {
          onClose();
        }
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/75 animate-fadeIn select-none"
    >
      {/* Linen Theme Luxury Login Card Matching Homepage */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-[#F5F2EB] text-[#1C1917] shadow-[0_25px_70px_rgba(0,0,0,0.5)] font-sans transition-all duration-300 animate-split-card overflow-hidden rounded-[26px] border border-[#B9965A]/50 p-6 sm:p-8"
      >
        {/* Soft Radial Vignette Shadow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-200/50 via-transparent to-transparent opacity-80" />

        {/* Top Right Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="group absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-[#E5DFD4] hover:bg-[#1C1917] text-[#1C1917] hover:text-white border border-[#D5CDBF] transition-all duration-200 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
        </button>

        {/* 1. Header Section */}
        <div className="relative z-10 text-center space-y-2 mb-6">
          {/* Official ONLY DENIMS Brand Header Logo */}
          <div className="flex justify-center items-center pt-2 pb-1">
            <Image
              src="/OnlyDenims_cropped.png"
              alt="ONLY DENIMS"
              width={260}
              height={60}
              priority
              className="h-8 sm:h-10 w-auto object-contain select-none theme-logo-invert drop-shadow-xs"
            />
          </div>

          {/* Header Title */}
          <h2
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            className="text-2xl sm:text-3xl font-bold tracking-[0.03em] uppercase text-[#0D0B0A] leading-tight pt-1"
          >
            {step === "phone" ? "Welcome back" : "Verify OTP"}
          </h2>

          {/* Gold Flourish Divider */}
          <div className="flex items-center justify-center gap-3 my-2 w-full max-w-[180px] mx-auto">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#B9965A] to-[#B9965A]" />
            <span className="text-[#B9965A] text-[10px] select-none">❖</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#B9965A] to-[#B9965A]" />
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-[#57534E] font-medium tracking-wide">
            {step === "phone"
              ? "Sign in to continue"
              : `Code sent to +91 ${phone}`}
          </p>

          {error && (
            <div className="w-full mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* 2. Input & Button Form */}
        <div className="relative z-10 w-full">
          {step === "phone" ? (
            /* STEP 1: Phone Form */
            <form onSubmit={handleSendOtp} className="w-full space-y-4">
              {/* Mobile Input Field */}
              <div className="relative h-[50px] w-full rounded-xl px-4 flex items-center bg-white border border-[#D5CDBF] transition-all focus-within:border-[#B9965A] focus-within:ring-2 focus-within:ring-[#B9965A]/20 shadow-xs">
                <span className="text-[#1C1917] font-extrabold text-[15px] tracking-wide select-none">
                  +91
                </span>

                <div className="w-[1px] h-4 mx-3 bg-[#D5CDBF]" />

                <input
                  ref={phoneInputRef}
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) setPhone(val);
                  }}
                  placeholder="Enter mobile number"
                  className="w-full bg-transparent text-[15px] tracking-wider text-[#1C1917] placeholder-[#A8A29E] outline-none border-0 py-1 font-medium"
                />
              </div>

              {/* Action Button: SEND OTP (Switches from Gray to Yellow when 10 digits filled) */}
              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className={`group w-full h-[50px] font-bold text-xs tracking-[0.2em] uppercase rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${phone.length === 10
                  ? "bg-[#ECA625] hover:bg-[#d9961d] text-[#1C1917] shadow-md"
                  : "bg-stone-300 text-stone-500 cursor-not-allowed opacity-70"
                  }`}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#1C1917]" />
                ) : (
                  <>
                    <span>SEND OTP</span>
                    <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 ${phone.length === 10 ? "text-[#1C1917]" : "text-stone-500"}`} />
                  </>
                )}
              </button>

              {/* Hidden KwikPass SSO Container */}
              <div className="hidden">
                <div
                  id="kwikpass-sso-container"
                  {...({ logo: "https://pdp.gokwik.co/kwikpass/assets/icons/kwik_pass_logo.svg" } as any)}
                />
              </div>
            </form>
          ) : (
            /* STEP 2: OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="w-full space-y-4">
              {/* OTP Input Field */}
              <div className="relative h-[50px] w-full rounded-xl px-4 flex items-center justify-between bg-white border border-[#D5CDBF] transition-all focus-within:border-[#B9965A] focus-within:ring-2 focus-within:ring-[#B9965A]/20 shadow-xs">
                <Lock className="w-4 h-4 text-[#B9965A] shrink-0" />
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 4) setOtp(val);
                  }}
                  placeholder="Enter 4-digit OTP"
                  autoFocus
                  className="w-full bg-transparent text-center text-[18px] tracking-[0.5em] text-[#1C1917] placeholder-[#A8A29E] outline-none border-0 py-1 font-mono font-bold"
                />
              </div>

              {/* VERIFY & LOGIN Button (Switches from Gray to Yellow when 4 digits filled) */}
              <button
                type="submit"
                disabled={loading || otp.length !== 4}
                className={`group w-full h-[50px] font-bold text-xs tracking-[0.2em] uppercase rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${otp.length === 4
                  ? "bg-[#ECA625] hover:bg-[#d9961d] text-[#1C1917] shadow-md"
                  : "bg-stone-300 text-stone-500 cursor-not-allowed opacity-70"
                  }`}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#1C1917]" />
                ) : (
                  <>
                    <CheckCircle2 className={`w-4 h-4 ${otp.length === 4 ? "text-[#1C1917]" : "text-stone-500"}`} />
                    <span>VERIFY & LOGIN</span>
                    <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 ${otp.length === 4 ? "text-[#1C1917]" : "text-stone-500"}`} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1 text-[#57534E]">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setError(null);
                  }}
                  className="hover:text-[#1C1917] transition-colors underline cursor-pointer font-medium"
                >
                  Change Number
                </button>

                <button
                  type="button"
                  disabled={!canResend || loading}
                  onClick={handleResendOtp}
                  className={`transition-colors cursor-pointer ${canResend
                    ? "text-[#B9965A] hover:underline font-bold"
                    : "text-[#A8A29E] cursor-not-allowed font-medium"
                    }`}
                >
                  {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 3. Security & Trust Footer */}
        <div className="relative z-10 mt-6 pt-4 border-t border-[#E5DFD4] text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-[#78716C] font-medium select-none">
            <Lock className="w-3.5 h-3.5 text-[#B9965A] shrink-0" />
            <span>We'll never share your number with anyone.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
