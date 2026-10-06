"use client";

import React, { useEffect, useRef } from "react";
import { X, ArrowUpRight } from "lucide-react";
import "@/component/rbw/3d/rbw-showroom.css";
import "@/component/rbw/rbw-journey.css";

export interface RbwSizingSpec {
  size: string;
  waist: number;
  inseam: number;
  frontRise: number;
  thigh: number;
  legOpening: number;
}

interface RbwSizeChartModalProps {
  /** Small gold line above the title, e.g. "Straight fit" */
  kicker: string;
  title: string;
  /** Italic serif line under the title */
  subtitle?: string;
  rows: RbwSizingSpec[];
  unit: "in" | "cm";
  onUnitChange: (unit: "in" | "cm") => void;
  onClose: () => void;
  /** Highlights a row and tags it CURRENT */
  currentSize?: string;
  /** When provided, each row gets a Select action */
  onSelectSize?: (size: string) => void;
  /** Show the "How to measure" strip (size-guide use) */
  showHowTo?: boolean;
  /** Footer call to action (fit-selection use) */
  cta?: { label: string; onClick: () => void };
  note?: string;
}

const HOW_TO: { term: string; text: string }[] = [
  { term: "Waist", text: "Measure flat across the waistband without stretching, then double it." },
  { term: "Inseam", text: "From the inner crotch point straight down to the leg hem." },
  { term: "Front rise", text: "From the crotch intersection up to the top of the waistband." },
  { term: "Thigh", text: "One inch below the crotch point, flat across the leg." },
  { term: "Leg opening", text: "Flat measurement across the bottom hem." },
  { term: "Recommendation", text: "Select your standard natural waist size." },
];

/**
 * Showroom-styled measurement sheet. Rendered inside a `.rbw-showroom` drawer,
 * so it inherits Step 1's tokens. `position: fixed` resolves against the
 * (transformed) drawer, which is exactly the room the user is standing in.
 */
export function RbwSizeChartModal({
  kicker,
  title,
  subtitle,
  rows,
  unit,
  onUnitChange,
  onClose,
  currentSize,
  onSelectSize,
  showHowTo = false,
  cta,
  note,
}: RbwSizeChartModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fmt = (inches: number) => (unit === "cm" ? (inches * 2.54).toFixed(1) : String(inches));
  const U = unit.toUpperCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rbw-chart-title"
      className="rbw-j-modal"
      onClick={onClose}
    >
      <div className="rbw-j-panel" onClick={(e) => e.stopPropagation()}>
        <div className="rbw-j-panel__head">
          <div className="min-w-0">
            <p className="rbw-eyebrow">{kicker}</p>
            <h3 id="rbw-chart-title" className="rbw-j-panel__title">
              {title}
            </h3>
            {subtitle && <p className="rbw-descriptor rbw-j-panel__sub">{subtitle}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rbw-glass-btn rbw-j-close"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {showHowTo && (
          <div className="rbw-j-howto">
            {HOW_TO.map((h) => (
              <p key={h.term}>
                <b>{h.term}.</b> {h.text}
              </p>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="rbw-j-label">Measurements · {unit === "in" ? "Inches" : "Centimetres"}</span>
          <div className="rbw-j-toggle" role="group" aria-label="Unit">
            <button type="button" data-on={unit === "in"} aria-pressed={unit === "in"} onClick={() => onUnitChange("in")}>
              In
            </button>
            <button type="button" data-on={unit === "cm"} aria-pressed={unit === "cm"} onClick={() => onUnitChange("cm")}>
              Cm
            </button>
          </div>
        </div>

        <div className="rbw-j-table-wrap">
          <table className="rbw-j-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Waist {U}</th>
                <th>Inseam {U}</th>
                <th>Rise</th>
                <th>Thigh</th>
                <th>Leg opening</th>
                {onSelectSize && <th aria-label="Action" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isCurrent = currentSize === row.size;
                return (
                  <tr key={row.size} data-current={isCurrent}>
                    <td>
                      {row.size}
                      {isCurrent && <span className="rbw-j-tag">CURRENT</span>}
                    </td>
                    <td>{fmt(row.waist)}</td>
                    <td>{fmt(row.inseam)}</td>
                    <td>{fmt(row.frontRise)}</td>
                    <td>{fmt(row.thigh)}</td>
                    <td>{fmt(row.legOpening)}</td>
                    {onSelectSize && (
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="rbw-j-link"
                          onClick={() => onSelectSize(row.size)}
                          aria-label={`Select size ${row.size}`}
                        >
                          {isCurrent ? "Selected" : "Select"}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {note && (
          <p className="rbw-descriptor mt-4" style={{ fontSize: 14, lineHeight: 1.5 }}>
            {note}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
          <button type="button" onClick={onClose} className="rbw-j-btn">
            Close
          </button>
          {cta && (
            <button type="button" onClick={cta.onClick} className="rbw-cta">
              <span>{cta.label}</span>
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
