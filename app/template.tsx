"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

/** Luxury ease curve — same as RBW showroom `--rbw-ease` */
const RBW_EASE = [0.16, 1, 0.3, 1] as const;

/** Brief human-readable label for any route */
function routeLabel(path: string): string {
  if (!path || path === "/") return "HOME";
  if (path === "/experience-center") return "EXPERIENCE CENTER";
  if (path.startsWith("/stores/rbw")) return "RBW SHOWROOM";
  if (path.startsWith("/stores")) return "STORES";
  if (path.startsWith("/product")) return "PRODUCT";
  if (path.startsWith("/shop")) return "SHOP";
  if (path.startsWith("/about")) return "ABOUT";
  if (path.startsWith("/contact")) return "CONTACT";
  if (path.startsWith("/journey")) return "JOURNEY";
  if (path.startsWith("/returns")) return "RETURNS";
  if (path.startsWith("/jackets")) return "JACKETS";
  if (path.startsWith("/shorts")) return "SHORTS";
  if (path.startsWith("/accessories")) return "ACCESSORIES";
  return "ONLY DENIMS";
}

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [curtainVisible, setCurtainVisible] = useState(true);
  const label = routeLabel(pathname || "/");

  useEffect(() => {
    setCurtainVisible(true);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Safety fallback: ensure curtain never gets stuck even if tab is in background
    const timer = setTimeout(() => {
      setCurtainVisible(false);
    }, 1100);

    return () => clearTimeout(timer);
  }, [pathname]);

  /* ─── CURTAIN SHUTTER variants ───────────────────────────────────────────
     Both panels start closed (scaleY: 1), hold briefly so the brand moment
     registers, then retract smoothly (top sweeps UP, bottom sweeps DOWN).
  ─────────────────────────────────────────────────────────────────────────── */
  const topPanel = {
    initial: { scaleY: 1, originY: "0%" },
    animate: {
      scaleY: 0,
      originY: "0%",
      transition: { duration: 0.58, ease: RBW_EASE, delay: 0.32 },
    },
  };

  const bottomPanel = {
    initial: { scaleY: 1, originY: "100%" },
    animate: {
      scaleY: 0,
      originY: "100%",
      transition: { duration: 0.58, ease: RBW_EASE, delay: 0.32 },
    },
  };

  /* ─── BRAND CENTRE MOMENT ─────────────────────────────────────────────── */
  const brandCenter = {
    initial: { opacity: 1, scale: 1 },
    animate: {
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.25, ease: "easeOut" as const, delay: 0.22 },
    },
  };

  const scanLine = {
    initial: { scaleX: 1, opacity: 1 },
    animate: {
      scaleX: 0,
      opacity: 0,
      transition: { duration: 0.25, ease: RBW_EASE, delay: 0.18 },
    },
  };

  /* ─── CONTENT variants ───────────────────────────────────────────────────
     Page content rises and fades in smoothly as curtain retracts */
  const contentVariants = {
    initial: { opacity: 0, y: 18 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: RBW_EASE, delay: 0.38 },
    },
  };

  return (
    <>
      {/* ── CINEMATIC CURTAIN REVEAL OVERLAY ─────────────────────────────── */}
      <AnimatePresence>
        {curtainVisible && (
          <motion.div
            key={`curtain-${pathname}`}
            aria-hidden="true"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* TOP PANEL — sweeps up to top edge */}
            <motion.div
              variants={topPanel}
              initial="initial"
              animate="animate"
              onAnimationComplete={() => setCurtainVisible(false)}
              style={{
                flex: "0 0 50%",
                background: "linear-gradient(180deg, #07080a 0%, #0f1016 100%)",
                transformOrigin: "top center",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 0,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Subtle noise/grain texture */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
                  pointerEvents: "none",
                }}
              />
            </motion.div>

            {/* CENTRE SEAM — brand badge pinned between panels */}
            <motion.div
              variants={brandCenter}
              initial="initial"
              animate="animate"
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                zIndex: 10000,
                pointerEvents: "none",
              }}
            >
              {/* Top gold scan line */}
              <motion.div
                variants={scanLine}
                style={{
                  width: "min(260px, 38vw)",
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, #C5A059 30%, #DFBC77 50%, #C5A059 70%, transparent)",
                  marginBottom: "8px",
                }}
              />

              {/* ONLY DENIMS title */}
              <p
                style={{
                  fontFamily: "var(--font-serif), Georgia, serif",
                  fontSize: "clamp(11px, 1.8vw, 15px)",
                  letterSpacing: "0.32em",
                  color: "#C5A059",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                ONLY DENIMS
              </p>

              {/* Current route label */}
              <p
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "clamp(8px, 1.1vw, 10px)",
                  letterSpacing: "0.22em",
                  color: "rgba(161,161,170,0.7)",
                  fontWeight: 400,
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {label}
              </p>

              {/* Bottom gold scan line */}
              <motion.div
                variants={scanLine}
                style={{
                  width: "min(260px, 38vw)",
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, #C5A059 30%, #DFBC77 50%, #C5A059 70%, transparent)",
                  marginTop: "8px",
                }}
              />
            </motion.div>

            {/* BOTTOM PANEL — sweeps down to bottom edge */}
            <motion.div
              variants={bottomPanel}
              initial="initial"
              animate="animate"
              style={{
                flex: "0 0 50%",
                background: "linear-gradient(0deg, #07080a 0%, #0f1016 100%)",
                transformOrigin: "bottom center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Subtle noise/grain texture */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
                  pointerEvents: "none",
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGE CONTENT ────────────────────────────────────────────────── */}
      <motion.div
        key={`content-${pathname}`}
        variants={contentVariants}
        initial="initial"
        animate="animate"
        className="w-full flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </>
  );
}
