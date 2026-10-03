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
function splitGhostWord(word: string): { left: string; center: string; right: string } {
  const upper = word.toUpperCase();
  if (upper === "RAW") {
    return { left: "R", center: "A", right: "W" };
  }
  if (upper === "BLACK") {
    return { left: "BL", center: "A", right: "CK" };
  }
  if (upper === "WHITE") {
    return { left: "WH", center: "I", right: "TE" };
  }
  if (upper.length === 0) {
    return { left: "", center: "", right: "" };
  }
  if (upper.length % 2 === 1) {
    const mid = Math.floor(upper.length / 2);
    return {
      left: upper.slice(0, mid),
      center: upper.charAt(mid),
      right: upper.slice(mid + 1),
    };
  }
  const mid = upper.length / 2;
  return {
    left: upper.slice(0, mid),
    center: "",
    right: upper.slice(mid),
  };
}

function RbwShowroomBackdropBase({ washKey, ghostText }: RbwShowroomBackdropProps) {
  const active = toAtmosphere(washKey);
  const ghost = (ghostText || "").trim();
  const parts = splitGhostWord(ghost);

  // Scaled so the center letter (A in RAW, A in BLACK, I in WHITE) is positioned
  // directly behind the 3D pant and fully covered by its silhouette.
  const ghostSize =
    ghost.length <= 5
      ? "min(22vw, 45vh)"
      : ghost.length <= 8
        ? "min(18vw, 38vh)"
        : "min(13vw, 28vh)";

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
          <div key={ghost} className="rbw-bd__ghost-grid">
            <span className="rbw-bd__ghost-left">{parts.left}</span>
            <span className="rbw-bd__ghost-center">{parts.center}</span>
            <span className="rbw-bd__ghost-right">{parts.right}</span>
          </div>
        </div>
      ) : null}

      <div className="rbw-bd__fabric" />
      <div className="rbw-bd__vignette" />
    </div>
  );
}

export const RbwShowroomBackdrop = React.memo(RbwShowroomBackdropBase);
