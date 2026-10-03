"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, ShoppingBag, Heart, User } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide mobile bottom navigation on fullscreen 3D Atelier Showroom
  if (pathname === "/stores/rbw" || pathname === "/stores/rbw/preview-3d") {
    return null;
  }

  const items = [
    { label: "HOME", href: "/", icon: Home },
    { label: "STORES", href: "/#explore-brands", icon: Store },
    { label: "SHOP", href: "/shop", icon: ShoppingBag, isCenter: true },
    { label: "WISHLIST", href: "/wishlist", icon: Heart },
    { label: "ACCOUNT", href: "/account", icon: User },
  ];

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-[100] w-full max-w-[100vw] overflow-visible bg-[#0D0B0A] border-t border-[#B9965A]/50 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-4 shadow-[0_-8px_24px_rgba(0,0,0,0.85)] flex items-center justify-between select-none box-border">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : item.href !== "/#explore-brands" && pathname?.startsWith(item.href);

        if (item.isCenter) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-full bg-gradient-to-b from-[#D4B16A] via-[#B9965A] to-[#8C6B2F] border-2 border-[#FAF8F5] text-white flex flex-col items-center justify-center -mt-6 shadow-[0_8px_20px_rgba(185,150,90,0.55)] transition-transform duration-300 group-hover:scale-105 active:scale-95">
                <Icon className="w-4.5 h-4.5 text-white drop-shadow-xs" />
                <span className="text-[7px] font-black tracking-widest text-white uppercase mt-0.5">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? "text-[#D4B16A]" : "text-stone-400 hover:text-white"
              }`}
          >
            <Icon className="w-4 h-4 stroke-[2]" />
            <span className="text-[8px] font-bold tracking-wider uppercase mt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
