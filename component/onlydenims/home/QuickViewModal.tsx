"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface QuickViewModalProps {
  quickViewProduct: any | null;
  setQuickViewProduct: (product: any | null) => void;
  quickViewSelectedSize: string;
  setQuickViewSelectedSize: (size: string) => void;
  addToCart: (variantId: string, quantity: number, metadata: any) => void;
}

export default function QuickViewModal({
  quickViewProduct,
  setQuickViewProduct,
  quickViewSelectedSize,
  setQuickViewSelectedSize,
  addToCart: _addToCartProp,
}: QuickViewModalProps) {
  const { addToCart, updateBuyerIdentity } = useCart();
  return (
    <AnimatePresence>
      {quickViewProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickViewProduct(null)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl bg-[var(--background)] border border-foreground/5 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:max-h-[80vh] rounded-none z-10"
          >
            {/* Close Button */}
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-[var(--foreground)] z-20 text-xs font-bold uppercase tracking-widest p-2 cursor-pointer"
            >
              CLOSE ✕
            </button>

            {/* Left: Image Showcase */}
            <div className="w-full md:w-1/2 relative aspect-[2/3] md:aspect-auto md:h-auto bg-transparent overflow-hidden">
              <img
                src={quickViewProduct.images?.edges?.[0]?.node?.url || "/raw_jeans.png"}
                alt={quickViewProduct.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right: Info Details */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                {/* Category Tag */}
                <span className="text-[10px] tracking-[0.22em] font-black text-neutral-500 uppercase">
                  {quickViewProduct.tags?.find((t: any) => t.startsWith('wash:'))?.replace('wash:', '').toUpperCase() ||
                    (quickViewProduct.handle.includes('raw')
                      ? 'RAW'
                      : quickViewProduct.handle.includes('white')
                      ? 'WHITE'
                      : 'BLACK')}
                </span>

                {/* Title */}
                <h2 className="text-2xl font-serif tracking-wide text-[var(--foreground)] uppercase font-light">
                  {quickViewProduct.title.replace(/Denims/gi, 'Denim')}
                </h2>

                {/* Price */}
                <p className="text-lg font-mono font-bold text-[var(--foreground)]">
                  {quickViewProduct.priceRange?.minVariantPrice
                    ? `${
                        quickViewProduct.priceRange.minVariantPrice.currencyCode === 'INR'
                          ? '₹ '
                          : quickViewProduct.priceRange.minVariantPrice.currencyCode + ' '
                      }${parseFloat(quickViewProduct.priceRange.minVariantPrice.amount).toLocaleString('en-IN')}`
                    : "₹ 1,850"}
                </p>

                {/* Description */}
                <p className="text-xs text-neutral-400 leading-relaxed font-sans font-normal tracking-wide">
                  {quickViewProduct.description}
                </p>

                {/* Dynamic Size selection inside Quick View */}
                <div className="space-y-3">
                  <span className="text-[9px] tracking-widest font-black text-neutral-500 uppercase">SELECT SIZE:</span>
                  <div className="flex flex-wrap gap-2">
                    {(
                      quickViewProduct.options?.find((opt: any) => opt.name.toLowerCase() === "size")?.values || [
                        "28",
                        "30",
                        "32",
                        "34",
                        "36",
                        "38",
                        "40",
                        "42",
                      ]
                    ).map((sz: string) => {
                      const isSelected = quickViewSelectedSize === sz;
                      return (
                        <button
                          key={sz}
                          onClick={() => setQuickViewSelectedSize(sz)}
                          className={`w-10 h-10 border text-xs font-bold flex items-center justify-center cursor-pointer transition-all rounded-none ${
                            isSelected
                              ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                              : "border-foreground/10 hover:border-[var(--foreground)] text-neutral-400 hover:text-[var(--foreground)]"
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Add to Cart Footer */}
              <div className="pt-6 space-y-2.5">
                <button
                  onClick={() => {
                    const matchingVariant = quickViewProduct.variants?.edges?.find(({ node }: any) => {
                      const sizeOpt = node.selectedOptions?.find((opt: any) => opt.name.toLowerCase() === "size");
                      return sizeOpt?.value === quickViewSelectedSize;
                    });

                    const variantId =
                      matchingVariant?.node?.id ||
                      quickViewProduct.variants?.edges?.[0]?.node?.id ||
                      `gid://shopify/ProductVariant/${quickViewProduct.id.split("/").pop()}`;
                    const price = quickViewProduct.priceRange?.minVariantPrice;
                    const imageUrl = quickViewProduct.images?.edges?.[0]?.node?.url || "/raw_jeans.png";

                    addToCart(variantId, 1, {
                      title: `${quickViewProduct.title} - Size ${quickViewSelectedSize}`,
                      price: price ? parseFloat(price.amount) : 1850,
                      image: imageUrl,
                    });
                    setQuickViewProduct(null);
                  }}
                  className="w-full py-3.5 bg-[var(--foreground)] text-[var(--background)] hover:bg-[#d7a33c] hover:text-black transition-all duration-300 text-xs font-black tracking-widest uppercase rounded-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO SHOPPING CART</span>
                </button>

                <button
                  onClick={async () => {
                    const matchingVariant = quickViewProduct.variants?.edges?.find(({ node }: any) => {
                      const sizeOpt = node.selectedOptions?.find((opt: any) => opt.name.toLowerCase() === "size");
                      return sizeOpt?.value === quickViewSelectedSize;
                    });

                    const variantId =
                      matchingVariant?.node?.id ||
                      quickViewProduct.variants?.edges?.[0]?.node?.id ||
                      `gid://shopify/ProductVariant/${quickViewProduct.id.split("/").pop()}`;
                    const price = quickViewProduct.priceRange?.minVariantPrice;
                    const imageUrl = quickViewProduct.images?.edges?.[0]?.node?.url || "/raw_jeans.png";

                    const freshCart = await addToCart(variantId, 1, {
                      title: `${quickViewProduct.title} - Size ${quickViewSelectedSize}`,
                      price: price ? parseFloat(price.amount) : 1850,
                      image: imageUrl,
                    });
                    setQuickViewProduct(null);

                    const variantCode = variantId.split("/").pop();
                    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "shop.onlydenims.com";
                    let checkoutUrl = freshCart?.checkoutUrl
                      ? freshCart.checkoutUrl
                      : `https://${shopifyDomain}/cart/${variantCode}:1`;

                    try {
                      const savedCust = localStorage.getItem("shopifyCustomer");
                      let cust = undefined;
                      if (savedCust) {
                        try {
                          cust = JSON.parse(savedCust);
                        } catch (e) {}
                      }
                      const updatedUrl = await updateBuyerIdentity(cust);
                      if (updatedUrl) {
                        checkoutUrl = updatedUrl;
                      }
                    } catch (err) {
                      console.error("Pre-checkout identity update error in QuickViewModal:", err);
                    }

                    window.location.href = checkoutUrl;
                  }}
                  className="w-full py-3.5 bg-[#1F4E79] dark:bg-[#3b82f6] hover:opacity-90 text-white transition-all duration-300 text-xs font-black tracking-[0.2em] uppercase rounded-none cursor-pointer flex items-center justify-center gap-2 border-0 shadow-md"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>BUY IT NOW (DIRECT CHECKOUT)</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
