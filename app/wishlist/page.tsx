"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const response = await axios.get("/api/shopify/products", {
          validateStatus: (status) => status < 500,
        });
        if (response.status === 200 && Array.isArray(response.data)) {
          setAllProducts(response.data);
        }
      } catch (err) {
        console.error("Failed to load products for wishlist display:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const wishlistedProducts = allProducts.filter((p) => wishlist.includes(p.id));

  const handleAddToCart = (product: any) => {
    const variantId = product.variants?.edges?.[0]?.node?.id || `gid://shopify/ProductVariant/${product.id.split("/").pop()}`;
    const price = product.priceRange?.minVariantPrice;
    const imageUrl = product.images?.edges?.[0]?.node?.url || "/raw_jeans.png";

    addToCart(variantId, 1, {
      title: product.title,
      price: price ? parseFloat(price.amount) : 1850,
      image: imageUrl,
    });
  };

  const getProductFit = (p: any) => {
    const tags = p.tags || [];
    const knownFits = ["ankle", "slim", "comfort", "straight", "baggy", "bootcut"];
    const found = tags.find((t: string) => {
      const clean = t.toLowerCase().replace("-fit", "").trim();
      return knownFits.includes(clean);
    });
    return found ? found.toLowerCase().replace("-fit", "").trim() : "straight";
  };

  const getProductWash = (p: any) => {
    const tags = p.tags || [];
    const knownWashes = ["raw", "black", "white"];
    const found = tags.find((t: string) => {
      const clean = t.toLowerCase().replace("-denim", "").trim();
      return knownWashes.includes(clean);
    });
    return found ? found.toLowerCase().replace("-denim", "").trim() : "raw";
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-[150px] pb-24 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-12 md:px-20">
        
        {/* Header Block */}
        <div className="flex flex-col items-center justify-center mb-16">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.48em] text-neutral-400 dark:text-neutral-500">
            YOUR COLLECTION
          </span>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl uppercase tracking-[0.06em]">
            MY WISHLIST
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="w-16 h-px bg-[var(--divider-color)]" />
            <Heart className="w-4 h-4 text-[#d7a33c] fill-[#d7a33c]" />
            <div className="w-16 h-px bg-[var(--divider-color)]" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-2 border-t-transparent border-[var(--foreground)] rounded-full animate-spin mb-4" />
            <span className="text-[10px] tracking-[0.25em] font-extrabold text-neutral-400 uppercase">
              SYNCING WISHLIST ITEMS...
            </span>
          </div>
        ) : wishlistedProducts.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 border border-[var(--divider-color)] p-8">
            <Heart className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
              YOUR WISHLIST IS EMPTY
            </h2>
            <p className="text-xs text-neutral-400 mb-8 leading-relaxed">
              Explore our Kojima raw twill selections and save your favorite fits here.
            </p>
            <Link
              href="/shop"
              prefetch={false}
              className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] hover:bg-transparent hover:text-[var(--foreground)] text-xs font-extrabold tracking-widest uppercase transition-all duration-300 rounded-none cursor-pointer"
            >
              BROWSE CATALOGUE
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {wishlistedProducts.map((product) => {
              const price = product.priceRange?.minVariantPrice;
              const formattedPrice = price
                ? `${price.currencyCode === 'INR' ? '₹ ' : price.currencyCode + ' '}${parseFloat(price.amount).toLocaleString('en-IN')}`
                : "₹ 1,850";
              const primaryUrl = product.images?.edges?.[0]?.node?.url
                || (Array.isArray(product.images) ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url) : null)
                || "/raw_jeans.png";
              const secondaryUrl = product.images?.edges?.[1]?.node?.url
                || (Array.isArray(product.images) ? (typeof product.images[1] === 'string' ? product.images[1] : product.images[1]?.url) : null);
              const hasSecondary = Boolean(secondaryUrl);
              
              const fitLabel = getProductFit(product).toUpperCase();
              const washLabel = getProductWash(product).toUpperCase();

              return (
                <div key={product.id} className="flex flex-col group relative">
                  {/* Delete / Remove item overlay */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-black hover:text-red-500 shadow-md transition-colors z-20 cursor-pointer border-0"
                    aria-label="Remove item"
                  >
                    <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                  </button>

                  <Link href={`/product/${encodeURIComponent(product.handle || product.id)}`} prefetch={false}>
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--card-bg)] border border-[var(--divider-color)] mb-4">
                      <img
                        src={primaryUrl}
                        alt={product.title.replace(/Denims/gi, 'Denim')}
                        className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                          hasSecondary ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-[1.04]"
                        }`}
                      />
                      {hasSecondary && (
                        <img
                          src={secondaryUrl}
                          alt={`${product.title.replace(/Denims/gi, 'Denim')} Alternate View`}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out scale-95 group-hover:scale-105"
                        />
                      )}
                      {hasSecondary && (
                        <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[8px] font-black tracking-[0.2em] text-white uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          FRONT VIEW
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-col flex-1">
                    <span className="text-[9px] tracking-[0.2em] font-extrabold text-neutral-400 uppercase select-none">
                      {fitLabel} • {washLabel}
                    </span>
                    <Link href={`/product/${encodeURIComponent(product.handle || product.id)}`} prefetch={false} className="mt-1.5">
                      <h3 className="text-xs sm:text-sm font-serif tracking-wide text-[var(--foreground)] group-hover:text-amber-500 transition-colors duration-300">
                        {product.title.replace(/Denims/gi, 'Denim')}
                      </h3>
                    </Link>
                    <span className="mt-1 text-xs font-mono font-bold text-[var(--foreground)]">
                      {formattedPrice}
                    </span>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="mt-4 w-full py-2.5 bg-[var(--foreground)] text-[var(--background)] hover:bg-[#d7a33c] hover:text-black rounded-none text-[9px] font-black tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      ADD TO BAG
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
