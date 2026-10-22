"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, LogOut, Moon, Sun, ZoomIn, X } from "lucide-react";
import type { ClientProduct, PublicStore } from "@/lib/stores/types";
import { ghostFor, StoreShell, useStoreTheme } from "./StoreShell";

const fmtPrice = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;
const titleOf = (p: ClientProduct, i: number) => p.name || `Piece ${String(i + 1).padStart(2, "0")}`;

export default function Storefront({
  store, products, initialProductId,
}: { store: PublicStore; products: ClientProduct[]; initialProductId?: string }) {
  const router = useRouter();
  const [theme, toggleTheme] = useStoreTheme();
  const [selectedId, setSelectedId] = useState<string | null>(
    initialProductId && products.some((p) => p.id === initialProductId) ? initialProductId : null
  );
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [onlyWished, setOnlyWished] = useState(false);
  const wishKey = `od_wishlist_${store.slug}`;

  useEffect(() => {
    try { setWishlist(JSON.parse(localStorage.getItem(wishKey) || "[]")); } catch {}
  }, [wishKey]);
  const toggleWish = useCallback((id: string) => {
    setWishlist((w) => {
      const n = w.includes(id) ? w.filter((x) => x !== id) : [...w, id];
      try { localStorage.setItem(wishKey, JSON.stringify(n)); } catch {}
      return n;
    });
  }, [wishKey]);

  // deep links + browser back/forward
  useEffect(() => {
    const onPop = () => {
      const p = new URLSearchParams(window.location.search).get("p");
      setSelectedId(p && products.some((x) => x.id === p) ? p : null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [products]);

  const open = (id: string | null) => {
    setSelectedId(id);
    const url = id ? `${window.location.pathname}?p=${encodeURIComponent(id)}` : window.location.pathname;
    window.history.pushState({}, "", url);
  };

  async function logout() {
    await fetch(`/api/stores/${store.slug}/login`, { method: "DELETE" }).catch(() => {});
    router.refresh();
  }

  const selected = selectedId ? products.find((p) => p.id === selectedId) : null;
  const selectedIndex = selected ? products.indexOf(selected) : -1;
  const visible = useMemo(() => (onlyWished ? products.filter((p) => wishlist.includes(p.id)) : products), [onlyWished, products, wishlist]);

  const header = (
    <header className="od-head">
      <div className="od-head__side">
        <a href="/" className="od-textbtn" aria-label="Back to OnlyDenims"><ArrowLeft size={14} strokeWidth={1.5} /><span>OnlyDenims</span></a>
      </div>
      <button type="button" onClick={() => open(null)} aria-label={`${store.name} — all products`} style={{ background: "none", border: 0, cursor: "pointer", padding: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={store.logoUrl} alt={store.name} className="od-logo" />
      </button>
      <div className="od-head__side od-head__side--end">
        <button type="button" className="od-iconbtn" aria-pressed={onlyWished} aria-label={`Wishlist (${wishlist.length})`}
          title={`Wishlist (${wishlist.length})`} onClick={() => { setOnlyWished((v) => !v); open(null); }}>
          <Heart size={16} strokeWidth={1.5} fill={wishlist.length ? "currentColor" : "none"} />
        </button>
        <button type="button" className="od-iconbtn" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
          {theme === "dark" ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
        </button>
        <button type="button" className="od-textbtn" onClick={logout} aria-label="Log out"><LogOut size={14} strokeWidth={1.5} /><span>Log out</span></button>
      </div>
    </header>
  );

  return (
    <StoreShell theme={theme} ghostText={ghostFor(store.name)} header={header}>
      <div style={{ height: 72 }} aria-hidden />
      {selected ? (
        <ProductView
          key={selected.id} store={store} product={selected} index={selectedIndex}
          wished={wishlist.includes(selected.id)} onWish={() => toggleWish(selected.id)} onBack={() => open(null)}
        />
      ) : (
        <main className="od-wrap">
          <div className="od-intro">
            <div>
              <p className="rbw-eyebrow">{onlyWished ? "Your wishlist" : "Collection"}</p>
              <h1 className="rbw-j-title" style={{ marginTop: 8 }}>{store.name}</h1>
            </div>
            <p className="rbw-j-note">{visible.length} {visible.length === 1 ? "piece" : "pieces"}</p>
          </div>

          {visible.length === 0 ? (
            <p className="od-empty">{onlyWished ? "Nothing in your wishlist yet." : "No products yet."}</p>
          ) : (
            <ul className="od-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {visible.map((p) => {
                const i = products.indexOf(p);
                return (
                  <li key={p.id} style={{ position: "relative" }}>
                    <button type="button" className="od-card" onClick={() => open(p.id)} aria-label={`View ${titleOf(p, i)}`}>
                      <div className="od-card__plate">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imageUrls[0]} alt={titleOf(p, i)} loading="lazy" />
                        {!p.ready && <span className="od-card__tag">Coming soon</span>}
                      </div>
                      <div className="od-card__meta">
                        <span className="od-card__name">{titleOf(p, i)}</span>
                        <span className="od-card__price">{p.price ? fmtPrice(p.price) : <span className="od-muted">—</span>}</span>
                      </div>
                    </button>
                    <button type="button" className="od-iconbtn od-card__heart" aria-pressed={wishlist.includes(p.id)}
                      aria-label={wishlist.includes(p.id) ? "Remove from wishlist" : "Add to wishlist"} onClick={() => toggleWish(p.id)}
                      style={{ background: "var(--rbw-glass)" }}>
                      <Heart size={15} strokeWidth={1.5} fill={wishlist.includes(p.id) ? "currentColor" : "none"} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      )}
    </StoreShell>
  );
}

/* ------------------------------------------------------------------ product view
   Same structure and classes as the RBW product step (rbw-pdp + rbw-j-*), so
   gallery, typography, size cells, stepper and CTA are the RBW components. */

function ProductView({
  store, product, index, wished, onWish, onBack,
}: { store: PublicStore; product: ClientProduct; index: number; wished: boolean; onWish: () => void; onBack: () => void }) {
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const frame = useRef<HTMLDivElement>(null);
  const title = titleOf(product, index);
  const images = product.imageUrls;

  const onMove = (e: React.MouseEvent) => {
    if (!zoom || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const unavailableLabel = product.ready ? "Checkout not available yet" : "Coming soon";

  return (
    <main>
      <div className="od-wrap" style={{ paddingBottom: 0, paddingTop: 20 }}>
        <button type="button" className="od-back" onClick={onBack}><ArrowLeft size={14} strokeWidth={1.5} /> All pieces</button>
      </div>

      <div className="rbw-pdp w-[88%] max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-16">
        <div className="rbw-in w-full lg:col-span-6 lg:sticky lg:top-24 flex flex-col items-center lg:items-start">
          <div className="w-full flex flex-col-reverse sm:flex-row items-center sm:items-start justify-center lg:justify-start gap-4">
            {images.length > 1 && (
              <div className="rbw-j-thumbs flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 max-w-full">
                {images.map((u, i) => (
                  <button key={u} type="button" className="rbw-j-thumb" data-on={img === i} aria-label={`View image ${i + 1}`} onClick={() => { setImg(i); setZoom(false); }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" />
                  </button>
                ))}
              </div>
            )}
            <div ref={frame} className="rbw-j-frame" onMouseMove={onMove} style={{ cursor: zoom ? "zoom-out" : "zoom-in" }} onClick={() => setZoom((z) => !z)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={images[img]} src={images[img]} alt={title} className="rbw-fade w-full h-full object-contain object-center pointer-events-none"
                style={{ transform: zoom ? "scale(2)" : "none", transformOrigin: origin, transition: "transform 250ms cubic-bezier(0.25,1,0.5,1)" }} />
              <button type="button" className="rbw-glass-btn absolute bottom-3 left-3 z-20 w-10 h-10 rounded-full !text-[color:var(--rbw-ink)]"
                aria-label={zoom ? "Zoom out" : "Zoom image"} onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}>
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
          <p className="rbw-eyebrow rbw-in">{(product as any).category || product.categoryId || store.name}</p>
          <h1 className="rbw-j-title rbw-in mt-3">{title}</h1>

          <div className="rbw-in mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            {product.price ? <span className="rbw-j-price">{fmtPrice(product.price)}</span> : <span className="rbw-j-note">Pricing to be announced</span>}
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
            <button type="button" disabled className="rbw-cta rbw-j-cta-block"><span>{unavailableLabel}</span></button>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" disabled className="rbw-j-btn"><span>Add to cart</span></button>
              <button type="button" className="rbw-j-btn" onClick={onWish} aria-pressed={wished}>
                <Heart className="w-3.5 h-3.5" strokeWidth={1.5} fill={wished ? "currentColor" : "none"} />
                <span>{wished ? "Wishlisted" : "Wishlist"}</span>
              </button>
            </div>
          </div>

          {!product.ready && (
            <p className="od-notice rbw-in">This piece is still being set up by the brand. Purchasing opens once its details are added.</p>
          )}
          {product.ready && (
            <p className="od-notice rbw-in">Online checkout is not connected for this store yet.</p>
          )}

          {Boolean(product.fit || (product as any).fits?.length) && (
            <dl className="rbw-j-specs rbw-in mt-9">
              <div className="rbw-j-spec" style={{ gridColumn: "1 / -1" }}>
                <dt>Fit</dt><dd>{product.fit || (product as any).fits?.join(" · ")}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </main>
  );
}
