"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import Image from "next/image";
import axios from "axios";
import dynamic from "next/dynamic";
import ShopByFit from "../../../component/home/ShopByFit";
import Footer from "../../../component/Footer";
import { useCart } from "../../../context/CartContext";
import { Truck, Check, ShoppingBag, ZoomIn, X, Move, ArrowUpRight, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateWashSelection3D } from "../../../component/store-template/TemplateWashSelection3D";
import TemplateBrandCustomizerBar from "../../../component/store-template/TemplateBrandCustomizerBar";
import TemplateSimulationModal from "../../../component/store-template/TemplateSimulationModal";
import { RbwJourneyShell, RbwJourneyBar } from "../../../component/rbw/RbwJourneyShell";
import { RbwSizeChartModal } from "../../../component/rbw/RbwSizeChartModal";
import "@/component/rbw/3d/rbw-showroom.css";
import "@/component/rbw/rbw-journey.css";

interface FlyingItemData {
  id: number;
  imageUrl: string;
  quantity: number;
  startCenterX: number;
  startCenterY: number;
  targetX: number;
  targetY: number;
}

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

const getProductHandleForWashAndFit = (wash: "raw" | "black" | "white" | "vintage" | string, fit: string, category: string = "jeans") => {
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

const getInitialWashVal = (): "raw" | "black" | "white" | "vintage" | null => {
  if (typeof window !== "undefined") {
    const rawWash = new URLSearchParams(window.location.search).get("wash")?.toLowerCase();
    if (rawWash && ["raw", "black", "white", "vintage"].includes(rawWash)) {
      return rawWash as "raw" | "black" | "white" | "vintage";
    }
  }
  return null;
};

const getInitialFitVal = (): string | null => {
  if (typeof window !== "undefined") {
    const rawFit = new URLSearchParams(window.location.search).get("fit")?.toLowerCase();
    if (rawFit && ["ankle", "slim", "comfort", "straight", "baggy", "bootcut"].includes(rawFit)) {
      return rawFit;
    }
  }
  return null;
};

function StoreTemplateContent() {
  const searchParams = useSearchParams();
  const washParam = searchParams?.get("wash")?.toLowerCase();
  const fitParam = searchParams?.get("fit")?.toLowerCase();

  // Brand Customizer live demo state
  const [brandName, setBrandName] = useState<string>("YOUR BRAND");
  const [accentColor, setAccentColor] = useState<string>("#B9965A");
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [simActionType, setSimActionType] = useState<"cart" | "buy_now" | "info">("info");

  // Showroom navigation state
  const [activeWash, setActiveWash] = useState<"raw" | "black" | "white" | "vintage" | null>(getInitialWashVal);
  const [selectedWash, setSelectedWash] = useState<"raw" | "black" | "white" | "vintage" | null>(getInitialWashVal);
  const [selectedCategory, setSelectedCategory] = useState<string>("jeans");
  const [selectedFit, setSelectedFit] = useState<string | null>(getInitialFitVal);
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

  // The "room" remembers the last wash/fit so lighting and ghost lettering never
  // blink out while a drawer is sliding away.
  const [roomWash, setRoomWash] = useState<"raw" | "black" | "white" | "vintage">(
    () => getInitialWashVal() || "raw"
  );
  const [roomFit, setRoomFit] = useState<string>(() => getInitialFitVal() || "");
  if (selectedWash && selectedWash !== roomWash) setRoomWash(selectedWash);
  if (selectedFit && selectedFit !== roomFit) setRoomFit(selectedFit);

  const [fitEntries, setFitEntries] = useState<number>(() => (getInitialWashVal() ? 1 : 0));
  const [hadWash, setHadWash] = useState<boolean>(() => !!getInitialWashVal());
  if (!!selectedWash !== hadWash) {
    setHadWash(!!selectedWash);
    if (selectedWash) setFitEntries((n) => n + 1);
  }

  const [rbwTheme, setRbwTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rbw_theme") as "dark" | "light" | null;
      if (saved === "dark" || saved === "light") {
        setRbwTheme(saved);
      }
      const handleThemeExternal = (e: any) => {
        if (e.detail === "dark" || e.detail === "light") {
          setRbwTheme(e.detail);
        }
      };
      window.addEventListener("RBW_THEME_SET", handleThemeExternal);
      window.addEventListener("RBW_THEME_CHANGED", handleThemeExternal);
      return () => {
        window.removeEventListener("RBW_THEME_SET", handleThemeExternal);
        window.removeEventListener("RBW_THEME_CHANGED", handleThemeExternal);
      };
    }
  }, []);

  const handleToggleTheme = () => {
    setRbwTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem("rbw_theme", next);
        window.dispatchEvent(new CustomEvent("RBW_THEME_CHANGED", { detail: next }));
      }
      return next;
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomScale((prev) => Math.max(prev - 0.5, 1));
  };

  const [sizeChartOpen, setSizeChartOpen] = useState<boolean>(false);
  const [sizeGuideUnit, setSizeGuideUnit] = useState<"in" | "cm">("in");
  const [pincode, setPincode] = useState<string>("");
  const [pincodeStatus, setPincodeStatus] = useState<{ checked: boolean; valid: boolean; message: string; eta: string } | null>(null);

  const handleCheckPincode = (code: string) => {
    const clean = code.trim();
    if (clean.length === 6 && /^\d{6}$/.test(clean)) {
      const isMetro = /^(11|40|56|60|70|50)/.test(clean);
      setPincodeStatus({
        checked: true,
        valid: true,
        message: isMetro ? "Express Metro Delivery Active" : "Standard Surface Delivery Active",
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

  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const [isInlineZoomActive, setIsInlineZoomActive] = useState<boolean>(false);
  const [inlineZoomScale, setInlineZoomScale] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const fitsDrawerRef = useRef<HTMLDivElement>(null);
  const detailDrawerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLElement>(null);

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
    if (inlineZoomScale <= 1) {
      setPanPosition({ x: 0, y: 0 });
    } else if (zoomContainerRef.current) {
      const rect = zoomContainerRef.current.getBoundingClientRect();
      const maxPanX = (rect.width * (inlineZoomScale - 1)) / 2;
      const maxPanY = (rect.height * (inlineZoomScale - 1)) / 2;
      setPanPosition((prev) => ({
        x: Math.max(-maxPanX, Math.min(maxPanX, prev.x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, prev.y)),
      }));
    }
  }, [inlineZoomScale]);

  useEffect(() => {
    setIsInlineZoomActive(false);
    setInlineZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  }, [activeImageIndex]);

  const [shopifyProducts, setShopifyProducts] = useState<any[]>([]);
  const [shopifyLoading, setShopifyLoading] = useState<boolean>(true);

  const buyButtonRef = useRef<HTMLDivElement>(null);
  const { addToCart, updateBuyerIdentity } = useCart();

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

  useEffect(() => {
    const VALID_WASHES = ["raw", "black", "white", "vintage"];
    const VALID_FITS = ["ankle", "slim", "comfort", "straight", "baggy", "bootcut"];

    const rawWash = washParam || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("wash")?.toLowerCase() : null);
    const rawFit = fitParam || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("fit")?.toLowerCase() : null);

    if (rawWash && VALID_WASHES.includes(rawWash)) {
      const safeWash = rawWash as "raw" | "black" | "white" | "vintage";
      setSelectedWash(safeWash);
      setActiveWash(safeWash);
      setRoomWash(safeWash);
      setSelectedCategory("jeans");
      if (rawFit && VALID_FITS.includes(rawFit)) {
        setSelectedFit(rawFit);
        setRoomFit(rawFit);
      } else {
        setSelectedFit(null);
      }
    } else {
      setSelectedWash(null);
      setSelectedFit(null);
    }
  }, [washParam, fitParam]);

  const handleWashClick = (wash: "raw" | "black" | "white" | "vintage" | string, category?: string, defaultFit?: string) => {
    const safeWash = (["raw", "black", "white", "vintage"].includes(wash) ? wash : "raw") as "raw" | "black" | "white" | "vintage";
    setSelectedWash(safeWash);
    setActiveWash(safeWash);
    setSelectedFit(null);
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("jeans");
    }
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("wash", safeWash);
        url.searchParams.delete("fit");
        window.history.pushState({ wash: safeWash }, "", url.toString());
      } catch (e) {}
    }
    
    if (category && category !== "jeans" && defaultFit) {
      setTimeout(() => {
        handleFitClick(defaultFit);
      }, 100);
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
    if (prod && prod.options) {
      const sizeOption = prod.options.find((opt: any) => opt.name.toLowerCase() === "size");
      if (sizeOption && Array.isArray(sizeOption.values) && sizeOption.values.length > 0) {
        if (!sizeOption.values.includes(selectedSize)) {
          setSelectedSize(sizeOption.values[0]);
        }
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
      window.dispatchEvent(new CustomEvent("RBW_WASH_STATE_CHANGED", { detail: { hasWash: false } }));
    }
  };

  const resetToStep1 = useCallback(() => {
    setSelectedWash(null);
    setSelectedFit(null);
    setActiveWash(null);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("wash");
        url.searchParams.delete("fit");
        window.history.pushState({}, "", url.pathname);
      } catch (e) {}
      window.dispatchEvent(new CustomEvent("RBW_WASH_STATE_CHANGED", { detail: { hasWash: false } }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (mainContainerRef.current) mainContainerRef.current.scrollTop = 0;
    if (fitsDrawerRef.current) fitsDrawerRef.current.scrollTop = 0;
    if (detailDrawerRef.current) detailDrawerRef.current.scrollTop = 0;
  }, []);

  useEffect(() => {
    const handleReset = () => {
      resetToStep1();
    };
    window.addEventListener("RESET_RBW_STOREFRONT", handleReset);
    return () => {
      window.removeEventListener("RESET_RBW_STOREFRONT", handleReset);
    };
  }, [resetToStep1]);

  const handleBackToFits = () => {
    setSelectedFit(null);
    setSizeChartOpen(false);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("fit");
        if (selectedWash) {
          url.searchParams.set("wash", selectedWash);
        }
        window.history.pushState({ wash: selectedWash, fit: null }, "", url.toString());
      } catch (e) {}
    }
    if (detailDrawerRef.current) detailDrawerRef.current.scrollTop = 0;
  };

  const handleShopAgain = () => {
    resetToStep1();
  };

  const getSelectedVariantId = (prod: any, size: string) => {
    if (!prod || !prod.variants?.edges) return null;
    const matchingVariant = prod.variants.edges.find(({ node }: any) => {
      const sizeOpt = node.selectedOptions?.find((opt: any) => opt.name.toLowerCase() === "size");
      return sizeOpt?.value === size || node.title === size;
    });
    return matchingVariant?.node?.id || prod.variants.edges[0]?.node?.id || null;
  };

  const handleAddToCartClick = async (prod: any, e?: React.MouseEvent) => {
    if (!prod) return;
    const variantId = getSelectedVariantId(prod, selectedSize);
    if (!variantId) return;

    const priceVal = parseFloat(prod.priceRange?.minVariantPrice?.amount || "1850");
    const imageUrl = prod.images?.edges?.[0]?.node?.url || "/raw_jeans.png";

    try {
      const sourceEl = (e?.currentTarget as HTMLElement | null)?.closest(".flex-col")?.querySelector("img") || (e?.currentTarget as HTMLElement | null);
      const cartBtn = document.getElementById("header-cart-button") || document.querySelector('[aria-label="Shopping Cart"]');
      const bagIcon = cartBtn?.querySelector("svg") || cartBtn;

      let sRect = sourceEl ? sourceEl.getBoundingClientRect() : null;
      if (!sRect || sRect.width === 0 || sRect.height === 0 || sRect.bottom < 0 || sRect.top > window.innerHeight) {
        const btnRect = (e?.currentTarget as HTMLElement | null)?.getBoundingClientRect();
        if (btnRect && btnRect.width > 0) {
          sRect = btnRect;
        } else {
          sRect = {
            left: window.innerWidth * 0.25,
            top: window.innerHeight * 0.35,
            width: 180,
            height: 220,
            bottom: window.innerHeight * 0.55,
            right: window.innerWidth * 0.25 + 180
          } as DOMRect;
        }
      }

      const bRect = bagIcon ? bagIcon.getBoundingClientRect() : null;
      const targetX = (bRect && bRect.width > 0 && bRect.left > 0) ? bRect.left + bRect.width / 2 : window.innerWidth - 65;
      const targetY = (bRect && bRect.height > 0 && bRect.top >= 0) ? bRect.top + bRect.height / 2 : 36;

      setFlyingItem({
        id: Date.now(),
        imageUrl,
        quantity,
        startCenterX: sRect.left + sRect.width / 2,
        startCenterY: sRect.top + sRect.height / 2,
        targetX,
        targetY,
      });

      setIsAddingCart(true);
      await addToCart(variantId, quantity, {
        title: `${brandName} ${prod.title.replace(/Denims/gi, 'Denim')}`,
        price: priceVal,
        image: imageUrl,
      }, false);

      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2400);
    } catch (err) {
      console.error("Cart error:", err);
    } finally {
      setIsAddingCart(false);
    }
  };

  const handleBuyNowClick = async (prod: any) => {
    if (!prod) return;
    const variantId = getSelectedVariantId(prod, selectedSize);
    if (!variantId) return;

    const priceVal = parseFloat(prod.priceRange?.minVariantPrice?.amount || "1850");
    const imageUrl = prod.images?.edges?.[0]?.node?.url || "/raw_jeans.png";

    setIsBuyingNow(true);
    try {
      const freshCart = await addToCart(variantId, quantity, {
        title: `${brandName} ${prod.title.replace(/Denims/gi, 'Denim')}`,
        price: priceVal,
        image: imageUrl,
      }, false);

      const variantCode = variantId.includes("/") ? variantId.split("/").pop() : variantId;
      const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "onlydenims-dev.myshopify.com";
      let checkoutUrl = freshCart?.checkoutUrl
        ? freshCart.checkoutUrl
        : `https://${shopifyDomain}/cart/${variantCode}:${quantity}`;

      try {
        const savedCust = localStorage.getItem("shopifyCustomer");
        let cust = undefined;
        if (savedCust) {
          try {
            cust = JSON.parse(savedCust);
          } catch (e) { }
        }
        const updatedUrl = await updateBuyerIdentity(cust);
        if (updatedUrl) {
          checkoutUrl = updatedUrl;
        }
      } catch (err) {
        console.error("Pre-checkout identity update error on Buy Now:", err);
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Buy now failed:", err);
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <main
      ref={mainContainerRef}
      data-theme={rbwTheme}
      className={`w-full h-screen ${rbwTheme === "dark" ? "bg-[#07080a]" : "bg-[var(--background)]"} overflow-hidden relative pt-[75px] md:pt-[85px] xl:pt-[103px] box-border`}
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
        {/* Slide 1: Wash Selection (3D Preview) */}
        <div className={`absolute left-0 w-full h-[100dvh] top-[-75px] md:top-[-85px] xl:top-[-103px] shrink-0 overflow-hidden transition-all duration-500 ${selectedWash ? "scale-[0.98] brightness-75 filter blur-[0.5px]" : "scale-100 brightness-100"}`}>
          <TemplateWashSelection3D
            brandName={brandName}
            accentColor={accentColor}
            onWashSelect={handleWashClick}
            theme={rbwTheme}
            onToggleTheme={handleToggleTheme}
          />
        </div>

        {/* Slide 2: FIT — showroom journey room inheriting backdrop and controls */}
        <RbwJourneyShell
          open={!!selectedWash}
          layerClass="z-50"
          washKey={roomWash}
          ghostText={roomWash.toUpperCase()}
          receded={!!selectedFit}
          scrollRef={fitsDrawerRef}
          theme={rbwTheme}
        >
          <div className="flex-1 flex flex-col justify-start pt-1 sm:pt-3 pb-4">
            <ShopByFit
              key={fitEntries}
              variant="showroom"
              selectedWash={roomWash}
              selectedFit={roomFit}
              isInsideViewport={false}
              onFitClick={handleFitClick}
            />
            <Footer />
          </div>
        </RbwJourneyShell>

        {/* Slide 3: PRODUCT — deep showroom atelier room */}
        <RbwJourneyShell
          open={!!(selectedFit && selectedWash)}
          layerClass="z-55"
          washKey={roomWash}
          ghostText={(selectedCategory === "jeans" && roomFit ? roomFit : roomWash).toUpperCase()}
          ghost="soft"
          scrollRef={detailDrawerRef}
          theme={rbwTheme}
          bar={
            <RbwJourneyBar
              backLabel={selectedCategory === "jeans" ? "Fits" : "Back"}
              onBack={selectedCategory === "jeans" ? handleBackToFits : handleShopAgain}
            />
          }
        >
          {selectedFit && selectedWash && (() => {
            const productHandle = getProductHandleForWashAndFit(selectedWash, selectedFit, selectedCategory);
            const product = shopifyProducts.find((p) => p.handle === productHandle);
            const reveal = (ms: number): React.CSSProperties => ({ ["--rbw-delay" as any]: `${ms}ms` }) as React.CSSProperties;

            if (shopifyLoading) {
              return (
                <div className="py-24 text-center">
                  <p className="rbw-eyebrow animate-pulse" style={{ color: "var(--rbw-ink-faint)" }}>
                    Loading
                  </p>
                </div>
              );
            }

            if (!product) {
              return (
                <div className="py-20 px-6 flex flex-col items-center text-center rbw-fade">
                  <p className="rbw-eyebrow">Unavailable</p>
                  <p className="rbw-descriptor mt-3 text-[18px] max-w-[30ch]">
                    This model couldn&rsquo;t be found or is currently unavailable.
                  </p>
                  <span className="rbw-j-rule rbw-j-rule--gold mt-6" />
                  <button type="button" onClick={handleShopAgain} className="rbw-cta mt-8">
                    <span>Shop again</span>
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              );
            }

            const price = product.priceRange?.minVariantPrice;
            const formattedPrice = price
              ? `${price.currencyCode === 'INR' ? '₹ ' : price.currencyCode + ' '}${parseFloat(price.amount).toLocaleString('en-IN')}`
              : "₹ 1,850";

            const imagesObj = product.images as any;
            const imageUrls: string[] = [];
            if (imagesObj?.edges && Array.isArray(imagesObj.edges)) {
              imagesObj.edges.forEach((edge: any) => {
                if (edge?.node?.url) imageUrls.push(edge.node.url);
              });
            } else if (Array.isArray(imagesObj)) {
              imagesObj.forEach((img: any) => {
                if (typeof img === 'string') imageUrls.push(img);
                else if (img?.url) imageUrls.push(img.url);
              });
            }
            if (imageUrls.length === 0) imageUrls.push("/raw_jeans.png");

            const activeStep3Img = imageUrls[activeImageIndex] || imageUrls[0];

            const sizeOpt = product.options?.find((opt: any) => opt.name.toLowerCase() === "size");
            const sizes = sizeOpt?.values || ["28", "30", "32", "34", "36", "38", "40", "42"];
            const activeFitSizing = sizingData[selectedFit.toLowerCase()] || [];

            const selectedVariantNode = product.variants?.edges?.find((edge: any) => {
              return edge?.node?.selectedOptions?.some((opt: any) => opt.value === selectedSize);
            })?.node;

            const isVariantInStock = selectedVariantNode
              ? selectedVariantNode.availableForSale !== false
              : (product.availableForSale !== false);

            const fabricSpec = (() => {
              if (selectedCategory === "jackets") return "14.5oz Japanese Selvedge Trucker Twill";
              if (selectedCategory === "shorts") return "12.5oz Summer Weight Selvedge Denim";
              if (selectedWash === "raw") return "14.5oz Pure Raw Indigo Selvedge Denim";
              if (selectedWash === "black") return "13.5oz Deep Sulphur Black Overdyed Denim";
              if (selectedWash === "white" || selectedWash === "vintage") return "13.0oz Natural Ecru Bleached Bull Denim";
              return "14.5oz Pure Selvedge Denim";
            })();

            const silhouetteSpec = (() => {
              if (selectedCategory === "jackets") return "Heritage Type II Trucker Silhouette";
              if (selectedCategory === "shorts") return "Relaxed Cut-Off Carpenter Silhouette";
              return `${selectedFit ? selectedFit.charAt(0).toUpperCase() + selectedFit.slice(1) : "Straight"} Fit • 5-Pocket`;
            })();

            const careSpec = (() => {
              if (selectedWash === "raw") return "Wear 6 months before first cold wash; line dry inside out";
              if (selectedWash === "black") return "Cold wash inside out with dark colours; line dry";
              if (selectedWash === "white" || selectedWash === "vintage") return "Gentle cold wash with like light tones; do not bleach";
              return "Cold wash inside out, line dry in shade";
            })();

            return (
              <>
                <div className="max-w-[1240px] mx-auto w-full grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-start px-6 sm:px-10 md:px-14 pt-6 sm:pt-8 md:pt-10 pb-8">
                  {/* Left: Plate with Image Gallery */}
                  <div className="rbw-in w-full md:sticky md:top-6 flex flex-col items-center md:items-end" style={reveal(80)}>
                    <div className="w-full flex items-start justify-center md:justify-end gap-3.5">
                      {imageUrls.length > 1 && (
                        <div className="rbw-j-thumbs">
                          {imageUrls.slice(0, 4).map((url: string, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveImageIndex(idx)}
                              aria-label={`View image ${idx + 1}`}
                              data-on={activeImageIndex === idx}
                              className="rbw-j-thumb"
                            >
                              <img src={url} alt="" />
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
                        className="rbw-j-frame"
                      >
                        <img
                          key={activeStep3Img}
                          id="template-main-image"
                          src={activeStep3Img}
                          alt={product.title}
                          style={{
                            transform: isInlineZoomActive
                              ? `translate(${panPosition.x}px, ${panPosition.y}px) scale(${inlineZoomScale})`
                              : "none",
                            transformOrigin: "center center",
                            transition: isDragging ? "none" : "transform 250ms cubic-bezier(0.25, 1, 0.5, 1)",
                            cursor: isInlineZoomActive ? (isDragging ? "grabbing" : "grab") : "default"
                          }}
                          className="rbw-fade w-full h-full object-cover object-center pointer-events-none"
                        />

                        {isInlineZoomActive && inlineZoomScale > 1 && (
                          <div className="rbw-j-chip rbw-fade absolute top-3 right-3 z-30 pointer-events-none">
                            <Move className="w-3 h-3" strokeWidth={1.5} />
                            <span>Drag to move</span>
                          </div>
                        )}

                        {!isInlineZoomActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsInlineZoomActive(true);
                              setInlineZoomScale(1.5);
                              setPanPosition({ x: 0, y: 0 });
                            }}
                            title="Zoom image"
                            aria-label="Zoom image"
                            className="rbw-glass-btn absolute bottom-3 left-3 z-20 w-10 h-10 rounded-full !text-[color:var(--rbw-ink)]"
                          >
                            <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        ) : (
                          <div className="rbw-j-chip rbw-fade absolute bottom-3 left-3 z-30 !px-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const newScale = Math.max(1, inlineZoomScale - 0.5);
                                setInlineZoomScale(newScale);
                                if (newScale === 1) setPanPosition({ x: 0, y: 0 });
                              }}
                              disabled={inlineZoomScale <= 1}
                              title="Zoom out"
                              aria-label="Zoom out"
                            >
                              &minus;
                            </button>
                            <span className="min-w-[34px] text-center tabular-nums">{Math.round(inlineZoomScale * 100)}%</span>
                            <button
                              type="button"
                              onClick={() => setInlineZoomScale((prev) => Math.min(3.5, prev + 0.5))}
                              disabled={inlineZoomScale >= 3.5}
                              title="Zoom in"
                              aria-label="Zoom in"
                            >
                              +
                            </button>
                            <span className="w-px h-3.5 bg-[color:var(--rbw-line)]" aria-hidden="true" />
                            <button
                              type="button"
                              onClick={() => {
                                setIsInlineZoomActive(false);
                                setInlineZoomScale(1);
                                setPanPosition({ x: 0, y: 0 });
                              }}
                              title="Close zoom"
                              aria-label="Close zoom"
                            >
                              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {imageUrls.length > 1 && (
                      <p className="rbw-j-counter mt-4 text-center w-full">
                        <b>{String(activeImageIndex + 1).padStart(2, "0")}</b> / {String(Math.min(imageUrls.length, 4)).padStart(2, "0")}
                      </p>
                    )}
                  </div>

                  {/* Right: Garment Information & Atelier Actions */}
                  <div className="w-full max-w-[540px] flex flex-col text-left justify-start">
                    <div className="flex items-center gap-2 flex-wrap rbw-in" style={reveal(100)}>
                      <span
                        className="text-[10.5px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase"
                        style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                      >
                        {brandName}
                      </span>
                      <p className="rbw-eyebrow">
                        {selectedCategory === "jeans" ? `${selectedWash} · ${selectedFit}` : `${selectedWash} denim`}
                      </p>
                    </div>

                    <h1 className="rbw-j-title rbw-in mt-3" style={reveal(200)}>
                      {brandName} {product.title.replace(/Denims/gi, 'Denim')}
                    </h1>

                    <div className="rbw-in mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2" style={reveal(280)}>
                      <span className="rbw-j-price">{formattedPrice}</span>
                      <span className="rbw-j-note">Incl. taxes</span>
                    </div>

                    <div className="rbw-in mt-3" style={reveal(340)}>
                      <span className="rbw-j-status" data-low={!isVariantInStock}>
                        {isVariantInStock ? "In stock · ships in 24h" : "Low stock · dispatch in 48h"}
                      </span>
                    </div>

                    <span className="rbw-j-rule rbw-in my-6" style={reveal(380)} />

                    {/* Size Selector */}
                    <div className="rbw-in" style={reveal(420)}>
                      <div className="flex justify-between items-center mb-3 gap-3">
                        <span className="rbw-j-label">Waist size · inches</span>
                        <button type="button" onClick={() => setSizeChartOpen(true)} className="rbw-j-link">
                          <TapeIcon className="w-3.5 h-3.5" />
                          <span>Size guide</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-8 gap-2">
                        {sizes.map((sz: string) => (
                          <button
                            key={sz}
                            type="button"
                            aria-pressed={selectedSize === sz}
                            onClick={() => setSelectedSize(sz)}
                            className="rbw-j-size"
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="rbw-in mt-6 flex items-center justify-between" style={reveal(480)}>
                      <span className="rbw-j-label">Quantity</span>
                      <div className="rbw-j-stepper">
                        <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                          &minus;
                        </button>
                        <span aria-live="polite">{quantity}</span>
                        <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}>
                          +
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div ref={buyButtonRef} className="rbw-in w-full mt-6 flex flex-col gap-3" style={reveal(540)}>
                      <button
                        type="button"
                        disabled={isBuyingNow || !isVariantInStock}
                        onClick={() => handleBuyNowClick(product)}
                        className="rbw-cta rbw-j-cta-block"
                      >
                        {isBuyingNow ? (
                          <>
                            <span className="rbw-j-ring" />
                            <span>Preparing checkout</span>
                          </>
                        ) : !isVariantInStock ? (
                          <span>Currently unavailable</span>
                        ) : (
                          <>
                            <span>Buy now</span>
                            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </>
                        )}
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          disabled={isAddingCart || !isVariantInStock}
                          onClick={(e) => handleAddToCartClick(product, e)}
                          data-state={justAdded ? "added" : undefined}
                          className="rbw-j-btn"
                        >
                          {justAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" strokeWidth={1.75} />
                              <span>Added</span>
                            </>
                          ) : isAddingCart ? (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5 animate-bounce" strokeWidth={1.5} />
                              <span>Adding</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                              <span>Add to cart</span>
                            </>
                          )}
                        </button>

                        <button type="button" onClick={handleBackToFits} className="rbw-j-btn">
                          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>Change fit</span>
                        </button>
                      </div>
                    </div>

                    {/* Garment specs */}
                    <dl className="rbw-j-specs rbw-in mt-9" style={reveal(600)}>
                      <div className="rbw-j-spec">
                        <dt>Fabric</dt>
                        <dd>{fabricSpec}</dd>
                      </div>
                      <div className="rbw-j-spec">
                        <dt>Silhouette</dt>
                        <dd>{silhouetteSpec}</dd>
                      </div>
                      <div className="rbw-j-spec">
                        <dt>Stretch</dt>
                        <dd>100% Rigid Shuttle-Loom Cotton (0% Stretch)</dd>
                      </div>
                      <div className="rbw-j-spec">
                        <dt>Care</dt>
                        <dd>{careSpec}</dd>
                      </div>
                    </dl>

                    {/* Delivery */}
                    <div className="rbw-j-delivery rbw-in" style={reveal(660)}>
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                        <span className="rbw-j-label inline-flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-[color:var(--rbw-gold-bright)]" strokeWidth={1.5} />
                          Delivery &amp; dispatch
                        </span>
                        <span className="rbw-j-note" style={{ color: "var(--rbw-gold)" }}>
                          Free above ₹1,500
                        </span>
                      </div>

                      <div className="rbw-j-pin">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter 6-digit PIN code"
                          aria-label="PIN code"
                          value={pincode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setPincode(val);
                            if (val.length === 6) {
                              handleCheckPincode(val);
                            } else if (pincodeStatus) {
                              setPincodeStatus(null);
                            }
                          }}
                        />
                        <button type="button" onClick={() => handleCheckPincode(pincode)} className="rbw-j-link">
                          Check
                        </button>
                        {pincodeStatus && pincodeStatus.valid && (
                          <span className="rbw-j-status">{pincodeStatus.eta}</span>
                        )}
                      </div>

                      {pincodeStatus && !pincodeStatus.valid && (
                        <p className="mt-2.5 text-[11px] tracking-[0.04em]" style={{ color: "#9a4a3c" }}>
                          {pincodeStatus.message}
                        </p>
                      )}

                      {!pincodeStatus && (
                        <p className="rbw-j-note mt-3.5 flex items-center justify-between gap-3 flex-wrap">
                          <span>Standard delivery: 3–5 business days</span>
                          <span style={{ color: "var(--rbw-ink-dim)" }}>Priority 24h dispatch</span>
                        </p>
                      )}
                    </div>

                    <div className="rbw-j-trust rbw-in mt-9 mb-16" style={reveal(720)}>
                      <span>7-day easy returns</span>
                      <span>100% authentic selvedge</span>
                      <span>Secure checkout</span>
                    </div>
                  </div>
                </div>

                {sizeChartOpen && (
                  <RbwSizeChartModal
                    kicker={selectedCategory === "jeans" ? `${selectedFit} fit` : "Denim"}
                    title="Size guide & chart"
                    subtitle="Accurate garment specs · true to size"
                    rows={activeFitSizing}
                    unit={sizeGuideUnit}
                    onUnitChange={setSizeGuideUnit}
                    onClose={() => setSizeChartOpen(false)}
                    currentSize={selectedSize}
                    onSelectSize={(sz) => {
                      setSelectedSize(sz);
                      setSizeChartOpen(false);
                    }}
                    showHowTo
                    note="Need sizing help? Contact our fitting atelier."
                  />
                )}
              </>
            );
          })()}
        </RbwJourneyShell>
      </div>

      {/* Fullscreen Zoom Lightbox Modal */}
      {zoomedImage && (
        <div
          onClick={() => {
            setZoomedImage(null);
            setZoomScale(1.5);
          }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn cursor-default overflow-hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/80 border border-white/20 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md"
          >
            <button
              onClick={handleZoomOut}
              disabled={zoomScale <= 1}
              title="Zoom Out (-)"
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg text-white transition-all cursor-pointer ${zoomScale <= 1 ? "opacity-35 cursor-not-allowed" : "hover:bg-white/20 active:scale-95"}`}
            >
              −
            </button>
            <span className="text-xs font-mono font-bold text-stone-200 min-w-[50px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomScale >= 4}
              title="Zoom In (+)"
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg text-white transition-all cursor-pointer ${zoomScale >= 4 ? "opacity-35 cursor-not-allowed" : "hover:bg-white/20 active:scale-95"}`}
            >
              +
            </button>
            <div className="w-[1px] h-4 bg-white/20 my-auto mx-1" />
            <button
              onClick={() => {
                setZoomedImage(null);
                setZoomScale(1.5);
              }}
              title="Close Fullscreen"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[90vw] max-h-[85vh] overflow-hidden flex items-center justify-center"
          >
            <img
              src={zoomedImage}
              alt="Zoomed Detail View"
              style={{
                transform: `scale(${zoomScale})`,
                transition: "transform 200ms ease-out",
                cursor: zoomScale > 1 ? "grab" : "default"
              }}
              className="max-w-full max-h-[85vh] object-contain select-none"
            />
          </div>
        </div>
      )}

      {/* Fly-to-cart animation portal */}
      {flyingItem && mounted && createPortal(
        <motion.div
          key={flyingItem.id}
          initial={{
            left: flyingItem.startCenterX - 45,
            top: flyingItem.startCenterY - 45,
            scale: 1,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            left: flyingItem.targetX - 20,
            top: flyingItem.targetY - 20,
            scale: 0.18,
            opacity: 0.1,
            rotate: 360,
          }}
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          onAnimationComplete={() => setFlyingItem(null)}
          className="fixed z-9999 pointer-events-none rounded-xl overflow-hidden shadow-2xl border border-white/20"
          style={{ width: 90, height: 90 }}
        >
          <img
            src={flyingItem.imageUrl}
            alt="Flying product"
            className="w-full h-full object-cover"
          />
        </motion.div>,
        document.body
      )}
    </main>
  );
}

export default function StoreTemplatePage() {
  return (
    <Suspense fallback={null}>
      <StoreTemplateContent />
    </Suspense>
  );
}
