"use client";

import React, { useRef, useState } from "react";
import { Heart, X, ZoomIn, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import type { ClientProduct } from "@/lib/stores/types";
import { fmtPrice } from "@/component/store-front/brandItems";
import "@/component/rbw/rbw-pdp.css";

interface PDPProps {
  product: ClientProduct;
  categoryLabel: string;
  colorName: string;
  brandName: string;
  wished?: boolean;
  onWish?: () => void;
  onBackToFits?: () => void;
}

/**
 * Dedicated Product Detail Page (PDP) for Second army
 * Edit product layout, gallery, buy buttons, or specifications here.
 */
export function PDP({
  product,
  categoryLabel,
  colorName,
  brandName,
  wished = false,
  onWish,
  onBackToFits,
}: PDPProps) {
  const [img, setImg] = useState(0);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const frame = useRef<HTMLDivElement>(null);
  const images = product.imageUrls;

  const onMove = (e: React.MouseEvent) => {
    if (!zoom || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="rbw-pdp w-[90%] max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-16">
      {/* Left: Product Images Gallery */}
      <div className="w-full lg:col-span-6 lg:sticky lg:top-6 flex flex-col items-center lg:items-start">
        <div className="w-full flex flex-col-reverse sm:flex-row items-center sm:items-start justify-center lg:justify-start gap-4">
          {images.length > 1 && (
            <div className="rbw-j-thumbs flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 max-w-full">
              {images.map((u, i) => (
                <button
                  key={u}
                  type="button"
                  className="rbw-j-thumb"
                  data-on={img === i}
                  aria-label={`View photo ${i + 1}`}
                  onClick={() => { setImg(i); setZoom(false); }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" />
                </button>
              ))}
            </div>
          )}

          <div
            ref={frame}
            className="rbw-j-frame"
            onMouseMove={onMove}
            style={{ cursor: zoom ? "zoom-out" : "zoom-in" }}
            onClick={() => setZoom((z) => !z)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={images[img]}
              src={images[img]}
              alt={product.name}
              className="rbw-fade w-full h-full object-contain object-center pointer-events-none"
              style={{
                transform: zoom ? "scale(2)" : "none",
                transformOrigin: origin,
                transition: "transform 250ms cubic-bezier(0.25,1,0.5,1)",
              }}
            />
            <button
              type="button"
              className="rbw-glass-btn absolute bottom-3 left-3 z-20 w-10 h-10 rounded-full !text-[color:var(--rbw-ink)]"
              aria-label={zoom ? "Zoom out" : "Zoom photo"}
              onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}
            >
              {zoom ? <X className="w-4 h-4" strokeWidth={1.5} /> : <ZoomIn className="w-4 h-4" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {images.length > 1 && (
          <p className="rbw-j-counter mt-4 text-center sm:text-left w-full sm:pl-20 lg:pl-24">
            <b>{String(img + 1).padStart(2, "0")}</b> / {String(images.length).padStart(2, "0")}
          </p>
        )}
      </div>

      {/* Right: Product Details & Purchase Form */}
      <div className="w-full lg:col-span-6 flex flex-col text-left justify-start">
        <p className="rbw-eyebrow">
          {[brandName, categoryLabel, colorName].filter(Boolean).join(" · ")}
        </p>

        <h1 className="rbw-j-title mt-2">{product.name}</h1>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          {product.price ? (
            <span className="rbw-j-price">{fmtPrice(product.price)}</span>
          ) : (
            <span className="rbw-j-note">Price on request</span>
          )}
        </div>

        {product.stock !== "unknown" && (
          <div className="mt-3">
            <span className="rbw-j-status" data-low={product.stock === "out_of_stock"}>
              {product.stock === "in_stock" ? "In stock · Ready to ship" : "Currently out of stock"}
            </span>
          </div>
        )}

        <span className="rbw-j-rule my-6" />

        {/* Sizes */}
        {product.sizes.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="rbw-j-label">Select Size</span>
            </div>
            <div className="rbw-j-sizes grid grid-cols-4 sm:grid-cols-6 gap-2" role="group" aria-label="Size">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                  className="rbw-j-size"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Stepper */}
        <div className="mt-6 flex items-center justify-between">
          <span className="rbw-j-label">Quantity</span>
          <div className="rbw-j-stepper">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>&minus;</button>
            <span aria-live="polite">{qty}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => setQty(Math.min(10, qty + 1))}>+</button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-6 flex flex-col gap-3">
          <button
            type="button"
            className="rbw-cta rbw-j-cta-block flex items-center justify-center gap-2"
            onClick={() => alert(`Added ${qty}x ${product.name} (Size ${size || "Standard"}) to bag!`)}
          >
            <ShoppingBag size={16} />
            <span>Add to Bag · {product.price ? fmtPrice(product.price * qty) : "Buy"}</span>
          </button>

          {onWish && (
            <button
              type="button"
              className="rbw-j-btn flex items-center justify-center gap-2"
              onClick={onWish}
              aria-pressed={wished}
            >
              <Heart className="w-4 h-4" fill={wished ? "currentColor" : "none"} />
              <span>{wished ? "Saved to Wishlist" : "Add to Wishlist"}</span>
            </button>
          )}
        </div>

        {/* Brand Specs */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-[#5A6E3E]" />
            <span>Express domestic delivery across India (2–4 business days)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#5A6E3E]" />
            <span>100% Authentic tactical guarantee directly from Second army</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDP;
