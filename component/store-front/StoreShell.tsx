"use client";

import React, { useEffect, useState } from "react";
import { RbwShowroomBackdrop } from "@/component/rbw/3d/RbwShowroomBackdrop";
import "@/component/rbw/3d/rbw-showroom.css";
import "@/component/rbw/rbw-journey.css";
import "@/component/rbw/rbw-pdp.css";
import "./store-front.css";
import type { PublicStore } from "@/lib/stores/types";

export type StoreTheme = "dark" | "light";
const KEY = "od_store_theme";

/** Dark by default, exactly like RBW's own journey; visitors can switch. */
export function useStoreTheme(initial: StoreTheme = "dark"): [StoreTheme, () => void] {
  const [theme, setTheme] = useState<StoreTheme>(initial);
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "dark" || v === "light") setTheme(v);
    } catch {}
  }, []);
  const toggle = () =>
    setTheme((t) => {
      const n = t === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, n); } catch {}
      return n;
    });
  return [theme, toggle];
}

/**
 * Full-viewport RBW "room": same shell, backdrop, tokens and scroll container
 * the RBW journey uses. It overlays the global chrome so the brand's own logo
 * and header are what visitors see — RBW's navbar is never edited.
 */
export function StoreShell({
  theme, ghostText, header, children,
}: { theme: StoreTheme; ghostText: string; header?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="rbw-showroom rbw-j-shell od-store fixed inset-0 z-[9000] overflow-hidden"
      data-theme={theme}
      data-ghost="soft"
    >
      <RbwShowroomBackdrop washKey="raw" ghostText={ghostText} />
      {header}
      <div className="rbw-j-scroll flex flex-col [&>*]:shrink-0">{children}</div>
    </div>
  );
}

/**
 * Brand logo. "mono" mirrors how RBW treats its own logo (a white silhouette on
 * dark, a black one on light), so any transparent logo is legible on either
 * theme. "original" keeps the brand's own colours.
 */
export function StoreLogo({ store, theme, className = "od-logo" }: { store: PublicStore; theme: StoreTheme; className?: string }) {
  const filter = store.logoMode === "original" ? "none" : theme === "dark" ? "brightness(0) invert(1)" : "brightness(0)";
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={store.logoUrl} alt={store.name} className={className} style={{ filter }} />;
}

export const ghostFor = (name: string) => name.toUpperCase().replace(/[^A-Z0-9 ]/g, "").trim().slice(0, 14);
