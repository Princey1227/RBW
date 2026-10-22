"use client";

import React, { useRef, useState } from "react";
import { Heart, X, ZoomIn } from "lucide-react";
import type { ClientProduct } from "@/lib/stores/types";
import { fmtPrice } from "./brandItems";

/**
 * Product step. Same structure and classes as the RBW product step
 * (rbw-pdp + rbw-j-*): gallery with thumbnails and zoom, eyebrow, title,
 * price, sizes, quantity, actions and a facts list.
 */
export default function ProductStep({
  product, categoryLabel, colorName, brandName, wished, onWish,
}: {
  product: ClientProduct; categoryLabel: string; colorName: string; brandName: string; wished: boolean; onWish: () => void;
}) {
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
    <div className="rbw-pdp w-[88%] max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-12">
      <div className="rbw-in w-full lg:col-span-6 lg:sticky lg:top-6 flex flex-col items-center lg:items-start">
        <div className="w-full flex flex-col-reverse sm:flex-row items-center sm:items-start justify-center lg:justify-start gap-4">
          {images.length > 1 && (
            <div className="rbw-j-thumbs flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 max-w-full">
              {images.map((u, i) => (
                <button key={u} type="button" className="rbw-j-thumb" data-on={img === i} aria-label={`View photo ${i + 1}`} onClick={() => { setImg(i); setZoom(false); }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" />
                </button>
              ))}
            </div>
          )}
          <div ref={frame} className="rbw-j-frame" onMouseMove={onMove} style={{ cursor: zoom ? "zoom-out" : "zoom-in" }} onClick={() => setZoom((z) => !z)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={images[img]} src={images[img]} alt={product.name} className="rbw-fade w-full h-full object-contain object-center pointer-events-none"
              style={{ transform: zoom ? "scale(2)" : "none", transformOrigin: origin, transition: "transform 250ms cubic-bezier(0.25,1,0.5,1)" }} />
            <button type="button" className="rbw-glass-btn absolute bottom-3 left-3 z-20 w-10 h-10 rounded-full !text-[color:var(--rbw-ink)]"
              aria-label={zoom ? "Zoom out" : "Zoom photo"} onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}>
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

      <div className="w-full lg:col-span-6 flex flex-col text-left justify-start">
        <p className="rbw-eyebrow rbw-in">{[categoryLabel, product.fit].filter(Boolean).join(" · ")}</p>
        <h1 className="rbw-j-title rbw-in mt-3">{product.name}</h1>

        <div className="rbw-in mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span className="rbw-j-price">{fmtPrice(product.price)}</span>
        </div>

        {product.stock !== "unknown" && (
          <div className="rbw-in mt-3">
            <span className="rbw-j-status" data-low={product.stock === "out_of_stock"}>
              {product.stock === "in_stock" ? "In stock" : "Out of stock"}
            </span>
          </div>
        )}

        <span className="rbw-j-rule rbw-in my-6" />

        {product.sizes.length > 0 && (
          <div className="rbw-in">
            <div className="flex justify-between items-center mb-3 gap-3"><span className="rbw-j-label">Size</span></div>
            <div className="rbw-j-sizes grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2" role="group" aria-label="Size">
              {product.sizes.map((s) => (
                <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)} className="rbw-j-size">{s}</button>
              ))}
            </div>
          </div>
        )}

        <div className="rbw-in mt-6 flex items-center justify-between">
          <span className="rbw-j-label">Quantity</span>
          <div className="rbw-j-stepper">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>&minus;</button>
            <span aria-live="polite">{qty}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => setQty(Math.min(20, qty + 1))}>+</button>
          </div>
        </div>

        <div className="rbw-in w-full mt-6 flex flex-col gap-3">
          <button type="button" disabled className="rbw-cta rbw-j-cta-block"><span>Checkout not available yet</span></button>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled className="rbw-j-btn"><span>Add to cart</span></button>
            <button type="button" className="rbw-j-btn" onClick={onWish} aria-pressed={wished}>
              <Heart className="w-3.5 h-3.5" strokeWidth={1.5} fill={wished ? "currentColor" : "none"} />
              <span>{wished ? "Wishlisted" : "Wishlist"}</span>
            </button>
          </div>
        </div>
        <p className="od-notice rbw-in">Online checkout is not connected for {brandName} yet.</p>

        {product.description && (
          <p className="rbw-in mt-8 whitespace-pre-line" style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: 17, lineHeight: 1.55, color: "var(--rbw-ink)" }}>
            {product.description}
          </p>
        )}

        <dl className="rbw-j-specs rbw-in mt-8">
          <div className="rbw-j-spec"><dt>Colour</dt><dd>{colorName}</dd></div>
          <div className="rbw-j-spec"><dt>{product.fit ? "Fit" : "Category"}</dt><dd>{product.fit ?? categoryLabel}</dd></div>
        </dl>
      </div>
    </div>
  );
}
