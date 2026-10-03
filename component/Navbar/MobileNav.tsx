"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ArrowLeft, ChevronDown } from "lucide-react";

const navItems = [
  { label: "Jeans", href: "/stores/rbw" },
  { label: "Jackets", href: "/stores/rbw/jackets" },
  { label: "Shorts", href: "/stores/rbw/shorts" },
  { label: "Accessories", href: "/accessories" },
];

interface MobileNavProps {
  isOpen: boolean;
  isScrolled: boolean;
  isLoggedIn: boolean;
  customerInfo: { displayName?: string; firstName?: string; lastName?: string } | null;
  wishlistCount: number;
  onClose: () => void;
  onLogout: () => void;
  onLoginClick: () => void;
  theme: "light" | "dark";
}

export default function MobileNav({
  isOpen,
  isScrolled,
  isLoggedIn,
  customerInfo,
  onClose,
  onLogout,
  onLoginClick,
  theme,
}: MobileNavProps) {
  const pathname = usePathname();
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);

  const isRbwStorePage =
    pathname?.startsWith("/stores") ||
    pathname?.startsWith("/shop") ||
    pathname?.startsWith("/product") ||
    pathname?.startsWith("/jackets") ||
    pathname?.startsWith("/shorts") ||
    pathname?.startsWith("/accessories");

  if (!isOpen) return null;

  return (
    <>
      {/* Full-screen Backdrop Overlay for Click-Outside */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs xl:hidden animate-in fade-in duration-200"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute left-0 w-full border-b xl:hidden transition-all duration-300 pointer-events-auto max-h-[calc(100vh-68px)] overflow-y-auto z-50 ${theme === "light"
            ? "bg-white border-neutral-200 text-black shadow-2xl"
            : "bg-black border-neutral-800 text-white shadow-2xl"
          } top-full`}
      >
        <div className="px-6 py-6 space-y-3.5 flex flex-col text-[15px] font-medium tracking-wide">
          {/* RBW Store Mobile Navigation */}
          {isRbwStorePage ? (
            <>
              <div className="pb-3 border-b border-foreground/10 flex items-center justify-between">
                <span className="text-xs font-black tracking-[0.2em] text-[#B9965A] uppercase">
                  RBW STORE MENU
                </span>
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  LIVE STORE
                </span>
              </div>

              <Link
                href="/stores/rbw#new-arrivals"
                prefetch={false}
                onClick={onClose}
                className="text-left py-2 border-b border-foreground/5 font-bold uppercase text-foreground tracking-wider hover:text-[#B9965A] transition-colors"
              >
                NEW ARRIVALS
              </Link>

              {[
                { label: "JEANS", href: "/stores/rbw" },
                { label: "JACKETS", href: "/stores/rbw/jackets" },
                { label: "SHORTS", href: "/stores/rbw/shorts" },
                { label: "ACCESSORIES", href: "/accessories" },
              ].map((item) => {
                const active =
                  item.href === "/stores/rbw"
                    ? pathname === "/stores/rbw" || pathname === "/stores/rbw/"
                    : item.href === "/stores/rbw/shorts"
                      ? pathname.startsWith("/shorts") || pathname.startsWith("/stores/rbw/shorts")
                      : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    prefetch={false}
                    onClick={(e) => {
                      onClose();
                      if (item.href === "/stores/rbw" && (pathname === "/stores/rbw" || pathname === "/stores/rbw/")) {
                        e.preventDefault();
                        if (typeof window !== "undefined") {
                          try {
                            sessionStorage.removeItem("selectedWash");
                            if (window.location.search) {
                              window.history.replaceState({}, "", "/stores/rbw");
                            }
                          } catch (err) { }
                          window.dispatchEvent(new CustomEvent("RESET_RBW_STOREFRONT"));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }
                    }}
                    className={`text-left py-2 border-b border-foreground/5 font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${active
                        ? "text-[#B9965A] font-black"
                        : "text-foreground hover:text-[#B9965A]"
                      }`}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="w-2 h-2 rounded-full bg-[#B9965A] shadow-[0_0_6px_rgba(185,150,90,0.6)]" />
                    )}
                  </Link>
                );
              })}

              <Link
                href="/about"
                prefetch={false}
                onClick={onClose}
                className="text-left py-2 border-b border-foreground/5 font-bold uppercase text-foreground tracking-wider hover:text-[#B9965A] transition-colors"
              >
                ABOUT RBW
              </Link>

              <div className="pt-2 pb-1 border-b border-foreground/10">
                <Link
                  href="/"
                  prefetch={false}
                  onClick={onClose}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground font-extrabold tracking-widest text-xs uppercase transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4 text-[#B9965A] group-hover:-translate-x-1 transition-transform" />
                    <span>ONLY DENIMS PLATFORM</span>
                  </span>
                  <span className="text-[9px] font-bold text-[#B9965A] bg-[#B9965A]/10 px-2 py-0.5 rounded-full">
                    MAIN
                  </span>
                </Link>
              </div>
            </>
          ) : (
            /* ONLY DENIMS Main Platform Mobile Navigation */
            <>
              {/* BRANDS Accordion */}
              <div className="py-1 border-b border-foreground/5">
                <button
                  type="button"
                  onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                  className="flex items-center justify-between text-left font-bold uppercase tracking-wider text-foreground text-[14px] w-full py-1.5 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>BRANDS</span>
                    <ChevronDown className={`w-4 h-4 text-[#B9965A] transition-transform duration-300 ${isBrandsOpen ? "rotate-180" : ""}`} />
                  </div>
                  <span className="text-[10px] text-[#B9965A] font-extrabold uppercase bg-[#B9965A]/10 px-2 py-0.5 rounded-full">5 STORES</span>
                </button>

                {isBrandsOpen && (
                  <div className="mt-2 ml-2 flex flex-col gap-2 pl-3 border-l-2 border-[#E8E3DA] dark:border-stone-800">
                    <Link
                      href="/stores/rbw"
                      prefetch={false}
                      onClick={onClose}
                      className="text-xs font-bold text-foreground hover:text-[#B9965A] transition-colors flex items-center justify-between py-1"
                    >
                      <span>RBW</span>
                      <span className="text-[8px] font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase">
                        LIVE STORE
                      </span>
                    </Link>
                    {["THINC", "WIDE", "IJNS", "SECOND ARMY"].map((b) => (
                      <div
                        key={b}
                        className="text-xs font-medium text-foreground/50 flex items-center justify-between py-1"
                      >
                        <span>{b}</span>
                        <span className="text-[8px] font-bold text-stone-400 bg-stone-100 dark:bg-stone-800 dark:text-stone-400 px-2 py-0.5 rounded-full uppercase">
                          COMING SOON
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/about"
                prefetch={false}
                onClick={onClose}
                className="text-left py-2.5 border-b border-foreground/5 font-bold uppercase text-foreground tracking-wider text-[14px] hover:text-[#B9965A] transition-colors"
              >
                ABOUT US
              </Link>

              <Link
                href="/experience-center"
                prefetch={false}
                onClick={onClose}
                className="text-left py-2.5 border-b border-foreground/5 font-bold uppercase text-foreground tracking-wider text-[14px] hover:text-[#B9965A] transition-colors"
              >
                EXPERIENCE CENTER
              </Link>

              <Link
                href="/returns"
                prefetch={false}
                onClick={onClose}
                className="text-left py-2.5 border-b border-foreground/5 font-bold uppercase text-foreground tracking-wider text-[14px] hover:text-[#B9965A] transition-colors"
              >
                RETURNS
              </Link>

              <Link
                href="/contact"
                prefetch={false}
                onClick={onClose}
                className="text-left py-2.5 border-b border-foreground/5 font-bold uppercase text-foreground tracking-wider text-[14px] hover:text-[#B9965A] transition-colors"
              >
                CONTACT US
              </Link>
            </>
          )}

          {/* Auth section: Shown ONLY on ONLY DENIMS main platform pages, hidden on RBW store */}
          {!isRbwStorePage && (
            <div className="border-t border-foreground/5 pt-4 mt-2">
              {isLoggedIn ? (
                <div className="flex flex-col space-y-3">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black tracking-[0.15em] text-[#d7a33c] uppercase">
                      {customerInfo?.displayName ? "SELVEDGE MEMBER" : "AUTHENTICATING"}
                    </p>
                    <p className="text-[14px] font-bold truncate mt-0.5 capitalize">
                      {customerInfo?.firstName || (customerInfo?.displayName ? customerInfo.displayName.split(" ")[0] : null) || "KwikPass Member"}
                    </p>
                  </div>
                  <Link
                    href="/account/orders"
                    prefetch={false}
                    onClick={onClose}
                    className="text-left py-1.5 text-[14px] text-foreground/60 hover:text-foreground"
                  >
                    Order History Page
                  </Link>
                  <Link
                    href="/account/measurements"
                    prefetch={false}
                    onClick={onClose}
                    className="text-left py-1.5 text-[14px] text-foreground/60 hover:text-foreground"
                  >
                    My Measurements
                  </Link>
                  <button
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="text-left py-2 text-[14px] text-red-500 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onLoginClick();
                  }}
                  className="w-full flex items-center justify-center py-3 px-4 text-center font-extrabold tracking-[0.18em] uppercase text-xs rounded-xl bg-[#1C1917] text-[#FAF8F5] hover:bg-black transition-all shadow-md cursor-pointer"
                >
                  LOGIN / REGISTER
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
