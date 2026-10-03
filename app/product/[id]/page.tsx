"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  ChevronRight,
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Star,
  Maximize2,
  X,
  Search,
  Tag,
  Copy,
  Check,
  Zap,
  Sparkles,
  Package,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/app/theme-provider";
import { useToast } from "@/context/ToastContext";
import SizeGuideDrawer from "@/component/SizeGuideDrawer";

export default function ProductDetailPage() {
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;

  const { theme } = useTheme();
  const isLight = theme === "light";

  const { cart, addToCart, toggleWishlist, isWishlisted, setIsOpen, updateBuyerIdentity } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive UI state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("32");
  const [selectedFit, setSelectedFit] = useState<string>("Straight");
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isDeepZoom, setIsDeepZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHoverZoom, setIsHoverZoom] = useState(false);
  const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 });
  const [hoveredImageIdx, setHoveredImageIdx] = useState<number | null>(null);
  const [isClickZooming, setIsClickZooming] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

  // Accordion state
  const [expandedSection, setExpandedSection] = useState<string | null>("details");

  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsDeepZoom(false);
  }, [activeImageIndex, isLightboxOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    async function loadAllProducts() {
      try {
        const response = await axios.get("/api/shopify/products", {
          headers: { Accept: "application/json" },
        });
        if (Array.isArray(response.data)) {
          setAllProducts(response.data);
        } else if (response.data && Array.isArray(response.data.products)) {
          setAllProducts(response.data.products);
        }
      } catch (err) {
        console.error("Failed to load catalog products for recommendations:", err);
      }
    }
    loadAllProducts();
  }, []);

  useEffect(() => {
    if (!rawId) return;

    // Reset gallery & modal state whenever navigating to a new product
    setActiveImageIndex(0);
    setIsLightboxOpen(false);
    setIsDeepZoom(false);

    async function loadProductDetails() {
      try {
        if (!product) {
          setLoading(true);
        }
        setError(null);

        // Attempt 1: Fetch exact product from Shopify API handler by ID/Handle
        let productData: any = null;
        try {
          const encodedId = encodeURIComponent(rawId);
          const response = await axios.get(`/api/shopify/product/${encodedId}`, {
            headers: { Accept: "application/json" },
            validateStatus: (status) => status < 500,
          });
          if (response.data && typeof response.data === "object" && !response.data.error && typeof response.data !== "string") {
            productData = response.data;
          }
        } catch (apiErr) {
          console.warn("Direct Shopify API lookup by handle failed, attempting catalogue fallback:", apiErr);
        }

        // Attempt 2: Fallback lookup from allProducts catalog
        if (!productData || productData.error) {
          const decoded = decodeURIComponent(rawId).toLowerCase();
          
          if ((decoded.includes("vintage") || decoded.includes("white")) && (decoded.includes("jacket") || decoded.includes("trucker"))) {
            productData = allProducts.find((p) => p.handle === "white-denim-jacket");
          }

          if (!productData) {
            productData = allProducts.find(
              (p) =>
                p.handle?.toLowerCase() === decoded ||
                p.id === rawId ||
                decoded.includes(p.handle?.toLowerCase())
            );
          }

          // Attempt 3: Wash & Fit tag matching fallback
          if (!productData && allProducts.length > 0) {
            const knownFits = ["ankle", "slim", "comfort", "straight", "baggy", "bootcut"];
            const knownWashes = ["raw", "black", "white", "vintage"];
            const foundFit = knownFits.find((f) => decoded.includes(f)) || "straight";
            const foundWash = knownWashes.find((w) => decoded.includes(w)) || "raw";
            const targetWash = foundWash === "vintage" ? "white" : foundWash;

            productData = allProducts.find((p) => {
              const tags = (p.tags || []).map((t: string) => t.toLowerCase());
              const pHandle = p.handle?.toLowerCase() || "";
              const matchesWash = tags.some((t: string) => t.includes(targetWash)) || pHandle.includes(targetWash);
              const matchesFit = tags.some((t: string) => t.includes(foundFit)) || pHandle.includes(foundFit);
              return matchesWash && matchesFit;
            });
          }
        }

        if (!productData) {
          throw new Error("Product details could not be resolved from catalogue.");
        }

        setProduct(productData);

        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/stores/rbw/product")) {
          const canonicalUrl = `/stores/rbw/product/${encodeURIComponent(productData.handle || rawId)}`;
          window.history.replaceState({ path: canonicalUrl }, "", canonicalUrl);
        }

        // Dynamically select the first available size from Shopify options
        const sizeOpt = productData?.options?.find(
          (opt: any) => opt.name.toLowerCase() === "size"
        );
        if (sizeOpt && sizeOpt.values && sizeOpt.values.length > 0) {
          setSelectedSize(sizeOpt.values[0]);
        } else {
          const isAcc = (productData?.tags || []).map((t: string) => t.toLowerCase()).includes("accessories") || productData?.productType?.toLowerCase() === "accessories";
          const isJk = (productData?.tags || []).map((t: string) => t.toLowerCase()).includes("jackets") || (productData?.tags || []).map((t: string) => t.toLowerCase()).includes("jacket") || productData?.title?.toLowerCase().includes("jacket") || productData?.handle?.toLowerCase().includes("jacket");
          if (isAcc) {
            setSelectedSize("");
          } else if (isJk) {
            setSelectedSize("M");
          } else {
            setSelectedSize("32");
          }
        }

        // Dynamically select the fit from tags
        const knownFits = ["ankle", "slim", "comfort", "straight", "baggy", "bootcut"];
        const foundFit = productData?.tags?.find((t: string) => {
          const cleanTag = t.toLowerCase().replace("-fit", "").trim();
          return knownFits.includes(cleanTag);
        });
        if (foundFit) {
          const cleanFit = foundFit.toLowerCase().replace("-fit", "").trim();
          setSelectedFit(cleanFit.charAt(0).toUpperCase() + cleanFit.slice(1));
        }
      } catch (err: any) {
        console.error("Error loading product details:", err);
        setError(err.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }

    loadProductDetails();
  }, [rawId, allProducts]);

  useEffect(() => {
    if (product) {
      const priceVal = parseFloat(product.priceRange?.minVariantPrice?.amount || "1850");
      const event = new CustomEvent("page_view_kp", {
        detail: {
          type: "product",
          data: {
            cart_id: "",
            product_id: product.id || rawId,
            variant_id: "",
            image_url: product.images?.edges?.[0]?.node?.url || "/raw_jeans.png",
            name: product.title || "",
            price: priceVal,
            handle: product.handle || ""
          }
        }
      });
      console.log("Fired KwikPass page_view_kp product event:", event.detail);
      window.dispatchEvent(event);
    }
  }, [product, rawId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center py-20 px-6">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center animate-pulse">
          <div className="w-16 h-16 border-2 border-t-transparent border-[var(--foreground)] rounded-full animate-spin mb-4" />
          <span className="text-xs tracking-[0.3em] font-bold text-[var(--foreground)] uppercase">
            Loading Product Details
          </span>
          <span className="text-[10px] text-neutral-500 tracking-wider">
            Loading high-fidelity denim parameters...
          </span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="max-w-md border border-[var(--divider-color)] p-8">
          <p className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider mb-2">
            PRODUCT NOT RESOLVED
          </p>
          <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
            {error || "The selected product could not be resolved from the catalogue."}
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
          >
            RETURN TO CATALOGUE
          </button>
        </div>
      </div>
    );
  }

  // Formatting helpers
  const price = product.priceRange?.minVariantPrice;
  const formattedPrice = price
    ? `${price.currencyCode === 'INR' ? '₹ ' : price.currencyCode + ' '}${parseFloat(price.amount).toLocaleString('en-IN')}`
    : "₹ 1,850";

  const images = product.images?.edges?.map((e: any) => e.node.url) || [];
  if (images.length === 0) {
    images.push("/raw_jeans.png"); // Fallback
  }

  const tags = product.tags || [];

  const knownFits = ["ankle", "slim", "comfort", "straight", "baggy", "bootcut"];
  const foundFitTag = tags.find((t: string) => {
    const cleanTag = t.toLowerCase().replace("-fit", "").trim();
    return knownFits.includes(cleanTag);
  });
  const fitTag = foundFitTag ? foundFitTag.toLowerCase().replace("-fit", "").trim().toUpperCase() : "STRAIGHT";

  const knownWashes = ["raw", "black", "white"];
  const foundWashTag = tags.find((t: string) => {
    const cleanTag = t.toLowerCase().replace("-denim", "").trim();
    return knownWashes.includes(cleanTag);
  });
  const washTag = foundWashTag ? foundWashTag.toLowerCase().replace("-denim", "").trim().toUpperCase() : "RAW";

  const isAccessory = tags.map((t: string) => t.toLowerCase()).includes("accessories") || product.productType?.toLowerCase() === "accessories";
  const isJacket = tags.map((t: string) => t.toLowerCase()).includes("jackets") || tags.map((t: string) => t.toLowerCase()).includes("jacket") || product.title?.toLowerCase().includes("jacket") || product.handle?.toLowerCase().includes("jacket");

  const sizeOption = product.options?.find((opt: any) => opt.name.toLowerCase() === "size");
  const sizeOptions = sizeOption && sizeOption.values && sizeOption.values.length > 0
    ? sizeOption.values
    : isAccessory
      ? []
      : isJacket
        ? ["S", "M", "L", "XL", "XXL"]
        : ["28", "30", "32", "34", "36", "38"];

  const switchProductSmoothly = (targetProduct: any, targetUrl: string) => {
    if (!targetProduct) {
      if (targetUrl) router.push(targetUrl);
      return;
    }

    setActiveImageIndex(0);
    setIsLightboxOpen(false);
    setIsDeepZoom(false);
    setProduct(targetProduct);

    // Dynamic size selection for target product
    const sizeOpt = targetProduct?.options?.find(
      (opt: any) => opt.name.toLowerCase() === "size"
    );
    if (sizeOpt && sizeOpt.values && sizeOpt.values.length > 0) {
      setSelectedSize(sizeOpt.values[0]);
    }

    // Dynamic fit tag selection
    const knownFits = ["ankle", "slim", "comfort", "straight", "baggy", "bootcut"];
    const foundFit = targetProduct?.tags?.find((t: string) => {
      const cleanTag = t.toLowerCase().replace("-fit", "").trim();
      return knownFits.includes(cleanTag);
    });
    if (foundFit) {
      const cleanFit = foundFit.toLowerCase().replace("-fit", "").trim();
      setSelectedFit(cleanFit.charAt(0).toUpperCase() + cleanFit.slice(1));
    }

    // Update address bar URL seamlessly without triggering full Next.js page reloads
    if (typeof window !== "undefined" && targetUrl) {
      window.history.pushState({ path: targetUrl }, "", targetUrl);
    }
  };

  const handleFitChange = (fitName: string) => {
    const normFit = fitName.toLowerCase();
    let washKey = "raw";
    if (washTag.toLowerCase().includes("black")) {
      washKey = "black";
    } else if (washTag.toLowerCase().includes("white")) {
      washKey = "white";
    }

    // Dynamic match in loaded catalog
    const targetProduct = allProducts.find((p) => {
      const pTags = (p.tags || []).map((t: string) => t.toLowerCase());
      const pHandle = p.handle?.toLowerCase() || "";
      const matchesWash = pTags.some((t: string) => t.includes(washKey)) || pHandle.includes(washKey);
      const matchesFit = pTags.some((t: string) => t.includes(normFit)) || pHandle.includes(normFit);
      return matchesWash && matchesFit;
    });

    let targetUrl = `/shop?wash=${washKey}&fit=${normFit}`;
    if (washKey === "raw") {
      if (normFit === "slim") targetUrl = "/stores/rbw/product/raw-slim-denims";
      else if (normFit === "straight") targetUrl = "/stores/rbw/product/raw-straight-denims";
      else if (normFit === "baggy") targetUrl = "/stores/rbw/product/raw-baggy-denims";
      else if (normFit === "bootcut") targetUrl = "/stores/rbw/product/raw-bootcut-denims";
      else if (normFit === "ankle") targetUrl = "/stores/rbw/product/raw-ankle-denims";
      else if (normFit === "comfort") targetUrl = "/stores/rbw/product/raw-comfort-denims";
    } else if (washKey === "black") {
      if (normFit === "slim") targetUrl = "/stores/rbw/product/black-slim-denims";
      else if (normFit === "straight") targetUrl = "/stores/rbw/product/black-straight-denims";
      else if (normFit === "baggy") targetUrl = "/stores/rbw/product/black-baggy-denims";
      else if (normFit === "bootcut") targetUrl = "/stores/rbw/product/black-bootcut-denims";
      else if (normFit === "ankle") targetUrl = "/stores/rbw/product/black-ankle-denims";
      else if (normFit === "comfort") targetUrl = "/stores/rbw/product/black-comfort-denims";
    } else if (washKey === "white") {
      if (normFit === "slim") targetUrl = "/stores/rbw/product/white-slim-denim";
      else if (normFit === "straight") targetUrl = "/stores/rbw/product/white-straight-denim";
      else if (normFit === "baggy") targetUrl = "/stores/rbw/product/white-baggy-denim";
      else if (normFit === "bootcut") targetUrl = "/stores/rbw/product/white-bootcut-denim";
      else if (normFit === "ankle") targetUrl = "/stores/rbw/product/white-ankle-denim";
      else if (normFit === "comfort") targetUrl = "/stores/rbw/product/white-comfort-denim";
    }

    if (targetProduct) {
      const finalUrl = `/stores/rbw/product/${encodeURIComponent(targetProduct.handle || targetProduct.id)}`;
      switchProductSmoothly(targetProduct, finalUrl);
    } else if (targetUrl) {
      router.push(targetUrl);
    }
  };

  const handleWashChange = (washName: string) => {
    const normWash = washName.toLowerCase().replace("-denim", "").trim();
    const normFit = activeFit;

    // Dynamic match in loaded catalog
    const targetProduct = allProducts.find((p) => {
      const pTags = (p.tags || []).map((t: string) => t.toLowerCase());
      const pHandle = p.handle?.toLowerCase() || "";
      const matchesWash = pTags.some((t: string) => t.includes(normWash)) || pHandle.includes(normWash);
      const matchesFit = pTags.some((t: string) => t.includes(normFit)) || pHandle.includes(normFit);
      return matchesWash && matchesFit;
    });

    let targetUrl = `/shop?wash=${normWash}&fit=${normFit}`;
    if (normWash === "raw") {
      if (normFit === "slim") targetUrl = "/stores/rbw/product/raw-slim-denims";
      else if (normFit === "straight") targetUrl = "/stores/rbw/product/raw-straight-denims";
      else if (normFit === "baggy") targetUrl = "/stores/rbw/product/raw-baggy-denims";
      else if (normFit === "bootcut") targetUrl = "/stores/rbw/product/raw-bootcut-denims";
      else if (normFit === "ankle") targetUrl = "/stores/rbw/product/raw-ankle-denims";
      else if (normFit === "comfort") targetUrl = "/stores/rbw/product/raw-comfort-denims";
    } else if (normWash === "black") {
      if (normFit === "slim") targetUrl = "/stores/rbw/product/black-slim-denims";
      else if (normFit === "straight") targetUrl = "/stores/rbw/product/black-straight-denims";
      else if (normFit === "baggy") targetUrl = "/stores/rbw/product/black-baggy-denims";
      else if (normFit === "bootcut") targetUrl = "/stores/rbw/product/black-bootcut-denims";
      else if (normFit === "ankle") targetUrl = "/stores/rbw/product/black-ankle-denims";
      else if (normFit === "comfort") targetUrl = "/stores/rbw/product/black-comfort-denims";
    } else if (normWash === "white") {
      if (normFit === "slim") targetUrl = "/stores/rbw/product/white-slim-denim";
      else if (normFit === "straight") targetUrl = "/stores/rbw/product/white-straight-denim";
      else if (normFit === "baggy") targetUrl = "/stores/rbw/product/white-baggy-denim";
      else if (normFit === "bootcut") targetUrl = "/stores/rbw/product/white-bootcut-denim";
      else if (normFit === "ankle") targetUrl = "/stores/rbw/product/white-ankle-denim";
      else if (normFit === "comfort") targetUrl = "/stores/rbw/product/white-comfort-denim";
    }

    if (targetProduct) {
      const finalUrl = `/stores/rbw/product/${encodeURIComponent(targetProduct.handle || targetProduct.id)}`;
      switchProductSmoothly(targetProduct, finalUrl);
    } else if (targetUrl) {
      router.push(targetUrl);
    }
  };

  const toggleAccessory = (accId: string) => {
    if (selectedAccessories.includes(accId)) {
      setSelectedAccessories(selectedAccessories.filter((id) => id !== accId));
    } else {
      setSelectedAccessories([...selectedAccessories, accId]);
    }
  };

  const getSelectedVariantId = () => {
    if (!product || !product.variants?.edges) return null;

    const matchingVariant = product.variants.edges.find(({ node }: any) => {
      const sizeOption = node.selectedOptions?.find(
        (opt: any) => opt.name.toLowerCase() === "size"
      );
      return sizeOption?.value === selectedSize;
    });

    return matchingVariant?.node?.id || product.variants.edges[0]?.node?.id || null;
  };

  const isUserLoggedIn = () => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("kpToken");
    return Boolean(token && token.trim().length > 0);
  };

  const ensureUserAuthenticated = (): boolean => {
    if (isUserLoggedIn()) return true;

    if (typeof window !== "undefined") {
      if (typeof (window as any).triggerKwikpassLogin === "function") {
        (window as any).triggerKwikpassLogin();
      } else {
        window.dispatchEvent(new CustomEvent("open-login-modal"));
        setTimeout(() => {
          if (!localStorage.getItem("kpToken")) {
            sessionStorage.setItem("triggerKwikPass", "true");
            window.location.href = "/login";
          }
        }, 300);
      }
    }
    return false;
  };

  const handleAddToCart = async () => {
    if (!product) return;

    const variantId = getSelectedVariantId() || `gid://shopify/ProductVariant/${product.id.split("/").pop()}`;
    const priceVal = parseFloat(product.priceRange?.minVariantPrice?.amount || "1850");
    const imageUrl = product.images?.edges?.[0]?.node?.url || "/raw_jeans.png";

    await addToCart(variantId, quantity, {
      title: product.title,
      price: priceVal,
      image: imageUrl,
    });

    // Add selected accessories to cart
    for (const accId of selectedAccessories) {
      const accItem = accessoryList.find((a) => a.id === accId);
      if (accItem) {
        await addToCart(accItem.variantId, 1, {
          title: accItem.title,
          price: accItem.price,
          image: accItem.image,
        }, false);
      }
    }

    // Open Cart Drawer to display added jeans + paired accessories
    setIsOpen(true);
  };

  const handleBuyDirectly = async () => {
    if (!product) return;

    const variantId = getSelectedVariantId() || `gid://shopify/ProductVariant/${product.id.split("/").pop()}`;
    const priceVal = parseFloat(product.priceRange?.minVariantPrice?.amount || "1850");
    const imageUrl = product.images?.edges?.[0]?.node?.url || "/raw_jeans.png";

    const freshCart = await addToCart(variantId, quantity, {
      title: product.title,
      price: priceVal,
      image: imageUrl,
    }, false);

    // Add selected accessories to cart
    for (const accId of selectedAccessories) {
      const accItem = accessoryList.find((a) => a.id === accId);
      if (accItem) {
        await addToCart(accItem.variantId, 1, {
          title: accItem.title,
          price: accItem.price,
          image: accItem.image,
        }, false);
      }
    }

    const variantCode = variantId.split("/").pop();
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    let checkoutUrl = freshCart?.checkoutUrl
      ? freshCart.checkoutUrl
      : `https://${shopifyDomain}/cart/${variantCode}:${quantity}`;

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
      console.error("Pre-checkout identity update error on Buy Now:", err);
    }

    window.location.href = checkoutUrl;
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
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

  const getProductWash = (p: any) => {
    const tags = p.tags || [];
    const knownWashes = ["raw", "black", "white"];
    const found = tags.find((t: string) => {
      const clean = t.toLowerCase().replace("-denim", "").trim();
      return knownWashes.includes(clean);
    });
    return found ? found.toLowerCase().replace("-denim", "").trim() : "raw";
  };

  const activeFit = fitTag.toLowerCase();
  const activeWash = washTag.toLowerCase();

  // 1. Denim Pants & Jackets matching fit or wash (all included)
  const fitMatches = allProducts.filter(
    (p) => {
      const pTags = (p.tags || []).map((t: string) => t.toLowerCase());
      const isAcc = pTags.includes("accessories") || p.productType?.toLowerCase() === "accessories";
      return !isAcc && getProductFit(p) === activeFit && p.id !== product?.id;
    }
  );

  const washMatches = allProducts.filter(
    (p) => {
      const pTags = (p.tags || []).map((t: string) => t.toLowerCase());
      const isAcc = pTags.includes("accessories") || p.productType?.toLowerCase() === "accessories";
      return !isAcc && getProductWash(p) === activeWash && getProductFit(p) !== activeFit && p.id !== product?.id;
    }
  );

  const denimRecommendations = [...fitMatches, ...washMatches];

  // 2. Accessories - strictly capped to maximum 4 accessories
  const accessoryRecommendations = allProducts.filter((p) => {
    const pTags = (p.tags || []).map((t: string) => t.toLowerCase());
    const isAcc = pTags.includes("accessories") || p.productType?.toLowerCase() === "accessories";
    return isAcc && p.id !== product?.id;
  }).slice(0, 4);

  const fallbackAccessories = [
    {
      id: "acc-belt-01",
      variantId: allProducts[0]?.variants?.edges?.[0]?.node?.id || product?.variants?.edges?.[0]?.node?.id || "gid://shopify/ProductVariant/8691491242218",
      title: "Cognac Leather Belt",
      price: 499,
      formattedPrice: "₹ 499",
      image: "/khaki_jeans.png",
    },
    {
      id: "acc-chain-02",
      variantId: allProducts[1]?.variants?.edges?.[0]?.node?.id || product?.variants?.edges?.[0]?.node?.id || "gid://shopify/ProductVariant/8691491242218",
      title: "Pocket Denim Chain",
      price: 299,
      formattedPrice: "₹ 299",
      image: "/black_jeans.png",
    },
    {
      id: "acc-spray-03",
      variantId: allProducts[2]?.variants?.edges?.[0]?.node?.id || product?.variants?.edges?.[0]?.node?.id || "gid://shopify/ProductVariant/8691491242218",
      title: "Denim Care Spray",
      price: 199,
      formattedPrice: "₹ 199",
      image: "/raw_jeans.png",
    },
  ];

  const accessoryList = accessoryRecommendations.length > 0
    ? accessoryRecommendations.slice(0, 4).map((p) => ({
        id: p.id,
        variantId: p.variants?.edges?.[0]?.node?.id || `gid://shopify/ProductVariant/${p.id.split('/').pop()}`,
        title: p.title,
        price: parseFloat(p.priceRange?.minVariantPrice?.amount || "499"),
        formattedPrice: p.priceRange?.minVariantPrice ? `₹ ${parseFloat(p.priceRange.minVariantPrice.amount).toLocaleString('en-IN')}` : "₹ 499",
        image: p.images?.edges?.[0]?.node?.url || "/khaki_jeans.png",
      }))
    : fallbackAccessories;

  const isCurrentProductAccessory = (product?.tags || []).map((t: string) => t.toLowerCase()).includes("accessories") || product?.productType?.toLowerCase() === "accessories";

  const recommendations = isCurrentProductAccessory
    ? accessoryRecommendations
    : [...denimRecommendations, ...accessoryRecommendations];

  return (
    <div className="min-h-screen bg-transparent text-[var(--foreground)] pt-0 sm:pt-2 pb-16 transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-8">

        {/* Top Back Button & Breadcrumb Navigation Bar (Mobile & Desktop) */}
        <div className="flex items-center justify-between gap-3 mb-4 pt-1 sm:pt-2">
          {/* Back Button */}
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/stores/rbw");
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold tracking-wider transition-all shadow-xs border border-stone-300 dark:border-stone-700 cursor-pointer shrink-0 active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span>BACK</span>
          </button>

          {/* Breadcrumb Steps */}
          <nav className="flex items-center gap-1.5 text-[9.5px] sm:text-[10.5px] tracking-widest uppercase text-neutral-500 select-none overflow-x-auto scrollbar-none py-1">
            <Link href="/" prefetch={false} className="hover:text-[var(--foreground)] transition-colors shrink-0">HOME</Link>
            <ChevronRight className="w-3 h-3 shrink-0 text-neutral-400" />
            <Link href="/shop" prefetch={false} className="hover:text-[var(--foreground)] transition-colors shrink-0">STORES</Link>
            <ChevronRight className="w-3 h-3 shrink-0 text-neutral-400" />
            <span className="text-[var(--foreground)] font-extrabold truncate max-w-[140px] sm:max-w-[240px]">{product.title.replace(/Denims/gi, 'Denim')}</span>
          </nav>
        </div>

        {/* 2 Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* LEFT: Vertical Thumbnails + Main Viewport + 3 Feature Badges */}
          <div className="lg:col-span-6 flex flex-col gap-3 lg:sticky lg:top-[120px] self-start">
            
            {/* Gallery Section: Vertical Thumbnails Stack + Main Photo Box */}
            <div className="flex gap-3 sm:gap-4 items-start">
              
              {/* Vertical Thumbnail Stack on Left */}
              <div className="flex flex-col gap-2.5 shrink-0">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-16 sm:w-18 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-black ring-2 ring-black/20 scale-102 shadow-md opacity-100"
                        : "border-stone-200 opacity-60 hover:opacity-100 bg-stone-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>

              {/* Main Full-View Photo Viewport */}
              <div
                onClick={() => {
                  if (window.innerWidth >= 640) setIsClickZooming(!isClickZooming);
                }}
                className="relative flex-1 h-[480px] sm:h-[580px] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs group cursor-zoom-in"
              >
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover object-top select-none transition-all duration-300"
                />

                {/* Expand Icon Button Top Right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-stone-700 hover:scale-110 transition-all z-20 cursor-pointer border border-stone-200"
                  aria-label="Expand image"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-md text-stone-800 border border-stone-200 shadow-md flex items-center justify-center transition-all z-20 hover:scale-110 cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-md text-stone-800 border border-stone-200 shadow-md flex items-center justify-center transition-all z-20 hover:scale-110 cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 3 Quality Feature Badges Underneath Gallery (Full Width) */}
            <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 mt-2">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-stone-700 shrink-0" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-black">PREMIUM DENIM</p>
                  <p className="text-[9px] text-stone-500 font-medium">12.5oz Selvedge Denim</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 border-l border-stone-200 pl-2.5">
                <Sparkles className="w-5 h-5 text-stone-700 shrink-0" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-black">COMFORT FIT</p>
                  <p className="text-[9px] text-stone-500 font-medium">All Day Flex &amp; Comfort</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 border-l border-stone-200 pl-2.5">
                <Package className="w-5 h-5 text-stone-700 shrink-0" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-black">BUILT TO LAST</p>
                  <p className="text-[9px] text-stone-500 font-medium">Crafted to Outlast Trends</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Product Details Panel matching Reference Image 1 */}
          <div className="lg:col-span-6 flex flex-col gap-4 pt-1">

            {/* Category / Subheader */}
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase">
              <span>{fitTag} FIT</span>
              <span>|</span>
              <span>{washTag}</span>
            </div>

            {/* Title: Cursive Bold Serif Font (Exactly as Image 1) */}
            <h1 className="text-3xl sm:text-4xl font-serif italic font-bold text-black tracking-tight leading-snug">
              {product.title.replace(/Denims/gi, 'Denim')}
            </h1>

            {/* Rating Pill */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-[#FFF7ED] border border-[#FFEDD5] px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#EA580C]">
                <Star className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
                <span>4.8</span>
                <span className="text-stone-400 font-normal">| 128 Reviews</span>
              </div>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline gap-3 pb-3 border-b border-stone-200">
              <span className="text-3xl font-bold text-black">{formattedPrice}</span>
              <span className="text-xs text-stone-500 font-medium">Inclusive of all taxes</span>
            </div>

            {/* Select Size */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-extrabold tracking-wider text-black uppercase">SELECT SIZE</span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs font-bold text-stone-600 hover:text-black flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Size guide</span>
                  <Info className="w-3.5 h-3.5 text-stone-500" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {["28", "30", "32", "34", "36", "38", "40", "42"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${
                      selectedSize === size
                        ? "bg-black text-white border-black font-extrabold shadow-md scale-105"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color / Wash Selector */}
            <div>
              <div className="text-xs font-extrabold tracking-wider text-black uppercase mb-2">
                COLOR: <span className="text-stone-500 font-bold">{washTag}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => handleWashChange("RAW")}
                  className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                    washTag.includes("RAW") ? "border-black bg-stone-900 text-white ring-1 ring-black shadow-xs" : "border-stone-200 text-stone-600 hover:border-stone-400 bg-stone-50"
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-[#1c2d42] border border-[#142030] shadow-xs" />
                  <span>RAW</span>
                </button>
                <button
                  onClick={() => handleWashChange("BLACK")}
                  className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                    washTag.includes("BLACK") ? "border-black bg-stone-900 text-white ring-1 ring-black shadow-xs" : "border-stone-200 text-stone-600 hover:border-stone-400 bg-stone-50"
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-black border border-black shadow-xs" />
                  <span>BLACK</span>
                </button>
                <button
                  onClick={() => handleWashChange("WHITE")}
                  className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                    washTag.includes("WHITE") ? "border-black bg-white text-black ring-1 ring-black shadow-xs" : "border-stone-200 text-stone-600 hover:border-stone-400 bg-stone-50"
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white border border-stone-300 shadow-xs" />
                  <span>WHITE</span>
                </button>
              </div>
            </div>

            {/* Fit Type Selector */}
            <div>
              <div className="text-xs font-extrabold tracking-wider text-black uppercase mb-2">
                FIT TYPE: <span className="text-stone-500 font-bold">{selectedFit.toUpperCase()}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["ANKLE", "SLIM", "COMFORT", "STRAIGHT", "RELAXED"].map((fit) => (
                  <button
                    key={fit}
                    onClick={() => handleFitChange(fit)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                      selectedFit.toUpperCase() === fit
                        ? "bg-black text-white border-black shadow-md font-extrabold"
                        : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>

            {/* PAIR WITH AN ACCESSORY Box */}
            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-extrabold tracking-wider text-black uppercase">PAIR WITH AN ACCESSORY</span>
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest cursor-pointer hover:text-black">VIEW ALL</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {accessoryList.map((acc) => {
                  const isSelected = selectedAccessories.includes(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleAccessory(acc.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer bg-white ${
                        isSelected ? "border-black ring-1 ring-black shadow-xs" : "border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={acc.image} alt={acc.title} className="w-10 h-10 object-cover rounded-lg bg-stone-100 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-black truncate">{acc.title}</p>
                          <p className="text-[10px] text-stone-500 font-semibold">{acc.formattedPrice}</p>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-stone-400 hover:text-black shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity & Wishlist Row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold tracking-wider text-black uppercase">QUANTITY</span>
                <div className="flex items-center gap-2 border border-stone-200 rounded-full px-3 py-1 bg-stone-50">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-stone-500 hover:text-black">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-extrabold text-black px-2">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="text-stone-500 hover:text-black">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => toggleWishlist(product.id)}
                className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-black flex items-center gap-2 hover:bg-stone-50 transition-all cursor-pointer shadow-2xs"
              >
                <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                <span>ADD TO WISHLIST</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* ADD TO BAG: White button with border & bag icon */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 px-6 bg-white border-2 border-black text-black hover:bg-stone-50 font-extrabold text-xs tracking-[0.2em] uppercase transition-all shadow-xs flex items-center justify-center gap-2.5 cursor-pointer rounded-xl"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO BAG</span>
              </button>

              {/* BUY NOW: Solid black button with bolt icon */}
              <button
                onClick={handleBuyDirectly}
                className="w-full py-4 px-6 bg-black text-white hover:bg-neutral-900 font-extrabold text-xs tracking-[0.2em] uppercase transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer rounded-xl"
              >
                <Zap className="w-4 h-4 fill-current text-white" />
                <span>BUY NOW</span>
              </button>
            </div>

              {/* Trust Badges directly below buttons (Uniform sizing & perfect alignment) */}
              <div className="grid grid-cols-2 gap-3 pt-4 text-[11px] font-extrabold text-foreground/85 border-t border-foreground/10 mt-5">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                  <span>Premium Denim</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                  <span>Easy 7 Day Return</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                  <span>Made in India</span>
                </div>
              </div>

            {/* Delivery Section Redesign */}
            <div className={`mb-6 p-5 rounded-2xl border space-y-4 select-none ${isLight
                ? "bg-[#F4F4F2] border-neutral-300 text-black"
                : "bg-neutral-900/60 border-neutral-800 text-white"
              }`}>
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${isLight ? "text-[#1F4E79]" : "text-[#3b82f6]"}`} />
                <span className={`text-xs font-black tracking-wider uppercase ${isLight ? "text-black" : "text-white"}`}>
                  Deliver to
                </span>
              </div>

              {/* Pincode Input Container */}
              <div className="relative flex items-center max-w-sm">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPincode(val);
                    if (val.length !== 6) setPincodeChecked(false);
                  }}
                  placeholder="Enter PIN Code"
                  className={`w-full py-2.5 px-3.5 pr-24 text-xs font-mono font-bold border rounded-xl transition-colors uppercase ${isLight
                      ? "bg-white text-black border-neutral-300 focus:border-[#1F4E79] placeholder:text-neutral-500"
                      : "bg-black text-white border-neutral-700 focus:border-[#3b82f6] placeholder:text-neutral-500"
                    }`}
                />
                <button
                  onClick={() => {
                    if (pincode.length === 6) {
                      setIsCheckingPincode(true);
                      setTimeout(() => {
                        setIsCheckingPincode(false);
                        setPincodeChecked(true);
                      }, 400);
                    }
                  }}
                  disabled={pincode.length !== 6 || isCheckingPincode}
                  className={`absolute right-1.5 text-[10px] font-black tracking-wider uppercase px-3.5 py-1.5 rounded-lg transition-all ${pincode.length === 6
                      ? (isLight ? "bg-[#1F4E79] text-white hover:bg-black cursor-pointer shadow-sm" : "bg-[#3b82f6] text-white hover:bg-white hover:text-black shadow-sm")
                      : "text-neutral-500 bg-neutral-200 dark:bg-neutral-800 opacity-50 cursor-not-allowed"
                    }`}
                >
                  {isCheckingPincode ? "CHECKING..." : pincodeChecked ? "CHANGE" : "CHECK"}
                </button>
              </div>

              {/* Prominent Estimated Delivery Date */}
              <div className="space-y-1.5 pt-1">
                <span className={`text-[10px] font-black uppercase tracking-wider block ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>
                  Estimated Delivery
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <span className={`text-sm font-black tracking-wide uppercase px-3 py-1.5 rounded-lg ${isLight
                      ? "bg-emerald-100/90 text-emerald-950 border border-emerald-300"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}>
                    Tomorrow – Saturday
                  </span>
                </div>
              </div>

              {/* Clean Feature List */}
              <div className={`pt-3 border-t space-y-2 text-[11px] font-black ${isLight ? "border-neutral-300 text-black" : "border-neutral-800 text-white"
                }`}>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                  <span>COD Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                  <span>Easy Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                  <span>Free Shipping above ₹999</span>
                </div>
              </div>
            </div>

            {/* BEST OFFERS Clean Cards */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2">
                <Tag className={`w-4 h-4 ${isLight ? "text-[#1F4E79]" : "text-[#3b82f6]"}`} />
                <span className={`text-xs font-black tracking-wider uppercase ${isLight ? "text-black" : "text-white"}`}>
                  Best Offers
                </span>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 ${isLight
                  ? "bg-[#F4F4F2] border-neutral-300 text-black"
                  : "bg-neutral-900/60 border-neutral-800 text-white"
                }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg sm:text-xl font-black uppercase tracking-tight ${isLight ? "text-black" : "text-white"}`}>
                      ₹150 OFF
                    </span>
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                      LIMITED OFFER
                    </span>
                  </div>
                  <p className={`text-[11px] font-bold ${isLight ? "text-neutral-700" : "text-neutral-300"}`}>
                    Use code <strong className={`font-mono font-black tracking-wider underline px-1.5 py-0.5 rounded ${isLight ? "text-black" : "text-white"}`}>ONLYDENIMS150</strong> on orders above ₹999
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText("ONLYDENIMS150");
                    setCopiedCoupon(true);
                    showToast({
                      title: "COUPON COPIED",
                      message: "Code ONLYDENIMS150 copied! Use at checkout for ₹150 OFF.",
                      type: "info",
                    });
                    setTimeout(() => setCopiedCoupon(false), 2000);
                  }}
                  className={`group relative px-4 py-2.5 text-[10px] font-black tracking-wider uppercase border rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-2 shrink-0 ${isLight
                      ? "border-neutral-400 text-black hover:border-[#C9A063] hover:bg-[#C9A063] hover:text-black hover:shadow-[0_0_15px_rgba(201,160,99,0.35)]"
                      : "border-neutral-700 text-white hover:border-[#3b82f6] hover:bg-[#3b82f6] hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.35)]"
                    }`}
                >
                  <Copy className="w-3.5 h-3.5 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
                  <span>{copiedCoupon ? "COPIED!" : "COPY"}</span>
                </button>
              </div>
            </div>

            {/* Accordion Specification Menus with 16px Divider Spacing */}
            <div className="mt-8 space-y-4">

              {/* Product Specifications Accordion / Grid */}
              <div className={`border-t pt-4 ${isLight ? "border-neutral-300" : "border-neutral-800"}`}>
                <button
                  onClick={() => toggleSection("details")}
                  className={`w-full py-3 flex items-center justify-between text-xs font-black uppercase tracking-wider ${isLight ? "text-black" : "text-white"
                    }`}
                >
                  <span>PRODUCT SPECIFICATIONS</span>
                  {expandedSection === "details" ? <ChevronUp className={`w-4 h-4 ${isLight ? "text-black" : "text-white"}`} /> : <ChevronDown className={`w-4 h-4 ${isLight ? "text-black" : "text-white"}`} />}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSection === "details" ? "max-h-[400px] pb-5 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                    <div className={`p-3.5 rounded-xl border space-y-1.5 ${isLight ? "bg-[#F4F4F2] border-neutral-300" : "bg-neutral-900/60 border-neutral-800"
                      }`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🧵</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>Fabric</span>
                      </div>
                      <span className={`font-black text-xs block pl-5 ${isLight ? "text-black" : "text-white"}`}>Premium Cotton Denim</span>
                    </div>
                    <div className={`p-3.5 rounded-xl border space-y-1.5 ${isLight ? "bg-[#F4F4F2] border-neutral-300" : "bg-neutral-900/60 border-neutral-800"
                      }`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">↔</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>Stretch</span>
                      </div>
                      <span className={`font-black text-xs block pl-5 ${isLight ? "text-black" : "text-white"}`}>2% Elastane</span>
                    </div>
                    <div className={`p-3.5 rounded-xl border space-y-1.5 ${isLight ? "bg-[#F4F4F2] border-neutral-300" : "bg-neutral-900/60 border-neutral-800"
                      }`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">📏</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>Fit</span>
                      </div>
                      <span className={`font-black text-xs block pl-5 ${isLight ? "text-black" : "text-white"}`}>{fitTag || "Straight"}</span>
                    </div>
                    <div className={`p-3.5 rounded-xl border space-y-1.5 ${isLight ? "bg-[#F4F4F2] border-neutral-300" : "bg-neutral-900/60 border-neutral-800"
                      }`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">📍</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>Rise</span>
                      </div>
                      <span className={`font-black text-xs block pl-5 ${isLight ? "text-black" : "text-white"}`}>Mid Rise</span>
                    </div>
                    <div className={`p-3.5 rounded-xl border space-y-1.5 ${isLight ? "bg-[#F4F4F2] border-neutral-300" : "bg-neutral-900/60 border-neutral-800"
                      }`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🔒</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>Closure</span>
                      </div>
                      <span className={`font-black text-xs block pl-5 ${isLight ? "text-black" : "text-white"}`}>Button + Zip</span>
                    </div>
                    <div className={`p-3.5 rounded-xl border space-y-1.5 ${isLight ? "bg-[#F4F4F2] border-neutral-300" : "bg-neutral-900/60 border-neutral-800"
                      }`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🧺</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>Wash Care</span>
                      </div>
                      <span className={`font-black text-xs block pl-5 ${isLight ? "text-black" : "text-white"}`}>Machine Wash</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ⭐ Why You'll Love It Section */}
              <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 select-none ${isLight
                  ? "bg-[#F4F4F2] border-neutral-300 text-black"
                  : "bg-neutral-900/60 border-neutral-800 text-white"
                }`}>
                <div className="flex items-center gap-2 border-b pb-3 border-foreground/10">
                  <Sparkles className={`w-4 h-4 ${isLight ? "text-[#1F4E79]" : "text-[#3b82f6]"}`} />
                  <h4 className={`text-xs font-black tracking-[0.2em] uppercase ${isLight ? "text-black" : "text-white"}`}>
                    Why You&apos;ll Love It
                  </h4>
                </div>

                <ul className="space-y-2.5 text-xs font-bold">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                    <span>Crafted from premium cotton denim</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                    <span>Softens beautifully with every wash</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                    <span>Reinforced stitching for everyday durability</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                    <span>Tailored fit with all-day comfort</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                    <span>Designed and made in India</span>
                  </li>
                </ul>
              </div>

              {/* Shipping & Delivery Accordion */}
              <div>
                <button
                  onClick={() => toggleSection("shipping")}
                  className="w-full py-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--foreground)]"
                >
                  <span>SHIPPING & DELIVERY</span>
                  {expandedSection === "shipping" ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSection === "shipping" ? "max-h-[200px] pb-5 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="flex items-start gap-3 text-xs text-neutral-500 leading-relaxed">
                    <Truck className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[var(--foreground)] uppercase text-[10px] tracking-wider mb-1">EXPRESS SHIPPING</p>
                      <p className="text-[11px] text-neutral-400">Guaranteed dispatch within 24 hours. Transit time ranges from 3-5 business days across metropolitan districts.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Care Guide Accordion */}
              <div>
                <button
                  onClick={() => toggleSection("care")}
                  className="w-full py-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--foreground)]"
                >
                  <span>GARMENT CARE GUIDE</span>
                  {expandedSection === "care" ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSection === "care" ? "max-h-[200px] pb-5 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="flex items-start gap-3 text-xs text-neutral-500 leading-relaxed">
                    <RotateCcw className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[var(--foreground)] uppercase text-[10px] tracking-wider mb-1">WASH INSTRUCTIONS</p>
                      <p className="text-[11px] text-neutral-400">To preserve color depth and stiff selvedge feel, cold wash inside out with similar colors. Avoid bleaching. Hang dry in shade.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Related Products Section */}
        {recommendations.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[var(--divider-color)]">
            <div className="flex flex-col items-center justify-center mb-12">
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.4em] text-neutral-400 dark:text-neutral-500">
                DISCOVER MORE
              </span>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl uppercase tracking-[0.1em] text-[var(--foreground)]">
                YOU MAY ALSO LIKE
              </h2>
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="w-12 h-px bg-[var(--divider-color)]" />
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                <div className="w-12 h-px bg-[var(--divider-color)]" />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {recommendations.filter(rec => rec && (rec.handle || rec.id)).map((rec: any, idx: number) => {
                const recPrice = rec.priceRange?.minVariantPrice;
                const recFormattedPrice = recPrice
                  ? `${recPrice.currencyCode === 'INR' ? '₹ ' : recPrice.currencyCode + ' '}${parseFloat(recPrice.amount).toLocaleString('en-IN')}`
                  : "₹ 1,850";

                const primaryUrl = rec.images?.edges?.[0]?.node?.url
                  || (Array.isArray(rec.images) ? (typeof rec.images[0] === 'string' ? rec.images[0] : rec.images[0]?.url) : null)
                  || "/raw_jeans.png";
                const secondaryUrl = rec.images?.edges?.[1]?.node?.url
                  || (Array.isArray(rec.images) ? (typeof rec.images[1] === 'string' ? rec.images[1] : rec.images[1]?.url) : null);
                const hasSecondary = Boolean(secondaryUrl);

                const recFit = getProductFit(rec).toUpperCase();
                const recWash = getProductWash(rec).toUpperCase();
                const productSlug = rec.handle || rec.id || "";
                if (!productSlug) return null;

                return (
                  <div key={rec.id || idx} className="flex flex-col group cursor-pointer">
                    <Link href={`/product/${encodeURIComponent(productSlug)}`} prefetch={false}>
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--card-bg)] border border-[var(--divider-color)] mb-4">
                        <img
                          src={primaryUrl}
                          alt={rec.title.replace(/Denims/gi, 'Denim')}
                          className={`w-full h-full object-cover transition-all duration-700 ease-out ${hasSecondary ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-[1.04]"
                            }`}
                        />
                        {hasSecondary && (
                          <img
                            src={secondaryUrl}
                            alt={`${rec.title.replace(/Denims/gi, 'Denim')} Alternate View`}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out scale-95 group-hover:scale-105"
                          />
                        )}
                        {hasSecondary && (
                          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[8px] font-black tracking-[0.2em] text-white uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            FRONT VIEW
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] tracking-[0.2em] font-extrabold text-neutral-400 uppercase">
                        {recFit} • {recWash}
                      </span>
                      <h3 className="mt-1.5 text-xs sm:text-sm font-serif tracking-wide text-[var(--foreground)] group-hover:text-amber-500 transition-colors duration-300">
                        {rec.title.replace(/Denims/gi, 'Denim')}
                      </h3>
                      <span className="mt-1 text-xs font-mono font-bold text-[var(--foreground)] block">
                        {recFormattedPrice}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Armani Exchange (A|X) Inspired High-Fashion Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[200] bg-[var(--background)]/98 backdrop-blur-3xl flex flex-col justify-between p-4 sm:p-8 select-none text-[var(--foreground)] transition-colors duration-300"
          >
            {/* Top Armani-Style Minimalist Header */}
            <div className="w-full max-w-[1700px] mx-auto flex items-center justify-between z-30 pt-2 pb-4 border-b border-[var(--border-color)]/50">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono font-extrabold tracking-[0.35em] uppercase text-[var(--foreground)]">
                  ONLY DENIMS
                </span>
                <span className="text-[var(--text-secondary)]/40">•</span>
                <span className="text-[10px] tracking-[0.25em] font-extrabold text-[var(--accent-gold,#C9A063)] uppercase">
                  {product.title.replace(/Denims/gi, 'Denim')} ({fitTag} FIT)
                </span>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-xs font-mono font-bold tracking-[0.2em] text-[var(--text-secondary)]">
                  {String(activeImageIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                </span>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2 text-[var(--foreground)] hover:opacity-60 transition-opacity cursor-pointer border-0 flex items-center justify-center"
                  aria-label="Close Lightbox"
                >
                  <X className="w-6 h-6 stroke-[1.5]" />
                </button>
              </div>
            </div>

            {/* Center High-Fashion Editorial Image Viewport */}
            <div className="relative flex-1 w-full max-w-[1700px] mx-auto flex items-center justify-center py-4 my-auto overflow-hidden">
              {/* Left Arrow */}
              {images.length > 1 && (
                <button
                  onClick={() => {
                    setIsDeepZoom(false);
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                  }}
                  className="absolute left-2 sm:left-6 z-30 p-4 text-[var(--foreground)] hover:opacity-50 transition-all duration-300 cursor-pointer hover:scale-125 border-0 bg-transparent"
                >
                  <ChevronLeft className="w-8 h-8 stroke-[1.2]" />
                </button>
              )}

              {/* Main Editorial Image Frame */}
              <div
                onMouseMove={(e) => {
                  if (!isDeepZoom) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                  const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                  setZoomPos({ x, y });
                }}
                onClick={() => setIsDeepZoom(!isDeepZoom)}
                className={`relative max-h-[86vh] max-w-[92vw] overflow-hidden rounded-none transition-all duration-300 ${isDeepZoom
                    ? "cursor-zoom-out shadow-2xl"
                    : "cursor-zoom-in"
                  }`}
              >
                <motion.img
                  key={activeImageIndex}
                  src={images[activeImageIndex]}
                  alt={product.title}
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }}
                  animate={{
                    scale: isDeepZoom ? 2.5 : 1,
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="max-h-[86vh] max-w-[92vw] object-contain drop-shadow-xl select-none rounded-none"
                />
              </div>

              {/* Right Arrow */}
              {images.length > 1 && (
                <button
                  onClick={() => {
                    setIsDeepZoom(false);
                    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-2 sm:right-6 z-30 p-4 text-[var(--foreground)] hover:opacity-50 transition-all duration-300 cursor-pointer hover:scale-125 border-0 bg-transparent"
                >
                  <ChevronRight className="w-8 h-8 stroke-[1.2]" />
                </button>
              )}
            </div>

            {/* Bottom Armani Minimal Strip */}
            <div className="w-full max-w-[1700px] mx-auto flex items-center justify-center gap-3 overflow-x-auto pt-3 pb-1 z-30 border-t border-[var(--border-color)]/50">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-12 h-16 sm:w-14 sm:h-18 rounded-none overflow-hidden transition-all duration-300 cursor-pointer border ${activeImageIndex === idx
                      ? "border-[var(--foreground)] opacity-100 scale-105"
                      : "border-[var(--border-color)] opacity-40 hover:opacity-80"
                    }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover rounded-none" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      <SizeGuideDrawer
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        defaultFit={fitTag}
      />
    </div>
  );
}
