"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  LogOut,
  Sun,
  Moon,
  Search,
  ShoppingBag,
  ChevronDown,
  Gift,
  Truck,
  Star,
  RotateCcw,
} from "lucide-react";
import type { PublicStore, StoreCategory } from "@/lib/stores/types";
import { useCart } from "@/context/CartContext";

interface BrandNavbarProps {
  store: PublicStore;
  categories: StoreCategory[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onHomeClick: () => void;
  onLogout: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

const promoMessages = [
  { icon: Gift, text: "10% OFF YOUR FIRST ORDER • USE CODE: ONLY10" },
  { icon: Truck, text: "FREE SHIPPING ON ORDERS ABOVE ₹1,500" },
  { icon: Star, text: "PREMIUM ARTISAN DENIM & UTILITY ESSENTIALS" },
  { icon: RotateCcw, text: "EASY RETURNS & EXCHANGES WITHIN 7 DAYS" },
];

/**
 * Dedicated Brand Header / Navbar matching RBW's premium styling:
 * Includes Top Announcement Bar, Brand Category Pills, Search, Theme Toggle, Cart with Subtotal, and Exit.
 */
export function BrandNavbar({
  store,
  categories,
  activeCategory,
  onSelectCategory,
  onHomeClick,
  onLogout,
  theme,
  onToggleTheme,
}: BrandNavbarProps) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % promoMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const { cart, setIsOpen: setCartOpen } = useCart();
  const totalCartItems = cart?.lines.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const subtotal = cart?.lines.reduce((acc, item) => {
    const price = parseFloat(item.merchandise.price?.amount || "0");
    return acc + price * item.quantity;
  }, 0) || 0;

  const filter =
    store.logoMode === "original"
      ? "none"
      : theme === "dark"
      ? "brightness(0) invert(1)"
      : "brightness(0)";

  const activeMsg = promoMessages[msgIdx];
  const ActiveIcon = activeMsg.icon;

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent("OPEN_SEARCH_OVERLAY"));
  };

  const isDark = theme === "dark";

  return (
    <header className="brand-head select-none" aria-label={`${store.name} navigation`}>
      {/* 1. Top Announcement Bar */}
      <div
        className={`w-full h-[28px] sm:h-[34px] border-b flex items-center justify-center text-[9px] sm:text-[10px] font-bold tracking-[0.16em] uppercase transition-colors px-4 overflow-hidden ${
          isDark
            ? "bg-[#0b0c0e] border-white/10 text-white/90"
            : "bg-[#EFECE6] border-[#E2DDD5]/80 text-[#18181B]"
        }`}
      >
        <div className="flex items-center justify-center gap-2 truncate">
          <ActiveIcon className="w-3.5 h-3.5 text-[#B9965A] shrink-0" strokeWidth={2.2} />
          <span className="truncate">{activeMsg.text}</span>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="w-full flex-1 grid grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-6 md:px-10 h-[47px] md:h-[51px] xl:h-[69px]">
        {/* Left: Back Link & Category Pills */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <a
            href="/"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] xl:text-[10.5px] font-bold tracking-wider uppercase border transition-all shadow-2xs whitespace-nowrap shrink-0 group ${
              isDark
                ? "border-zinc-700/60 hover:border-zinc-500 text-zinc-100 bg-white/5 hover:bg-white/10"
                : "border-zinc-300 hover:border-zinc-700 text-zinc-800 bg-white/80 hover:bg-white"
            }`}
            title="Return to ONLY DENIMS Homepage"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform text-[#B9965A]" strokeWidth={2.2} />
            <span>ONLY DENIMS</span>
          </a>

          <div
            className={`h-3.5 w-[1px] mx-0.5 shrink-0 hidden sm:block ${
              isDark ? "bg-white/20" : "bg-[#241F1D]/15"
            }`}
          />

          <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {categories.map((c) => {
              const active = c.id === activeCategory;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10.5px] font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer border ${
                    active
                      ? "bg-[#B9965A] text-black border-[#B9965A] shadow-xs"
                      : isDark
                      ? "bg-white/5 text-zinc-300 border-white/10 hover:border-white/25 hover:text-white"
                      : "bg-black/5 text-zinc-700 border-zinc-200 hover:border-zinc-400 hover:text-black"
                  }`}
                  data-active={active}
                  onClick={() => onSelectCategory(c.id)}
                >
                  <span>{c.label}</span>
                  {active && <span className="opacity-75 text-[10px] ml-0.5 font-bold">✕</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Brand Logo */}
        <button
          type="button"
          onClick={onHomeClick}
          aria-label={`${store.name} home`}
          className="cursor-pointer bg-transparent border-0 p-1 flex items-center justify-center justify-self-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={store.logoUrl}
            alt={store.name}
            className="brand-logo"
            style={{ filter }}
          />
        </button>

        {/* Right: Search, Theme Toggle, Cart, and Exit */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 justify-self-end">
          {/* Search Icon */}
          <button
            type="button"
            onClick={handleOpenSearch}
            aria-label="Search Products"
            className={`relative transition-colors duration-300 p-1.5 sm:p-2 rounded-full cursor-pointer flex items-center justify-center shrink-0 ${
              isDark
                ? "text-white/80 hover:text-white"
                : "text-[#18181B] hover:text-black"
            }`}
            title="Search Products"
          >
            <Search className="h-[18px] w-[18px] sm:h-[19px] sm:w-[19px]" />
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`relative transition-all duration-300 p-1.5 sm:p-2 rounded-full cursor-pointer flex items-center justify-center shrink-0 border ${
              isDark
                ? "border-white/15 bg-white/5 hover:bg-white/10 text-[#B9965A]"
                : "border-[#241F1D]/15 bg-black/5 hover:bg-black/10 text-[#18181B]"
            }`}
          >
            {isDark ? (
              <Sun className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px] text-[#B9965A]" strokeWidth={1.8} />
            ) : (
              <Moon className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px] text-[#18181B]" strokeWidth={1.8} />
            )}
          </button>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Shopping Cart"
            className={`flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:px-3.5 sm:py-2 rounded-full border transition-all duration-300 shadow-none cursor-pointer select-none shrink-0 ${
              isDark
                ? "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                : "border-[#241F1D]/15 bg-white/50 hover:bg-white/80 text-[#18181B]"
            }`}
          >
            <div className="relative flex items-center justify-center pr-0 sm:pr-1">
              <ShoppingBag className="h-[18px] w-[18px] sm:h-[19px] sm:w-[19px]" />
              {totalCartItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 font-sans flex items-center justify-center rounded-full bg-[#B9965A] text-white"
                  style={{
                    width: "15px",
                    height: "15px",
                    fontSize: "8.5px",
                    fontWeight: "bold",
                  }}
                >
                  {totalCartItems}
                </span>
              )}
            </div>

            <div
              className={`hidden sm:block w-[1px] h-6 ${
                isDark ? "bg-white/20" : "bg-[#241F1D]/15"
              }`}
            />

            <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
              <span className="font-sans text-[11px] sm:text-[12px] font-extrabold">
                ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`font-sans text-[9px] sm:text-[9.5px] font-medium ${
                  isDark ? "text-neutral-300" : "text-[#71717A]"
                }`}
              >
                {totalCartItems} {totalCartItems === 1 ? "item" : "items"}
              </span>
            </div>

            <ChevronDown
              className={`hidden sm:block h-3.5 w-3.5 pl-0.5 ${
                isDark ? "text-neutral-300" : "text-[#71717A]"
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}

export default BrandNavbar;
