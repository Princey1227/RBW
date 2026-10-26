"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Move,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
  ZoomIn,
  Loader2,
} from "lucide-react";
import type { ClientProduct } from "@/lib/stores/types";
import { fmtPrice } from "@/component/store-front/brandItems";
import { useCart } from "@/context/CartContext";
import { RbwSizeChartModal, type RbwSizingSpec } from "@/component/rbw/RbwSizeChartModal";
import "@/component/rbw/rbw-pdp.css";
import "@/component/rbw/rbw-journey.css";

const TapeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="7" width="18" height="10" rx="3" />
    <path d="M7 7v4M11 7v3M15 7v4M19 7v3" />
  </svg>
);

const sizingData: Record<string, RbwSizingSpec[]> = {
  slim: [
    { size: "28", waist: 29.0, inseam: 32, frontRise: 9.5, thigh: 20.5, legOpening: 13.0 },
    { size: "30", waist: 31.0, inseam: 32, frontRise: 10.0, thigh: 21.5, legOpening: 13.5 },
    { size: "32", waist: 33.0, inseam: 32, frontRise: 10.5, thigh: 22.5, legOpening: 14.0 },
    { size: "34", waist: 35.0, inseam: 32, frontRise: 11.0, thigh: 23.5, legOpening: 14.5 },
    { size: "36", waist: 37.0, inseam: 32, frontRise: 11.5, thigh: 24.5, legOpening: 15.0 },
    { size: "38", waist: 39.0, inseam: 32, frontRise: 12.0, thigh: 25.5, legOpening: 15.5 },
    { size: "40", waist: 41.0, inseam: 32, frontRise: 12.5, thigh: 26.5, legOpening: 16.0 },
    { size: "42", waist: 43.0, inseam: 32, frontRise: 13.0, thigh: 27.5, legOpening: 16.5 },
  ],
  straight: [
    { size: "28", waist: 29.0, inseam: 32, frontRise: 10.0, thigh: 21.5, legOpening: 14.5 },
    { size: "30", waist: 31.0, inseam: 32, frontRise: 10.5, thigh: 22.5, legOpening: 15.0 },
    { size: "32", waist: 33.0, inseam: 32, frontRise: 11.0, thigh: 23.5, legOpening: 15.5 },
    { size: "34", waist: 35.0, inseam: 32, frontRise: 11.5, thigh: 24.5, legOpening: 16.0 },
    { size: "36", waist: 37.0, inseam: 32, frontRise: 12.0, thigh: 25.5, legOpening: 16.5 },
    { size: "38", waist: 39.0, inseam: 32, frontRise: 12.5, thigh: 26.5, legOpening: 17.0 },
    { size: "40", waist: 41.0, inseam: 32, frontRise: 13.0, thigh: 27.5, legOpening: 17.5 },
    { size: "42", waist: 43.0, inseam: 32, frontRise: 13.5, thigh: 28.5, legOpening: 18.0 },
  ],
  baggy: [
    { size: "28", waist: 30.0, inseam: 30, frontRise: 12.0, thigh: 24.5, legOpening: 18.0 },
    { size: "30", waist: 32.0, inseam: 30, frontRise: 12.5, thigh: 25.5, legOpening: 18.5 },
    { size: "32", waist: 34.0, inseam: 30, frontRise: 13.0, thigh: 26.5, legOpening: 19.0 },
    { size: "34", waist: 36.0, inseam: 30, frontRise: 13.5, thigh: 27.5, legOpening: 19.5 },
    { size: "36", waist: 38.0, inseam: 30, frontRise: 14.0, thigh: 28.5, legOpening: 20.0 },
    { size: "38", waist: 40.0, inseam: 30, frontRise: 14.5, thigh: 29.5, legOpening: 20.5 },
    { size: "40", waist: 42.0, inseam: 30, frontRise: 15.0, thigh: 30.5, legOpening: 21.0 },
    { size: "42", waist: 44.0, inseam: 30, frontRise: 15.5, thigh: 31.5, legOpening: 21.5 },
  ],
  bootcut: [
    { size: "28", waist: 29.0, inseam: 32, frontRise: 10.25, thigh: 22.0, legOpening: 18.0 },
    { size: "30", waist: 31.0, inseam: 32, frontRise: 10.75, thigh: 23.0, legOpening: 18.5 },
    { size: "32", waist: 33.0, inseam: 32, frontRise: 11.25, thigh: 24.0, legOpening: 19.0 },
    { size: "34", waist: 35.0, inseam: 32, frontRise: 11.75, thigh: 25.0, legOpening: 19.5 },
    { size: "36", waist: 37.0, inseam: 32, frontRise: 12.25, thigh: 26.0, legOpening: 20.0 },
    { size: "38", waist: 39.0, inseam: 32, frontRise: 12.75, thigh: 27.0, legOpening: 20.5 },
    { size: "40", waist: 41.0, inseam: 32, frontRise: 13.25, thigh: 28.0, legOpening: 21.0 },
    { size: "42", waist: 43.0, inseam: 32, frontRise: 13.75, thigh: 29.0, legOpening: 21.5 },
  ],
  comfort: [
    { size: "28", waist: 29.5, inseam: 31, frontRise: 10.75, thigh: 22.5, legOpening: 13.75 },
    { size: "30", waist: 31.5, inseam: 31, frontRise: 11.25, thigh: 23.5, legOpening: 14.25 },
    { size: "32", waist: 33.5, inseam: 31, frontRise: 11.75, thigh: 24.5, legOpening: 14.75 },
    { size: "34", waist: 35.5, inseam: 31, frontRise: 12.25, thigh: 25.5, legOpening: 15.25 },
    { size: "36", waist: 37.5, inseam: 31, frontRise: 12.75, thigh: 26.5, legOpening: 15.75 },
    { size: "38", waist: 39.5, inseam: 31, frontRise: 13.25, thigh: 27.5, legOpening: 16.25 },
    { size: "40", waist: 41.5, inseam: 31, frontRise: 13.75, thigh: 28.5, legOpening: 16.75 },
    { size: "42", waist: 43.5, inseam: 31, frontRise: 14.25, thigh: 29.5, legOpening: 17.25 },
  ],
};

interface PDPProps {
  product: ClientProduct;
  categoryLabel: string;
  colorName: string;
  brandName: string;
  fit?: string | null;
  wished?: boolean;
  onWish?: () => void;
  onBackToFits?: () => void;
}

/**
 * Dedicated Product Detail Page (PDP) matching the RBW flagship showroom:
 * - 4-thumbnail vertical gallery strip with active gold border
 * - Main frame with high-resolution pan and zoom controls
 * - Headline, price incl. taxes, in-stock badge
 * - Waist size selector & Size guide modal trigger
 * - Quantity stepper
 * - Solid "Buy now ↗" primary action
 * - "Add to cart" & "Change fit" secondary row
 * - 2x2 Garment Specifications (Fabric, Silhouette, Stretch, Care)
 * - Brand delivery & authenticity guarantee
 */
export function PDP({
  product,
  categoryLabel,
  colorName,
  brandName,
  fit,
  onBackToFits,
}: PDPProps) {
  const { addToCart } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("28");
  const [qty, setQty] = useState(1);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Inline Zoom & Pan state matching RBW
  const [isInlineZoomActive, setIsInlineZoomActive] = useState(false);
  const [inlineZoomScale, setInlineZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  // Size Chart Modal state
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [unit, setUnit] = useState<"in" | "cm">("in");

  // Construct 4 gallery shots to match the 4-thumbnail strip layout
  const galleryImages = useMemo(() => {
    const list = product.imageUrls && product.imageUrls.length ? [...product.imageUrls] : [];
    const normFit = (fit || product.fit || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const fallbacks = [
      normFit ? `/fits/black/b${normFit}.png` : "/brands/second-army_men.jpg",
      "/brands/second_army_v2.jpg",
      "/brands/second-army.jpg",
      "/raw_jeans.png",
    ];
    for (const fb of fallbacks) {
      if (list.length >= 4) break;
      if (!list.includes(fb)) list.push(fb);
    }
    return list.slice(0, 4);
  }, [product.imageUrls, fit, product.fit]);

  const activeImgUrl = galleryImages[activeImageIndex] || galleryImages[0];

  // Sizes: Use product.sizes if non-empty, otherwise default to full range
  const sizes = useMemo(() => {
    if (product.sizes && product.sizes.length > 0) return product.sizes;
    return ["28", "30", "32", "34", "36", "38", "40", "42"];
  }, [product.sizes]);

  // Initial selected size
  React.useEffect(() => {
    if (sizes.length > 0 && !sizes.includes(selectedSize)) {
      setSelectedSize(sizes[0]);
    }
  }, [sizes, selectedSize]);

  // Panning event handlers for zoomed image
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isInlineZoomActive || inlineZoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isInlineZoomActive) return;
    const maxPan = (inlineZoomScale - 1) * 160;
    const newX = Math.min(Math.max(e.clientX - dragStart.x, -maxPan), maxPan);
    const newY = Math.min(Math.max(e.clientY - dragStart.y, -maxPan), maxPan);
    setPanPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isInlineZoomActive || inlineZoomScale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - panPosition.x, y: e.touches[0].clientY - panPosition.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isInlineZoomActive || e.touches.length !== 1) return;
    const maxPan = (inlineZoomScale - 1) * 160;
    const newX = Math.min(Math.max(e.touches[0].clientX - dragStart.x, -maxPan), maxPan);
    const newY = Math.min(Math.max(e.touches[0].clientY - dragStart.y, -maxPan), maxPan);
    setPanPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Cart actions
  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(
        product.id,
        qty,
        {
          title: `${product.name} (${selectedSize})`,
          price: product.price || 0,
          image: galleryImages[0],
        },
        true
      );
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2200);
    } catch (err) {
      console.error("Failed adding product to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      const freshCart = await addToCart(
        product.id,
        qty,
        {
          title: `${product.name} (${selectedSize})`,
          price: product.price || 0,
          image: galleryImages[0],
        },
        true
      );
      if (freshCart?.checkoutUrl) {
        window.location.href = freshCart.checkoutUrl;
      }
    } catch (err) {
      console.error("Buy now checkout failed:", err);
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Garment Specifications matching RBW
  const fabricSpec = useMemo(() => {
    const cat = categoryLabel.toLowerCase();
    const col = colorName.toLowerCase();
    if (cat.includes("jacket")) return "14.5oz Heavy Tactical Twill Selvedge";
    if (cat.includes("shirt")) return "8.5oz Chambray Selvedge Cotton";
    if (col.includes("raw")) return "14.5oz Pure Raw Indigo Selvedge Denim";
    if (col.includes("black")) return "13.5oz Deep Sulphur Black Overdyed Denim";
    if (col.includes("white")) return "13.0oz Natural Ecru Bleached Bull Denim";
    if (col.includes("olive")) return "14.0oz Tactical Olive Drab Overdyed Twill";
    return "14.5oz Pure Selvedge Denim";
  }, [categoryLabel, colorName]);

  const silhouetteSpec = useMemo(() => {
    const cat = categoryLabel.toLowerCase();
    if (cat.includes("jacket")) return "Heritage Tactical Field Silhouette";
    if (cat.includes("shirt")) return "Classic Relaxed Overshirt Silhouette";
    const f = fit || product.fit || "Straight";
    return `${f.charAt(0).toUpperCase() + f.slice(1)} Fit • 5-Pocket`;
  }, [categoryLabel, fit, product.fit]);

  const stretchSpec = "100% Rigid Shuttle-Loom Cotton (0% Stretch)";

  const careSpec = useMemo(() => {
    const col = colorName.toLowerCase();
    if (col.includes("raw")) return "Wear 6 months before first cold wash; line dry inside out";
    if (col.includes("black")) return "Cold wash inside out with dark colours; line dry";
    if (col.includes("white")) return "Gentle cold wash with like light tones; do not bleach";
    return "Cold wash inside out, line dry in shade";
  }, [colorName]);

  const normFitKey = (fit || product.fit || "straight").toLowerCase();
  const activeSpecs = sizingData[normFitKey] || sizingData.straight;

  return (
    <>
      <div className="rbw-pdp w-[88%] max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-16">
        {/* Left: Product Images Gallery with 4 Vertical Thumbnails */}
        <div className="w-full lg:col-span-6 lg:sticky lg:top-6 flex flex-col items-center lg:items-start">
          <div className="w-full flex flex-col-reverse sm:flex-row items-center sm:items-start justify-center lg:justify-start gap-4">
            {galleryImages.length > 1 && (
              <div className="rbw-j-thumbs flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 max-w-full">
                {galleryImages.map((u, i) => (
                  <button
                    key={i}
                    type="button"
                    className="rbw-j-thumb"
                    data-on={activeImageIndex === i}
                    aria-label={`View photo ${i + 1}`}
                    onClick={() => {
                      setActiveImageIndex(i);
                      setIsInlineZoomActive(false);
                      setInlineZoomScale(1);
                      setPanPosition({ x: 0, y: 0 });
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" />
                  </button>
                ))}
              </div>
            )}

            <div
              ref={zoomContainerRef}
              className="rbw-j-frame"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={activeImgUrl}
                src={activeImgUrl}
                alt={product.name}
                style={{
                  transform: isInlineZoomActive
                    ? `translate(${panPosition.x}px, ${panPosition.y}px) scale(${inlineZoomScale})`
                    : "none",
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 250ms cubic-bezier(0.25, 1, 0.5, 1)",
                  cursor: isInlineZoomActive ? (isDragging ? "grabbing" : "grab") : "default",
                }}
                className="rbw-fade w-full h-full object-contain p-2 sm:p-3 object-center pointer-events-none"
              />

              {isInlineZoomActive && inlineZoomScale > 1 && (
                <div className="rbw-j-chip rbw-fade absolute top-3 right-3 z-30 pointer-events-none">
                  <Move className="w-3 h-3" strokeWidth={1.5} />
                  <span>Drag to move</span>
                </div>
              )}

              {!isInlineZoomActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsInlineZoomActive(true);
                    setInlineZoomScale(1.5);
                    setPanPosition({ x: 0, y: 0 });
                  }}
                  title="Zoom image"
                  aria-label="Zoom image"
                  className="rbw-glass-btn absolute bottom-3 left-3 z-20 w-10 h-10 rounded-full !text-[color:var(--rbw-ink)] cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
                </button>
              ) : (
                <div className="rbw-j-chip rbw-fade absolute bottom-3 left-3 z-30 !px-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const newScale = Math.max(1, inlineZoomScale - 0.5);
                      setInlineZoomScale(newScale);
                      if (newScale === 1) setPanPosition({ x: 0, y: 0 });
                    }}
                    disabled={inlineZoomScale <= 1}
                    title="Zoom out"
                    aria-label="Zoom out"
                  >
                    &minus;
                  </button>
                  <span className="min-w-[34px] text-center tabular-nums">{Math.round(inlineZoomScale * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setInlineZoomScale((prev) => Math.min(3.5, prev + 0.5))}
                    disabled={inlineZoomScale >= 3.5}
                    title="Zoom in"
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                  <span className="w-px h-3.5 bg-[color:var(--rbw-line)]" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsInlineZoomActive(false);
                      setInlineZoomScale(1);
                      setPanPosition({ x: 0, y: 0 });
                    }}
                    title="Close zoom"
                    aria-label="Close zoom"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {galleryImages.length > 1 && (
            <p className="rbw-j-counter mt-4 text-center sm:text-left w-full sm:pl-20 lg:pl-24">
              <b>{String(activeImageIndex + 1).padStart(2, "0")}</b> / {String(galleryImages.length).padStart(2, "0")}
            </p>
          )}
        </div>

        {/* Right: Product Details & Purchase Controls */}
        <div className="w-full lg:col-span-6 flex flex-col text-left justify-start">
          <p className="rbw-eyebrow">
            {colorName} · {fit || categoryLabel}
          </p>

          <h1 className="rbw-j-title mt-3">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <span className="rbw-j-price">{fmtPrice(product.price || 1900)}</span>
            <span className="rbw-j-note">Incl. taxes</span>
          </div>

          <div className="mt-3">
            <span className="rbw-j-status" data-low={product.stock === "out_of_stock"}>
              {product.stock === "out_of_stock" ? "Low stock · dispatch in 48h" : "In stock · ships in 24h"}
            </span>
          </div>

          <span className="rbw-j-rule my-6" />

          {/* Waist Size & Size Guide */}
          <div>
            <div className="flex justify-between items-center mb-3 gap-3">
              <span className="rbw-j-label">
                {categoryLabel.toLowerCase().includes("jacket") ? "Jacket size · Chest" : "Waist size · inches"}
              </span>
              <button
                type="button"
                onClick={() => setSizeChartOpen(true)}
                className="rbw-j-link cursor-pointer inline-flex items-center gap-1.5"
              >
                <TapeIcon className="w-3.5 h-3.5" />
                <span>Size guide</span>
              </button>
            </div>
            <div className="rbw-j-sizes grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2" role="group" aria-label="Waist size">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={selectedSize === s}
                  onClick={() => setSelectedSize(s)}
                  className="rbw-j-size cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="mt-6 flex items-center justify-between">
            <span className="rbw-j-label">Quantity</span>
            <div className="rbw-j-stepper">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                &minus;
              </button>
              <span aria-live="polite">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty(Math.min(10, qty + 1))}
              >
                +
              </button>
            </div>
          </div>

          {/* Purchase Actions */}
          <div className="w-full mt-6 flex flex-col gap-3">
            {/* Primary Buy Now Button */}
            <button
              type="button"
              disabled={isBuyingNow}
              onClick={handleBuyNow}
              className="rbw-cta rbw-j-cta-block cursor-pointer flex items-center justify-center gap-2"
            >
              {isBuyingNow ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing checkout</span>
                </>
              ) : (
                <>
                  <span>Buy now</span>
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </>
              )}
            </button>

            {/* Secondary Row: Add to cart & Change fit */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isAdding}
                onClick={handleAddToCart}
                data-state={justAdded ? "added" : undefined}
                className="rbw-j-btn cursor-pointer flex items-center justify-center gap-2"
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Added</span>
                  </>
                ) : isAdding ? (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 animate-bounce" strokeWidth={1.5} />
                    <span>Adding</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Add to cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onBackToFits}
                className="rbw-j-btn cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Change fit</span>
              </button>
            </div>
          </div>

          {/* Garment Specifications 2x2 Grid */}
          <dl className="rbw-j-specs mt-9">
            <div className="rbw-j-spec">
              <dt>Fabric</dt>
              <dd>{fabricSpec}</dd>
            </div>
            <div className="rbw-j-spec">
              <dt>Silhouette</dt>
              <dd>{silhouetteSpec}</dd>
            </div>
            <div className="rbw-j-spec">
              <dt>Stretch</dt>
              <dd>{stretchSpec}</dd>
            </div>
            <div className="rbw-j-spec">
              <dt>Care</dt>
              <dd>{careSpec}</dd>
            </div>
          </dl>

          {/* Delivery & Authenticity Guarantee */}
          <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Truck size={14} className="text-[#B9965A]" />
              <span>Express domestic delivery across India (2–4 business days)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#B9965A]" />
              <span>100% Authentic brand guarantee directly from {brandName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sizing Chart Modal */}
      {sizeChartOpen && (
        <RbwSizeChartModal
          kicker={`${fit || "Straight"} fit`}
          title={`${brandName} Size Guide`}
          subtitle="Crafted to standard bespoke tailoring specs"
          rows={activeSpecs}
          unit={unit}
          onUnitChange={setUnit}
          onClose={() => setSizeChartOpen(false)}
          currentSize={selectedSize}
          onSelectSize={(s) => {
            setSelectedSize(s);
            setSizeChartOpen(false);
          }}
          showHowTo={true}
        />
      )}
    </>
  );
}

export default PDP;
