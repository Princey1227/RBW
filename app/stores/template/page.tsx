"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import axios from "axios";
import dynamic from "next/dynamic";
import ShopByFit from "../../../component/home/ShopByFit";
import { useCart } from "../../../context/CartContext";
import {
  ShieldCheck,
  Truck,
  Award,
  Check,
  ShoppingBag,
  ZoomIn,
  X,
  Move,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateWashSelection3D } from "../../../component/store-template/TemplateWashSelection3D";
import TemplateBrandCustomizerBar from "../../../component/store-template/TemplateBrandCustomizerBar";
import TemplateSimulationModal from "../../../component/store-template/TemplateSimulationModal";

interface FlyingItemData {
  id: number;
  imageUrl: string;
  quantity: number;
  startCenterX: number;
  startCenterY: number;
  targetX: number;
  targetY: number;
}

const PantsIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12l1 18-6-2-1-7-1 7-6 2L6 3z" />
  </svg>
);

const TapeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="18" height="10" rx="3" />
    <path d="M7 7v4M11 7v3M15 7v4M19 7v3" />
  </svg>
);

interface SizingSpec {
  size: string;
  waist: number;
  inseam: number;
  frontRise: number;
  thigh: number;
  legOpening: number;
}

const sizingData: Record<string, SizingSpec[]> = {
  slim: [
    { size: "28", waist: 29.0, inseam: 32, frontRise: 9.5, thigh: 20.5, legOpening: 13.0 },
    { size: "30", waist: 31.0, inseam: 32, frontRise: 10.0, thigh: 21.5, legOpening: 13.5 },
    { size: "32", waist: 33.0, inseam: 32, frontRise: 10.5, thigh: 22.5, legOpening: 14.0 },
    { size: "34", waist: 35.0, inseam: 32, frontRise: 11.0, thigh: 23.5, legOpening: 14.5 },
    { size: "36", waist: 37.0, inseam: 32, frontRise: 11.5, thigh: 24.5, legOpening: 15.0 },
    { size: "38", waist: 39.0, inseam: 32, frontRise: 12.0, thigh: 25.5, legOpening: 15.5 },
    { size: "40", waist: 41.0, inseam: 32, frontRise: 12.5, thigh: 26.5, legOpening: 16.0 },
    { size: "42", waist: 43.0, inseam: 32, frontRise: 13.0, thigh: 27.5, legOpening: 16.5 },
  ],
  straight: [
    { size: "28", waist: 29.0, inseam: 32, frontRise: 10.0, thigh: 21.5, legOpening: 14.5 },
    { size: "30", waist: 31.0, inseam: 32, frontRise: 10.5, thigh: 22.5, legOpening: 15.0 },
    { size: "32", waist: 33.0, inseam: 32, frontRise: 11.0, thigh: 23.5, legOpening: 15.5 },
    { size: "34", waist: 35.0, inseam: 32, frontRise: 11.5, thigh: 24.5, legOpening: 16.0 },
    { size: "36", waist: 37.0, inseam: 32, frontRise: 12.0, thigh: 25.5, legOpening: 16.5 },
    { size: "38", waist: 39.0, inseam: 32, frontRise: 12.5, thigh: 26.5, legOpening: 17.0 },
    { size: "40", waist: 41.0, inseam: 32, frontRise: 13.0, thigh: 27.5, legOpening: 17.5 },
    { size: "42", waist: 43.0, inseam: 32, frontRise: 13.5, thigh: 28.5, legOpening: 18.0 },
  ],
  baggy: [
    { size: "28", waist: 30.0, inseam: 30, frontRise: 12.0, thigh: 24.5, legOpening: 18.0 },
    { size: "30", waist: 32.0, inseam: 30, frontRise: 12.5, thigh: 25.5, legOpening: 18.5 },
    { size: "32", waist: 34.0, inseam: 30, frontRise: 13.0, thigh: 26.5, legOpening: 19.0 },
    { size: "34", waist: 36.0, inseam: 30, frontRise: 13.5, thigh: 27.5, legOpening: 19.5 },
    { size: "36", waist: 38.0, inseam: 30, frontRise: 14.0, thigh: 28.5, legOpening: 20.0 },
    { size: "38", waist: 40.0, inseam: 30, frontRise: 14.5, thigh: 29.5, legOpening: 20.5 },
    { size: "40", waist: 42.0, inseam: 30, frontRise: 15.0, thigh: 30.5, legOpening: 21.0 },
    { size: "42", waist: 44.0, inseam: 30, frontRise: 15.5, thigh: 31.5, legOpening: 21.5 },
  ],
  comfort: [
    { size: "28", waist: 29.5, inseam: 31, frontRise: 10.75, thigh: 22.5, legOpening: 13.75 },
    { size: "30", waist: 31.5, inseam: 31, frontRise: 11.25, thigh: 23.5, legOpening: 14.25 },
    { size: "32", waist: 33.5, inseam: 31, frontRise: 11.75, thigh: 24.5, legOpening: 14.75 },
    { size: "34", waist: 35.5, inseam: 31, frontRise: 12.25, thigh: 25.5, legOpening: 15.25 },
    { size: "36", waist: 37.5, inseam: 31, frontRise: 12.75, thigh: 26.5, legOpening: 15.75 },
    { size: "38", waist: 39.5, inseam: 31, frontRise: 13.25, thigh: 27.5, legOpening: 16.25 },
    { size: "40", waist: 41.5, inseam: 31, frontRise: 13.75, thigh: 28.5, legOpening: 16.75 },
    { size: "42", waist: 43.5, inseam: 31, frontRise: 14.25, thigh: 29.5, legOpening: 17.25 },
  ],
  bootcut: [
    { size: "28", waist: 29.0, inseam: 33, frontRise: 9.75, thigh: 21.5, legOpening: 17.0 },
    { size: "30", waist: 31.0, inseam: 33, frontRise: 10.25, thigh: 22.5, legOpening: 17.5 },
    { size: "32", waist: 33.0, inseam: 33, frontRise: 10.75, thigh: 23.5, legOpening: 18.0 },
    { size: "34", waist: 35.0, inseam: 33, frontRise: 11.25, thigh: 24.5, legOpening: 18.5 },
    { size: "36", waist: 37.0, inseam: 33, frontRise: 11.75, thigh: 25.5, legOpening: 19.0 },
    { size: "38", waist: 39.0, inseam: 33, frontRise: 12.25, thigh: 26.5, legOpening: 19.5 },
    { size: "40", waist: 41.0, inseam: 33, frontRise: 12.75, thigh: 27.5, legOpening: 20.0 },
    { size: "42", waist: 43.0, inseam: 33, frontRise: 13.25, thigh: 28.5, legOpening: 20.5 },
  ],
  ankle: [
    { size: "28", waist: 29.0, inseam: 28, frontRise: 10.25, thigh: 21.5, legOpening: 12.75 },
    { size: "30", waist: 31.0, inseam: 28, frontRise: 10.75, thigh: 22.5, legOpening: 13.25 },
    { size: "32", waist: 33.0, inseam: 28, frontRise: 11.25, thigh: 23.5, legOpening: 13.75 },
    { size: "34", waist: 35.0, inseam: 28, frontRise: 11.75, thigh: 24.5, legOpening: 14.25 },
    { size: "36", waist: 37.0, inseam: 28, frontRise: 12.25, thigh: 25.5, legOpening: 14.75 },
    { size: "38", waist: 39.0, inseam: 28, frontRise: 12.75, thigh: 26.5, legOpening: 15.25 },
    { size: "40", waist: 41.0, inseam: 28, frontRise: 13.25, thigh: 27.5, legOpening: 15.75 },
    { size: "42", waist: 43.0, inseam: 28, frontRise: 13.75, thigh: 28.5, legOpening: 16.25 },
  ],
};

const getProductHandleForWashAndFit = (wash: string, fit: string, category: string = "jeans") => {
  const normFit = fit.toLowerCase();
  if (category === "jackets") {
    if (wash === "raw") return "raw-denim-jacket";
    if (wash === "black") return "black-denim-jacket";
    if (wash === "white" || wash === "vintage") return "white-denim-jacket";
  }
  if (category === "shorts") {
    if (wash === "raw") return "raw-shorts";
    if (wash === "black") return "black-shorts";
    if (wash === "white") return "white-shorts";
  }
  if (category === "accessories") {
    return "rbw-cap";
  }
  if (wash === "raw") {
    if (normFit === "slim") return "raw-slim-denims";
    if (normFit === "straight") return "raw-straight-denims";
    if (normFit === "baggy") return "raw-baggy-denims";
    if (normFit === "bootcut") return "raw-bootcut-denims";
    if (normFit === "ankle") return "raw-ankle-denims";
    if (normFit === "comfort") return "raw-comfort-denims";
  } else if (wash === "black") {
    if (normFit === "slim") return "black-slim-denims";
    if (normFit === "straight") return "black-straight-denims";
    if (normFit === "baggy") return "black-baggy-denims";
    if (normFit === "bootcut") return "black-bootcut-denims";
    if (normFit === "ankle") return "black-ankle-denims";
    if (normFit === "comfort") return "black-comfort-denims";
  } else if (wash === "white") {
    if (normFit === "slim") return "white-slim-denim";
    if (normFit === "straight") return "white-straight-denim";
    if (normFit === "baggy") return "white-baggy-denim";
    if (normFit === "bootcut") return "white-bootcut-denim";
    if (normFit === "ankle") return "white-ankle-denim";
    if (normFit === "comfort") return "white-comfort-denim";
  }
  return "raw-straight-denims";
};

export default function TemplateStorefrontPage() {
  // Brand Configuration State (Interactive toolbar controls)
  const [brandName, setBrandName] = useState("YOUR BRAND");
  const [accentColor, setAccentColor] = useState("#B9965A");
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [simActionType, setSimActionType] = useState<"cart" | "buy_now" | "info">("buy_now");

  // Selection state
  const [activeWash, setActiveWash] = useState<"raw" | "black" | "white" | "vintage" | null>(null);
  const [selectedWash, setSelectedWash] = useState<"raw" | "black" | "white" | "vintage" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("jeans");
  const [selectedFit, setSelectedFit] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("32");
  const [quantity, setQuantity] = useState<number>(1);
  const [isBuyingNow, setIsBuyingNow] = useState<boolean>(false);
  const [isAddingCart, setIsAddingCart] = useState<boolean>(false);
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1.5);
  const [flyingItem, setFlyingItem] = useState<FlyingItemData | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  // Inline Zoom & Pan
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const [isInlineZoomActive, setIsInlineZoomActive] = useState<boolean>(false);
  const [inlineZoomScale, setInlineZoomScale] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pincode & Size Guide
  const [sizeChartOpen, setSizeChartOpen] = useState<boolean>(false);
  const [sizeGuideUnit, setSizeGuideUnit] = useState<"in" | "cm">("in");
  const [pincode, setPincode] = useState<string>("");
  const [pincodeStatus, setPincodeStatus] = useState<{
    checked: boolean;
    valid: boolean;
    message: string;
    eta: string;
  } | null>(null);

  // Drawers
  const fitsDrawerRef = useRef<HTMLDivElement>(null);
  const detailDrawerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLElement>(null);
  const buyButtonRef = useRef<HTMLDivElement>(null);

  const { addToCart, updateBuyerIdentity, setIsOpen: setCartOpen } = useCart();
  const [shopifyProducts, setShopifyProducts] = useState<any[]>([]);
  const [shopifyLoading, setShopifyLoading] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch shopify products for realistic demo pricing and inventory
  useEffect(() => {
    async function loadShopifyProducts() {
      try {
        const response = await axios.get("/api/shopify/products", {
          validateStatus: (status) => status < 500,
        });
        if (response.status === 200 && Array.isArray(response.data)) {
          setShopifyProducts(response.data);
        }
      } catch (error) {
        console.error("Failed to load Shopify products:", error);
      } finally {
        setShopifyLoading(false);
      }
    }
    loadShopifyProducts();
  }, []);

  // Sync URL parameters
  useEffect(() => {
    const VALID_WASHES = ["raw", "black", "white", "vintage"];
    const VALID_FITS = ["ankle", "slim", "comfort", "straight", "baggy", "bootcut"];

    const handleUrlCheck = () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const rawWash = urlParams.get("wash")?.toLowerCase();
        const rawFit = urlParams.get("fit")?.toLowerCase();
        const rawCat = urlParams.get("category")?.toLowerCase();

        if (rawCat && ["jeans", "jackets", "shorts"].includes(rawCat)) {
          setSelectedCategory(rawCat);
        }

        if (rawWash && VALID_WASHES.includes(rawWash)) {
          setSelectedWash(rawWash as any);
          setActiveWash(rawWash as any);
          if (rawFit && VALID_FITS.includes(rawFit)) {
            setSelectedFit(rawFit);
          } else {
            setSelectedFit(null);
          }
        } else {
          setSelectedWash(null);
          setSelectedFit(null);
        }
      }
    };

    handleUrlCheck();
    window.addEventListener("popstate", handleUrlCheck);
    return () => window.removeEventListener("popstate", handleUrlCheck);
  }, []);

  const handleWashClick = (wash: string, category?: string, defaultFit?: string) => {
    const safeWash = (["raw", "black", "white", "vintage"].includes(wash) ? wash : "raw") as any;
    setSelectedWash(safeWash);
    setActiveWash(safeWash);
    const cat = category || "jeans";
    setSelectedCategory(cat);

    if (cat === "accessories") {
      const fitName = "standard";
      setSelectedFit(fitName);
      setSelectedSize("One Size");
      if (typeof window !== "undefined") {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set("wash", safeWash);
          url.searchParams.set("category", cat);
          url.searchParams.set("fit", fitName);
          window.history.pushState({ wash: safeWash, category: cat, fit: fitName }, "", url.toString());
        } catch (e) {}
      }
      return;
    }

    if (cat !== "jeans") {
      const fitName = defaultFit ? defaultFit.toLowerCase() : (cat === "jackets" ? "comfort" : "shorts");
      setSelectedFit(fitName);
      setSelectedSize(cat === "jackets" ? "L" : "32");
      if (typeof window !== "undefined") {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set("wash", safeWash);
          url.searchParams.set("category", cat);
          url.searchParams.set("fit", fitName);
          window.history.pushState({ wash: safeWash, category: cat, fit: fitName }, "", url.toString());
        } catch (e) {}
      }
    } else {
      setSelectedFit(null);
      if (typeof window !== "undefined") {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set("wash", safeWash);
          url.searchParams.delete("fit");
          window.history.pushState({ wash: safeWash }, "", url.toString());
        } catch (e) {}
      }
    }
  };

  const handleBackClick = () => {
    setSelectedWash(null);
    setSelectedFit(null);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("wash");
        url.searchParams.delete("fit");
        window.history.pushState({}, "", url.pathname);
      } catch (e) {}
    }
  };

  const handleFitClick = (fitName: string) => {
    const normFit = fitName.toLowerCase();
    setSelectedFit(normFit);
    setSizeChartOpen(false);

    if (typeof window !== "undefined" && selectedWash) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("wash", selectedWash);
        url.searchParams.set("fit", normFit);
        window.history.pushState({ wash: selectedWash, fit: normFit }, "", url.toString());
      } catch (e) {}
    }

    const productHandle = selectedWash ? getProductHandleForWashAndFit(selectedWash, normFit, selectedCategory) : "";
    const prod = shopifyProducts.find((p) => p.handle === productHandle);
    if (prod) {
      const sizeOpt = prod.options?.find((opt: any) => opt.name.toLowerCase() === "size");
      if (sizeOpt && sizeOpt.values?.length > 0) {
        setSelectedSize(sizeOpt.values[0]);
      } else {
        setSelectedSize("32");
      }
    } else {
      setSelectedSize("32");
    }
  };

  const handleBackToFits = () => {
    setSelectedFit(null);
    setSizeChartOpen(false);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("fit");
        if (selectedWash) url.searchParams.set("wash", selectedWash);
        window.history.pushState({ wash: selectedWash, fit: null }, "", url.toString());
      } catch (e) {}
    }
  };

  const handleCheckPincode = (code: string) => {
    const clean = code.trim();
    if (clean.length === 6 && /^\d{6}$/.test(clean)) {
      const isMetro = /^(11|40|56|60|70|50)/.test(clean);
      setPincodeStatus({
        checked: true,
        valid: true,
        message: isMetro ? "Express Metro Air Active" : "Standard Surface Delivery Active",
        eta: isMetro ? "2–3 Business Days (Express Air)" : "3–5 Business Days (Standard)",
      });
    } else if (clean.length > 0) {
      setPincodeStatus({
        checked: true,
        valid: false,
        message: "Enter a valid 6-digit Indian PIN code",
        eta: "",
      });
    } else {
      setPincodeStatus(null);
    }
  };

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomScale((prev) => Math.min(prev + 0.5, 4));
  };
  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomScale((prev) => Math.max(prev - 0.5, 1));
  };
  const handleResetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomScale(1);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isInlineZoomActive || inlineZoomScale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panPosition };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isInlineZoomActive || inlineZoomScale <= 1) return;
    e.preventDefault();
    const rect = zoomContainerRef.current?.getBoundingClientRect();
    const width = rect ? rect.width : 460;
    const height = rect ? rect.height : 613;
    const maxPanX = (width * (inlineZoomScale - 1)) / 2;
    const maxPanY = (height * (inlineZoomScale - 1)) / 2;

    const rawX = panStartRef.current.x + (e.clientX - dragStartRef.current.x);
    const rawY = panStartRef.current.y + (e.clientY - dragStartRef.current.y);

    setPanPosition({
      x: Math.max(-maxPanX, Math.min(maxPanX, rawX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, rawY)),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isInlineZoomActive || inlineZoomScale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    panStartRef.current = { ...panPosition };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isInlineZoomActive || inlineZoomScale <= 1 || e.touches.length !== 1) return;
    const rect = zoomContainerRef.current?.getBoundingClientRect();
    const width = rect ? rect.width : 460;
    const height = rect ? rect.height : 613;
    const maxPanX = (width * (inlineZoomScale - 1)) / 2;
    const maxPanY = (height * (inlineZoomScale - 1)) / 2;

    const rawX = panStartRef.current.x + (e.touches[0].clientX - dragStartRef.current.x);
    const rawY = panStartRef.current.y + (e.touches[0].clientY - dragStartRef.current.y);

    setPanPosition({
      x: Math.max(-maxPanX, Math.min(maxPanX, rawX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, rawY)),
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  useEffect(() => {
    setIsInlineZoomActive(false);
    setInlineZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  }, [activeImageIndex]);

  const getSelectedVariantId = (prod: any, size: string) => {
    if (!prod || !prod.variants?.edges) return null;
    const matchingVariant = prod.variants.edges.find(({ node }: any) => {
      const sizeOpt = node.selectedOptions?.find((opt: any) => opt.name.toLowerCase() === "size");
      return sizeOpt?.value === size || node.title === size;
    });
    return matchingVariant?.node?.id || prod.variants.edges[0]?.node?.id || null;
  };

  const handleAddToCartClick = async (prod: any, e?: React.MouseEvent) => {
    // Open the partner simulation modal to explain checkout
    setSimActionType("cart");
    setIsSimModalOpen(true);
  };

  const handleBuyNowClick = async (prod: any) => {
    setSimActionType("buy_now");
    setIsSimModalOpen(true);
  };

  const renderSelectionPath = (currentStep: 1 | 2 | 3) => {
    const washLabel = selectedWash ? selectedWash.toUpperCase() : null;
    const fitLabel = selectedFit ? selectedFit.toUpperCase() : null;

    return (
      <nav aria-label="Selection Path" className="flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs font-mono font-bold tracking-wider uppercase whitespace-nowrap select-none">
        {currentStep === 1 ? (
          <span className="text-stone-950 font-black bg-stone-200/90 px-2.5 py-1 rounded-full border border-stone-300/60 shadow-2xs">
            {washLabel ? `WASH: ${washLabel}` : "SELECT WASH"}
          </span>
        ) : (
          <button
            onClick={handleBackClick}
            className="text-stone-600 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1 rounded-full border border-stone-300/50 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
          >
            <span className="text-stone-400 font-semibold">WASH:</span>
            <span className="font-extrabold text-stone-900">{washLabel || "SELECT"}</span>
          </button>
        )}

        {currentStep >= 3 && fitLabel && selectedCategory === "jeans" && (
          <>
            <span className="text-stone-400 font-black select-none text-[11px] sm:text-xs">&rarr;</span>
            <button
              onClick={handleBackToFits}
              className="text-stone-600 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1 rounded-full border border-stone-300/50 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <span className="text-stone-400 font-semibold">FIT:</span>
              <span className="font-extrabold text-stone-900">{fitLabel}</span>
            </button>
          </>
        )}

        {currentStep >= 3 && selectedSize && (
          <>
            <span className="text-stone-400 font-black select-none text-[11px] sm:text-xs">&rarr;</span>
            <span className="text-stone-950 font-black bg-stone-200/90 px-2.5 py-1 rounded-full border border-stone-300/60 shadow-2xs">
              SIZE: {selectedSize}
            </span>
          </>
        )}
      </nav>
    );
  };

  return (
    <main
      ref={mainContainerRef}
      className="w-full h-screen bg-[var(--background)] overflow-hidden relative pt-[75px] md:pt-[85px] xl:pt-[103px] box-border"
    >
      {/* Floating Partner Customizer Bar */}
      <TemplateBrandCustomizerBar
        brandName={brandName}
        onChangeBrandName={setBrandName}
        accentColor={accentColor}
        onChangeAccentColor={setAccentColor}
        onOpenSimulation={() => {
          setSimActionType("info");
          setIsSimModalOpen(true);
        }}
      />

      {/* Demo Simulation Modal */}
      <TemplateSimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        brandName={brandName}
        accentColor={accentColor}
        itemTitle={`${brandName} ${selectedWash?.toUpperCase() || "RAW"} DENIM`}
        actionType={simActionType}
      />

      <div className="w-full h-full relative">
        {/* ============================================================== */}
        {/* Slide 1: Wash Selection (3D Preview)                           */}
        {/* ============================================================== */}
        <div
          className={`absolute left-0 w-full h-[100dvh] top-[-75px] md:top-[-85px] xl:top-[-103px] shrink-0 overflow-hidden transition-all duration-500 ${
            selectedWash ? "scale-[0.98] brightness-75 filter blur-[0.5px]" : "scale-100 brightness-100"
          }`}
        >
          <TemplateWashSelection3D
            brandName={brandName}
            accentColor={accentColor}
            onWashSelect={handleWashClick}
          />
        </div>

        {/* ============================================================== */}
        {/* Slide 2: Shop By Fit Drawer                                    */}
        {/* ============================================================== */}
        <div
          ref={fitsDrawerRef}
          className={`absolute inset-0 z-50 bg-[#FAF8F5] flex flex-col pt-[48px] sm:pt-[54px] xl:pt-0 overflow-y-auto pb-28 sm:pb-36 transform-gpu will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            selectedWash
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "translate-y-full opacity-0 pointer-events-none"
          } ${selectedFit ? "scale-[0.98] brightness-75 filter blur-[0.5px]" : "scale-100 brightness-100"}`}
        >
          {/* Header Bar */}
          <div className="w-full bg-[#FAF8F5]/90 border-b border-stone-200/60 px-3 sm:px-6 md:px-12 py-2.5 flex items-center justify-between gap-2 shadow-xs shrink-0 z-50">
            {selectedWash ? (
              <button
                onClick={handleBackClick}
                className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-black tracking-wider text-white bg-stone-900 hover:bg-black px-2.5 sm:px-3 py-1.5 rounded-full transition-all active:scale-95 uppercase cursor-pointer shrink-0 shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">WASHES</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex-1 flex items-center justify-center overflow-x-auto scrollbar-none min-w-0">
              {renderSelectionPath(2)}
            </div>

            <div className="w-[34px] sm:w-[68px] shrink-0 invisible" />
          </div>

          <div className="flex-1 flex flex-col justify-center py-2 md:py-6">
            <ShopByFit
              selectedWash={selectedWash as any}
              isInsideViewport={false}
              onFitClick={handleFitClick}
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* Slide 3: Product Detail View Drawer                            */}
        {/* ============================================================== */}
        <div
          ref={detailDrawerRef}
          className={`absolute inset-0 z-55 bg-[#FAF8F5] text-[#1C1917] flex flex-col transform-gpu will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pt-[48px] sm:pt-[54px] xl:pt-0 overflow-y-auto pb-28 sm:pb-36 ${
            selectedFit && selectedWash
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          {/* Header Bar */}
          <div className="w-full bg-[#FAF8F5] border-b border-stone-200/60 px-3 sm:px-6 md:px-12 py-2 flex items-center justify-between gap-2 shadow-xs z-30 shrink-0">
            <button
              onClick={handleBackToFits}
              className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-black tracking-wider text-white bg-stone-900 hover:bg-black px-2.5 sm:px-3 py-1.5 rounded-full transition-all active:scale-95 uppercase cursor-pointer shrink-0 shadow-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">FITS</span>
            </button>

            <div className="flex-1 flex items-center justify-center overflow-x-auto scrollbar-none min-w-0">
              {renderSelectionPath(3)}
            </div>

            <div className="w-[34px] sm:w-[68px] shrink-0 invisible" />
          </div>

          {selectedFit && selectedWash && (() => {
            const productHandle = getProductHandleForWashAndFit(selectedWash, selectedFit, selectedCategory);
            const product = shopifyProducts.find((p) => p.handle === productHandle);

            const displayTitle = selectedCategory === "jackets"
              ? `${brandName} ${selectedWash.toUpperCase()} SELVEDGE JACKET`
              : selectedCategory === "shorts"
              ? `${brandName} ${selectedWash.toUpperCase()} BERMUDA SHORTS`
              : selectedCategory === "accessories"
              ? `${brandName} RAW DENIM ACCESSORY`
              : `${brandName} ${selectedWash.toUpperCase()} ${selectedFit.toUpperCase()} DENIM`;

            const price = product?.priceRange?.minVariantPrice;
            const formattedPrice = price
              ? `${price.currencyCode === 'INR' ? '₹ ' : price.currencyCode + ' '}${parseFloat(price.amount).toLocaleString('en-IN')}`
              : selectedCategory === "jackets"
              ? "₹ 3,490"
              : selectedCategory === "shorts"
              ? "₹ 1,490"
              : selectedCategory === "accessories"
              ? "₹ 990"
              : "₹ 1,950";

            const defaultImgList = selectedCategory === "jackets"
              ? selectedWash === "black"
                ? ["/black_denim_jacket.png", "/vintage_denim_jacket.png"]
                : selectedWash === "white" || selectedWash === "vintage"
                ? ["/vintage_denim_jacket.png", "/raw_denim_jacket.png"]
                : ["/raw_denim_jacket.png", "/black_denim_jacket.png"]
              : selectedCategory === "shorts"
              ? selectedWash === "black"
                ? ["/black_denim_shorts.png", "/black_denim_shorts_hanger.png"]
                : selectedWash === "white"
                ? ["/white_denim_shorts.png", "/raw_denim_shorts.png"]
                : ["/raw_denim_shorts.png", "/black_denim_shorts.png"]
              : selectedCategory === "accessories"
              ? ["/denim_tote_bag.jpg", "/denim_pouch.jpg", "/rbw_cap.jpg"]
              : selectedWash === "black"
              ? ["/black_jeans.png", "/preview_black.png", "/rbw_lookbook2.png"]
              : selectedWash === "white"
              ? ["/white_jeans.png", "/preview_white.png", "/rbw_lookbook1.png"]
              : ["/raw_jeans.png", "/preview_raw.png", "/rbw_lookbook1.png"];

            const imageUrls = product?.images?.edges?.map((e: any) => e.node?.url).filter(Boolean) || defaultImgList;
            const activeStep3Img = imageUrls[activeImageIndex] || imageUrls[0];
            const activeFitSizing = sizingData[selectedFit.toLowerCase()] || sizingData["straight"] || [];

            const availableSizesList = selectedCategory === "jackets"
              ? ["S", "M", "L", "XL", "XXL"]
              : selectedCategory === "shorts"
              ? ["30", "32", "34", "36", "38", "40"]
              : selectedCategory === "accessories"
              ? ["One Size"]
              : ["28", "30", "32", "34", "36", "38", "40", "42"];

            return (
              <div className="max-w-[1240px] mx-auto w-full flex flex-col md:flex-row px-6 sm:px-10 md:px-14 pt-3 sm:pt-4 md:pt-6 pb-6 sm:pb-8 gap-6 md:gap-8 lg:gap-10 items-start justify-center">
                {/* Left: Product Images with Zoom */}
                <div className="w-full md:w-1/2 flex items-start justify-center md:justify-end gap-3.5">
                  {imageUrls.length > 1 && (
                    <div className="flex flex-col gap-3 shrink-0">
                      {imageUrls.slice(0, 4).map((url: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-14 h-18 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                            activeImageIndex === idx ? "scale-105 shadow-md" : "border-stone-200 opacity-65 hover:opacity-100"
                          }`}
                          style={{
                            borderColor: activeImageIndex === idx ? accentColor : undefined,
                          }}
                        >
                          <img src={url} alt={`Angle ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    ref={zoomContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="relative w-full max-w-[460px] aspect-[3/4] bg-neutral-900 overflow-hidden border border-[#E8E3DA] shadow-lg rounded-[14px] group select-none cursor-grab active:cursor-grabbing"
                  >
                    <img
                      src={activeStep3Img}
                      alt={displayTitle}
                      style={{
                        transform: isInlineZoomActive
                          ? `translate(${panPosition.x}px, ${panPosition.y}px) scale(${inlineZoomScale})`
                          : "none",
                        transformOrigin: "center center",
                        transition: isDragging ? "none" : "transform 250ms cubic-bezier(0.25, 1, 0.5, 1)",
                        cursor: isInlineZoomActive ? (isDragging ? "grabbing" : "grab") : "default",
                      }}
                      className="w-full h-full object-cover object-center pointer-events-none"
                    />

                    {isInlineZoomActive && inlineZoomScale > 1 && (
                      <div className="absolute top-3 right-3 z-30 bg-black/80 text-white text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-md pointer-events-none border border-white/10 animate-fadeIn">
                        <Move className="w-3 h-3 text-[#D4B16A]" />
                        <span>DRAG TO MOVE TOP/BOTTOM</span>
                      </div>
                    )}

                    {!isInlineZoomActive ? (
                      <button
                        onClick={() => {
                          setIsInlineZoomActive(true);
                          setInlineZoomScale(1.5);
                          setPanPosition({ x: 0, y: 0 });
                        }}
                        title="Zoom Image"
                        className="absolute bottom-3 left-3 w-9.5 h-9.5 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center backdrop-blur-xs transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer z-20"
                      >
                        <ZoomIn className="w-4 h-4 text-white stroke-[2.5]" />
                      </button>
                    ) : (
                      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2 bg-black/85 border border-white/20 px-3 py-1.5 rounded-full shadow-2xl backdrop-blur-md animate-fadeIn select-none">
                        <button
                          onClick={() => {
                            const newScale = Math.max(1, inlineZoomScale - 0.5);
                            setInlineZoomScale(newScale);
                            if (newScale === 1) setPanPosition({ x: 0, y: 0 });
                          }}
                          disabled={inlineZoomScale <= 1}
                          title="Zoom Out (-)"
                          className="w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-sm text-white hover:bg-white/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          &minus;
                        </button>
                        <span className="text-[10px] font-mono font-bold text-stone-200 min-w-[36px] text-center">
                          {Math.round(inlineZoomScale * 100)}%
                        </span>
                        <button
                          onClick={() => setInlineZoomScale((prev) => Math.min(3.5, prev + 0.5))}
                          disabled={inlineZoomScale >= 3.5}
                          title="Zoom In (+)"
                          className="w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-sm text-white hover:bg-white/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          +
                        </button>
                        <div className="w-[1px] h-3.5 bg-white/20 my-auto mx-0.5" />
                        <button
                          onClick={() => {
                            setIsInlineZoomActive(false);
                            setInlineZoomScale(1);
                            setPanPosition({ x: 0, y: 0 });
                          }}
                          title="Close Zoom"
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Product Details & CTAs */}
                <div className="w-full md:w-1/2 max-w-[540px] flex flex-col text-left justify-start">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-white px-3 py-1 rounded-full uppercase shadow-xs"
                      style={{ backgroundColor: accentColor }}
                    >
                      {brandName}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] bg-stone-950 text-white px-3 py-1 rounded-full uppercase shadow-xs">
                      {selectedWash} • {selectedFit}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1C1917] font-semibold uppercase leading-tight tracking-wide">
                    {displayTitle}
                  </h1>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                    <div className="text-xl sm:text-2xl font-bold font-sans text-stone-900 tracking-tight flex items-center gap-2">
                      <span>{formattedPrice}</span>
                      <span className="text-[9px] sm:text-[9.5px] font-black tracking-widest text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md uppercase">
                        INCL. TAXES
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      IN STOCK • SHIPS IN 24H
                    </span>
                  </div>

                  <div className="w-full h-[1px] bg-[#E8E3DA] my-3.5" />

                  {/* Size Selector */}
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10.5px] sm:text-[11px] font-black tracking-wider uppercase text-stone-700">
                        {selectedCategory === "jackets"
                          ? "SELECT CHEST SIZE (INTERNATIONAL)"
                          : selectedCategory === "accessories"
                          ? "ONE SIZE FITS ALL"
                          : "SELECT WAIST SIZE (INCHES)"}
                      </span>
                      {selectedCategory !== "accessories" && (
                        <button
                          type="button"
                          onClick={() => setSizeChartOpen(true)}
                          className="inline-flex items-center gap-1 text-[10.5px] font-black tracking-wider uppercase text-[#8C6B2F] hover:text-black transition-colors cursor-pointer"
                        >
                          <TapeIcon className="w-3.5 h-3.5 text-[#B9965A]" />
                          <span>SIZE GUIDE & CHART</span>
                        </button>
                      )}
                    </div>

                    <div className={`grid gap-2 ${
                      selectedCategory === "accessories"
                        ? "grid-cols-1 max-w-[140px]"
                        : selectedCategory === "jackets"
                        ? "grid-cols-5"
                        : selectedCategory === "shorts"
                        ? "grid-cols-3 sm:grid-cols-6"
                        : "grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-8"
                    }`}>
                      {availableSizesList.map((sz) => {
                        const isSelected = selectedSize === sz;
                        return (
                          <button
                            key={sz}
                            onClick={() => setSelectedSize(sz)}
                            className={`w-full h-10 sm:h-11 flex items-center justify-center font-sans font-extrabold text-xs sm:text-sm tracking-wider rounded-xl transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "bg-stone-950 text-white border-stone-950 shadow-md ring-2 ring-stone-950/20 scale-[1.03]"
                                : "bg-white text-stone-800 border border-stone-300 hover:border-black hover:bg-stone-100"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10.5px] font-black tracking-widest uppercase text-stone-600">
                      QUANTITY
                    </span>
                    <div className="flex items-center gap-3 bg-white border border-[#E8E3DA] px-3 py-1 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-6 h-6 flex items-center justify-center font-bold text-base text-neutral-700 hover:text-black cursor-pointer select-none"
                      >
                        −
                      </button>
                      <span className="font-sans font-black text-xs w-5 text-center text-neutral-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center font-bold text-base text-neutral-700 hover:text-black cursor-pointer select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div ref={buyButtonRef} className="w-full mt-5 flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleBuyNowClick(product)}
                      className="w-full py-3.5 px-6 rounded-xl font-sans font-black text-[12px] sm:text-[12.5px] tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer select-none text-white shadow-lg hover:shadow-xl active:scale-[0.98]"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>BUY NOW &rarr;</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCartClick(product, e)}
                        className="w-full py-3 px-3 rounded-xl font-sans font-black text-[10.5px] sm:text-[11px] tracking-[0.16em] uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer select-none border bg-white hover:bg-stone-50 border-[#E8E3DA] text-stone-900 shadow-xs active:scale-[0.98]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#B9965A]" />
                        <span>ADD TO CART</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleBackToFits}
                        className="w-full py-3 px-3 rounded-xl font-sans font-black text-[10.5px] sm:text-[11px] tracking-[0.16em] uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer select-none bg-white hover:bg-stone-50 border border-[#E8E3DA] text-stone-900 shadow-xs active:scale-[0.98]"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
                        <span>CHANGE FIT</span>
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-[#E8E3DA] my-5" />

                  {/* Specifications */}
                  <div className="rounded-xl bg-white/90 border border-[#E8E3DA] p-3.5 shadow-2xs">
                    <h4 className="text-[10px] font-black tracking-[0.16em] uppercase text-stone-900 mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#B9965A]" />
                      <span>Garment Specifications</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[11px]">
                      <div>
                        <span className="text-stone-400 block text-[9px] font-bold uppercase tracking-wider">Fabric</span>
                        <span className="font-semibold text-stone-800">14.5oz Pure Raw Selvedge Denim</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px] font-bold uppercase tracking-wider">Silhouette</span>
                        <span className="font-semibold text-stone-800 capitalize">{selectedFit} Fit • 5-Pocket</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px] font-bold uppercase tracking-wider">Stretch</span>
                        <span className="font-semibold text-stone-800">100% Rigid Shuttle-Loom Cotton (0% Stretch)</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px] font-bold uppercase tracking-wider">Care</span>
                        <span className="font-semibold text-stone-800">Cold soak inside out, line dry in shade</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Dispatch */}
                  <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex flex-col gap-2 text-[10.5px] text-stone-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#B9965A] shrink-0" />
                        <span className="font-semibold text-stone-900">Delivery & Dispatch</span>
                      </div>
                      <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                        FREE ABOVE ₹1,500
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit PIN code"
                        value={pincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setPincode(val);
                          if (val.length === 6) handleCheckPincode(val);
                          else if (pincodeStatus) setPincodeStatus(null);
                        }}
                        className="w-36 px-2.5 py-1 text-[11px] font-mono bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-stone-800 text-stone-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleCheckPincode(pincode)}
                        className="px-3 py-1 bg-stone-900 hover:bg-black text-white rounded-lg text-[10px] font-bold tracking-wider uppercase cursor-pointer"
                      >
                        CHECK
                      </button>
                      {pincodeStatus && pincodeStatus.valid && (
                        <span className="text-[10px] font-bold text-stone-700 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                          <span>{pincodeStatus.eta}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 text-[9.5px] text-stone-500 font-semibold tracking-wider uppercase mt-4 mb-20">
                    <span>✓ 7-Day Easy Returns</span>
                    <span>•</span>
                    <span>✓ 100% Authentic Selvedge</span>
                    <span>•</span>
                    <span>✓ Secure Checkout</span>
                  </div>

                  {/* Size Guide Modal */}
                  {sizeChartOpen && (
                    <div
                      role="dialog"
                      aria-modal="true"
                      onClick={() => setSizeChartOpen(false)}
                      className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-[640px] bg-[#FAF8F5] text-[#1C1917] border border-[#E8E3DA] rounded-2xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
                      >
                        <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-3 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#D4B16A]/15 flex items-center justify-center">
                              <TapeIcon className="w-4 h-4 text-[#B9965A]" />
                            </div>
                            <div>
                              <h3 className="font-serif text-base sm:text-lg font-bold tracking-wide uppercase">
                                {selectedFit ? `${selectedFit} Fit` : "Denim"} Size Guide & Chart
                              </h3>
                              <span className="text-[10px] text-stone-500 uppercase tracking-widest font-mono">
                                Accurate Garment Specs • True to Size
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setSizeChartOpen(false)}
                            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <X className="w-4 h-4 text-stone-700" />
                          </button>
                        </div>

                        {/* How to measure */}
                        <div className="bg-white rounded-xl border border-stone-200/80 p-3.5 mb-4 shadow-2xs">
                          <h4 className="text-[10.5px] font-black uppercase tracking-wider text-stone-900 mb-2 flex items-center gap-1.5">
                            <span>📐</span>
                            <span>How to Measure</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] text-stone-600">
                            <div>
                              <strong className="text-stone-900">Waist:</strong> Measure flat across waistband without stretching, &times; 2.
                            </div>
                            <div>
                              <strong className="text-stone-900">Inseam:</strong> From inner crotch point straight down to leg hem.
                            </div>
                            <div>
                              <strong className="text-stone-900">Front Rise:</strong> From crotch intersection up to top waistband.
                            </div>
                            <div>
                              <strong className="text-stone-900">Thigh:</strong> 1" below crotch point flat across the leg.
                            </div>
                            <div>
                              <strong className="text-stone-900">Leg Opening:</strong> Flat measurement across the bottom hem.
                            </div>
                            <div>
                              <strong className="text-stone-900">Recommendation:</strong> Select your standard natural waist size.
                            </div>
                          </div>
                        </div>

                        {/* Unit Switcher */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black tracking-widest uppercase text-stone-500">
                            Measurements ({sizeGuideUnit === "in" ? "Inches" : "Centimeters"})
                          </span>
                          <div className="flex items-center rounded-lg border border-[#E8E3DA] bg-white p-0.5 text-[9.5px] font-bold">
                            <button
                              type="button"
                              onClick={() => setSizeGuideUnit("in")}
                              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                                sizeGuideUnit === "in"
                                  ? "bg-stone-900 text-white shadow-2xs"
                                  : "text-neutral-500 hover:text-black"
                              }`}
                            >
                              INCHES (")
                            </button>
                            <button
                              type="button"
                              onClick={() => setSizeGuideUnit("cm")}
                              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                                sizeGuideUnit === "cm"
                                  ? "bg-stone-900 text-white shadow-2xs"
                                  : "text-neutral-500 hover:text-black"
                              }`}
                            >
                              CM
                            </button>
                          </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-xl border border-[#E8E3DA] bg-white shadow-2xs">
                          <table className="w-full text-left text-[11px] text-neutral-700 border-collapse">
                            <thead>
                              <tr className="border-b border-[#E8E3DA] bg-stone-50">
                                <th className="py-2 px-2.5 font-bold tracking-wider text-[9px] text-neutral-500">SIZE</th>
                                <th className="py-2 px-2 font-bold tracking-wider text-[9px] text-neutral-500">WAIST</th>
                                <th className="py-2 px-2 font-bold tracking-wider text-[9px] text-neutral-500">INSEAM</th>
                                <th className="py-2 px-2 font-bold tracking-wider text-[9px] text-neutral-500">RISE</th>
                                <th className="py-2 px-2 font-bold tracking-wider text-[9px] text-neutral-500">THIGH</th>
                                <th className="py-2 px-2 font-bold tracking-wider text-[9px] text-neutral-500">LEG OPENING</th>
                                <th className="py-2 px-2 font-bold tracking-wider text-[9px] text-neutral-500 text-right">ACTION</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeFitSizing.map((row: any) => {
                                const toUnit = (val: number) =>
                                  sizeGuideUnit === "cm" ? (val * 2.54).toFixed(1) : `${val}"`;
                                const isCurrent = selectedSize === row.size;
                                return (
                                  <tr
                                    key={row.size}
                                    className={`border-b border-[#E8E3DA]/60 transition-colors ${
                                      isCurrent ? "bg-[#D4B16A]/15 font-bold text-black" : "hover:bg-stone-50"
                                    }`}
                                  >
                                    <td className="py-2 px-2.5 font-extrabold text-black">
                                      <span className="flex items-center gap-1.5">
                                        <span>{row.size}</span>
                                        {isCurrent && (
                                          <span className="text-[8px] bg-stone-900 text-white px-1.5 py-0.5 rounded font-bold">
                                            CURRENT
                                          </span>
                                        )}
                                      </span>
                                    </td>
                                    <td className="py-2 px-2 font-mono">{toUnit(row.waist)}</td>
                                    <td className="py-2 px-2 font-mono">{toUnit(row.inseam)}</td>
                                    <td className="py-2 px-2 font-mono">{toUnit(row.frontRise)}</td>
                                    <td className="py-2 px-2 font-mono">{toUnit(row.thigh)}</td>
                                    <td className="py-2 px-2 font-mono">{toUnit(row.legOpening)}</td>
                                    <td className="py-2 px-2 text-right">
                                      <button
                                        onClick={() => {
                                          setSelectedSize(row.size);
                                          setSizeChartOpen(false);
                                        }}
                                        className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                          isCurrent
                                            ? "bg-stone-900 text-white"
                                            : "bg-stone-100 hover:bg-stone-200 text-stone-800"
                                        }`}
                                      >
                                        {isCurrent ? "Selected" : "Select"}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-[11px] text-stone-500">
                          <span>Need sizing help? Contact our partner atelier.</span>
                          <button
                            onClick={() => setSizeChartOpen(false)}
                            className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-[10.5px] font-black tracking-wider uppercase rounded-xl cursor-pointer transition-all"
                          >
                            Done & Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </main>
  );
}
