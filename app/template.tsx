"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const getRouteRank = (path: string): number => {
  if (!path || path === "/") return 0;
  if (path.startsWith("/product")) return 3;
  if (path.includes("preview-3d") || path === "/stores/rbw") return 3;
  if (
    path.startsWith("/stores") ||
    path.startsWith("/shop") ||
    path.startsWith("/jackets") ||
    path.startsWith("/shorts") ||
    path.startsWith("/accessories")
  ) {
    return 2;
  }
  return 1; // /about, /blog, /contact, /journey, /returns
};

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [direction, setDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    try {
      const prevPath = sessionStorage.getItem("prev_route_path") || "/";
      const prevRank = getRouteRank(prevPath);
      const currRank = getRouteRank(pathname || "/");

      if (currRank < prevRank) {
        setDirection("down"); // Navigating backward -> slides down
      } else {
        setDirection("up"); // Navigating forward / deeper -> slides up
      }

      sessionStorage.setItem("prev_route_path", pathname || "/");
    } catch {
      setDirection("up");
    }
  }, [pathname]);

  const initialY = direction === "up" ? 50 : -50;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: initialY }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -initialY }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // Ultra smooth luxury deceleration curve
      }}
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
