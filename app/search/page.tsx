"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useTheme } from "../theme-provider";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { ShoppingBag, Heart, X, Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType?: string;
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

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="aspect-[3/4] bg-foreground/5 w-full rounded-none" />
      <div className="h-3 bg-foreground/5 w-1/4 mt-2" />
      <div className="h-4 bg-foreground/5 w-3/4" />
      <div className="h-4 bg-foreground/5 w-1/4" />
      <div className="h-4 bg-foreground/5 w-full mt-2" />
      <div className="h-10 bg-foreground/5 w-full mt-2" />
    </div>
  );
}

function SearchPageContent() {
  const { theme } = useTheme();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({});
  
  // Quick View States
  const [quickViewProduct, setQuickViewProduct] = useState<ShopifyProduct | null>(null);
  const [quickViewSelectedSize, setQuickViewSelectedSize] = useState<string>("32");

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const router = useRouter();
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    } else {
      router.push(`/search`);
    }
  };

  const [showSuggestions, setShowSuggestions] = useState(false);

  const querySuggestions = useMemo(() => {
    const query = inputValue.toLowerCase().trim();
    if (!query) return [];

    const suggestionsList: string[] = [];

    // Define some static high-quality terms that we can match
    const keywords = [
      "baggy fit jeans",
      "comfort fit jeans",
      "slim fit jeans",
      "straight fit jeans",
      "ankle fit jeans",
      "bootcut fit jeans",
      "raw indigo jeans",
      "carbon black jeans",
      "alabaster white jeans",
      "denim jacket",
      "raw denim",
      "black jeans",
      "white jeans",
      "indigo jeans"
    ];

    keywords.forEach((keyword) => {
      if (keyword.includes(query) && keyword !== query) {
        suggestionsList.push(keyword);
      }
    });

    return suggestionsList.slice(0, 4);
  }, [inputValue]);

  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    const query = inputValue.toLowerCase().trim();
    const queryTerms = query.split(/\s+/).filter(Boolean);

    return products.filter((product) => {
      const title = product.title.toLowerCase();
      const handle = product.handle.toLowerCase();
      const description = product.description.toLowerCase();
      const tags = product.tags?.map((t) => t.toLowerCase()) || [];
      const productType = (product.productType || "").toLowerCase();

      const isAccessory = tags.includes("accessories") || productType === "accessories" || handle.includes("accessory");
      const isJacket = tags.includes("jacket") || tags.includes("jackets") || handle.includes("jacket") || title.includes("jacket");
      const isJeans = !isAccessory && !isJacket;

      return queryTerms.every((term) => {
        let normalizedTerm = term;
        if (normalizedTerm.endsWith("s") && normalizedTerm.length > 3) {
          normalizedTerm = normalizedTerm.slice(0, -1);
        }
        if (normalizedTerm === "jean") {
          return isJeans;
        }
        return (
          title.includes(term) ||
          title.includes(normalizedTerm) ||
          handle.includes(term) ||
          handle.includes(normalizedTerm) ||
          description.includes(term) ||
          description.includes(normalizedTerm) ||
          tags.some((tag) => tag.includes(term) || tag.includes(normalizedTerm))
        );
      });
    }).slice(0, 5);
  }, [inputValue, products]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Filter Drawer and Sort States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");

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

  const openQuickView = (product: ShopifyProduct) => {
    setQuickViewProduct(product);
    const sizeOpt = product.options?.find((opt) => opt.name.toLowerCase() === "size");
    if (sizeOpt && sizeOpt.values.length > 0) {
      setQuickViewSelectedSize(sizeOpt.values[0]);
    } else {
      setQuickViewSelectedSize("32");
    }
  };

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

  // Filter products by search query
  const searchedProducts = products.filter((product) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const title = product.title.toLowerCase();
    const handle = product.handle.toLowerCase();
    const description = product.description.toLowerCase();
    const tags = product.tags?.map((t) => t.toLowerCase()) || [];
    const productType = (product.productType || "").toLowerCase();

    // Identify if product is jeans (not jackets, not accessories)
    const isAccessory = tags.includes("accessories") || productType === "accessories" || handle.includes("accessory");
    const isJacket = tags.includes("jacket") || tags.includes("jackets") || handle.includes("jacket") || title.includes("jacket");
    const isJeans = !isAccessory && !isJacket;

    // Split search query into individual terms for multi-word queries (e.g., "raw jeans")
    const queryTerms = query.split(/\s+/).filter(Boolean);

    // Every query term must match
    return queryTerms.every((term) => {
      // Simple singularization for plural search queries (e.g. "jeans" -> "jean", "jackets" -> "jacket")
      let normalizedTerm = term;
      if (normalizedTerm.endsWith("s") && normalizedTerm.length > 3) {
        normalizedTerm = normalizedTerm.slice(0, -1);
      }

      // If the term maps to "jean" (singular/plural), match it against all jeans products
      if (normalizedTerm === "jean") {
        return isJeans;
      }

      // Check standard fields for term or normalized term match
      return (
        title.includes(term) ||
        title.includes(normalizedTerm) ||
        handle.includes(term) ||
        handle.includes(normalizedTerm) ||
        description.includes(term) ||
        description.includes(normalizedTerm) ||
        tags.some((tag) => tag.includes(term) || tag.includes(normalizedTerm))
      );
    });
  });

  // Apply filters on top of search query results
  const filteredProducts = searchedProducts.filter((product) => {
    const handle = product.handle.toLowerCase();
    const title = product.title.toLowerCase();
    const tags = product.tags?.map((t) => t.toLowerCase()) || [];

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
    setSelectedCollections((prev) =>
      prev.includes(col) ? prev.filter((item) => item !== col) : [col]
    );
  };

  const getWashCount = (wash: string) => {
    return searchedProducts.filter((product) => {
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
    setMaxPrice(3000);
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
    if (maxPrice < 3000) {
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
      setMaxPrice(3000);
    } else if (type === "stock") {
      setInStockOnly(false);
    }
  };

  const textMuted = "text-neutral-500 dark:text-neutral-400";

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-[120px] pb-16 font-sans">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-12 md:px-20">
        
        {/* Search header / title */}
        <div className="mb-12 pt-4 select-none">
          <div className="text-left mb-6">
            <span className="text-xs sm:text-sm font-mono tracking-[0.2em] text-neutral-400 lowercase">
              search results for :
            </span>
          </div>
          
          <div className="flex justify-center">
            <div className="w-full max-w-2xl px-4 relative search-container">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-transparent text-left text-xl md:text-2xl font-light tracking-wide text-foreground focus:outline-none pb-2.5 border-b border-foreground/10 focus:border-foreground/35 transition-colors duration-300 pr-8"
                  placeholder="SEARCH CATALOGUE..."
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue("");
                      setShowSuggestions(false);
                    }}
                    className="absolute right-2 bottom-2.5 p-1 text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>              {/* Suggestions Dropdown */}
              {showSuggestions && (querySuggestions.length > 0 || suggestions.length > 0) && (
                <div className="absolute top-full left-4 right-4 bg-[var(--background)] border border-foreground/10 shadow-2xl z-[100] mt-2 rounded-none backdrop-blur-md">
                  <div className="py-1">
                    {/* Suggested Searches */}
                    {querySuggestions.length > 0 && (
                      <div className="border-b border-foreground/5 pb-1.5 mb-1.5">
                        <div className="px-4 py-2 text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
                          Suggested Searches
                        </div>
                        <ul>
                          {querySuggestions.map((term) => (
                            <li key={term}>
                              <button
                                type="button"
                                onClick={() => {
                                  setInputValue(term);
                                  setShowSuggestions(false);
                                  router.push(`/search?q=${encodeURIComponent(term)}`);
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs sm:text-sm hover:bg-foreground/[0.03] transition-all duration-200 flex items-center gap-2 text-foreground/80 hover:text-foreground cursor-pointer font-sans"
                              >
                                <Search className="w-3.5 h-3.5 text-neutral-400" />
                                <span className="font-light tracking-wide">
                                  {term}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggested Products */}
                    {suggestions.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
                          Suggested Products
                        </div>
                        <ul className="divide-y divide-foreground/5 max-h-60 overflow-y-auto">
                          {suggestions.map((suggestion) => (
                            <li key={suggestion.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setInputValue(suggestion.title);
                                  setShowSuggestions(false);
                                  router.push(`/search?q=${encodeURIComponent(suggestion.title)}`);
                                }}
                                className="w-full px-4 py-3 text-left text-xs sm:text-sm hover:bg-foreground/[0.03] transition-all duration-200 flex items-center justify-between text-foreground/80 hover:text-foreground cursor-pointer"
                              >
                                <span className="font-light tracking-wide font-sans">
                                  {suggestion.title.replace(/Denims/gi, 'Denim')}
                                </span>
                                <span className="text-[9px] text-neutral-400 font-mono tracking-widest uppercase bg-foreground/[0.04] px-2 py-0.5 border border-foreground/5">
                                  View Product
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter & Sort Toolbar (only if products are found, i.e., searchedProducts.length > 0) */}
        {!loading && searchedProducts.length > 0 && (
          <>
            <div className={`flex justify-between items-center border-b border-foreground/5 pb-6 w-full select-none ${getActiveChips().length > 0 ? "mb-4" : "mb-8"}`}>
              {/* Left Zone: Filters Button */}
              <div className="flex justify-start">
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

              {/* Right Zone: Sort Selector */}
              <div className="flex justify-end items-center">
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

            {/* Active Filter Chips Row */}
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
          </>
        )}

        {/* Results grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-12 h-12 text-foreground/20 mb-6" />
            <h2 className="text-xl font-serif tracking-wide uppercase mb-3">No results found</h2>
            <p className={`text-xs sm:text-sm max-w-md leading-relaxed mb-8 ${textMuted}`}>
              We couldn&apos;t find any matches for &ldquo;{searchQuery}&rdquo;. Try checking the spelling or searching for general keywords like &ldquo;fit&rdquo; or &ldquo;wash&rdquo;.
            </p>
            <Link
              href="/shop"
              className="px-8 py-3 bg-foreground text-background hover:bg-[#d7a33c] hover:text-black uppercase text-xs font-black tracking-widest transition-all duration-300 rounded-none cursor-pointer"
            >
              Browse Shop Catalog
            </Link>
          </div>
        ) : (
          <motion.div
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

              const primaryUrl = product.images?.edges?.[0]?.node?.url
                || (Array.isArray(product.images) ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url) : null)
                || "/raw_jeans.png";
              const secondaryUrl = product.images?.edges?.[1]?.node?.url
                || (Array.isArray(product.images) ? (typeof product.images[1] === 'string' ? product.images[1] : product.images[1]?.url) : null);
              const hasSecondary = Boolean(secondaryUrl);

              const tagLabel = product.tags?.find((t) => t.startsWith('wash:'))?.replace('wash:', '').toUpperCase()
                || (product.handle.includes('raw') ? 'RAW' : product.handle.includes('white') ? 'WHITE' : 'BLACK');

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col justify-between group transition-all duration-500 hover:-translate-y-1 bg-transparent"
                >
                  <div className="relative aspect-[3/4] bg-transparent overflow-hidden rounded-none">
                    <Link href={`/product/${encodeURIComponent(product.handle || product.id)}`} prefetch={false} className="block w-full h-full relative">
                      <img
                        src={primaryUrl}
                        alt={product.title}
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

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 z-10 transition-all duration-300 hover:scale-110 cursor-pointer ${
                        isWishlisted(product.id)
                          ? "opacity-100 text-red-500"
                          : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-white/50 hover:text-red-400"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors duration-300 ${
                          isWishlisted(product.id) ? "fill-red-500" : ""
                        }`}
                      />
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openQuickView(product);
                      }}
                      className="absolute bottom-0 left-0 right-0 py-2.5 bg-[var(--background)]/90 backdrop-blur-md text-[9px] font-black tracking-[0.25em] text-[var(--foreground)] uppercase text-center border-t border-foreground/5 opacity-0 lg:group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:bg-[var(--foreground)] hover:text-[var(--background)] z-15"
                    >
                      QUICK VIEW
                    </button>
                  </div>

                  <div className="py-4 flex flex-col justify-between flex-1 gap-4 sm:gap-6">
                    <div className="flex flex-col flex-1">
                      <span className="text-[8px] tracking-[0.2em] font-bold text-neutral-400 dark:text-neutral-500 uppercase select-none">
                        {tagLabel}
                      </span>
                      <Link href={`/product/${encodeURIComponent(product.handle || product.id)}`} prefetch={false} className="mt-3">
                        <h3 className="text-xs sm:text-sm font-serif tracking-wider text-[var(--foreground)] group-hover:text-amber-500 transition-colors duration-300">
                          {product.title.replace(/Denims/gi, 'Denim')}
                        </h3>
                      </Link>
                      <span className="text-xs font-mono font-bold text-[var(--foreground)] mt-3">
                        {formattedPrice}
                      </span>
                      <p className={`text-[10px] sm:text-[11px] leading-relaxed line-clamp-2 sm:line-clamp-3 mt-4 ${textMuted}`}>
                        {product.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2.5 sm:py-3 bg-[var(--foreground)] text-[var(--background)] hover:bg-[#d7a33c] hover:text-black rounded-none text-[8px] sm:text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      ADD TO BAG
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Quick View Modal Overlay */}
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

            {/* Jacket Size Filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] tracking-[0.25em] font-black uppercase text-neutral-500">JACKET SIZE</h4>
              <div className="grid grid-cols-5 gap-2">
                {["S", "M", "L", "XL", "XXL"].map((size) => {
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
                  max="3000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-1 bg-foreground/10 accent-[#d7a33c] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-neutral-500 uppercase tracking-widest mt-2">
                  <span>₹ 1,499</span>
                  <span>₹ 3,000</span>
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
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-[130px] pb-16 flex items-center justify-center bg-[var(--background)]">
        <div className="text-xs tracking-[0.3em] text-neutral-500 uppercase animate-pulse">Searching Catalogue...</div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
