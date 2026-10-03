"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { useTheme } from "../../theme-provider";

export default function AccountWishlist() {
  const { theme } = useTheme();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const response = await axios.get("/api/shopify/products");
        const data = Array.isArray(response.data) ? response.data : (response.data?.products || []);
        setAllProducts(data);
      } catch (err) {
        console.error("Failed to load products for wishlist display:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const wishlistedProducts = allProducts.filter((p) => p && (p.handle || p.id) && wishlist.includes(p.id));

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

  const isLight = theme === "light";

  return (
    <div className={`space-y-8 font-sans antialiased select-none transition-colors duration-300 ${isLight ? "bg-white text-black" : "bg-black text-white"
      }`}>

      {/* Title */}
      <div className={`border-b pb-4 ${isLight ? "border-neutral-200" : "border-neutral-900"}`}>
        <h2 className="font-serif text-xl font-bold uppercase">
          My Saved Wishlist
        </h2>
        <p className={`text-[10px] tracking-wider uppercase mt-1 ${isLight ? "text-neutral-500" : "text-neutral-450"
          }`}>
          Items you are tracking and planning to purchase.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4 ${isLight ? "border-[#1F4E79]" : "border-[#3b82f6]"
            }`} />
          <span className="text-[9px] tracking-[0.25em] font-extrabold text-neutral-500 uppercase">
            SYNCING WISHLIST ITEMS...
          </span>
        </div>
      ) : wishlistedProducts.length === 0 ? (
        <div className={`max-w-md mx-auto text-center py-16 border border-dashed p-8 rounded-2xl ${isLight ? "border-neutral-200 bg-neutral-50/50" : "border-neutral-900 bg-neutral-955/20"
          }`}>
          <Heart className={`w-8 h-8 mx-auto mb-4 ${isLight ? "text-neutral-450" : "text-neutral-600"}`} />
          <h3 className="text-xs font-black tracking-widest uppercase mb-2">
            Wishlist is Empty
          </h3>
          <p className="text-[11px] text-neutral-400 mb-8 leading-relaxed">
            Browse our Kojima raw denim collections and tap the heart icon on your favorite fits to track them here.
          </p>
          <Link
            href="/shop"
            prefetch={false}
            className={`inline-flex items-center gap-2 px-6 py-3 text-xs font-black tracking-widest uppercase transition-colors rounded-xl cursor-pointer ${isLight ? "bg-black text-white hover:bg-[#1F4E79]" : "bg-[#3b82f6] text-white hover:bg-white hover:text-black"
              }`}
          >
            BROWSE SHOP
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistedProducts.map((product) => {
            const price = product.priceRange?.minVariantPrice;
            const formattedPrice = price
              ? `₹ ${parseFloat(price.amount).toLocaleString('en-IN')}`
              : "₹ 1,850";
            const primaryUrl = product.images?.edges?.[0]?.node?.url
              || (Array.isArray(product.images) ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url) : null)
              || "/raw_jeans.png";
            const secondaryUrl = product.images?.edges?.[1]?.node?.url
              || (Array.isArray(product.images) ? (typeof product.images[1] === 'string' ? product.images[1] : product.images[1]?.url) : null);
            const hasSecondary = Boolean(secondaryUrl);
            const fitLabel = getProductFit(product).toUpperCase();
            const productSlug = product.handle || product.id;

            return (
              <div key={product.id} className={`group flex flex-col border p-4 rounded-2xl relative transition-all ${isLight ? "border-neutral-200 bg-white hover:border-[#1F4E79]" : "border-neutral-900 bg-neutral-950 hover:border-[#3b82f6]"
                }`}>

                {/* Remove button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-6 right-6 p-1.5 rounded-full shadow-md border cursor-pointer z-10 hover:scale-110 transition-transform ${isLight ? "bg-white text-red-500 border-neutral-100" : "bg-neutral-900 text-red-500 border-neutral-800"
                    }`}
                >
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                </button>

                {/* Image */}
                <Link href={`/product/${encodeURIComponent(productSlug)}`} prefetch={false}>
                  <div className={`aspect-[3/4] rounded-xl overflow-hidden mb-4 relative transition-colors ${isLight ? "bg-neutral-50" : "bg-neutral-900"
                    }`}>
                    <img
                      src={primaryUrl}
                      alt={product.title}
                      className={`w-full h-full object-cover transition-all duration-700 ease-out ${hasSecondary ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-[1.04]"
                        }`}
                    />
                    {hasSecondary && (
                      <img
                        src={secondaryUrl}
                        alt={`${product.title} Alternate View`}
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

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className={`text-[8px] font-black tracking-widest uppercase ${isLight ? "text-neutral-500" : "text-neutral-450"
                      }`}>
                      {fitLabel} FIT
                    </span>
                    <Link href={`/product/${encodeURIComponent(productSlug)}`} prefetch={false} className="block mt-1">
                      <h4 className={`font-serif italic font-bold text-sm truncate transition-colors ${isLight ? "text-black group-hover:text-[#1F4E79]" : "text-white group-hover:text-[#3b82f6]"
                        }`}>
                        {product.title}
                      </h4>
                    </Link>
                    <span className={`text-xs font-mono font-bold block mt-1 ${isLight ? "text-[#1F4E79]" : "text-[#3b82f6]"
                      }`}>
                      {formattedPrice}
                    </span>
                    <p className={`text-[9px] mt-2 font-medium ${isLight ? "text-neutral-500" : "text-neutral-400"
                      }`}>
                      Available Sizes: <span className={isLight ? "text-neutral-750 font-bold" : "text-neutral-300 font-bold"}>28, 30, 32, 34, 36, 38, 40</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`mt-4 w-full py-2.5 font-black tracking-widest text-[9px] uppercase transition-colors rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border-0 ${isLight ? "bg-black text-white hover:bg-[#1F4E79]" : "bg-[#3b82f6] text-white hover:bg-white hover:text-black"
                      }`}
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
  );
}
