"use client";

import React from "react";
import { ArrowLeft, LogOut, Sun, Moon } from "lucide-react";
import type { PublicStore, StoreCategory } from "@/lib/stores/types";

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

/**
 * Dedicated Brand Header / Navbar for Second army
 * Customize your logo, links, and layout directly here.
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
  const filter =
    store.logoMode === "original"
      ? "none"
      : theme === "dark"
      ? "brightness(0) invert(1)"
      : "brightness(0)";

  return (
    <header className="brand-head" aria-label="Second army navigation">
      {/* Left: Back to Main Mall & Category Pills */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm transition-all shrink-0"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          <span className="hidden sm:inline">OnlyDenims</span>
        </a>

        <nav className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className="brand-cat-btn"
              data-active={c.id === activeCategory}
              onClick={() => onSelectCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Center: Brand Logo */}
      <button
        type="button"
        onClick={onHomeClick}
        aria-label="Second army home"
        className="cursor-pointer bg-transparent border-0 p-1 flex items-center justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={store.logoUrl}
          alt={store.name}
          className="brand-logo"
          style={{ filter }}
        />
      </button>

      {/* Right: Theme Switcher & Logout */}
      <div className="flex items-center justify-end gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 inline-flex items-center justify-center rounded-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button
          type="button"
          onClick={onLogout}
          aria-label="Log out"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm transition-all cursor-pointer"
        >
          <LogOut size={13} strokeWidth={1.75} />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
}

export default BrandNavbar;
