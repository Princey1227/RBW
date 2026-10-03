"use client";

import React, { useEffect, useState } from "react";
import "./rbw-showroom.css";

export type RbwAtmosphere = "raw" | "black" | "white";

/** Maps any wash key (incl. "vintage") onto one of the three atmospheres. */
export function toAtmosphere(washKey?: string): RbwAtmosphere {
  if (washKey === "black") return "black";
  if (washKey === "white") return "white";
  return "raw";
}

/** True when the visitor asked the OS for reduced motion. SSR-safe (false until mounted). */
export function useRbwReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

const ATMOSPHERES: RbwAtmosphere[] = ["raw", "black", "white"];

interface RbwShowroomBackdropProps {
  washKey?: string;
  /** Large ghost word placed behind the product */
  ghostText?: string;
}

/**
 * Quiet studio environment. Pure DOM + CSS: no WebGL, no per-frame work.
 * Each wash has its own lighting recipe; switching cross-fades opacity
 * (~1s) so the room "re-lights" instead of snapping.
 */
function RbwShowroomBackdropBase({ washKey, ghostText }: RbwShowroomBackdropProps) {
  const active = toAtmosphere(washKey);
  const ghost = (ghostText || "").trim();
  // Single words get a very large ghost, longer names step down so they never overflow
  const ghostSize =
    ghost.length <= 5 ? "min(21vw, 36vh)" : ghost.length <= 8 ? "min(15vw, 26vh)" : "min(10vw, 17vh)";

  return (
    <div className="rbw-bd" aria-hidden="true">
      <div className="rbw-bd__base" />

      <div className="rbw-bd__lights">
        {ATMOSPHERES.map((w) => (
          <div key={w} className="rbw-bd__wash" data-wash={w} data-active={w === active} />
        ))}
      </div>

      <div className="rbw-bd__floor" />
      <div className="rbw-bd__haze" />

      {ghost ? (
        <div className="rbw-bd__ghost" style={{ fontSize: ghostSize }}>
          <span key={ghost}>{ghost}</span>
        </div>
      ) : null}

      <div className="rbw-bd__fabric" />
      <div className="rbw-bd__vignette" />
    </div>
  );
}

export const RbwShowroomBackdrop = React.memo(RbwShowroomBackdropBase);
