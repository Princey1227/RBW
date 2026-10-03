"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useTheme } from "../theme-provider";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface AccessoryProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  availableForSale?: boolean;
  options?: Array<{
    name: string;
    values: string[];
  }>;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
}

function AccessoriesPageContent() {
  const { theme } = useTheme();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<AccessoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<string>("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<AccessoryProduct | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadShopifyProducts() {
      try {
        setLoading(true);
        const response = await axios.get("/api/shopify/products", {
          validateStatus: (status) => status < 500,
        });
        if (response.status === 200 && Array.isArray(response.data)) {
          // Filter out products containing "accessories" tag or having Accessories type
          const shopifyAccessories = response.data.filter((p: any) => {
            const tags = p.tags?.map((tag: string) => tag.toLowerCase()) || [];
            return tags.includes("accessories") || p.productType?.toLowerCase() === "accessories";
          });
          setProducts(shopifyAccessories);
        }
      } catch (error) {
        console.error("Failed to load products from Shopify:", error);
      } finally {
        setLoading(false);
      }
    }
    loadShopifyProducts();
  }, []);

  // Gokwik page view tracking compatibility
  useEffect(() => {
    const event = new CustomEvent("page_view_kp", {
      detail: {
        type: "collection",
        data: {
          cart_id: "",
          collection_id: "accessories",
          name: "Accessories",
          image_url: "/accessories/patchwork_cap.png",
          handle: "accessories"
        }
      }
    });
    console.log("Fired KwikPass page_view_kp accessories event:", event.detail);
    window.dispatchEvent(event);
  }, []);

  const toggleLike = (id: string) => {
    setLikedProducts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Sort Logic
  const sortedProducts = [...products].sort((a, b) => {
    const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
    const priceB = parseFloat(b.priceRange.minVariantPrice.amount);

    if (sortBy === "price-asc") return priceA - priceB;
    if (sortBy === "price-desc") return priceB - priceA;
    if (sortBy === "title-asc") return a.title.localeCompare(b.title);
    if (sortBy === "title-desc") return b.title.localeCompare(a.title);
    return 0; // featured
  });

  return (
    <div className="w-full bg-transparent text-[var(--foreground)] min-h-screen pt-[118px] md:pt-[132px] pb-24 px-6 sm:px-12 md:px-20 relative overflow-x-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-amber-500/5 dark:bg-amber-500/[0.02] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/5 dark:bg-blue-500/[0.015] blur-[150px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto w-full flex flex-col relative z-10">

        {/* Product Count & Sort Toolbar (Clean 2-Column layout, no filters or wash tabs) */}
        <div className="mb-4 select-none flex justify-start">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500">
            Showing {sortedProducts.length} {sortedProducts.length === 1 ? "Product" : "Products"}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-foreground/5 pb-6 w-full select-none mb-8">
          <div className="flex items-center">
            <span className="text-xs font-black tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
              Accessories
            </span>
          </div>

          <div className="flex items-center">
            <span className="text-[9px] tracking-widest text-neutral-500 font-bold mr-1 uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold uppercase tracking-wider text-[var(--foreground)] border-0 focus:outline-none focus:ring-0 cursor-pointer pr-6 py-1.5 select-none"
              style={{
                WebkitAppearance: "none",
                MozAppearance: "none",
                backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='${theme === 'light' ? 'black' : 'white'}' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right center",
                backgroundSize: "16px"
              }}
            >
              <option value="featured" className="bg-[#090A0C] text-white">Featured</option>
              <option value="price-asc" className="bg-[#090A0C] text-white">Price: Low to High</option>
              <option value="price-desc" className="bg-[#090A0C] text-white">Price: High to Low</option>
              <option value="title-asc" className="bg-[#090A0C] text-white">Name: A to Z</option>
              <option value="title-desc" className="bg-[#090A0C] text-white">Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Products Display Grid with Fade Transition on Sort */}
        {loading ? (
          <div className="py-24 text-center text-xs tracking-[0.3em] text-neutral-500 uppercase animate-pulse">
            Loading collection...
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-foreground/10 rounded-none p-8">
            <p className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">No Accessories Found</p>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed max-w-md mx-auto">
              Check back soon or try adjusting your filters.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={sortBy}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {sortedProducts.map((product) => {
                const formattedPrice = `₹ ${parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString('en-IN')}`;
                const imageUrl = product.images.edges[0]?.node.url || "/accessories/patchwork_cap.png";

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col justify-between group transition-all duration-500 hover:-translate-y-1 bg-transparent"
                  >
                    <div className="relative aspect-[3/4] bg-[var(--card-white-bg)] overflow-hidden rounded-none border border-[var(--card-white-border)]">
                      <Link href={`/product/${encodeURIComponent(product.id)}`} prefetch={false}>
                        <img
                          src={imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                        />
                      </Link>

                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-3 right-3 z-10 transition-all duration-300 hover:scale-110 cursor-pointer ${isWishlisted(product.id)
                            ? "opacity-100 text-red-500"
                            : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-white/50 hover:text-red-400"
                          }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-colors duration-300 ${isWishlisted(product.id) ? "fill-red-500" : ""
                            }`}
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuickViewProduct(product);
                        }}
                        className="absolute bottom-0 left-0 right-0 py-2.5 bg-[var(--background)]/90 backdrop-blur-md text-[9px] font-black tracking-[0.25em] text-[var(--foreground)] uppercase text-center border-t border-foreground/5 opacity-0 lg:group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:bg-[var(--foreground)] hover:text-[var(--background)] z-15"
                      >
                        QUICK VIEW
                      </button>
                    </div>

                    <div className="py-4 flex flex-col justify-between flex-1 gap-4 sm:gap-6">
                      <div className="flex flex-col flex-1">
                        <span className="text-[8px] tracking-[0.2em] font-bold text-neutral-400 dark:text-neutral-500 uppercase select-none font-sans">
                          ACCESSORIES
                        </span>
                        <Link href={`/product/${encodeURIComponent(product.id)}`} prefetch={false}>
                          <h3 className="mt-2 text-[12px] sm:text-[13px] font-extrabold uppercase text-[var(--foreground)] tracking-wide leading-tight group-hover:text-amber-600 transition-colors duration-300">
                            {product.title}
                          </h3>
                        </Link>
                      </div>
                      <span className="text-[12px] sm:text-[13px] font-black text-[var(--foreground)]">
                        {formattedPrice}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* QUICK VIEW MODAL */}
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
                className="absolute top-4 right-4 text-neutral-400 hover:text-[var(--foreground)] z-25 text-xs font-bold uppercase tracking-widest p-2 cursor-pointer"
              >
                CLOSE ✕
              </button>

              {/* Left: Image Showcase */}
              <div className="w-full md:w-1/2 relative aspect-[2/3] md:aspect-auto md:h-auto bg-transparent overflow-hidden">
                <img
                  src={quickViewProduct.images.edges[0]?.node.url || "/accessories/patchwork_cap.png"}
                  alt={quickViewProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right: Info Details */}
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between overflow-y-auto font-sans">
                <div className="space-y-6">
                  {/* Category Tag */}
                  <span className="text-[10px] tracking-[0.22em] font-black text-[#d7a33c] uppercase">
                    ACCESSORIES
                  </span>

                  {/* Title */}
                  <h2 className="text-2xl font-serif tracking-wide text-[var(--foreground)] uppercase font-light">
                    {quickViewProduct.title}
                  </h2>

                  {/* Price */}
                  <p className="text-lg font-mono font-bold text-[var(--foreground)]">
                    ₹ {parseFloat(quickViewProduct.priceRange.minVariantPrice.amount).toLocaleString('en-IN')}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans font-normal tracking-wide">
                    {quickViewProduct.description}
                  </p>
                </div>

                {/* Add to Cart Footer */}
                <div className="pt-8">
                  <button
                    onClick={() => {
                      const variantId = `gid://shopify/ProductVariant/${quickViewProduct.id.split("/").pop()}`;
                      const priceVal = parseFloat(quickViewProduct.priceRange.minVariantPrice.amount);
                      const imageUrl = quickViewProduct.images.edges[0]?.node.url || "/accessories/patchwork_cap.png";

                      addToCart(variantId, 1, {
                        title: quickViewProduct.title,
                        price: priceVal,
                        image: imageUrl,
                      });
                      setQuickViewProduct(null);
                    }}
                    className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] hover:bg-[#d7a33c] hover:text-black transition-all duration-300 text-xs font-black tracking-widest uppercase rounded-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    ADD TO SHOPPING CART
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AccessoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-[130px] pb-16 flex items-center justify-center">
        <div className="text-xs tracking-[0.3em] text-neutral-500 uppercase animate-pulse">Loading Accessories...</div>
      </div>
    }>
      <AccessoriesPageContent />
    </Suspense>
  );
}
