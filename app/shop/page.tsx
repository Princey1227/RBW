"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useTheme } from "../theme-provider";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Heart, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface ShopifyProduct {
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
  tags: string[];
  variants?: {
    edges: Array<{
      node: {
        id: string;
        title?: string;
        availableForSale?: boolean;
        selectedOptions?: Array<{
          name: string;
          value: string;
        }>;
      };
    }>;
  };
}

function ShopPageContent() {
  const { theme } = useTheme();
  const { addToCart, wishlist, toggleWishlist, isWishlisted } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({});

  const searchParams = useSearchParams();
  const washFilter = searchParams.get("wash");
  const fitFilter = searchParams.get("fit");

  // Filter Drawer and Sort States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(1999);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<ShopifyProduct | null>(null);
  const [quickViewSelectedSize, setQuickViewSelectedSize] = useState<string>("32");

  const openQuickView = (product: ShopifyProduct) => {
    setQuickViewProduct(product);
    const sizeOpt = product.options?.find((opt) => opt.name.toLowerCase() === "size");
    if (sizeOpt && sizeOpt.values.length > 0) {
      setQuickViewSelectedSize(sizeOpt.values[0]);
    } else {
      setQuickViewSelectedSize("32");
    }
  };

  // Sync state with search parameters when page loads
  useEffect(() => {
    if (washFilter) {
      const col = washFilter.toUpperCase();
      setSelectedCollections((prev) => prev.includes(col) ? prev : [...prev, col]);
    }
  }, [washFilter]);

  useEffect(() => {
    if (fitFilter) {
      const fit = fitFilter.toUpperCase();
      setSelectedFits((prev) => prev.includes(fit) ? prev : [...prev, fit]);
    }
  }, [fitFilter]);

  useEffect(() => {
    async function loadShopifyProducts() {
      try {
        setLoading(true);
        const response = await axios.get("/api/shopify/products", {
          validateStatus: (status) => status < 500,
        });
        if (response.status === 200 && Array.isArray(response.data)) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Failed to load products from Shopify:", error);
      } finally {
        setLoading(false);
      }
    }
    loadShopifyProducts();
  }, []);

  useEffect(() => {
    const event = new CustomEvent("page_view_kp", {
      detail: {
        type: "collection",
        data: {
          cart_id: "",
          collection_id: "all_denims",
          name: "All Catalogue",
          image_url: "/raw_jeans_v2.png",
          handle: "shop"
        }
      }
    });
    console.log("Fired KwikPass page_view_kp collection event:", event.detail);
    window.dispatchEvent(event);
  }, []);

  const toggleLike = (id: string) => {
    setLikedProducts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddToCart = (product: ShopifyProduct) => {
    const variantId = product.variants?.edges?.[0]?.node?.id || `gid://shopify/ProductVariant/${product.id.split("/").pop()}`;
    const price = product.priceRange?.minVariantPrice;
    const imageUrl = product.images?.edges?.[0]?.node?.url || "/raw_jeans.png";

    addToCart(variantId, 1, {
      title: product.title,
      price: price ? parseFloat(price.amount) : 1850,
      image: imageUrl,
    });
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter((product) => {
    const handle = product.handle.toLowerCase();
    const title = product.title.toLowerCase();
    const tags = product.tags?.map((t) => t.toLowerCase()) || [];

    // Filter out accessories and jackets from the shop catalog
    if (
      tags.includes("accessories") || 
      tags.includes("jacket") || 
      tags.includes("jackets") || 
      handle.includes("jacket") || 
      title.includes("jacket")
    ) {
      return false;
    }

    // 1. Collection wash filter
    const tagLabel = product.tags?.find((t) => t.startsWith('wash:'))?.replace('wash:', '').toUpperCase()
      || (product.handle.includes('raw') ? 'RAW' : product.handle.includes('white') ? 'WHITE' : 'BLACK');

    if (selectedCollections.length > 0) {
      if (!selectedCollections.includes(tagLabel)) return false;
    }

    // 2. Fit Filter
    if (selectedFits.length > 0) {
      const matchesFit = selectedFits.some((fit) => {
        const f = fit.toLowerCase();
        return handle.includes(f) || title.includes(f) || tags.includes(`fit:${f}`);
      });
      if (!matchesFit) return false;
    }

    // 3. Size Filter
    if (selectedSizes.length > 0) {
      const matchesSize = selectedSizes.some((size) => {
        return product.variants?.edges?.some(({ node }: any) => {
          const sizeOpt = node.selectedOptions?.find(
            (opt: any) => opt.name.toLowerCase() === "size"
          );
          return sizeOpt?.value === size;
        });
      });
      if (!matchesSize) return false;
    }

    // 4. Price Filter
    const priceVal = parseFloat(product.priceRange?.minVariantPrice?.amount || "0");
    if (priceVal > maxPrice) return false;

    // 5. In Stock Filter
    if (inStockOnly) {
      const isProductInStock = product.availableForSale !== false;
      const hasInStockVariant = product.variants?.edges?.some(({ node }: any) => node.availableForSale !== false);
      if (!isProductInStock && !hasInStockVariant) return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parseFloat(a.priceRange?.minVariantPrice?.amount || "0");
    const priceB = parseFloat(b.priceRange?.minVariantPrice?.amount || "0");
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();

    if (sortBy === "price-asc") return priceA - priceB;
    if (sortBy === "price-desc") return priceB - priceA;
    if (sortBy === "title-asc") return titleA.localeCompare(titleB);
    if (sortBy === "title-desc") return titleB.localeCompare(titleA);
    return 0; // featured
  });

  const toggleCollection = (col: string) => {
    const nextCols = selectedCollections.includes(col) ? [] : [col];
    setSelectedCollections(nextCols);

    // Sync wash query param in the URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (nextCols.length > 0) {
        params.set("wash", col.toLowerCase());
      } else {
        params.delete("wash");
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState(null, "", newUrl);
    }
  };

  const getWashCount = (wash: string) => {
    return products.filter((product) => {
      const handle = product.handle.toLowerCase();
      const title = product.title.toLowerCase();
      const tags = product.tags?.map((t) => t.toLowerCase()) || [];
      if (
        tags.includes("accessories") || 
        tags.includes("jacket") || 
        tags.includes("jackets") || 
        handle.includes("jacket") || 
        title.includes("jacket")
      ) {
        return false;
      }

      const tagLabel = product.tags?.find((t) => t.startsWith('wash:'))?.replace('wash:', '').toUpperCase()
        || (product.handle.includes('raw') ? 'RAW' : product.handle.includes('white') ? 'WHITE' : 'BLACK');
      return tagLabel === wash;
    }).length;
  };

  const toggleFit = (fit: string) => {
    setSelectedFits((prev) =>
      prev.includes(fit) ? prev.filter((item) => item !== fit) : [...prev, fit]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setSelectedCollections([]);
    setSelectedFits([]);
    setSelectedSizes([]);
    setMaxPrice(1999);
    setInStockOnly(false);
  };

  const getActiveChips = () => {
    const chips: Array<{ id: string; type: string; value: string; label: string }> = [];
    selectedCollections.forEach((col) => {
      const label = col === "RAW" ? "RAW INDIGO" : col === "BLACK" ? "CARBON BLACK" : col === "WHITE" ? "ALABASTER WHITE" : col;
      chips.push({ id: `col-${col}`, type: "collection", value: col, label });
    });
    selectedFits.forEach((fit) => {
      chips.push({ id: `fit-${fit}`, type: "fit", value: fit, label: fit });
    });
    selectedSizes.forEach((size) => {
      chips.push({ id: `size-${size}`, type: "size", value: size, label: `SIZE: ${size}` });
    });
    if (maxPrice < 1999) {
      chips.push({ id: "price", type: "price", value: "", label: `UNDER ₹ ${maxPrice.toLocaleString('en-IN')}` });
    }
    if (inStockOnly) {
      chips.push({ id: "stock", type: "stock", value: "", label: "IN STOCK" });
    }
    return chips;
  };

  const removeFilter = (type: string, value: string) => {
    if (type === "collection") {
      setSelectedCollections((prev) => prev.filter((item) => item !== value));
    } else if (type === "fit") {
      setSelectedFits((prev) => prev.filter((item) => item !== value));
    } else if (type === "size") {
      setSelectedSizes((prev) => prev.filter((item) => item !== value));
    } else if (type === "price") {
      setMaxPrice(1999);
    } else if (type === "stock") {
      setInStockOnly(false);
    }
  };

  const pageBg = "bg-transparent";
  const textMuted = theme === "light" ? "text-slate-500" : "text-white/40";

  if (!mounted) {
    return (
      <div className="min-h-screen pt-[130px] pb-16 flex items-center justify-center">
        <div className="text-xs tracking-[0.3em] text-neutral-500 uppercase animate-pulse">Loading Catalogue...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-[118px] pb-16 md:pt-[132px] md:pb-24 px-6 sm:px-12 md:px-20 transition-colors duration-500 ${pageBg}`}>
      <div className="max-w-[1600px] mx-auto">
        
        {/* Product Count (Above the Toolbar) */}
        <div className="mb-4 select-none flex justify-start">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500">
            Showing {sortedProducts.length} {sortedProducts.length === 1 ? "Product" : "Products"}
          </span>
        </div>

        {/* Filter & Sort Toolbar */}
        <div className={`flex flex-col gap-4 sm:grid sm:grid-cols-3 items-center border-b border-foreground/5 pb-6 w-full select-none ${getActiveChips().length > 0 ? "mb-4" : "mb-8"}`}>
          {/* Left Zone: Filters Button */}
          <div className="flex justify-start w-full sm:w-auto">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative inline-flex items-center gap-2 px-5 py-2.5 border border-foreground/15 hover:border-[var(--foreground)] text-[10px] font-bold tracking-widest uppercase transition-all duration-300 rounded-none cursor-pointer hover:bg-foreground hover:text-background group/filter"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 transition-transform duration-300 group-hover/filter:scale-110" />
              <span>Filters</span>
              {getActiveChips().length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#d7a33c] text-[8.5px] font-black text-black select-none transition-transform duration-300 group-hover/filter:scale-110">
                  {getActiveChips().length}
                </span>
              )}
            </button>
          </div>

          {/* Center Zone: Premium Segmented Wash Control */}
          <div className="flex justify-center w-full sm:w-auto">
            <div className="inline-flex items-center bg-foreground/[0.03] dark:bg-white/[0.02] border border-foreground/10 px-1 py-1 rounded-full relative">
              {["RAW", "BLACK", "WHITE"].map((wash) => {
                const isSelected = selectedCollections.includes(wash);
                const label = wash === "RAW" ? "RAW" : wash === "BLACK" ? "BLACK" : "WHITE";
                const count = getWashCount(wash);
                return (
                  <button
                    key={wash}
                    onClick={() => toggleCollection(wash)}
                    className={`px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black tracking-widest uppercase transition-all duration-300 relative cursor-pointer select-none bg-transparent border-0 outline-none ${
                      isSelected
                        ? "text-foreground font-black"
                        : "text-neutral-400 hover:text-foreground/80 font-bold"
                    }`}
                  >
                    {isSelected && (
                      <>
                        {/* Smooth sliding pill background */}
                        <motion.span
                          layoutId="activeWashPill"
                          className="absolute inset-0 bg-foreground/5 dark:bg-white/5 rounded-full z-0"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                        {/* Gold underline sliding indicator */}
                        <motion.span
                          layoutId="activeWashUnderline"
                          className="absolute bottom-1 left-4 right-4 h-[2px] bg-[#d7a33c] z-0"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      </>
                    )}
                    <span className="relative z-10">{label} ({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Zone: Sort Selector */}
          <div className="flex justify-end items-center w-full sm:w-auto">
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

        {/* Active Filter Chips Row (Below the main toolbar) */}
        {getActiveChips().length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-8 select-none">
            {getActiveChips().map((chip) => (
              <button
                key={chip.id}
                onClick={() => removeFilter(chip.type, chip.value)}
                className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-neutral-400 hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <span>{chip.label}</span>
                <span className="text-[9px] text-neutral-500">×</span>
              </button>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-[10px] tracking-widest font-black uppercase text-[#d7a33c] hover:underline cursor-pointer transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-xs tracking-[0.3em] text-neutral-500 uppercase animate-pulse">
            Loading collection...
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-foreground/10 rounded-none p-8">
            <p className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">No Products Found</p>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed max-w-md mx-auto">
              Check back soon or try adjusting your filter criteria.
            </p>
          </div>
        ) : (
          <motion.div
            key={selectedCollections.join("-")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {sortedProducts.map((product) => {
              const price = product.priceRange?.minVariantPrice;
              const formattedPrice = price
                ? `${price.currencyCode === 'INR' ? '₹ ' : price.currencyCode + ' '}${parseFloat(price.amount).toLocaleString('en-IN')}`
                : "₹ 1,850";

              const imagesObj = product.images as any;
              const primaryUrl = imagesObj?.edges?.[0]?.node?.url
                || (Array.isArray(imagesObj) ? (typeof imagesObj[0] === 'string' ? imagesObj[0] : imagesObj[0]?.url) : null)
                || imagesObj?.nodes?.[0]?.url
                || "/raw_jeans.png";
              const secondaryUrl = imagesObj?.edges?.[1]?.node?.url
                || (Array.isArray(imagesObj) ? (typeof imagesObj[1] === 'string' ? imagesObj[1] : imagesObj[1]?.url) : null)
                || imagesObj?.nodes?.[1]?.url;
              const hasSecondary = Boolean(secondaryUrl);

              const tagLabel = product.tags?.find((t) => t.startsWith('wash:'))?.replace('wash:', '').toUpperCase()
                || (product.handle.includes('raw') ? 'RAW' : product.handle.includes('white') ? 'WHITE' : 'BLACK');

              const availableSizes = product.options?.find((opt) => opt.name.toLowerCase() === "size")?.values || ["28", "30", "32", "34", "36"];

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col justify-between group transition-all duration-500 hover:-translate-y-1 bg-transparent cursor-pointer"
                >
                  <div className="relative aspect-[3/4] bg-transparent overflow-hidden rounded-none border-0 transition-all duration-500 hover:-translate-y-1">
                    <Link href={`/product/${encodeURIComponent(product.handle || product.id)}`} prefetch={false} className="block w-full h-full relative">
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
                          alt={`${product.title} Alternate View`}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out scale-95 group-hover:scale-105"
                        />
                      )}

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
                      className={`absolute top-3 right-3 z-20 transition-all duration-300 hover:scale-110 cursor-pointer ${
                        isWishlisted(product.id)
                          ? "opacity-100 text-red-500"
                          : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-white/70 hover:text-red-400"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors duration-300 ${
                          isWishlisted(product.id) ? "fill-red-500" : ""
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

                  <Link href={`/product/${encodeURIComponent(product.handle || product.id)}`} prefetch={false} className="flex flex-col mt-4">
                    <span className="text-[10px] font-bold tracking-[2px] text-amber-500/90 uppercase select-none">
                      {tagLabel}
                    </span>

                    <h3 className="mt-1 font-sans font-semibold text-[15px] text-text-product tracking-tight group-hover:text-amber-500 transition-colors duration-300">
                      {product.title.replace(/Denims/gi, 'Denim')}
                    </h3>

                    <span className="mt-2 font-sans font-extrabold text-[15px] text-text-price tracking-normal">
                      {formattedPrice}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* FILTER DRAWER PANEL */}
      <div
        className={`fixed inset-0 z-[150] transition-all duration-[350ms] ${
          isDrawerOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setIsDrawerOpen(false)}
          className={`absolute inset-0 bg-black/5 backdrop-blur-md transition-opacity duration-[350ms] ${
            isDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Sliding drawer */}
        <div
          className={`absolute top-0 left-0 bottom-0 w-full max-w-[440px] bg-[var(--background)] border-r border-foreground/5 shadow-2xl transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col z-20 ${
            isDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-foreground/5 flex justify-between items-center select-none">
            <div className="flex items-center gap-2">
              <span className="text-[var(--diamond-color)] text-xs">♦</span>
              <span className="text-xs font-black tracking-[0.3em] uppercase">FILTERS</span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 -mr-2 text-neutral-400 hover:text-[var(--foreground)] transition-colors cursor-pointer text-sm font-bold uppercase tracking-widest"
            >
              CLOSE ✕
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none">
            {/* 1. Collection Filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] tracking-[0.25em] font-black uppercase text-neutral-500">COLLECTION</h4>
              <div className="flex flex-col gap-2.5">
                {["RAW", "BLACK", "WHITE"].map((col) => {
                  const label = col === "RAW" ? "RAW INDIGO" : col === "BLACK" ? "CARBON BLACK" : col === "WHITE" ? "ALABASTER WHITE" : col;
                  const isSelected = selectedCollections.includes(col);
                  return (
                    <label key={col} className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider hover:text-[#d7a33c] transition-colors">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCollection(col)}
                        className="w-4 h-4 border border-foreground/20 rounded-none bg-transparent accent-[#d7a33c] cursor-pointer"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 2. Fit Filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] tracking-[0.25em] font-black uppercase text-neutral-500">FIT STYLE</h4>
              <div className="grid grid-cols-2 gap-2.5">
                {["ANKLE", "SLIM", "COMFORT", "STRAIGHT", "BAGGY", "BOOTCUT"].map((fit) => {
                  const isSelected = selectedFits.includes(fit);
                  return (
                    <button
                      key={fit}
                      onClick={() => toggleFit(fit)}
                      className={`py-2 text-[10px] font-bold tracking-widest uppercase transition-all rounded-none cursor-pointer border text-center ${
                        isSelected
                          ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                          : "border-foreground/15 text-neutral-400 hover:border-foreground/50 hover:text-[var(--foreground)]"
                      }`}
                    >
                      {fit}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Size Filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] tracking-[0.25em] font-black uppercase text-neutral-500">WAIST SIZE</h4>
              <div className="grid grid-cols-4 gap-2">
                {["28", "30", "32", "34", "36", "38", "40", "42"].map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`h-11 flex items-center justify-center text-xs font-bold rounded-none cursor-pointer border transition-all ${
                        isSelected
                          ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                          : "border-foreground/15 text-neutral-400 hover:border-foreground/50 hover:text-[var(--foreground)]"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Price Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] tracking-[0.25em] font-black uppercase text-neutral-500">PRICE RANGE</h4>
                <span className="text-xs font-bold text-[#d7a33c]">UP TO ₹ {maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2">
                <input
                  type="range"
                  min="1499"
                  max="1999"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-1 bg-foreground/10 accent-[#d7a33c] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-neutral-500 uppercase tracking-widest mt-2">
                  <span>₹ 1,499</span>
                  <span>₹ 1,999</span>
                </div>
              </div>
            </div>

            {/* 5. In Stock Filter */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider hover:text-[#d7a33c] transition-colors select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(!inStockOnly)}
                  className="w-4 h-4 border border-foreground/20 rounded-none bg-transparent accent-[#d7a33c] cursor-pointer"
                />
                <span>IN STOCK ONLY</span>
              </label>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-foreground/5 bg-foreground/[0.02] flex gap-3">
            <button
              onClick={clearAllFilters}
              className="flex-1 py-3.5 border border-foreground/15 text-[10px] font-black tracking-widest uppercase hover:border-[var(--foreground)] hover:bg-foreground hover:text-background transition-all duration-300 rounded-none cursor-pointer"
            >
              RESET
            </button>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="flex-1 py-3.5 bg-[var(--foreground)] text-[var(--background)] hover:bg-[#d7a33c] hover:text-black transition-all duration-300 text-[10px] font-black tracking-widest uppercase rounded-none cursor-pointer"
            >
              APPLY FILTERS
            </button>
          </div>
        </div>
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
                    {quickViewProduct.tags?.find((t) => t.startsWith('wash:'))?.replace('wash:', '').toUpperCase()
                      || (quickViewProduct.handle.includes('raw') ? 'RAW' : quickViewProduct.handle.includes('white') ? 'WHITE' : 'BLACK')}
                  </span>

                  {/* Title */}
                  <h2 className="text-2xl font-serif tracking-wide text-[var(--foreground)] uppercase font-light">
                    {quickViewProduct.title.replace(/Denims/gi, 'Denim')}
                  </h2>

                  {/* Price */}
                  <p className="text-lg font-mono font-bold text-[var(--foreground)]">
                    {quickViewProduct.priceRange?.minVariantPrice
                      ? `${quickViewProduct.priceRange.minVariantPrice.currencyCode === 'INR' ? '₹ ' : quickViewProduct.priceRange.minVariantPrice.currencyCode + ' '}${parseFloat(quickViewProduct.priceRange.minVariantPrice.amount).toLocaleString('en-IN')}`
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
                      {(quickViewProduct.options?.find((opt) => opt.name.toLowerCase() === "size")?.values || ["28", "30", "32", "34", "36", "38", "40", "42"]).map((sz) => {
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
                <div className="pt-8">
                  <button
                    onClick={() => {
                      const matchingVariant = quickViewProduct.variants?.edges?.find(({ node }: any) => {
                        const sizeOpt = node.selectedOptions?.find((opt: any) => opt.name.toLowerCase() === "size");
                        return sizeOpt?.value === quickViewSelectedSize;
                      });

                      const variantId = matchingVariant?.node?.id || quickViewProduct.variants?.edges?.[0]?.node?.id || `gid://shopify/ProductVariant/${quickViewProduct.id.split("/").pop()}`;
                      const price = quickViewProduct.priceRange?.minVariantPrice;
                      const imageUrl = quickViewProduct.images?.edges?.[0]?.node?.url || "/raw_jeans.png";

                      addToCart(variantId, 1, {
                        title: `${quickViewProduct.title} - Size ${quickViewSelectedSize}`,
                        price: price ? parseFloat(price.amount) : 1850,
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

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-[130px] pb-16 flex items-center justify-center">
        <div className="text-xs tracking-[0.3em] text-neutral-500 uppercase animate-pulse">Loading Catalogue...</div>
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}
