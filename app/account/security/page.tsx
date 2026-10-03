"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, Smartphone, Key, Check } from "lucide-react";
import { useTheme } from "../../theme-provider";

export default function SecurityPage() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [passwordlessEnabled, setPasswordlessEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className={`space-y-8 font-sans antialiased select-none transition-colors duration-300 ${
      isLight ? "bg-white text-black" : "bg-black text-white"
    }`}>
      
      {/* Title Header */}
      <div className={`border-b pb-4 ${isLight ? "border-neutral-200" : "border-neutral-800"}`}>
        <h2 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wider">
          Security & Privacy
        </h2>
        <p className={`text-xs font-semibold tracking-wider uppercase mt-1 ${
          isLight ? "text-neutral-700" : "text-neutral-400"
        }`}>
          Manage your authentication methods and session security.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Card 1: Passwordless KwikPass Authentication */}
        <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 transition-colors ${
          isLight 
            ? "bg-[#F5F5F3] border-neutral-300 text-black" 
            : "bg-neutral-900/80 border-neutral-800 text-white"
        }`}>
          <div className={`flex items-center justify-between border-b pb-4 ${
            isLight ? "border-neutral-300" : "border-neutral-800"
          }`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="text-xs font-black tracking-[0.2em] uppercase">KwikPass Passwordless Authentication</h3>
                <p className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${
                  isLight ? "text-neutral-600" : "text-neutral-400"
                }`}>
                  Instant OTP & biometric login on mobile numbers
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 uppercase">
              ACTIVE
            </span>
          </div>

          <div className="space-y-4 text-xs font-bold">
            <div className="flex items-center justify-between py-2 border-b border-foreground/5">
              <div className="space-y-0.5">
                <span className="block font-black uppercase text-xs">Mobile OTP Login</span>
                <span className={`text-[10px] block ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>
                  Allows 1-click login using verified SMS OTP
                </span>
              </div>
              <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <span className="block font-black uppercase text-xs">Encrypted Customer Session</span>
                <span className={`text-[10px] block ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>
                  256-bit SSL encrypted Shopify session tokens
                </span>
              </div>
              <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Card 2: Active Devices & Logout */}
        <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 transition-colors ${
          isLight 
            ? "bg-[#F5F5F3] border-neutral-300 text-black" 
            : "bg-neutral-900/80 border-neutral-800 text-white"
        }`}>
          <div className={`flex items-center gap-2 border-b pb-4 ${
            isLight ? "border-neutral-300" : "border-neutral-800"
          }`}>
            <Smartphone className="w-4 h-4 text-[#C9A063]" />
            <h3 className="text-xs font-black tracking-[0.2em] uppercase">Active Session</h3>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase block">Current Web Browser</span>
              <span className={`text-[10px] font-bold uppercase block ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>
                LoggedIn via Only Denims Shopify Portal
              </span>
            </div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              ● ONLINE
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
