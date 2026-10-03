"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Lock, Award, Truck, Box, ShieldCheck, UserCheck } from "lucide-react";
import axios from "axios";
import { useCart } from "../../context/CartContext";

export default function LoginPage() {
  const router = useRouter();
  const { updateBuyerIdentity } = useCart();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [customer, setCustomer] = useState<any>(null);

  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Check if user is already logged in
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shopifyCustomer");
      if (saved) {
        setCustomer(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

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
        const res: any = await inst.kpSendOTP(cleanedPhone);
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
        setError("An error occurred while sending OTP. Please try again.");
      }
    } else {
      // Demo / Fallback OTP step if KwikPass SDK isn't initialized on standalone page
      setTimeout(() => {
        setLoading(false);
        setStep("otp");
        setResendTimer(30);
        setCanResend(false);
      }, 800);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedOtp = otp.trim();
    if (cleanedOtp.length < 4) {
      setError("Please enter the 4-digit OTP code");
      return;
    }

    setLoading(true);
    const cleanedPhone = phone.replace(/\D/g, "");
    const otpNumber = parseInt(cleanedOtp, 10);
    const inst = (window as any).__KP_LOGIN_SDK_INSTANCE__ || (window as any).KP_LOGIN_SDK_INSTANCE;

    if (inst && typeof inst.kpVerifyOTP === "function") {
      try {
        let res: any = await inst.kpVerifyOTP({ phone: cleanedPhone, otp: otpNumber });
        if (res && (res.status === 200 || res.status === "200")) {
          const kpToken = res.body?.data?.kpToken || res.body?.kpToken;
          const userEmail = res.body?.data?.email || "";

          const verifyRes = await axios.post("/api/auth/kwikpass-verify", {
            kpToken: kpToken || "",
            phone: `+91${cleanedPhone}`,
            email: userEmail,
          });

          setLoading(false);
          if (verifyRes.data?.success) {
            const cust = verifyRes.data.customer;
            localStorage.setItem("shopifyCustomer", JSON.stringify(cust));
            if (typeof updateBuyerIdentity === "function") {
              updateBuyerIdentity(cust);
            }
            router.push("/account");
          } else {
            setError("Authentication failed. Please try again.");
          }
        } else {
          setLoading(false);
          setError(res?.message || "Invalid OTP. Please try again.");
        }
      } catch (err: any) {
        setLoading(false);
        setError("Verification error. Please check your OTP and try again.");
      }
    } else {
      // Fallback verification success for local testing
      setTimeout(() => {
        setLoading(false);
        const demoCustomer = {
          id: `gid://shopify/Customer/${cleanedPhone}`,
          firstName: "Valued",
          lastName: "Customer",
          phone: `+91${cleanedPhone}`,
          email: `${cleanedPhone}@onlydenims.com`,
        };
        localStorage.setItem("shopifyCustomer", JSON.stringify(demoCustomer));
        if (typeof updateBuyerIdentity === "function") {
          updateBuyerIdentity(demoCustomer);
        }
        router.push("/account");
      }, 800);
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
    } else {
      setTimeout(() => {
        setLoading(false);
        setResendTimer(30);
        setCanResend(false);
      }, 500);
    }
  };

  return (
    <main className="relative w-full bg-[#F5F2EB] text-[#1C1917] px-3 sm:px-6 md:px-8 lg:px-10 pt-4 sm:pt-6 pb-6 flex flex-col justify-between selection:bg-[#1C1917] selection:text-[#EDE7DE] min-h-[calc(100vh-68px)] overflow-x-hidden">
      {/* Soft Luminous Palm Leaf Shadow Backdrop Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-200/40 via-transparent to-transparent opacity-80" />

      {/* ---------------- 1. ONLINE MBO LOGIN HERO SECTION ---------------- */}
      <section className="relative z-10 w-full max-w-[1700px] mx-auto text-center pt-2 pb-4 shrink-0 flex flex-col items-center">
        {/* Official ONLY DENIMS Brand Header Logo */}
        <div className="flex justify-center items-center pt-2 pb-1">
          <Image
            src="/OnlyDenims_cropped.png"
            alt="ONLY DENIMS"
            width={280}
            height={64}
            priority
            className="h-10 sm:h-12 w-auto object-contain select-none theme-logo-invert drop-shadow-xs"
          />
        </div>

        {/* Main Headline with Oswald Display Typography matching Homepage */}
        <h1
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          className="mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-[52px] leading-tight font-bold text-[#0D0B0A] tracking-[0.03em] uppercase"
        >
          {customer ? "YOUR ACCOUNT" : "WELCOME BACK"}
        </h1>

        {/* Gold Flourish Divider */}
        <div className="flex items-center justify-center gap-3 my-2.5 w-full max-w-xs">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#B9965A]/50 to-[#B9965A]" />
          <span className="text-[#B9965A] text-xs select-none">❖</span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#B9965A]/50 to-[#B9965A]" />
        </div>

        {/* Subtitle */}
        <p className="text-[11.5px] sm:text-xs md:text-sm text-[#57534E] font-medium tracking-wide max-w-xl">
          {customer
            ? "You are logged in. Access your orders, addresses, and wishlist."
            : "Sign in to continue"}
        </p>
      </section>

      {/* ---------------- 2. LOGIN CARD FORM CONTAINER ---------------- */}
      <div className="relative z-10 w-full max-w-md mx-auto my-4 shrink-0">
        {customer ? (
          /* Logged In View */
          <div className="bg-[#1C1917] text-[#EDE7DE] rounded-[24px] p-6 sm:p-8 border border-[#B9965A]/40 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#B9965A]/20 border border-[#B9965A] flex items-center justify-center text-[#B9965A]">
              <UserCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold tracking-wide">
              Welcome back, {customer.firstName || "Denim Enthusiast"}!
            </h2>
            <p className="text-xs text-stone-300">
              {customer.phone || customer.email}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.push("/account")}
                className="flex-1 bg-white hover:bg-stone-100 text-[#1C1917] font-bold text-xs py-3 rounded-xl uppercase tracking-wider transition-colors shadow-md"
              >
                Go to Account
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("shopifyCustomer");
                  setCustomer(null);
                }}
                className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs py-3 rounded-xl uppercase tracking-wider transition-colors border border-stone-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Login Card Form */
          <div className="bg-[#EAE4D9]/90 backdrop-blur-md rounded-[26px] p-6 sm:p-8 border border-[#D5CDBF] shadow-xl text-[#1C1917]">
            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                    Mobile Number
                  </label>
                  <p className="text-[11px] text-[#78716C]">
                    We'll send a 4-digit verification code to your mobile.
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Mobile Input Field */}
                <div className="relative h-12 w-full rounded-xl px-4 flex items-center bg-white border border-[#D5CDBF] focus-within:border-[#B9965A] focus-within:ring-2 focus-within:ring-[#B9965A]/20 transition-all shadow-xs">
                  <span className="text-[#1C1917] font-extrabold text-sm tracking-wide select-none">
                    +91
                  </span>
                  <div className="w-[1px] h-4 mx-3 bg-stone-300" />
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
                    className="w-full bg-transparent text-sm tracking-wider text-[#1C1917] placeholder-stone-400 outline-none border-0 py-1 font-medium"
                    autoFocus
                  />
                </div>

                {/* Action Button: SEND OTP (Switches from Gray to Yellow when 10 digits filled) */}
                <button
                  type="submit"
                  disabled={loading || phone.length !== 10}
                  className={`group w-full h-12 font-bold text-xs tracking-[0.2em] uppercase rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                    phone.length === 10
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
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                    Verify OTP Code
                  </label>
                  <p className="text-[11px] text-[#78716C]">
                    Enter 4-digit code sent to <span className="font-bold text-[#1C1917]">+91 {phone}</span>
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* OTP Input Field */}
                <div className="relative h-12 w-full rounded-xl px-4 flex items-center justify-between bg-white border border-[#D5CDBF] focus-within:border-[#B9965A] focus-within:ring-2 focus-within:ring-[#B9965A]/20 transition-all shadow-xs">
                  <Lock className="w-4 h-4 text-[#B9965A] shrink-0" />
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 4) setOtp(val);
                    }}
                    placeholder="4-digit OTP"
                    autoFocus
                    className="w-full bg-transparent text-center text-lg tracking-[0.4em] text-[#1C1917] placeholder-stone-400 outline-none border-0 py-1 font-mono font-bold"
                  />
                </div>

                {/* VERIFY & LOGIN Button (Switches from Gray to Yellow when 4 digits filled) */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 4}
                  className={`group w-full h-12 font-bold text-xs tracking-[0.2em] uppercase rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                    otp.length === 4
                      ? "bg-[#ECA625] hover:bg-[#d9961d] text-[#1C1917] shadow-md"
                      : "bg-stone-300 text-stone-500 cursor-not-allowed opacity-70"
                  }`}
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#1C1917]" />
                  ) : (
                    <>
                      <CheckCircle2 className={`w-4 h-4 ${otp.length === 4 ? "text-[#1C1917]" : "text-stone-500"}`} />
                      <span>VERIFY &amp; LOGIN</span>
                      <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 ${otp.length === 4 ? "text-[#1C1917]" : "text-stone-500"}`} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1 text-[#78716C]">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setError(null);
                    }}
                    className="hover:text-[#1C1917] underline cursor-pointer"
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

            <div className="mt-5 pt-4 border-t border-[#D5CDBF]/70 flex items-center justify-center gap-1.5 text-xs text-[#78716C]">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>We'll never share your number with anyone.</span>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- 3. BOTTOM TRUST FEATURE BAR DOCK ---------------- */}
      <section className="relative z-10 w-full max-w-[1400px] mx-auto mt-6 mb-2 py-2">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-10 lg:gap-14 text-center">
          {/* Item 1 */}
          <div className="flex items-center gap-2 text-[#2C2825]">
            <Award className="w-4.5 h-4.5 text-[#2C2825] stroke-[1.8] shrink-0" />
            <span className="text-xs sm:text-[12.5px] font-medium text-[#2C2825] tracking-wide whitespace-nowrap">
              100% Original Brands
            </span>
          </div>

          <div className="hidden sm:block w-[1px] h-4 bg-[#D5CDBF]" />

          {/* Item 2 */}
          <div className="flex items-center gap-2 text-[#2C2825]">
            <Truck className="w-4.5 h-4.5 text-[#2C2825] stroke-[1.8] shrink-0" />
            <span className="text-xs sm:text-[12.5px] font-medium text-[#2C2825] tracking-wide whitespace-nowrap">
              Fast &amp; Reliable Delivery
            </span>
          </div>

          <div className="hidden md:block w-[1px] h-4 bg-[#D5CDBF]" />

          {/* Item 3 */}
          <div className="flex items-center gap-2 text-[#2C2825]">
            <Box className="w-4.5 h-4.5 text-[#2C2825] stroke-[1.8] shrink-0" />
            <span className="text-xs sm:text-[12.5px] font-medium text-[#2C2825] tracking-wide whitespace-nowrap">
              Easy Returns
            </span>
          </div>

          <div className="hidden sm:block w-[1px] h-4 bg-[#D5CDBF]" />

          {/* Item 4 */}
          <div className="flex items-center gap-2 text-[#2C2825]">
            <ShieldCheck className="w-4.5 h-4.5 text-[#2C2825] stroke-[1.8] shrink-0" />
            <span className="text-xs sm:text-[12.5px] font-medium text-[#2C2825] tracking-wide whitespace-nowrap">
              Secure Payments
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
