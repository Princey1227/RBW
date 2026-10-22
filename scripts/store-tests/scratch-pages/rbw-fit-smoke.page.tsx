"use client";
import { useEffect, useState } from "react";
import { RbwFitSelector } from "@/component/rbw/RbwFitSelector";
/** Scratch-only: RBW's fit selector with DEFAULT props, called the way ShopByFit calls it. */
export default function Smoke() {
  const [fired, setFired] = useState(false);
  useEffect(() => { const h = () => setFired(true); window.addEventListener("RESET_RBW_STOREFRONT", h); return () => window.removeEventListener("RESET_RBW_STOREFRONT", h); }, []);
  const fits = ["Straight", "Baggy"].map((name) => ({ name, keySpec: "k", description: "d" }));
  return (
    <div className="rbw-showroom rbw-j-shell" data-theme="light" style={{ position: "fixed", inset: 0, overflow: "auto" }} data-fired={fired ? "yes" : "no"} id="smoke">
      <RbwFitSelector selectedWash="raw" selectedFit={null} fits={fits} sizing={{ Straight: [], Baggy: [] }} onFitClick={() => {}} onWashChange={() => {}} hrefFor={(f) => `/x/${f}`} />
    </div>
  );
}
