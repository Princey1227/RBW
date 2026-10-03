"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Truck, Gift, Star, RotateCcw, ShieldCheck, RefreshCw } from "lucide-react";

interface AnnouncementBarProps {
  isScrolled: boolean;
  isRbwStore?: boolean;
}

const rbwMessages = [
  { icon: Truck, text: "FREE SHIPPING ABOVE ₹1,500" },
  { icon: Gift, text: "10% OFF YOUR FIRST ORDER • USE CODE: ONLY10" },
  { icon: Star, text: "PREMIUM SELVEDGE DENIM CRAFTED THROUGH GENERATIONS" },
  { icon: RotateCcw, text: "EASY RETURNS WITHIN 7 DAYS" },
];

export default function AnnouncementBar({ isScrolled, isRbwStore: propIsRbwStore }: AnnouncementBarProps) {
  const pathname = usePathname();
  const [isRbwEventOpen, setIsRbwEventOpen] = React.useState(false);

  React.useEffect(() => {
    const handleOpen = () => setIsRbwEventOpen(true);
    const handleClose = () => setIsRbwEventOpen(false);
    window.addEventListener("OPEN_RBW_STORE", handleOpen);
    window.addEventListener("CLOSE_RBW_STORE", handleClose);
    return () => {
      window.removeEventListener("OPEN_RBW_STORE", handleOpen);
      window.removeEventListener("CLOSE_RBW_STORE", handleClose);
    };
  }, []);

  const isRbwStore =
    propIsRbwStore ||
    isRbwEventOpen ||
    pathname?.startsWith("/stores/rbw") ||
    pathname?.startsWith("/shorts") ||
    pathname?.startsWith("/jackets");

  const [currentMsgIdx, setCurrentMsgIdx] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMsgIdx((prev) => (prev + 1) % rbwMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  if (isRbwStore) {
    const activeMsg = rbwMessages[currentMsgIdx];
    const Icon = activeMsg.icon;

    return (
      <div
        className={`w-full ${pathname === "/stores/rbw" || pathname === "/stores/rbw/"
            ? "bg-[#EFECE6] border-b border-[#E2DDD5]/60 text-[#18181B]"
            : "bg-[#E5E7EB] dark:bg-stone-900 text-[#18181B] dark:text-[#F5F1E8] border-b border-[#D1D5DB] dark:border-stone-800 shadow-2xs"
          } text-[9.5px] sm:text-[10px] font-bold tracking-[0.16em] h-[34px] flex items-center justify-center overflow-hidden fixed top-0 left-0 z-[101] select-none uppercase transition-all duration-300 ${isScrolled
            ? "-translate-y-full opacity-0 pointer-events-none invisible"
            : "translate-y-0 opacity-100"
          }`}
      >
        <div
          aria-live="polite"
          aria-atomic="true"
          className="flex items-center justify-center gap-2 px-4 transition-opacity duration-300 h-full"
        >
          <Icon className="w-3.5 h-3.5 text-[#B9965A] shrink-0" strokeWidth={2.2} />
          <span className="truncate">{activeMsg.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-[#0D0B0A] text-[#EDE7DE] text-[9.5px] sm:text-[10.5px] font-medium tracking-wider h-[34px] flex items-center justify-between px-3 sm:px-6 md:px-10 fixed top-0 left-0 z-[101] select-none border-b border-white/10 shadow-xs transition-all duration-300 ${isScrolled
        ? "-translate-y-full opacity-0 pointer-events-none invisible"
        : "translate-y-0 opacity-100"
        }`}
    >
      {/* Left Item */}
      <div className="flex items-center gap-1.5 text-stone-300 font-semibold shrink-0">
        <Truck className="w-3.5 h-3.5 text-amber-400/90" />
        <span className="truncate">Free Shipping on Orders Above ₹1999</span>
      </div>

      {/* Center Tagline */}
      <div className="hidden md:flex items-center gap-3 text-stone-400 font-bold tracking-[0.2em] uppercase text-[9.5px]">
        <span className="w-6 h-[1px] bg-stone-600" />
        <span>Premium Denim. Timeless Style.</span>
        <span className="w-6 h-[1px] bg-stone-600" />
      </div>

      {/* Right Item */}
      <div className="flex items-center gap-3 text-stone-300 font-semibold text-[9px] sm:text-[10px] shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1">
          <RefreshCw className="w-3 h-3 text-stone-400" />
          Easy Returns
        </span>
        <span className="hidden sm:inline text-stone-600">|</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/90" />
          Secure Payments
        </span>
      </div>
    </div>
  );
}
