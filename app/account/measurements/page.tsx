"use client";

import React, { useState, useEffect } from "react";
import { Ruler, HelpCircle, Check, Sparkles } from "lucide-react";
import { useTheme } from "../../theme-provider";

export default function SizeProfilePage() {
  const { theme } = useTheme();
  const [waist, setWaist] = useState<string>("32");
  const [inseam, setInseam] = useState<string>("32");
  const [preferredFit, setPreferredFit] = useState<string>("straight");
  const [rise, setRise] = useState<string>("mid");
  const [stretch, setStretch] = useState<string>("rigid");
  const [washes, setWashes] = useState<string[]>(["mid", "dark"]);

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("onlydenims_saved_measurements");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setWaist(parsed.waist || "32");
          setInseam(parsed.inseam || "32");
          setPreferredFit(parsed.preferredFit || "straight");
          setRise(parsed.rise || "mid");
          setStretch(parsed.stretch || "rigid");
          setWashes(parsed.washes || ["mid", "dark"]);
        } catch (e) {
          console.error("Failed to parse saved measurements:", e);
        }
      }
    }
  }, []);

  // Recalculate size recommendation when waist changes
  useEffect(() => {
    const wNum = parseFloat(waist);
    if (isNaN(wNum)) {
      setRecommendation(null);
      return;
    }

    let sizeRec = "32";
    if (wNum < 29) sizeRec = "28";
    else if (wNum >= 29 && wNum < 31) sizeRec = "30";
    else if (wNum >= 31 && wNum < 33) sizeRec = "32";
    else if (wNum >= 33 && wNum < 35) sizeRec = "34";
    else if (wNum >= 35 && wNum < 37) sizeRec = "36";
    else if (wNum >= 37 && wNum < 39) sizeRec = "38";
    else sizeRec = "40";

    setRecommendation(sizeRec);
  }, [waist]);

  const handleWashToggle = (wash: string) => {
    setWashes((prev) =>
      prev.includes(wash) ? prev.filter((w) => w !== wash) : [...prev, wash]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "onlydenims_saved_measurements",
          JSON.stringify({ waist, inseam, preferredFit, rise, stretch, washes })
        );
      }
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 800);
  };

  const isLight = theme === "light";

  const inputClass = `w-full px-0 py-2 text-xs font-semibold bg-transparent border-b focus:outline-none rounded-none transition-colors duration-300 ${
    isLight 
      ? "border-neutral-200 text-black focus:border-[#1F4E79]" 
      : "border-neutral-800 text-white focus:border-[#3b82f6]"
  }`;

  const labelClass = "block text-[9px] tracking-[0.25em] font-black uppercase text-neutral-450 mb-1";

  const selectOptionClass = isLight ? "bg-white text-black" : "bg-neutral-950 text-white";

  return (
    <div className={`space-y-10 font-sans antialiased select-none transition-colors duration-300 ${
      isLight ? "bg-white text-black" : "bg-black text-white"
    }`}>
      
      {/* Title */}
      <div className={`border-b pb-4 ${isLight ? "border-neutral-200" : "border-neutral-900"}`}>
        <h2 className="font-serif text-xl font-bold uppercase">
          Denim Size Profile
        </h2>
        <p className="text-[10px] text-neutral-450 tracking-wider uppercase mt-1">
          Define your bespoke dimensions to unlock personalized product sizing suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Profile parameters Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className={`flex items-center gap-2 border-b pb-2 ${isLight ? "border-neutral-100" : "border-neutral-900"}`}>
            <span className="text-[10px] font-black tracking-widest uppercase text-neutral-400">
              Fit Specifications
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Waist Size (Inches)</label>
              <select
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                className={inputClass}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='${isLight ? 'black' : 'white'}' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0 center",
                  backgroundSize: "16px"
                }}
              >
                {["28", "29", "30", "31", "32", "33", "34", "36", "38", "40"].map((w) => (
                  <option key={w} value={w} className={selectOptionClass}>{w}"</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Length / Inseam (Inches)</label>
              <select
                value={inseam}
                onChange={(e) => setInseam(e.target.value)}
                className={inputClass}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='${isLight ? 'black' : 'white'}' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0 center",
                  backgroundSize: "16px"
                }}
              >
                {["30", "32", "34"].map((ins) => (
                  <option key={ins} value={ins} className={selectOptionClass}>{ins}"</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Preferred Denim Fit</label>
            <select
              value={preferredFit}
              onChange={(e) => setPreferredFit(e.target.value)}
              className={inputClass}
              style={{
                WebkitAppearance: "none",
                MozAppearance: "none",
                backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='${isLight ? 'black' : 'white'}' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0 center",
                backgroundSize: "16px"
              }}
            >
              <option value="slim" className={selectOptionClass}>Slim Fit</option>
              <option value="straight" className={selectOptionClass}>Straight Fit</option>
              <option value="baggy" className={selectOptionClass}>Baggy Fit</option>
              <option value="relaxed" className={selectOptionClass}>Relaxed Fit</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Rise Preference</label>
              <select
                value={rise}
                onChange={(e) => setRise(e.target.value)}
                className={inputClass}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='${isLight ? 'black' : 'white'}' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0 center",
                  backgroundSize: "16px"
                }}
              >
                <option value="low" className={selectOptionClass}>Low Rise</option>
                <option value="mid" className={selectOptionClass}>Mid Rise</option>
                <option value="high" className={selectOptionClass}>High Rise</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Stretch Preference</label>
              <select
                value={stretch}
                onChange={(e) => setStretch(e.target.value)}
                className={inputClass}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='${isLight ? 'black' : 'white'}' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0 center",
                  backgroundSize: "16px"
                }}
              >
                <option value="rigid" className={selectOptionClass}>100% Rigid Twill</option>
                <option value="raw" className={selectOptionClass}>Raw / Non-Stretch</option>
                <option value="comfort" className={selectOptionClass}>Comfort Stretch</option>
                <option value="stretch" className={selectOptionClass}>Flexible Stretch</option>
              </select>
            </div>
          </div>

          {/* Favorite Washes */}
          <div>
            <label className={labelClass}>Favorite Washes</label>
            <div className="flex flex-wrap gap-4 mt-2">
              {["light", "mid", "dark", "black"].map((wash) => {
                const isChecked = washes.includes(wash);
                return (
                  <button
                    key={wash}
                    type="button"
                    onClick={() => handleWashToggle(wash)}
                    className={`px-3 py-1.5 border text-[10px] font-black tracking-widest uppercase transition-all rounded-lg cursor-pointer ${
                      isChecked
                        ? (isLight ? "border-[#1F4E79] bg-[#1F4E79] text-white" : "border-[#3b82f6] bg-[#3b82f6] text-white")
                        : (isLight ? "border-neutral-200 text-neutral-600 hover:border-black" : "border-neutral-850 text-neutral-450 hover:border-white")
                    }`}
                  >
                    {wash} Wash
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 font-black tracking-[0.2em] text-[10px] uppercase transition-all duration-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer border-0 ${
                isLight 
                  ? "bg-[#1F4E79] text-white hover:bg-black" 
                  : "bg-[#3b82f6] text-white hover:bg-white hover:text-black"
              }`}
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border border-t-transparent border-current animate-spin" />
              ) : isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  FIT CARD SAVED
                </>
              ) : (
                "SAVE SIZE PROFILE"
              )}
            </button>
          </div>
        </form>

        {/* Denim recommendation card module */}
        <div className="space-y-6">
          <div className={`flex items-center gap-2 select-none border-b pb-2 ${isLight ? "border-neutral-100" : "border-neutral-900"}`}>
            <span className="text-[10px] font-black tracking-widest uppercase text-neutral-450">
              Bespoke Fit Card
            </span>
          </div>

          {recommendation ? (
            <div className={`p-8 border flex flex-col items-center justify-center text-center rounded-2xl ${
              isLight ? "bg-neutral-50/50 border-neutral-200" : "bg-[#3b82f6]/[0.02] border-neutral-900"
            }`}>
              <span className="text-[9px] tracking-[0.25em] text-neutral-450 uppercase font-black">
                RECOMMENDED TAG SIZE
              </span>
              <div className={`font-serif italic font-bold text-6xl mt-4 mb-2 ${
                isLight ? "text-[#1F4E79]" : "text-[#3b82f6]"
              }`}>
                {recommendation}
              </div>
              <span className="text-[9px] font-black tracking-[0.18em] text-neutral-500 uppercase">
                IN {preferredFit.toUpperCase()} FIT
              </span>
              <p className="text-[11px] text-neutral-450 leading-relaxed max-w-xs mt-6">
                Based on your saved waist of **{waist}"** and a desire for **{preferredFit} fit**, Tag Size **{recommendation}** will offer the optimal balance.
              </p>
            </div>
          ) : (
            <div className={`p-8 border border-dashed text-center text-xs py-16 rounded-2xl ${
              isLight ? "border-neutral-200 text-neutral-450" : "border-neutral-900 text-neutral-500"
            }`}>
              Enter your specifications to output recommendations.
            </div>
          )}

          <div className={`flex items-start gap-2.5 p-4 border rounded-2xl ${
            isLight ? "border-neutral-200 bg-neutral-50/50" : "border-neutral-900 bg-neutral-900/30"
          }`}>
            <HelpCircle className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${
              isLight ? "text-[#1F4E79]" : "text-[#3b82f6]"
            }`} />
            <p className={`text-[10px] leading-relaxed ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
              OnlyDenims garments are spun on classic shuttle looms using raw cotton. They will initially feel rigid but will conform to your dimensions after 10–15 wears.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
