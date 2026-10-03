"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Jeans", href: "/stores/rbw" },
  { label: "Jackets", href: "/stores/rbw/jackets" },
  { label: "Shorts", href: "/stores/rbw/shorts" },
  { label: "Accessories", href: "/accessories" },
];

interface DesktopNavProps {
  textClass?: string;
}

export default function DesktopNav({
  textClass = "text-foreground",
}: DesktopNavProps) {
  const pathname = usePathname();
  const isPreview3D = pathname === "/stores/rbw" || pathname === "/stores/rbw/preview-3d";

  // When inside the 3D Preview Showroom, remove category buttons from navbar (handled via left Filter Panel)
  if (isPreview3D) {
    return null;
  }

  return (
    <nav className="hidden xl:flex items-center gap-4 xl:gap-6 2xl:gap-8 z-20 pointer-events-auto select-none">
      {navItems.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : item.href === "/stores/rbw"
              ? pathname === "/stores/rbw" || pathname === "/stores/rbw/"
              : item.href === "/stores/rbw/shorts" || item.href === "/shorts"
                ? pathname.startsWith("/shorts") || pathname.startsWith("/stores/rbw/shorts")
                : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            prefetch={false}
            onClick={(e) => {
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
            className="group relative flex flex-col items-center py-1.5"
          >
            <span
              className={`
                transition-all
                duration-300
                text-[11px]
                xl:text-[12px]
                2xl:text-[13.5px]
                tracking-[0.16em]
                uppercase
                ${active
                  ? "font-black text-[#B9965A] drop-shadow-[0_1px_2px_rgba(185,150,90,0.2)]"
                  : `${textClass}/75 hover:${textClass} font-bold`
                }
              `}
            >
              {item.label}
            </span>

            {/* Prominent Gold/Tan RBW Active Underline */}
            {active && (
              <motion.div
                layoutId="desktopNavUnderline"
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 32,
                }}
                className="absolute -bottom-[3px] left-0 right-0 h-[2.5px] rounded-full bg-gradient-to-r from-[#B9965A] via-[#D4B16A] to-[#B9965A] shadow-[0_1px_6px_rgba(185,150,90,0.45)]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}