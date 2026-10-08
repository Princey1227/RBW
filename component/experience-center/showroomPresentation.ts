/**
 * Experience Centre — presentation metadata & stage geometry.
 *
 * PURELY VISUAL. Nothing in here touches product data, prices, URLs or
 * business logic. It only tells the showroom *how to stage* an existing
 * product photograph:
 *
 *  - "object"  : flat-lay photo on a clean light backdrop. A silhouette mask
 *                (./masks/*.png, derived from the photo — the photo itself is
 *                untouched) cuts the garment out so it stands in the niche with
 *                its true colours.
 *  - "cutout"  : image already has a transparent background (hanger shots,
 *                technical sketches). Shown as-is.
 *  - "panel"   : photograph with a dark / textured backdrop that cannot be
 *                blended into the wall (editorial flat-lays, collages). It is
 *                presented as a framed, back-lit print standing on the plinth.
 *
 * Unknown images (e.g. a future transparent PNG cut-out) fall back to a safe
 * "object" treatment, so adding new product art never breaks the stage.
 */

export type PresentationKind = "object" | "cutout" | "panel";

export interface ProductPresentation {
  kind: PresentationKind;
  /** natural width / height of the source image */
  ar: number;
  /** garment bounding box inside the photo, as fractions [x0, y0, x1, y1] */
  bbox: [number, number, number, number];
  /** panel only — frame width / height */
  frame?: number;
  /** panel only — horizontal focus (0-100) used by object-position */
  focusX?: number;
  /** object only — silhouette mask URL */
  mask?: string;
}

import stageArt from "./assets/showroom_amber_stage.png";
import mBaggy from "./masks/baggy_fit_flat.png";
import mStraight from "./masks/straight_fit_flat.png";
import mCream from "./masks/cream_denim_jacket.png";
import mCargo from "./masks/black_cargo_jeans.png";
import mShorts from "./masks/light_denim_shorts.png";
import mOlive from "./masks/olive_utility_jacket.png";
import mCap from "./masks/rbw_cap.png";
import mBlack from "./masks/black_jeans_v2.png";
import mBoot from "./masks/bootcut_fit_flat.png";

/** The showroom backdrop artwork (1759 × 732). */
export const STAGE_ART = stageArt;

const FULL: [number, number, number, number] = [0.08, 0.08, 0.92, 0.92];

const PRESENTATION: Record<string, ProductPresentation> = {
  // ── flat-lays on clean light cloth → blended "objects" ────────────────────
  "/baggy_fit_flat.png": { kind: "object", ar: 1, bbox: [0.237, 0.079, 0.775, 0.927], mask: mBaggy.src },
  "/straight_fit_flat.png": { kind: "object", ar: 1, bbox: [0.287, 0.069, 0.713, 0.931], mask: mStraight.src },
  "/cream_denim_jacket.jpg": { kind: "object", ar: 1, bbox: [0.127, 0.127, 0.915, 0.871], mask: mCream.src },
  "/black_cargo_jeans.jpg": { kind: "object", ar: 1, bbox: [0.271, 0.083, 0.733, 0.923], mask: mCargo.src },
  "/light_denim_shorts.jpg": { kind: "object", ar: 1, bbox: [0.142, 0.202, 0.875, 0.821], mask: mShorts.src },
  "/olive_utility_jacket.jpg": { kind: "object", ar: 1, bbox: [0.108, 0.113, 0.9, 0.898], mask: mOlive.src },
  "/rbw_cap.jpg": { kind: "object", ar: 1, bbox: [0.212, 0.215, 0.787, 0.825], mask: mCap.src },
  "/black_jeans_v2.png": { kind: "object", ar: 1, bbox: [0.26, 0.06, 0.744, 0.946], mask: mBlack.src },
  "/bootcut_fit_flat.png": { kind: "object", ar: 1, bbox: [0.281, 0.069, 0.719, 0.938], mask: mBoot.src },

  // ── transparent PNGs (hanger shots + technical sketches + RBW & fits) → "cutouts" ──────
  "/rbwstore/raw.png": { kind: "cutout", ar: 0.667, bbox: [0.055, 0.022, 0.957, 0.986] },
  "/rbwstore/black.png": { kind: "cutout", ar: 0.667, bbox: [0.052, 0.023, 0.955, 0.984] },
  "/rbwstore/white.png": { kind: "cutout", ar: 0.667, bbox: [0.062, 0.023, 0.939, 0.984] },
  "/fits/ankle.png": { kind: "cutout", ar: 0.402, bbox: [0.017, 0.005, 0.926, 0.991] },
  "/fits/black/bankle.png": { kind: "cutout", ar: 0.426, bbox: [0.04, 0.017, 0.869, 0.971] },
  "/fits/white/wankle.png": { kind: "cutout", ar: 0.386, bbox: [0.027, 0.019, 0.947, 0.993] },
  "/fits/slim.png": { kind: "cutout", ar: 0.374, bbox: [0, 0.007, 0.958, 0.993] },
  "/fits/black/bslim.png": { kind: "cutout", ar: 0.426, bbox: [0.06, 0.027, 0.873, 0.983] },
  "/fits/white/wslim.png": { kind: "cutout", ar: 0.386, bbox: [0.009, 0.02, 0.916, 0.991] },
  "/fits/comfort.png": { kind: "cutout", ar: 0.406, bbox: [0, 0.002, 0.952, 0.988] },
  "/fits/black/bcomfort.png": { kind: "cutout", ar: 0.426, bbox: [0.036, 0.019, 0.92, 0.976] },
  "/fits/white/wcomfort.png": { kind: "cutout", ar: 0.404, bbox: [0.03, 0.01, 0.979, 0.988] },
  "/fits/straight.png": { kind: "cutout", ar: 0.406, bbox: [0.03, 0.011, 0.926, 0.996] },
  "/fits/black/bstraight.png": { kind: "cutout", ar: 0.426, bbox: [0.068, 0.032, 0.892, 0.986] },
  "/fits/white/wstraight.png": { kind: "cutout", ar: 0.404, bbox: [0.059, 0.003, 0.941, 0.976] },
  "/fits/baggy.png": { kind: "cutout", ar: 0.446, bbox: [0.016, 0.005, 0.953, 0.996] },
  "/fits/black/bbaggy.png": { kind: "cutout", ar: 0.426, bbox: [0.036, 0.024, 0.984, 0.985] },
  "/fits/white/wbaggy.png": { kind: "cutout", ar: 0.416, bbox: [0.025, 0.015, 0.98, 0.993] },
  "/fits/bootcut.png": { kind: "cutout", ar: 0.442, bbox: [0.02, 0.007, 0.969, 0.995] },
  "/fits/black/bbootcut.png": { kind: "cutout", ar: 0.426, bbox: [0.04, 0.029, 0.992, 0.99] },
  "/fits/white/wbootcut.png": { kind: "cutout", ar: 0.440, bbox: [0.027, 0.012, 0.973, 0.997] },
  "/black_denim_jacket.png": { kind: "cutout", ar: 1299 / 1211, bbox: [0.085, 0.003, 0.931, 0.998] },
  "/vintage_denim_jacket.png": { kind: "cutout", ar: 1, bbox: [0.148, 0, 0.868, 0.926] },
  "/raw_denim_shorts.png": { kind: "cutout", ar: 1, bbox: [0.154, 0.048, 0.844, 0.87] },
  "/black_denim_shorts.png": { kind: "cutout", ar: 1, bbox: [0.13, 0.026, 0.87, 0.916] },
  "/white_denim_shorts.png": { kind: "cutout", ar: 1, bbox: [0.172, 0.082, 0.844, 0.894] },
  "/raw_denim_jacket.png": { kind: "cutout", ar: 1, bbox: [0.158, 0.012, 0.848, 0.912] },
  "/RBW-comfort.png": { kind: "cutout", ar: 1024 / 1536, bbox: [0.17, 0.01, 0.829, 0.984] },
  "/RBW-baggy.png": { kind: "cutout", ar: 1024 / 1536, bbox: [0.109, 0.002, 0.886, 0.975] },
  "/RBW-ankle.png": { kind: "cutout", ar: 1024 / 1536, bbox: [0.224, 0.01, 0.774, 0.984] },

  // ── dark / textured backdrops → framed back-lit prints ────────────────────
  "/raw_jeans.png": { kind: "panel", ar: 1672 / 941, bbox: FULL, frame: 0.74, focusX: 49.6 },
  "/raw_jeans_v2.png": { kind: "panel", ar: 1, bbox: FULL, frame: 0.74, focusX: 50 },
  "/black_jeans.png": { kind: "panel", ar: 1672 / 941, bbox: FULL, frame: 0.74, focusX: 50 },
  "/white_jeans.png": { kind: "panel", ar: 1672 / 941, bbox: FULL, frame: 0.74, focusX: 51 },
  "/white_jeans_v2.png": { kind: "panel", ar: 1, bbox: FULL, frame: 0.74, focusX: 53 },
  "/camo_jeans.png": { kind: "panel", ar: 1, bbox: FULL, frame: 0.92, focusX: 50 },
  "/olive_jeans.png": { kind: "panel", ar: 1, bbox: FULL, frame: 0.8, focusX: 50 },
  "/brands/rbw_accessories.jpg": { kind: "panel", ar: 0.75, bbox: FULL, frame: 0.75, focusX: 50 },
  "/brands/rbw_accessories_v2.jpg": { kind: "panel", ar: 0.75, bbox: FULL, frame: 0.75, focusX: 50 },
};

const FALLBACK: ProductPresentation = { kind: "cutout", ar: 1, bbox: FULL };

export function getPresentation(src: string): ProductPresentation {
  return PRESENTATION[src] ?? FALLBACK;
}

// ─── STAGE GEOMETRY ──────────────────────────────────────────────────────────
//
// The showroom backdrop (showroom_amber_stage.png, 1759 × 732) is rendered in a
// rigid stage that keeps this exact aspect ratio. Every coordinate below is a
// percentage of that stage, measured from the artwork itself (pedestal centres,
// pedestal top surfaces, wall-panel widths), so each garment is centred in its
// section and stands on its plinth at every viewport size.

export const STAGE_AR = 1759 / 732;

export interface SlotSpec {
  /** pedestal centre, % of stage width */
  x: number;
  /** pedestal top surface (where the garment stands), % of stage height */
  y: number;
  /** depth scale relative to the hero */
  s: number;
  opacity: number;
  z: number;
  /** max garment width, % of stage width (wall panels are ~23 / ~14 / ~13 wide) */
  maxW: number;
  /** extra depth treatment */
  filter: string;
}

export const HERO_BOX = { maxH: 55, maxW: 21.8 }; // stage % (height / width)

export const DESKTOP_SLOTS: Record<number, SlotSpec> = {
  0: { x: 50, y: 78.8, s: 1, opacity: 1, z: 30, maxW: 21.8, filter: "none" },
  [-1]: { x: 28.8, y: 77.5, s: 0.76, opacity: 1, z: 20, maxW: 12.6, filter: "saturate(0.95) brightness(0.97)" },
  1: { x: 71.2, y: 77.5, s: 0.76, opacity: 1, z: 20, maxW: 12.6, filter: "saturate(0.95) brightness(0.97)" },
  [-2]: { x: 11.7, y: 77.5, s: 0.7, opacity: 0.96, z: 10, maxW: 11.6, filter: "saturate(0.9) brightness(0.94)" },
  2: { x: 88.3, y: 77.5, s: 0.7, opacity: 0.96, z: 10, maxW: 11.6, filter: "saturate(0.9) brightness(0.94)" },
  [-3]: { x: -6, y: 77.5, s: 0.5, opacity: 0, z: 1, maxW: 11.6, filter: "none" },
  3: { x: 106, y: 77.5, s: 0.5, opacity: 0, z: 1, maxW: 11.6, filter: "none" },
};

export interface ItemGeometry {
  /** garment height at hero scale, stage % of height */
  h0: number;
  /** garment width at hero scale, stage % of width */
  w0: number;
}

/** Garment size at hero scale, fitted into the hero section. */
export function getItemGeometry(
  p: ProductPresentation,
  maxWidth: number = HERO_BOX.maxW,
  maxHeight: number = HERO_BOX.maxH,
): ItemGeometry {
  const g =
    p.kind === "panel"
      ? p.frame ?? 0.74
      : ((p.bbox[2] - p.bbox[0]) * p.ar) / (p.bbox[3] - p.bbox[1]);
  const maxH = p.kind === "panel" ? maxHeight - 2 : maxHeight;
  const h0 = Math.min(maxH, (maxWidth * STAGE_AR) / g);
  const w0 = (g * h0) / STAGE_AR;
  return { h0, w0 };
}
