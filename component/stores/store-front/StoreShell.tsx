"use client";

import React, { useEffect, useState } from "react";
import { RbwShowroomBackdrop } from "@/component/stores/rbw/3d/RbwShowroomBackdrop";
import "@/component/stores/rbw/3d/rbw-showroom.css";
import "@/component/stores/rbw/rbw-journey.css";
import "@/component/stores/rbw/rbw-pdp.css";
import "./store-front.css";

export type StoreTheme = "dark" | "light";
const KEY = "od_store_theme";

/** Light by default so dark brand logos are visible; visitors can switch. */
export function useStoreTheme(): [StoreTheme, () => void] {
  const [theme, setTheme] = useState<StoreTheme>("light");
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

export const ghostFor = (name: string) => name.toUpperCase().replace(/[^A-Z0-9 ]/g, "").trim().slice(0, 14);
