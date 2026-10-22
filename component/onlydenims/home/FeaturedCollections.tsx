"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturedCollectionsProps {
  shopifyLoading: boolean;
  shopifyProducts: any[];
  sortedJeans: any[];
  sortedJackets: any[];
  displayedAccessories: any[];
  headingColorClass: string;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  openQuickView: (product: any) => void;
}

export default function FeaturedCollections({
  shopifyLoading,
  shopifyProducts,
  sortedJeans,
  sortedJackets,
  displayedAccessories,
  headingColorClass,
  wishlist,
  toggleWishlist,
  openQuickView,
}: FeaturedCollectionsProps) {

  const renderProductCard = (product: any) => {
    const isWishlisted = wishlist.includes(product.id);
    const price = product.priceRange?.minVariantPrice;
    const formattedPrice = price
      ? `${price.currencyCode === 'INR' ? '₹ ' : price.currencyCode + ' '}${parseFloat(price.amount).toLocaleString('en-IN')}`
      : product.tags?.map((t: string) => t.toLowerCase()).includes("accessories") ? "₹ 999" : "₹ 1,850";

    const isAccessory = product.tags?.map((t: string) => t.toLowerCase()).includes("accessories") || product.productType?.toLowerCase() === "accessories";
    const imagesObj = product.images as any;
    const primaryUrl = imagesObj?.edges?.[0]?.node?.url
      || (Array.isArray(imagesObj) ? (typeof imagesObj[0] === 'string' ? imagesObj[0] : imagesObj[0]?.url) : null)
      || imagesObj?.nodes?.[0]?.url
      || (isAccessory ? "/accessories/patchwork_cap.png" : "/raw_jeans.png");
    const secondaryUrl = imagesObj?.edges?.[1]?.node?.url
      || (Array.isArray(imagesObj) ? (typeof imagesObj[1] === 'string' ? imagesObj[1] : imagesObj[1]?.url) : null)
      || imagesObj?.nodes?.[1]?.url;
    const hasSecondary = Boolean(secondaryUrl);

    const collectionName = isAccessory
      ? "ACCESSORIES"
      : product.tags?.find((t: string) => t.startsWith('wash:'))?.replace('wash:', '').toUpperCase()
      || (product.handle.includes('raw') ? 'RAW' : product.handle.includes('white') ? 'WHITE' : 'BLACK');

    const availableSizes = product.options?.find((opt: any) => opt.name.toLowerCase() === "size")?.values || ["28", "30", "32", "34", "36"];

    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col"
      >
        <div className="group relative flex flex-col text-left">
          {/* Card Container with Dual-Image Preview */}
          <div className="w-full relative overflow-hidden aspect-[3/4] bg-transparent border-0 rounded-none transition-all duration-500 hover:-translate-y-1">
            <Link href={`/product/${encodeURIComponent(product.handle || product.id)}`} prefetch={false} className="block w-full h-full relative">
              {/* Primary Product Image */}
              <img
                src={primaryUrl}
                alt={product.title.replace(/Denims/gi, 'Denim')}
                className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${hasSecondary ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-[1.04]"
                  }`}
              />

              {/* Secondary Product Image (Alternate View on Hover) */}
              {hasSecondary && (
                <img
                  src={secondaryUrl}
                  alt={`${product.title} Alternate View`}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out scale-95 group-hover:scale-105"
                />
              )}

              {/* View Indicator Badge */}
              {hasSecondary && (
                <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[8px] font-black tracking-[0.2em] text-white uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  FRONT VIEW
                </span>
              )}
            </Link>

            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className={`absolute top-3 right-3 z-20 transition-all duration-300 hover:scale-110 cursor-pointer ${isWishlisted
                  ? "opacity-100 text-red-500"
                  : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-white/70 hover:text-red-400"
                }`}
            >
              <Heart
                className={`w-4 h-4 transition-colors duration-300 ${isWishlisted ? "fill-red-500" : ""
                  }`}
              />
            </button>

            {/* Quick View Hover Button Bar */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openQuickView(product);
              }}
              className="absolute bottom-0 left-0 right-0 py-3 bg-[var(--background)]/90 backdrop-blur-md text-[10px] font-black tracking-[0.25em] text-[var(--foreground)] uppercase text-center border-t border-foreground/10 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:bg-[var(--foreground)] hover:text-[var(--background)] z-20"
            >
              QUICK VIEW
            </button>
          </div>

          {/* Product Info below Card */}
          <Link href={`/product/${encodeURIComponent(product.handle || product.id)}`} prefetch={false} className="flex flex-col">
            <span className="font-sans font-bold text-[10px] tracking-[2px] text-amber-500/90 uppercase mt-4 select-none">
              {collectionName}
            </span>

            <h3 className="mt-1 font-sans font-semibold text-[15px] text-text-product tracking-tight group-hover:text-amber-500 transition-colors duration-300">
              {product.title.replace(/Denims/gi, 'Denim')}
            </h3>

            <span className="mt-2 font-sans font-extrabold text-[15px] text-text-price tracking-normal">
              {formattedPrice}
            </span>
          </Link>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="w-full bg-transparent text-[var(--foreground)] pt-6 pb-6 px-6 sm:px-12 md:px-20">
      <div className="max-w-[1600px] mx-auto w-full flex flex-col">
        {shopifyLoading ? (
          <div className="py-12 text-center text-xs tracking-widest text-neutral-500 uppercase animate-pulse">
            Loading Featured Collection...
          </div>
        ) : shopifyProducts.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[var(--divider-color)] p-8">
            <p className="text-sm font-medium text-[var(--foreground)]">No products found.</p>
            <p className="text-xs text-neutral-500 mt-2">
              Check back soon or browse our other collections.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-12 w-full">
            {/* 01 / DENIM JEANS */}
            {sortedJeans.length > 0 && (
              <div className="w-full">
                <div className="flex flex-col mb-6 select-none">
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:items-end">
                    <h2 className="font-serif font-normal text-[36px] md:text-[42px] tracking-normal leading-[0.95] uppercase text-text-h2">
                      DENIM JEANS
                    </h2>
                    <Link
                      href="/shop"
                      className="text-[12px] font-bold tracking-[0.18em] text-accent-gold hover:text-accent-gold-hover uppercase pb-1 border-b border-accent-gold/30 hover:border-accent-gold-hover transition-all duration-300 flex items-center gap-1 shrink-0"
                    >
                      SHOP ALL JEANS
                      <span className="text-xs">&rarr;</span>
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                  {sortedJeans.map((product) => renderProductCard(product))}
                </div>
              </div>
            )}

            {/* 02 / DENIM JACKETS */}
            {sortedJackets.length > 0 && (
              <div className="w-full">
                <div className="flex flex-col mb-6 select-none">
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:items-end">
                    <h2 className="font-serif font-normal text-[36px] md:text-[42px] tracking-normal leading-[0.95] uppercase text-text-h2">
                      DENIM JACKETS
                    </h2>
                    <Link
                      href="/jackets"
                      className="text-[12px] font-bold tracking-[0.18em] text-accent-gold hover:text-accent-gold-hover uppercase pb-1 border-b border-accent-gold/30 hover:border-accent-gold-hover transition-all duration-300 flex items-center gap-1 shrink-0"
                    >
                      SHOP ALL JACKETS
                      <span className="text-xs">&rarr;</span>
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-5xl w-full">
                  {sortedJackets.map((product) => renderProductCard(product))}
                </div>
              </div>
            )}

            {/* 03 / DENIM ACCESSORIES */}
            {displayedAccessories.length > 0 && (
              <div className="w-full">
                <div className="flex flex-col mb-6 select-none">
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:items-end">
                    <h2 className="font-serif font-normal text-[36px] md:text-[42px] tracking-normal leading-[0.95] uppercase text-text-h2">
                      DENIM ACCESSORIES
                    </h2>
                    <Link
                      href="/accessories"
                      className="text-[12px] font-bold tracking-[0.18em] text-accent-gold hover:text-accent-gold-hover uppercase pb-1 border-b border-accent-gold/30 hover:border-accent-gold-hover transition-all duration-300 flex items-center gap-1 shrink-0"
                    >
                      SHOP ALL ACCESSORIES
                      <span className="text-xs">&rarr;</span>
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 w-full">
                  {displayedAccessories.map((product) => renderProductCard(product))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
