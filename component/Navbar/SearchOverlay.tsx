"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../app/theme-provider";
import axios from "axios";

interface SearchOverlayProps {
  isOpen: boolean;
  isScrolled: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onClose: () => void;
}

export default function SearchOverlay({
  isOpen,
  isScrolled,
  searchQuery,
  setSearchQuery,
  onClose,
}: SearchOverlayProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const [products, setProducts] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axios.get("/api/shopify/products", {
        validateStatus: (status) => status < 500,
      })
        .then((res) => {
          if (res.status === 200 && Array.isArray(res.data)) {
            setProducts(res.data);
          }
        })
        .catch((err) => console.error("Failed to load products for suggestions:", err));
    } else {
      setShowSuggestions(false);
    }
  }, [isOpen]);

  const querySuggestions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    const suggestionsList: string[] = [];
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
  }, [searchQuery]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    const queryTerms = query.split(/\s+/).filter(Boolean);

    return products.filter((product) => {
      const title = product.title.toLowerCase();
      const handle = product.handle.toLowerCase();
      const description = product.description.toLowerCase();
      const tags = product.tags?.map((t: string) => t.toLowerCase()) || [];
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
          tags.some((tag: string) => tag.includes(term) || tag.includes(normalizedTerm))
        );
      });
    }).slice(0, 5);
  }, [searchQuery, products]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const overlayEl = document.querySelector(".search-overlay-wrapper");
      
      if (overlayEl && !overlayEl.contains(target)) {
        if (!target.closest("[aria-label='Search Products']")) {
          onClose();
        }
      } else if (!target.closest(".search-overlay-container")) {
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`fixed left-0 z-[250] w-full px-6 sm:px-12 md:px-20 font-sans border-b border-transparent shadow-md flex items-center search-overlay-wrapper ${
            theme === "light"
              ? "bg-white text-black"
              : "bg-black text-white"
          } ${
            isScrolled ? "top-0 h-[48px] sm:h-[52px]" : "top-[34px] h-[68px]"
          }`}
        >
          <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between h-full relative">
            <div className="flex-1 max-w-xl mx-auto relative search-overlay-container">
              <form
                onSubmit={handleSubmit}
                className="w-full flex items-center gap-3 border-b border-foreground/20 focus-within:border-foreground/80 transition-colors duration-300 py-1.5"
              >
                <Search className="h-4 w-4 text-foreground/45 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="SEARCH ONLY DENIMS..."
                  autoFocus
                  className="w-full bg-transparent text-xs sm:text-sm tracking-widest font-normal uppercase focus:outline-none placeholder-foreground/25 text-foreground"
                />
                <button type="submit" className="hidden" />
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && (querySuggestions.length > 0 || suggestions.length > 0) && (
                <div className={`absolute top-full left-0 right-0 border border-foreground/10 shadow-2xl z-[300] mt-2 rounded-none backdrop-blur-md ${theme === "light" ? "bg-white text-black" : "bg-black text-white"}`}>
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
                                  setSearchQuery(term);
                                  setShowSuggestions(false);
                                  router.push(`/search?q=${encodeURIComponent(term)}`);
                                  onClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs sm:text-sm hover:bg-foreground/[0.03] transition-all duration-200 flex items-center gap-2 text-foreground/80 hover:text-foreground cursor-pointer font-sans"
                              >
                                <Search className="w-3.5 h-3.5 text-neutral-400" />
                                <span className="font-light tracking-wide normal-case">
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
                                  setSearchQuery(suggestion.title);
                                  setShowSuggestions(false);
                                  router.push(`/search?q=${encodeURIComponent(suggestion.title)}`);
                                  onClose();
                                }}
                                className="w-full px-4 py-3 text-left text-xs sm:text-sm hover:bg-foreground/[0.03] transition-all duration-200 flex items-center justify-between text-foreground/80 hover:text-foreground cursor-pointer"
                              >
                                <span className="font-light tracking-wide font-sans normal-case">
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
            <button
              onClick={onClose}
              className="p-1.5 text-foreground/50 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all duration-300 cursor-pointer ml-4"
              aria-label="Close search"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
