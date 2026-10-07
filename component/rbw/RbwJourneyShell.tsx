"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import { RbwShowroomBackdrop } from "@/component/rbw/3d/RbwShowroomBackdrop";
import "@/component/rbw/3d/rbw-showroom.css";
import "@/component/rbw/rbw-journey.css";

/* -------------------------------------------------------------------------- */
/*  SHELL                                                                     */
/* -------------------------------------------------------------------------- */

interface RbwJourneyShellProps {
  /** Slides the drawer in (translate-y-0) or parks it below the viewport */
  open: boolean;
  /** Stacking layer, e.g. "z-50" / "z-55" */
  layerClass: string;
  /** Wash that sets the lighting recipe — identical mapping to Step 1 */
  washKey: string | null;
  /** The oversized ghost word behind the content (wash on Step 2, fit on Step 3) */
  ghostText: string;
  /** Quieter ghost for content-dense steps */
  ghost?: "regular" | "soft";
  /** Recede slightly when a later step is stacked on top */
  receded?: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** Back control + path, rendered at the top of the scrolling area */
  bar?: React.ReactNode;
  theme?: "dark" | "light";
  children: React.ReactNode;
}

/**
 * One continuous room.
 *
 * Every step is rendered inside `.rbw-showroom` — the exact scope Step 1 uses —
 * so tokens, type and controls are inherited, never re-declared. The backdrop
 * is Step 1's own `RbwShowroomBackdrop`, so the lighting, floor, fabric grain,
 * vignette and ghost lettering match.
 *
 * Geometry mirrors Step 1: the room extends up beneath the global navbar, and
 * the scroll area is padded by (navbar height + the previous drawer offset), so
 * content lands exactly where it did before.
 */
export function RbwJourneyShell({
  open,
  layerClass,
  washKey,
  ghostText,
  ghost = "regular",
  receded = false,
  scrollRef,
  bar,
  theme = "dark",
  children,
}: RbwJourneyShellProps) {
  return (
    <div
      className={`rbw-showroom rbw-j-shell absolute left-0 w-full h-[100dvh] top-[-75px] md:top-[-85px] xl:top-[-103px] ${layerClass} overflow-hidden transform-gpu will-change-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        open
          ? /* entering: rises fully opaque so Step 1's canvas never bleeds through */
            "translate-y-0 opacity-100 pointer-events-auto transition-[transform,translate,scale,filter]"
          : /* leaving: slides away while fading, revealing the previous room */
            "translate-y-full opacity-0 pointer-events-none transition-[transform,translate,scale,filter,opacity]"
      } ${receded ? "scale-[0.985] brightness-[0.94]" : "scale-100 brightness-100"}`}
      data-ghost={ghost}
      data-theme={theme}
      aria-hidden={!open || receded}
      inert={!open || receded}
    >
      <RbwShowroomBackdrop washKey={washKey ?? undefined} ghostText={ghostText} />

      <div
        ref={scrollRef}
        className="rbw-j-scroll flex flex-col [&>*]:shrink-0 pt-[88px] sm:pt-[94px] md:pt-[98px] xl:pt-[106px] pb-28 sm:pb-36"
      >
        {bar}
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  TOP BAR                                                                   */
/* -------------------------------------------------------------------------- */

interface RbwJourneyBarProps {
  backLabel: string;
  onBack: () => void;
  children?: React.ReactNode;
}

/** Back control (left) + path (centre). The right column mirrors the left so the path is truly centred. */
export function RbwJourneyBar({ backLabel, onBack, children }: RbwJourneyBarProps) {
  return (
    <div className="rbw-j-bar rbw-fade">
      <button
        type="button"
        onClick={onBack}
        aria-label={`Back to ${backLabel}`}
        className="rbw-glass-btn rbw-j-back"
      >
        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span className="hidden sm:inline">{backLabel}</span>
      </button>
      {children && <div className="hidden md:block min-w-0 overflow-x-auto scrollbar-none">{children}</div>}
      <span aria-hidden="true" className="hidden md:block" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  PATH  — WASH → FIT → PRODUCT                                              */
/* -------------------------------------------------------------------------- */

interface RbwJourneyPathProps {
  currentStep: 2 | 3;
  wash: string | null;
  fit: string | null;
  /** "jeans" shows all three steps; other categories skip FIT (as the flow does) */
  category: string;
  size: string;
  quantity: number;
  onWash: () => void;
  onFit: () => void;
}

type StepState = "done" | "current" | "upcoming";

interface PathItem {
  key: string;
  label: string;
  value: string;
  state: StepState;
  onClick?: () => void;
  title?: string;
}

export function RbwJourneyPath({
  currentStep,
  wash,
  fit,
  category,
  size,
  quantity,
  onWash,
  onFit,
}: RbwJourneyPathProps) {
  const hasFit = category === "jeans";
  const items: PathItem[] = [
    {
      key: "wash",
      label: "Wash",
      value: wash ? wash.toUpperCase() : "Select",
      state: "done",
      onClick: onWash,
      title: "Change wash",
    },
  ];

  if (hasFit) {
    items.push({
      key: "fit",
      label: "Fit",
      value: currentStep >= 3 && fit ? fit.toUpperCase() : "Select",
      state: currentStep === 2 ? "current" : "done",
      onClick: currentStep >= 3 ? onFit : undefined,
      title: "Change fit",
    });
  }

  items.push({
    key: "size",
    label: "Size",
    value: currentStep >= 3 ? `${size} · Qty ${quantity}` : "—",
    state: currentStep >= 3 ? "current" : "upcoming",
  });

  return (
    <nav aria-label="Selection path" className="rbw-j-path justify-center select-none hidden md:flex">
      {items.map((item, i) => {
        const inner = (
          <>
            <span className="rbw-j-step__num">{String(i + 1).padStart(2, "0")}</span>
            <span className="rbw-j-step__lbl">{item.label}</span>
            <span className="rbw-j-step__val">{item.value}</span>
          </>
        );
        return (
          <React.Fragment key={item.key}>
            {i > 0 && <span className="rbw-j-sep" aria-hidden="true" />}
            {item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                title={item.title}
                data-state={item.state}
                className="rbw-j-step"
              >
                {inner}
              </button>
            ) : (
              <span
                data-state={item.state}
                aria-current={item.state === "current" ? "step" : undefined}
                className="rbw-j-step"
              >
                {inner}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
