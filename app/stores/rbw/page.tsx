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
import Footer from "../../../component/Footer";
import { useCart } from "../../../context/CartContext";
import { ShieldCheck, Truck, Award, Check, Droplet, ShoppingBag, Maximize2, ZoomIn, X, Move, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RbwWashSelection3D } from "../../../component/rbw/3d/RbwWashSelection3D";

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


const Interactive3DViewer = dynamic(
  () => import("../../../component/home/Interactive3DViewer"),
  { ssr: false }
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

export default function RBWStorefrontPage() {
  const [activeWash, setActiveWash] = useState<"raw" | "black" | "white" | "vintage" | null>(null);
  const [selectedWash, setSelectedWash] = useState<"raw" | "black" | "white" | "vintage" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("jeans");
  const [mobileWashIndex, setMobileWashIndex] = useState<number>(0);
  const [prevMobileWashIndex, setPrevMobileWashIndex] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleCarouselTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleCarouselTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (diffX > 30) {
      setMobileWashIndex((prev) => (prev + 1) % 3);
    } else if (diffX < -30) {
      setMobileWashIndex((prev) => (prev - 1 + 3) % 3);
    }
    setTouchStartX(null);
  };
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

  const handleResetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomScale(1);
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
  const [actionLoading, setActionLoading] = useState<boolean>(false);
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

  // Touch / Drag & Wheel Gesture state for Mobile Wash Carousel
  const isDraggingWash = useRef(false);
  const dragWashStartX = useRef(0);
  const dragWashCurrentX = useRef(0);
  const hasDraggedWash = useRef(false);
  const wheelWashCooldown = useRef(false);
  const isHoveringWash = useRef(false);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-slide wash cards every 4s, pause when hovering/dragging/wash selected
  useEffect(() => {
    const startAutoSlide = () => {
      autoSlideRef.current = setInterval(() => {
        if (!isHoveringWash.current && !isDraggingWash.current) {
          setMobileWashIndex((prev) => {
            const next = prev === 2 ? 0 : prev + 1;
            setPrevMobileWashIndex(prev);
            return next;
          });
        }
      }, 4000);
    };
    if (!selectedWash) {
      startAutoSlide();
    }
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [selectedWash]);

  const updateMobileWashIndex = (newIdx: number) => {
    setPrevMobileWashIndex(mobileWashIndex);
    setMobileWashIndex(newIdx);
  };

  const slideWash = (direction: "left" | "right") => {
    setPrevMobileWashIndex(mobileWashIndex);
    if (direction === "left") {
      setMobileWashIndex((prev) => (prev === 0 ? 2 : prev - 1));
    } else {
      setMobileWashIndex((prev) => (prev === 2 ? 0 : prev + 1));
    }
  };

  const handleWashDragStart = (clientX: number) => {
    isDraggingWash.current = true;
    dragWashStartX.current = clientX;
    dragWashCurrentX.current = clientX;
    hasDraggedWash.current = false;
  };

  const handleWashDragMove = (clientX: number) => {
    if (!isDraggingWash.current) return;
    dragWashCurrentX.current = clientX;
    const diff = Math.abs(dragWashCurrentX.current - dragWashStartX.current);
    if (diff > 10) {
      hasDraggedWash.current = true;
    }
  };

  const handleWashDragEnd = () => {
    if (!isDraggingWash.current) return;
    isDraggingWash.current = false;
    const diff = dragWashStartX.current - dragWashCurrentX.current;
    const threshold = 35;
    if (diff > threshold) {
      slideWash("right");
    } else if (diff < -threshold) {
      slideWash("left");
    }
    setTimeout(() => {
      hasDraggedWash.current = false;
    }, 100);
  };

  const handleWashWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 18 || wheelWashCooldown.current) return;

    if (delta > 0) {
      slideWash("right");
    } else {
      slideWash("left");
    }

    wheelWashCooldown.current = true;
    setTimeout(() => {
      wheelWashCooldown.current = false;
    }, 350);
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

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
  const { addToCart, updateBuyerIdentity, setIsOpen: setCartOpen } = useCart();

  useEffect(() => {
    const event = new CustomEvent("page_view_kp", {
      detail: {
        type: "other",
        data: {
          cart_id: ""
        }
      }
    });
    console.log("Fired KwikPass page_view_kp other event (RBW Storefront):", event.detail);
    window.dispatchEvent(event);

    return () => { };
  }, []);

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

    const handleUrlCheck = () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const rawWash = urlParams.get("wash")?.toLowerCase();
        const rawFit = urlParams.get("fit")?.toLowerCase();

        if (rawWash && VALID_WASHES.includes(rawWash)) {
          setSelectedWash(rawWash as "raw" | "black" | "white" | "vintage");
          setActiveWash(rawWash as "raw" | "black" | "white" | "vintage");
          if (rawFit && VALID_FITS.includes(rawFit)) {
            setSelectedFit(rawFit);
          } else {
            setSelectedFit(null);
          }
        } else {
          // Graceful fallback for invalid/missing wash: show default showroom, never blank
          setSelectedWash(null);
          setSelectedFit(null);
          try {
            sessionStorage.removeItem("selectedWash");
          } catch (e) {}
        }
      }
    };

    handleUrlCheck();
    window.addEventListener("popstate", handleUrlCheck);
    return () => {
      window.removeEventListener("popstate", handleUrlCheck);
    };
  }, []);

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
      sessionStorage.setItem("selectedWash", safeWash);
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("wash", safeWash);
        url.searchParams.delete("fit");
        window.history.pushState({ wash: safeWash }, "", url.toString());
      } catch (e) {}
    }
    
    // Auto-skip fit selection (step 2) for non-jeans items
    if (category && category !== "jeans" && defaultFit) {
      setTimeout(() => {
        handleFitClick(defaultFit);
      }, 100);
    }
  };

  const handleBackClick = () => {
    setSelectedWash(null);
    setSelectedFit(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("selectedWash");
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

    // Auto-select size based on loaded product size options
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

  useEffect(() => {
    if (selectedWash && selectedFit && shopifyProducts.length > 0) {
      const productHandle = getProductHandleForWashAndFit(selectedWash, selectedFit, selectedCategory);
      const prod = shopifyProducts.find((p) => p.handle === productHandle);
      if (prod) {
        const sizeOpt = prod.options?.find((opt: any) => opt.name.toLowerCase() === "size");
        if (sizeOpt && sizeOpt.values?.length > 0 && !sizeOpt.values.includes(selectedSize)) {
          setSelectedSize(sizeOpt.values[0]);
        }
      }
    }
  }, [selectedWash, selectedFit, selectedCategory, shopifyProducts, selectedSize]);

  const resetToStep1 = useCallback(() => {
    setSelectedFit(null);
    setSelectedWash(null);
    setSelectedSize("32");
    setQuantity(1);
    setActiveImageIndex(0);
    setZoomedImage(null);
    setIsInlineZoomActive(false);
    setSizeChartOpen(false);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("selectedWash");
        if (window.location.search) {
          window.history.replaceState({}, "", window.location.pathname);
        }
      } catch (e) {}
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

  const renderSelectionPath = (currentStep: 1 | 2 | 3) => {
    const washLabel = selectedWash ? selectedWash.toUpperCase() : null;
    const fitLabel = selectedFit ? selectedFit.toUpperCase() : null;

    return (
      <nav aria-label="Selection Path" className="flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs font-mono font-bold tracking-wider uppercase whitespace-nowrap select-none">
        {/* Step 1: WASH (Shown once wash is selected or when on step 1) */}
        {currentStep === 1 ? (
          <span className="text-stone-950 font-black bg-stone-200/90 px-2.5 py-1 rounded-full border border-stone-300/60 shadow-2xs">
            {washLabel ? `WASH: ${washLabel}` : "SELECT WASH"}
          </span>
        ) : (
          <button
            onClick={handleBackClick}
            className="text-stone-600 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1 rounded-full border border-stone-300/50 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
            title="Change Wash"
          >
            <span className="text-stone-400 font-semibold">WASH:</span>
            <span className="font-extrabold text-stone-900">{washLabel || "SELECT"}</span>
          </button>
        )}

        {/* Step 2: FIT (Only shown after user chooses a fit on step 2 and moves to step 3) */}
        {currentStep >= 3 && fitLabel && selectedCategory === "jeans" && (
          <>
            <span className="text-stone-400 font-black select-none text-[11px] sm:text-xs">&rarr;</span>
            <button
              onClick={handleBackToFits}
              className="text-stone-600 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1 rounded-full border border-stone-300/50 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
              title="Change Fit"
            >
              <span className="text-stone-400 font-semibold">FIT:</span>
              <span className="font-extrabold text-stone-900">{fitLabel}</span>
            </button>
          </>
        )}

        {/* Step 3: SIZE (Only shown in Step 3 when size is selected) */}
        {currentStep >= 3 && selectedSize && (
          <>
            <span className="text-stone-400 font-black select-none text-[11px] sm:text-xs">&rarr;</span>
            <span className="text-stone-950 font-black bg-stone-200/90 px-2.5 py-1 rounded-full border border-stone-300/60 shadow-2xs">
              SIZE: {selectedSize}
            </span>
          </>
        )}

        {/* Step 4: QUANTITY (Only shown in Step 3) */}
        {currentStep >= 3 && (
          <>
            <span className="text-stone-400 font-black select-none text-[11px] sm:text-xs">&rarr;</span>
            <span className="text-stone-950 font-black bg-stone-200/90 px-2.5 py-1 rounded-full border border-stone-300/60 shadow-2xs">
              QTY: {quantity}
            </span>
          </>
        )}
      </nav>
    );
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

      const startCenterX = sRect.left + sRect.width / 2;
      const startCenterY = sRect.top + sRect.height / 2;

      setFlyingItem({
        id: Date.now(),
        imageUrl,
        quantity,
        startCenterX,
        startCenterY,
        targetX,
        targetY
      });
    } catch (err) {
      console.warn("Could not calculate fly-to-cart rect in jeans:", err);
    }

    setIsAddingCart(true);
    try {
      await addToCart(variantId, quantity, {
        title: prod.title,
        price: priceVal,
        image: imageUrl,
      }, false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2400);
    } catch (err) {
      console.error("Failed to add jeans to cart:", err);
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
        title: prod.title,
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
      className="w-full h-screen bg-[#F5F3EF] overflow-hidden relative pt-[75px] md:pt-[85px] xl:pt-[103px] box-border"
    >
      <div className="w-full h-full relative">
        {/* Slide 1: Wash Selection (3D Preview) */}
        <div className={`absolute left-0 w-full h-[100dvh] top-[-75px] md:top-[-85px] xl:top-[-103px] shrink-0 overflow-hidden transition-all duration-500 ${selectedWash ? "scale-[0.98] brightness-75 filter blur-[0.5px]" : "scale-100 brightness-100"}`}>
          <RbwWashSelection3D onWashSelect={handleWashClick} />
        </div>

        {/* Slide 2: Shop By Fit - OVERLAY DRAWER ON TOP OF STEP 1 */}
        <div
          ref={fitsDrawerRef}
          className={`absolute inset-0 z-50 bg-[#FAF8F5] flex flex-col pt-[48px] sm:pt-[54px] xl:pt-0 overflow-y-auto pb-28 sm:pb-36 transform-gpu will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedWash
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
              selectedWash={selectedWash}
              isInsideViewport={false}
              onFitClick={handleFitClick}
            />
            <Footer />
          </div>
        </div>

        {/* Slide 3: Product Detail View - OVERLAY DRAWER ON TOP OF STEP 2 & STEP 1 */}
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
            {selectedCategory === "jeans" ? (
              <button
                onClick={handleBackToFits}
                className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-black tracking-wider text-white bg-stone-900 hover:bg-black px-2.5 sm:px-3 py-1.5 rounded-full transition-all active:scale-95 uppercase cursor-pointer shrink-0 shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">FITS</span>
              </button>
            ) : (
              <button
                onClick={handleShopAgain}
                className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-black tracking-wider text-white bg-stone-900 hover:bg-black px-2.5 sm:px-3 py-1.5 rounded-full transition-all active:scale-95 uppercase cursor-pointer shrink-0 shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">BACK</span>
              </button>
            )}

            <div className="flex-1 flex items-center justify-center overflow-x-auto scrollbar-none min-w-0">
              {renderSelectionPath(3)}
            </div>

            <div className="w-[34px] sm:w-[68px] shrink-0 invisible" />
          </div>

          {selectedFit && selectedWash && (() => {
            const productHandle = getProductHandleForWashAndFit(selectedWash, selectedFit, selectedCategory);
            const product = shopifyProducts.find((p) => p.handle === productHandle);

            if (shopifyLoading) {
              return (
                <div className="py-20 text-center text-xs tracking-widest text-neutral-500 uppercase animate-pulse">
                  Loading Jeans Details...
                </div>
              );
            }

            if (!product) {
              return (
                <div className="py-20 text-center border border-dashed border-[#EBE6DC] m-6 text-neutral-500 text-sm">
                  Jeans model not found or currently unavailable.
                  <div className="mt-4 flex flex-col items-center">
                    <button
                      onClick={handleShopAgain}
                      className="px-6 py-2.5 bg-black text-white text-[11px] font-black tracking-widest uppercase cursor-pointer"
                    >
                      SHOP AGAIN
                    </button>
                  </div>
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
              <div className="max-w-[1240px] mx-auto w-full flex flex-col md:flex-row px-6 sm:px-10 md:px-14 pt-3 sm:pt-4 md:pt-6 pb-6 sm:pb-8 gap-6 md:gap-8 lg:gap-10 items-start justify-center">
                {/* Left: Product Image & Thumbnails */}
                <div className="w-full md:w-1/2 flex items-start justify-center md:justify-end gap-3.5">
                  {imageUrls.length > 1 && (
                    <div className="flex flex-col gap-3 shrink-0">
                      {imageUrls.slice(0, 4).map((url: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-14 h-18 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${activeImageIndex === idx ? "border-[#D4B16A] scale-105 shadow-md" : "border-stone-200 opacity-65 hover:opacity-100"
                            }`}
                        >
                          <img src={url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
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
                      id="jeans-main-image"
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

                {/* Right: Product Details */}
                <div className="w-full md:w-1/2 max-w-[540px] flex flex-col text-left justify-start">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] bg-stone-950 text-white px-3 py-1 rounded-full uppercase shadow-xs">
                      {selectedCategory === "jeans" ? `${selectedWash} • ${selectedFit}` : selectedWash}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1C1917] font-semibold uppercase leading-tight tracking-wide">
                    {product.title.replace(/Denims/gi, 'Denim')}
                  </h1>

                  {/* Price */}
                  {/* Price & Stock Status */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                    <div className="text-xl sm:text-2xl font-bold font-sans text-stone-900 tracking-tight flex items-center gap-2">
                      <span>{formattedPrice}</span>
                      <span className="text-[9px] sm:text-[9.5px] font-black tracking-widest text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md uppercase">
                        INCL. TAXES
                      </span>
                    </div>

                    {isVariantInStock ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        IN STOCK • SHIPS IN 24H
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        LOW STOCK • DISPATCH IN 48H
                      </span>
                    )}
                  </div>

                  <div className="w-full h-[1px] bg-[#E8E3DA] my-3.5" />

                  {/* Size Selector + Size Guide inline link */}
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10.5px] sm:text-[11px] font-black tracking-wider uppercase text-stone-700">
                        SELECT WAIST SIZE (INCHES)
                      </span>
                      <button
                        type="button"
                        onClick={() => setSizeChartOpen(true)}
                        className="inline-flex items-center gap-1 text-[10.5px] font-black tracking-wider uppercase text-[#8C6B2F] hover:text-black transition-colors cursor-pointer"
                      >
                        <TapeIcon className="w-3.5 h-3.5 text-[#B9965A]" />
                        <span>SIZE GUIDE & CHART</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-8 gap-2">
                      {sizes.map((sz: string) => {
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

                  {/* Quantity Selector */}
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

                  {/* Primary Action Buttons (Immediately Below Quantity for Clean Conversion Hierarchy) */}
                  <div ref={buyButtonRef} className="w-full mt-5 flex flex-col gap-2.5">
                    {/* Primary BUY NOW Button */}
                    <button
                      type="button"
                      disabled={isBuyingNow || !isVariantInStock}
                      onClick={() => handleBuyNowClick(product)}
                      className="w-full py-3.5 px-6 rounded-xl font-sans font-black text-[12px] sm:text-[12.5px] tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer select-none bg-stone-950 hover:bg-black text-white shadow-lg hover:shadow-xl active:scale-[0.98] border border-stone-800 disabled:opacity-50"
                    >
                      {isBuyingNow ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>PREPARING CHECKOUT...</span>
                        </span>
                      ) : !isVariantInStock ? (
                        <span>CURRENTLY UNAVAILABLE</span>
                      ) : (
                        <>
                          <span>BUY NOW &rarr;</span>
                        </>
                      )}
                    </button>

                    {/* Secondary Row: ADD TO CART + CHANGE FIT */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={isAddingCart || !isVariantInStock}
                        onClick={(e) => handleAddToCartClick(product, e)}
                        className={`w-full py-3 px-3 rounded-xl font-sans font-black text-[10.5px] sm:text-[11px] tracking-[0.16em] uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer select-none border ${
                          justAdded
                            ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-400 shadow-md scale-[1.01]"
                            : "bg-white hover:bg-stone-50 border-[#E8E3DA] text-stone-900 hover:border-black shadow-xs active:scale-[0.98]"
                        } disabled:opacity-50`}
                      >
                        {justAdded ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Check className="w-4 h-4 stroke-[3] text-emerald-600" />
                            <span>ADDED!</span>
                          </span>
                        ) : isAddingCart ? (
                          <span className="flex items-center gap-1">
                            <ShoppingBag className="w-3.5 h-3.5 animate-bounce" />
                            <span>ADDING...</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#B9965A]" />
                            <span>ADD TO CART</span>
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleBackToFits}
                        className="w-full py-3 px-3 rounded-xl font-sans font-black text-[10.5px] sm:text-[11px] tracking-[0.16em] uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer select-none bg-white hover:bg-stone-50 border border-[#E8E3DA] text-stone-900 hover:border-black shadow-xs active:scale-[0.98]"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
                        <span>CHANGE FIT</span>
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-[#E8E3DA] my-5" />

                  {/* Secondary Information: Concise Garment Facts & Specifications */}
                  <div className="rounded-xl bg-white/90 border border-[#E8E3DA] p-3.5 shadow-2xs">
                    <h4 className="text-[10px] font-black tracking-[0.16em] uppercase text-stone-900 mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#B9965A]" />
                      <span>Garment Specifications</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[11px]">
                      <div>
                        <span className="text-stone-400 block text-[9px] font-bold uppercase tracking-wider">Fabric</span>
                        <span className="font-semibold text-stone-800">{fabricSpec}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px] font-bold uppercase tracking-wider">Silhouette</span>
                        <span className="font-semibold text-stone-800 capitalize">{silhouetteSpec}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px] font-bold uppercase tracking-wider">Stretch</span>
                        <span className="font-semibold text-stone-800">100% Rigid Shuttle-Loom Cotton (0% Stretch)</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px] font-bold uppercase tracking-wider">Care</span>
                        <span className="font-semibold text-stone-800">{careSpec}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping & Delivery Reassurance Strip with Dynamic Pincode Check */}
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
                          if (val.length === 6) {
                            handleCheckPincode(val);
                          } else if (pincodeStatus) {
                            setPincodeStatus(null);
                          }
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

                    {pincodeStatus && !pincodeStatus.valid && (
                      <span className="text-[10px] font-medium text-rose-600">
                        {pincodeStatus.message}
                      </span>
                    )}

                    {!pincodeStatus && (
                      <div className="flex items-center justify-between text-stone-500 text-[10px]">
                        <span>Standard delivery: 3–5 Business Days</span>
                        <span className="font-bold text-stone-700">Priority 24h Dispatch</span>
                      </div>
                    )}
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 text-[9.5px] text-stone-500 font-semibold tracking-wider uppercase mt-4 mb-20">
                    <span>✓ 7-Day Easy Returns</span>
                    <span>•</span>
                    <span>✓ 100% Authentic Selvedge</span>
                    <span>•</span>
                    <span>✓ Secure Checkout</span>
                  </div>

                  {/* Dedicated Size Guide Modal Dialog */}
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
                        {/* Header */}
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
                            aria-label="Close size guide"
                          >
                            <X className="w-4 h-4 text-stone-700" />
                          </button>
                        </div>

                        {/* How to Measure Section */}
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

                        {/* Measurement Table */}
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
                          <span>Need sizing help? Contact our fitting atelier.</span>
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

      {/* Fullscreen Zoom Lightbox Modal */}
      {zoomedImage && (
        <div
          onClick={() => {
            setZoomedImage(null);
            setZoomScale(1.5);
          }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn cursor-default overflow-hidden"
        >
          {/* Floating Zoom Controls Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/80 border border-white/20 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md"
          >
            {/* Zoom Out Button (-) */}
            <button
              onClick={handleZoomOut}
              disabled={zoomScale <= 1}
              title="Zoom Out (-)"
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg text-white transition-all cursor-pointer ${zoomScale <= 1 ? "opacity-35 cursor-not-allowed" : "hover:bg-white/20 active:scale-95"
                }`}
            >
              −
            </button>

            {/* Scale percentage indicator */}
            <span className="text-xs font-mono font-bold text-stone-200 min-w-[50px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>

            {/* Zoom In Button (+) */}
            <button
              onClick={handleZoomIn}
              disabled={zoomScale >= 4}
              title="Zoom In (+)"
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg text-white transition-all cursor-pointer ${zoomScale >= 4 ? "opacity-35 cursor-not-allowed" : "hover:bg-white/20 active:scale-95"
                }`}
            >
              +
            </button>

            <div className="w-[1px] h-4 bg-white/20 my-auto" />

            {/* Reset Zoom Button */}
            <button
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="text-[10px] font-black tracking-wider text-neutral-300 hover:text-white uppercase px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            >
              RESET
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setZoomedImage(null);
              setZoomScale(1.5);
            }}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer z-20"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Zoomable Image Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="overflow-auto max-w-full max-h-[90vh] flex items-center justify-center p-4"
          >
            <img
              src={zoomedImage}
              alt="Zoomed product view"
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: "center center",
                transition: "transform 300ms ease-out"
              }}
              className="max-w-[85vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Interactive Fly-To-Cart Animation mounted to document.body via Portal */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {flyingItem && (
            <motion.div
              key={flyingItem.id}
              initial={{
                x: flyingItem.startCenterX - 80,
                y: flyingItem.startCenterY - 100,
                width: 160,
                height: 200,
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: flyingItem.targetX - 80,
                y: [
                  flyingItem.startCenterY - 100,
                  Math.max(15, Math.min(flyingItem.startCenterY, flyingItem.targetY) - 55),
                  flyingItem.targetY - 100
                ],
                scale: [1, 0.82, 0.16],
                opacity: [1, 1, 0],
                rotate: [0, -8, 6, 0]
              }}
              transition={{
                duration: 0.7,
                x: { duration: 0.7, ease: [0.32, 0.72, 0, 1] },
                y: { duration: 0.7, times: [0, 0.35, 1], ease: ["easeOut", "easeIn"] },
                scale: { duration: 0.7, times: [0, 0.5, 1], ease: "easeInOut" },
                opacity: { duration: 0.7, times: [0, 0.86, 1], ease: "easeIn" },
                rotate: { duration: 0.7, ease: "easeInOut" }
              }}
              onAnimationComplete={() => {
                setFlyingItem(null);
                const cartBtn = document.getElementById("header-cart-button");
                if (cartBtn) {
                  cartBtn.animate(
                    [
                      { transform: "scale(1)" },
                      { transform: "scale(1.35) rotate(-6deg)", filter: "drop-shadow(0 0 10px rgba(185,150,90,0.8))" },
                      { transform: "scale(0.9) rotate(4deg)" },
                      { transform: "scale(1.15) rotate(-2deg)" },
                      { transform: "scale(1)" }
                    ],
                    { duration: 450, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
                  );
                }
                setTimeout(() => {
                  setCartOpen(true);
                }, 120);
              }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                transformOrigin: "center center",
                willChange: "transform, opacity",
                zIndex: 999999
              }}
              className="fixed top-0 left-0 z-[999999] pointer-events-none select-none drop-shadow-[0_16px_35px_rgba(0,0,0,0.55)] shadow-[0_0_30px_rgba(185,150,90,0.35)]"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-[#B9965A] bg-neutral-900 shadow-2xl">
                <img
                  src={flyingItem.imageUrl}
                  alt="Flying item preview"
                  className="w-full h-full object-cover object-center"
                />
                {/* Subtle Luxury Gloss Sheen Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
              </div>

              {flyingItem.quantity > 1 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                  transition={{ duration: 0.22, delay: 0.05 }}
                  className="absolute -top-3 -right-3 z-30 bg-[#B9965A] text-black text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-full border-2 border-white shadow-2xl tracking-wider flex items-center justify-center pointer-events-none"
                >
                  x{flyingItem.quantity}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </main>
  );
}
