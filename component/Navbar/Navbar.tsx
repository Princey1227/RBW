"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Menu, X, ShoppingBag, Search, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useTheme } from "../../app/theme-provider";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import Logo from "../Logo";
import axios from "axios";

import AnnouncementBar from "./AnnouncementBar";
import DesktopNav from "./DesktopNav";
import RbwNavbarCategorySelector from "./RbwNavbarCategorySelector";
import ThemeToggle from "./ThemeToggle";
import SearchOverlay from "./SearchOverlay";
import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";
import KwikpassLoginModal from "../KwikpassLoginModal";

export default function Navbar() {
  const env = (process.env.NEXT_PUBLIC_GOKWIK_ENV || "").toLowerCase();
  const host = env === "sandbox" ? "sandbox.pdp.gokwik.co" : "pdp.gokwik.co";

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const { showToast } = useToast();
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false);
  const brandsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        brandsDropdownRef.current &&
        !brandsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBrandsDropdownOpen(false);
      }
    };

    if (isBrandsDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBrandsDropdownOpen]);

  useEffect(() => {
    const handleToggleNav = () => setIsOpen((prev) => !prev);
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener("TOGGLE_MOBILE_NAV", handleToggleNav);
    window.addEventListener("OPEN_SEARCH_OVERLAY", handleOpenSearch);
    return () => {
      window.removeEventListener("TOGGLE_MOBILE_NAV", handleToggleNav);
      window.removeEventListener("OPEN_SEARCH_OVERLAY", handleOpenSearch);
    };
  }, []);

  const NAVBAR_BRANDS = [
    {
      name: "RBW",
      tagline: "Premium Everyday Denim",
      href: "/stores/rbw",
      isLive: true,
      badge: "LIVE",
    },
    {
      name: "BRAND TEMPLATE",
      tagline: "Turnkey Brand Outlet Demo",
      href: "/stores/template",
      isLive: true,
      badge: "DEMO",
    },
    {
      name: "THINC",
      tagline: "Minimal. Modern. Made for You.",
      href: "#",
      isLive: false,
      badge: "COMING SOON",
    },
    {
      name: "WIDE",
      tagline: "Loose Fit. Big Attitude.",
      href: "#",
      isLive: false,
    },
    {
      name: "IJNS",
      tagline: "Young. Bold. Expressive.",
      href: "#",
      isLive: false,
    },
    {
      name: "SECOND ARMY",
      tagline: "Utility Meets Street.",
      href: "#",
      isLive: false,
    },
  ];

  const handleBrandClickNav = (b: typeof NAVBAR_BRANDS[0]) => {
    setIsBrandsDropdownOpen(false);
    if (!b.isLive) {
      showToast({
        title: `${b.name} • Coming Soon`,
        message: `${b.tagline} — Launching soon on ONLY DENIMS.`,
        type: "info",
        duration: 3500,
      });
    }
  };

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-close search on route change
  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    if (isSearchOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  // Cart
  const { cart, setIsOpen: setCartOpen, wishlist, updateBuyerIdentity } = useCart();
  const totalCartItems =
    cart?.lines.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const subtotal =
    cart?.lines.reduce((acc, item) => {
      const price = parseFloat(item.merchandise.price?.amount || "0");
      return acc + price * item.quantity;
    }, 0) || 0;

  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [isKwikpassModalOpen, setIsKwikpassModalOpen] = useState(false);

  const triggerKwikpassLogin = () => {
    console.log("[KwikPass Debug] triggerKwikpassLogin invoked. Opening custom Headless KwikPass Modal...");
    setIsKwikpassModalOpen(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("kpToken");
    if (token) {
      setIsLoggedIn(true);
      const cachedCustomer = localStorage.getItem("shopifyCustomer");
      if (cachedCustomer) setCustomerInfo(JSON.parse(cachedCustomer));

      axios
        .post("/api/auth/kwikpass-verify", { kpToken: token })
        .then((res) => {
          if (res.data?.success) {
            localStorage.setItem(
              "shopifyCustomer",
              JSON.stringify(res.data.customer)
            );
            setCustomerInfo(res.data.customer);
          }
        })
        .catch((err) =>
          console.error("Error refreshing customer profile:", err)
        );
    }

    // KwikPass SDK script is now loaded declaratively via Next.js <Script> component in JSX

    const hideGoKwikIframes = () => {
      if (typeof document === "undefined") return;
      const searchAndHide = (root: Document | ShadowRoot | Element) => {
        if (root instanceof HTMLIFrameElement) {
          try {
            const src = root.src || "";
            const id = root.id || "";
            if (
              src.includes("gokwik.co") ||
              src.includes("kwikpass") ||
              id === "iframe-kp" ||
              id === "iframe-kf" ||
              id === "gokwik-iframe"
            ) {
              root.style.setProperty("display", "none", "important");
              let parent = root.parentElement;
              while (parent && parent !== document.body) {
                parent.style.setProperty("display", "none", "important");
                parent = parent.parentElement;
              }
            }
          } catch (e) {
            console.error("Error in iframe matching:", e);
          }
        }
        const children = root.children;
        if (children) {
          for (let i = 0; i < children.length; i++) {
            searchAndHide(children[i]);
          }
        }
        if (root instanceof HTMLElement && root.shadowRoot) {
          searchAndHide(root.shadowRoot);
        }
      };
      searchAndHide(document.body);
      const ids = ["iframe-kp", "iframe-kf", "gokwik-iframe"];
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.setProperty("display", "none", "important");
      });
    };

    const handleKwikpassMessage = async (event: any) => {
      const data = event?.detail || event?.details;
      const kpToken = data?.kpToken || data;
      const isLogout = data?.kpLogout || event?.detail?.kpLogout;

      if (kpToken && typeof kpToken === "string") {
        hideGoKwikIframes();
        localStorage.setItem("kpToken", kpToken);
        try {
          localStorage.removeItem("kp_logged_out");
        } catch (e) { }
        setIsLoggedIn(true);
        try {
          const res = await axios.post("/api/auth/kwikpass-verify", {
            kpToken,
          });
          if (res.data?.success) {
            localStorage.setItem(
              "shopifyCustomer",
              JSON.stringify(res.data.customer)
            );
            setCustomerInfo(res.data.customer);
            if (typeof updateBuyerIdentity === "function") {
              updateBuyerIdentity(res.data.customer);
            }
            window.dispatchEvent(new Event("customer-update"));
            window.dispatchEvent(new Event("storage"));
          }
        } catch (err) {
          console.error("Failed to sync customer with Shopify:", err);
        }
      }

      if (isLogout) {
        console.log("KwikPass SDK triggered logout message event. Starting full cleanup...");
        try {
          localStorage.setItem("kp_logged_out", "true");
        } catch (e) { }
        localStorage.removeItem("kpToken");
        localStorage.removeItem("shopifyCustomer");
        localStorage.removeItem("onlydenims_wishlist");

        // Complete cleanup of KwikPass/GoKwik keys in storage to prevent session stickiness
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.toUpperCase().includes("KWIK") || key.toUpperCase().includes("GOKWIK"))) {
              localStorage.removeItem(key);
              i--;
            }
          }
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (key.toUpperCase().includes("KWIK") || key.toUpperCase().includes("GOKWIK"))) {
              sessionStorage.removeItem(key);
              i--;
            }
          }
        } catch (storageErr) {
          console.error("Failed to clean up storage keys on SDK logout event:", storageErr);
        }

        // Clear KwikPass/GoKwik first-party cookies on onlydenims.com
        try {
          const cookies = document.cookie.split(";");
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
            const upperName = name.toUpperCase();
            if (upperName.includes("KWIK") || upperName.includes("GOKWIK") || upperName.includes("KP_")) {
              document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
              document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
              const hostParts = window.location.hostname.split(".");
              if (hostParts.length > 2) {
                const mainDomain = hostParts.slice(-2).join(".");
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + mainDomain;
              }
            }
          }
        } catch (cookieErr) {
          console.error("Failed to clear KwikPass cookies on SDK logout event:", cookieErr);
        }

        // Clear KwikPass/GoKwik IndexedDB databases on onlydenims.com
        try {
          if (window.indexedDB && typeof window.indexedDB.databases === "function") {
            window.indexedDB.databases().then((dbs) => {
              dbs.forEach((db) => {
                if (db.name && (db.name.toUpperCase().includes("KWIK") || db.name.toUpperCase().includes("GOKWIK"))) {
                  window.indexedDB.deleteDatabase(db.name);
                }
              });
            });
          }
        } catch (idbErr) {
          console.error("Failed to clean up KwikPass IndexedDB on SDK logout event:", idbErr);
        }

        setIsLoggedIn(false);
        setCustomerInfo(null);
        setShowDropdown(false);
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("customer-update"));

        const inst = (window as any).__KP_LOGIN_SDK_INSTANCE__ || (window as any).KP_LOGIN_SDK_INSTANCE;
        if (inst && typeof inst.handleKPLogout === "function") {
          try {
            inst.handleKPLogout();
          } catch (err) {
            console.error("KwikPass handleKPLogout error during SDK logout event:", err);
          }
        }

        // 1.5 second timeout to allow SDK asynchronous cleanups and postMessage to finalize before page redirects
        setTimeout(() => {
          console.log("Redirecting to homepage after SDK logout event");
          window.location.href = "/";
        }, 1500);
      }
    };

    const handleFormMessage = async (event: MessageEvent) => {
      const sandboxOrigin = "https://sandbox.pdp.gokwik.co";
      const prodOrigin = "https://pdp.gokwik.co";
      if (
        event.origin === sandboxOrigin ||
        event.origin === prodOrigin
      ) {
        if (event.data?.type === "kf:submitted") {
          hideGoKwikIframes();
          const formData = event.data?.data;
          if (formData) {
            const kpToken = formData.kpToken || formData.token;
            const phone =
              formData.phone ||
              formData.address?.recipient_phone ||
              formData.address?.phone;
            const email = formData.email || formData.address?.email;
            let firstName =
              formData.firstName || formData.address?.first_name || "";
            let lastName =
              formData.lastName || formData.address?.last_name || "";
            if (!firstName && formData.name) {
              const parts = formData.name.trim().split(/\s+/);
              firstName = parts[0] || "";
              lastName = parts.slice(1).join(" ") || "";
            }
            if (kpToken || phone || email) {
              localStorage.setItem(
                "kpToken",
                kpToken || `mock_token_${Date.now()}`
              );
              try {
                localStorage.removeItem("kp_logged_out");
              } catch (e) { }
              setIsLoggedIn(true);
              try {
                const res = await axios.post("/api/auth/kwikpass-verify", {
                  kpToken,
                  phone,
                  email,
                  firstName,
                  lastName,
                });
                if (res.data?.success) {
                  localStorage.setItem(
                    "shopifyCustomer",
                    JSON.stringify(res.data.customer)
                  );
                  setCustomerInfo(res.data.customer);
                  if (typeof updateBuyerIdentity === "function") {
                    updateBuyerIdentity(res.data.customer);
                  }
                  setShowDropdown(true);
                }
              } catch (err) {
                console.error(
                  "Failed to sync customer on KwikForm submit:",
                  err
                );
              }
            }
          }
        }
      }
    };

    const handleSsoButtonEvent = (event: any) => {
      console.log("sso-button-event fired:", event);
    };

    (window as any).triggerKwikpassLogin = triggerKwikpassLogin;

    const handleOpenLoginModal = () => {
      triggerKwikpassLogin();
    };

    window.addEventListener(
      "kp_data_sent",
      handleKwikpassMessage as EventListener
    );
    window.addEventListener(
      "kp-data-sent",
      handleKwikpassMessage as EventListener
    );
    window.addEventListener(
      "kwikpass-sso",
      handleKwikpassMessage as EventListener
    );
    window.addEventListener(
      "sso-button-event",
      handleSsoButtonEvent as EventListener
    );
    window.addEventListener(
      "message",
      handleFormMessage as unknown as EventListener
    );
    window.addEventListener("open-login-modal", handleOpenLoginModal);

    if (sessionStorage.getItem("triggerKwikPass") === "true") {
      sessionStorage.removeItem("triggerKwikPass");
      setTimeout(() => {
        triggerKwikpassLogin();
      }, 1000);
    }

    return () => {
      window.removeEventListener("open-login-modal", handleOpenLoginModal);
      try {
        delete (window as any).triggerKwikpassLogin;
      } catch (e) { }
      window.removeEventListener(
        "kp_data_sent",
        handleKwikpassMessage as EventListener
      );
      window.removeEventListener(
        "kp-data-sent",
        handleKwikpassMessage as EventListener
      );
      window.removeEventListener(
        "kwikpass-sso",
        handleKwikpassMessage as EventListener
      );
      window.removeEventListener(
        "sso-button-event",
        handleSsoButtonEvent as EventListener
      );
      window.removeEventListener(
        "message",
        handleFormMessage as unknown as EventListener
      );
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const styleId = "hide-gokwik-style";
    let style = document.getElementById(styleId);

    if (isLoggedIn) {
      if (!style) {
        style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
          iframe[src*="gokwik"], 
          iframe[src*="kwikpass"], 
          #iframe-kp, 
          #iframe-kf, 
          #gokwik-iframe,
          .gk-modal,
          .gokwik-modal,
          [id*="gokwik"], 
          [class*="gokwik"], 
          [id*="kwikpass-sso"],
          [id*="kp-"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      if (style) {
        style.remove();
      }
    }

    return () => {
      const activeStyle = document.getElementById(styleId);
      if (activeStyle) activeStyle.remove();
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!showDropdown) return;
    const close = () => setShowDropdown(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [showDropdown]);

  useEffect(() => {
    if (showDropdown && !isLoggedIn) {
      setTimeout(() => {
        const inst =
          (window as any).__KP_LOGIN_SDK_INSTANCE__ ||
          (window as any).KP_LOGIN_SDK_INSTANCE;
        if (inst && typeof inst.handleKpSSOButton === "function") {
          try {
            inst.handleKpSSOButton();
          } catch (err) {
            console.error("Error triggering handleKpSSOButton:", err);
          }
        }
      }, 100);
    }
  }, [showDropdown, isLoggedIn]);

  const handleLogout = () => {
    try {
      localStorage.setItem("kp_logged_out", "true");
    } catch (e) { }
    localStorage.removeItem("kpToken");
    localStorage.removeItem("shopifyCustomer");
    localStorage.removeItem("onlydenims_wishlist");

    // Complete cleanup of KwikPass/GoKwik keys in storage to prevent session stickiness
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.toUpperCase().includes("KWIK") || key.toUpperCase().includes("GOKWIK"))) {
          localStorage.removeItem(key);
          i--;
        }
      }
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.toUpperCase().includes("KWIK") || key.toUpperCase().includes("GOKWIK"))) {
          sessionStorage.removeItem(key);
          i--;
        }
      }
    } catch (storageErr) {
      console.error("Failed to clean up KwikPass storage keys in navbar:", storageErr);
    }

    // Clear KwikPass/GoKwik first-party cookies on onlydenims.com
    try {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        const upperName = name.toUpperCase();
        if (upperName.includes("KWIK") || upperName.includes("GOKWIK") || upperName.includes("KP_")) {
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
          const hostParts = window.location.hostname.split(".");
          if (hostParts.length > 2) {
            const mainDomain = hostParts.slice(-2).join(".");
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + mainDomain;
          }
        }
      }
    } catch (cookieErr) {
      console.error("Failed to clear KwikPass cookies on navbar logout:", cookieErr);
    }

    // Clear KwikPass/GoKwik IndexedDB databases on onlydenims.com
    try {
      if (window.indexedDB && typeof window.indexedDB.databases === "function") {
        window.indexedDB.databases().then((dbs) => {
          dbs.forEach((db) => {
            if (db.name && (db.name.toUpperCase().includes("KWIK") || db.name.toUpperCase().includes("GOKWIK"))) {
              window.indexedDB.deleteDatabase(db.name);
            }
          });
        });
      }
    } catch (idbErr) {
      console.error("Failed to clean up KwikPass IndexedDB on navbar logout:", idbErr);
    }

    setIsLoggedIn(false);
    setCustomerInfo(null);
    setShowDropdown(false);
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("customer-update"));

    const inst = (window as any).__KP_LOGIN_SDK_INSTANCE__ || (window as any).KP_LOGIN_SDK_INSTANCE;
    console.log("KwikPass SDK logout debug in navbar:", {
      instanceExists: !!inst,
      hasHandleKPLogout: inst ? typeof inst.handleKPLogout : "undefined",
      keys: inst ? Object.keys(inst) : []
    });

    if (inst && typeof inst.handleKPLogout === "function") {
      try {
        console.log("Invoking KwikPass handleKPLogout() in navbar");
        inst.handleKPLogout();
      } catch (err) {
        console.error("KwikPass handleKPLogout error in navbar:", err);
      }
    } else {
      console.warn("KwikPass handleKPLogout function was NOT found or is not a function in navbar!");
    }

    // 1.5 second timeout to allow SDK asynchronous cleanups and postMessage to finalize before page redirects
    setTimeout(() => {
      console.log("Redirecting to homepage after navbar logout");
      window.location.href = "/";
    }, 1500);
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    setMounted(true);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isStorePage =
    pathname?.startsWith("/stores") ||
    pathname?.startsWith("/shop") ||
    pathname?.startsWith("/product") ||
    pathname?.startsWith("/jackets") ||
    pathname?.startsWith("/shorts") ||
    pathname?.startsWith("/accessories");
  const isExperienceCentrePage = pathname === "/experience-center" || pathname === "/experience-center/";
  const isMainHomePage = !isStorePage;
  const isRbwStorePage = isStorePage;

  return (
    <>
      <Script id="kwikpass-init" strategy="afterInteractive">
        {`
          window.merchantInfo = {
            mid: "${process.env.NEXT_PUBLIC_GOKWIK_MERCHANT_ID}",
            environment: "${env}",
            type: "merchantInfo",
            integrationType: "CUSTOM_HEADLESS"
          };
          window.KwikPass = window.merchantInfo;
          window.kwikpassConfig = window.merchantInfo;
          window.getCustomerId = window.getCustomerId || (() => null);
          window.getThemeId = window.getThemeId || (() => 161793409314);
          window.__KP_LOGIN_SDK_INSTANCE__ = window.__KP_LOGIN_SDK_INSTANCE__ || {};
          window.__KP_LOGIN_SDK_INSTANCE__.logEvents = window.__KP_LOGIN_SDK_INSTANCE__.logEvents || function(event){
            window.kpqueue = window.kpqueue || [];
            window.kpqueue.push(event);
          };
          try {
            sessionStorage.setItem("KF_ASSET_PROPERTIES", JSON.stringify({ status: true }));
          } catch(e) {}
        `}
      </Script>
      <Script
        id="gokwik-custom-merchant-script"
        src={`https://${host}/kwikpass/plugin/build/kp-custom-merchant.js`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log("KwikPass SDK loaded successfully via next/script!");
          try {
            window.dispatchEvent(new Event("DOMContentLoaded"));
            document.dispatchEvent(new Event("DOMContentLoaded"));
          } catch (e) { }
          window.dispatchEvent(new CustomEvent("kp-script-loaded"));
          const inst = (window as any).__KP_LOGIN_SDK_INSTANCE__;
          if (inst && typeof inst.handleKpSSOButton === "function") {
            inst.handleKpSSOButton();
          }
        }}
      />

      {!isMainHomePage && (
        <AnnouncementBar isScrolled={isScrolled} isRbwStore={isRbwStorePage} />
      )}

      <nav
        style={{
          transform: "translate3d(0, 0, 0)",
        }}
        className={`w-full px-3 sm:px-8 md:px-12 lg:px-14 transition-all duration-500 ease-in-out font-sans pointer-events-auto ${isExperienceCentrePage
            ? `${isScrolled
              ? "fixed top-0 left-0 z-[100] h-[48px] sm:h-[58px] max-xl:hidden xl:bg-[#FAF8F5]/92 backdrop-blur-md border-b border-[#241F1D]/10 shadow-sm xl:text-[#17140F]"
              : "absolute top-0 left-0 z-[100] h-[54px] sm:h-[64px] max-xl:hidden xl:bg-transparent xl:text-[#17140F]"
            }`
            : isMainHomePage
              ? `${isScrolled
                ? "fixed top-0 left-0 z-[100] h-[48px] sm:h-[52px] max-xl:bg-[#0D0B0A] max-xl:text-white xl:bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#241F1D]/10 shadow-sm"
                : "relative z-[100] h-[54px] sm:h-[62px] max-xl:bg-[#0D0B0A] max-xl:text-white xl:bg-[#FAF8F5] xl:text-[#1C1917]"
              }`
              : `fixed left-0 z-[100] max-xl:bg-[#0D0B0A] max-xl:text-white max-xl:border-b max-xl:border-white/10 ${theme === "light"
                ? "xl:bg-white xl:border-b xl:border-[var(--border-color)] xl:text-black"
                : "xl:bg-black xl:border-b xl:border-[var(--border-color)] xl:text-white"
              } ${isScrolled ? "top-0 h-[48px] sm:h-[52px]" : "top-[35px] h-[68px]"}`
          }`}
      >
        <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between h-full relative py-2">

          {/* Mobile & Tablet hamburger button */}
          <div className="flex xl:hidden z-10 pointer-events-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none transition-colors opacity-90 hover:opacity-100 max-xl:text-white text-[var(--foreground)]"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              )}
            </button>
          </div>

          {/* Navigation links: Platform links on main homepage vs E-commerce links on store pages */}
          {isMainHomePage ? (
            <div
              className={`hidden xl:flex items-center gap-3.5 2xl:gap-7 tracking-[0.14em] xl:tracking-[0.18em] 2xl:tracking-[0.24em] z-30 ${isExperienceCentrePage
                  ? "text-[10px] xl:text-[10.5px] 2xl:text-[11.5px] font-bold text-[#0D0B0A]"
                  : "text-[9.5px] xl:text-[10px] 2xl:text-[11px] font-medium text-[#241F1D]/85"
                }`}
            >

              {/* Brands Dropdown Item with Chevron Arrow */}
              <div ref={brandsDropdownRef} className="relative py-2 z-50">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsBrandsDropdownOpen((prev) => !prev);
                  }}
                  className={`flex items-center gap-1.5 transition-colors duration-300 uppercase focus:outline-none cursor-pointer ${isExperienceCentrePage
                      ? "text-[#0D0B0A] hover:text-black font-bold"
                      : "hover:text-[#241F1D]"
                    }`}
                >
                  BRANDS
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${isBrandsDropdownOpen
                        ? "rotate-180 text-[#1C1917]"
                        : isExperienceCentrePage
                          ? "text-[#0D0B0A] stroke-[2.2]"
                          : "text-[#78716C]"
                      }`}
                  />
                </button>

                {/* Dropdown Menu Popup */}
                {isBrandsDropdownOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full left-0 w-[275px] bg-[#FDFBF7] border border-[#E8E3DA] rounded-2xl shadow-2xl p-3 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="px-3 py-1.5 text-[9px] font-bold tracking-[0.22em] text-[#78716C] uppercase border-b border-[#E8E3DA]">
                      FEATURED STORES
                    </div>

                    <div className="py-1 flex flex-col gap-0.5">
                      {NAVBAR_BRANDS.map((b) =>
                        b.isLive ? (
                          <Link
                            key={b.name}
                            href={b.href}
                            prefetch={false}
                            onClick={() => setIsBrandsDropdownOpen(false)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-[#1C1917] bg-[#F7F3EC]/80 hover:bg-[#F2EBDC] transition-all text-left group border border-[#EBE5DB]"
                          >
                            <span className="font-extrabold tracking-wide text-[#1C1917]">{b.name}</span>
                            <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-[#059669] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                              {b.badge || "LIVE"}
                            </span>
                          </Link>
                        ) : (
                          <button
                            key={b.name}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleBrandClickNav(b);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-stone-100/70 transition-colors text-left cursor-pointer"
                          >
                            <span className="text-xs font-semibold text-stone-400">{b.name}</span>
                            <span className="text-[8px] font-bold text-stone-400 bg-stone-200/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              COMING SOON
                            </span>
                          </button>
                        )
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E8E3DA] mt-0.5 text-center">
                      <a
                        href="#explore-brands"
                        onClick={() => setIsBrandsDropdownOpen(false)}
                        className="text-[9.5px] font-bold tracking-widest text-[#1C1917] hover:text-black uppercase flex items-center justify-center gap-1 py-1"
                      >
                        EXPLORE ALL BRANDS →
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <Link
                href="/about"
                prefetch={false}
                className={`transition-colors duration-300 uppercase whitespace-nowrap ${isExperienceCentrePage
                    ? "text-[#0D0B0A] hover:text-black font-bold"
                    : "hover:text-[#241F1D]"
                  }`}
              >
                ABOUT US
              </Link>
              <Link
                href="/blog"
                prefetch={false}
                className={`transition-colors duration-300 uppercase whitespace-nowrap ${isExperienceCentrePage
                    ? "text-[#0D0B0A] hover:text-black font-bold"
                    : "hover:text-[#241F1D]"
                  }`}
              >
                BLOG
              </Link>
              <Link
                href="/experience-center"
                prefetch={false}
                className={`transition-colors duration-300 uppercase whitespace-nowrap ${isExperienceCentrePage
                    ? "text-[#0D0B0A] hover:text-black font-bold"
                    : "hover:text-[#241F1D]"
                  }`}
              >
                EXPERIENCE CENTER
              </Link>
            </div>
          ) : (
            <div className="hidden xl:flex items-center gap-2 xl:gap-2.5 z-20">
              <Link
                href="/"
                prefetch={false}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] xl:text-[10.5px] font-bold tracking-wider uppercase transition-all duration-300 group shadow-2xs whitespace-nowrap shrink-0 ${pathname?.startsWith("/stores/rbw") || pathname?.startsWith("/stores/template")
                    ? "border border-zinc-300 hover:border-zinc-700 text-zinc-800 bg-white/80 hover:bg-white"
                    : "border border-foreground/20 hover:border-foreground/60 text-foreground/80 hover:text-foreground bg-foreground/5 hover:bg-foreground/10"
                  }`}
                title="Return to ONLY DENIMS Homepage"
              >
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform text-[#B9965A]" />
                <span>ONLY DENIMS</span>
              </Link>
              {pathname === "/stores/rbw" || pathname === "/stores/rbw/preview-3d" ? (
                <>
                  <div className="h-3.5 w-[1px] bg-zinc-300/80 mx-1 shrink-0" />
                  <RbwNavbarCategorySelector />
                </>
              ) : pathname?.startsWith("/stores/template") ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[9.5px] font-black tracking-widest text-[#B9965A] uppercase">
                  <span>BRAND TEMPLATE DEMO</span>
                </div>
              ) : (
                <>
                  <div className="h-3.5 w-[1px] bg-foreground/20 mx-0.5" />
                  <DesktopNav />
                </>
              )}
            </div>
          )}

          {/* Right icons: Shown on store pages (desktop) and ALWAYS on mobile/tablet */}
          <div className={`flex items-center gap-0.5 sm:gap-4 transition-colors duration-300 z-20 pointer-events-auto shrink-0 max-xl:text-white ${isMainHomePage ? "xl:hidden" : ""}`}>
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="relative transition-colors duration-300 p-1.5 sm:p-2 rounded-full cursor-pointer flex items-center justify-center shrink-0 max-xl:text-white hover:text-[var(--foreground)]"
              aria-label="Search Products"
            >
              <Search className="h-[19px] w-[19px] sm:h-[20px] sm:w-[20px] max-xl:text-white" />
            </button>

            {/* Cart */}
            <button
              id="header-cart-button"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-1.5 sm:gap-3 p-1.5 sm:px-4.5 sm:py-2.5 rounded-full border border-transparent xl:border-[#E8E3DA] bg-transparent xl:bg-[#FAF8F5]/80 hover:bg-foreground/5 xl:hover:bg-[#FAF8F5] transition-all duration-300 shadow-none xl:shadow-3xs cursor-pointer select-none max-xl:text-white xl:text-foreground shrink-0"
              aria-label="Shopping Cart"
            >
              {/* Bag Icon with Badge */}
              <div className="relative flex items-center justify-center pr-0 sm:pr-1.5">
                <ShoppingBag className="h-[19px] w-[19px] sm:h-[20px] sm:w-[20px] max-xl:text-white" />
                {totalCartItems > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 font-sans flex items-center justify-center rounded-full bg-[#B9965A] text-white"
                    style={{
                      width: "15px",
                      height: "15px",
                      fontSize: "8.5px",
                      fontWeight: "bold",
                    }}
                  >
                    {totalCartItems}
                  </span>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="hidden sm:block w-[1px] h-7 bg-[#E8E3DA]" />

              {/* Price & Items Details */}
              <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
                <span className="font-sans text-[12px] sm:text-[13px] font-extrabold text-foreground">
                  ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="font-sans text-[9.5px] sm:text-[10px] text-neutral-500 font-medium">
                  {totalCartItems} {totalCartItems === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Dropdown Arrow */}
              <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-neutral-500 pl-0.5" />
            </button>
          </div>

          {/* On platform header, place OUR JOURNEY, CONTACT & LOGIN on far right side for desktop */}
          {isMainHomePage && (
            <div
              className={`hidden xl:flex items-center justify-end gap-3 2xl:gap-6 tracking-[0.14em] xl:tracking-[0.18em] 2xl:tracking-[0.24em] z-20 ${isExperienceCentrePage
                  ? "text-[10px] xl:text-[10.5px] 2xl:text-[11.5px] font-bold text-[#0D0B0A]"
                  : "text-[9.5px] xl:text-[10px] 2xl:text-[11px] font-medium text-[#241F1D]/85"
                }`}
            >
              <Link
                href="/journey"
                prefetch={false}
                className={`transition-colors duration-300 uppercase whitespace-nowrap ${isExperienceCentrePage
                    ? "text-[#0D0B0A] hover:text-black font-bold"
                    : "hover:text-[#241F1D]"
                  }`}
              >
                OUR JOURNEY
              </Link>
              <Link
                href="/contact"
                prefetch={false}
                className={`transition-colors duration-300 uppercase whitespace-nowrap ${isExperienceCentrePage
                    ? "text-[#0D0B0A] hover:text-black font-bold"
                    : "hover:text-[#241F1D]"
                  }`}
              >
                CONTACT
              </Link>
              <Link
                href="/returns"
                prefetch={false}
                className={`transition-colors duration-300 uppercase whitespace-nowrap ${isExperienceCentrePage
                    ? "text-[#0D0B0A] hover:text-black font-bold"
                    : "hover:text-[#241F1D]"
                  }`}
              >
                RETURNS
              </Link>

              {/* User Login Menu on ONLY DENIMS main platform */}
              <div className={isExperienceCentrePage ? "font-bold text-[#0D0B0A]" : ""}>
                <UserMenu
                  isLoggedIn={isLoggedIn}
                  showDropdown={showDropdown}
                  mounted={mounted}
                  theme="light"
                  customerInfo={customerInfo}
                  wishlistCount={wishlist.length}
                  onUserClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                  onCloseDropdown={() => setShowDropdown(false)}
                  onLogout={handleLogout}
                  onLoginClick={triggerKwikpassLogin}
                />
              </div>

              {/* Experience Centre Shopping Bag */}
              {isExperienceCentrePage && (
                <button
                  id="experience-center-cart-badge"
                  onClick={() => setCartOpen(true)}
                  className="relative flex items-center justify-center p-1 hover:opacity-80 transition-opacity cursor-pointer ml-1 text-[#0D0B0A]"
                  aria-label="Shopping Bag"
                >
                  <ShoppingBag className="w-[18px] h-[18px] text-[#0D0B0A] stroke-[2.3]" />
                  <span
                    className="absolute -top-1 -right-1 font-sans flex items-center justify-center rounded-full bg-[#0D0B0A] text-white text-[8px] font-bold w-3.5 h-3.5"
                  >
                    {totalCartItems}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Center logo */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 z-40 pointer-events-auto ${isScrolled ? "scale-80 sm:scale-85 md:scale-90" : "scale-100 md:scale-108"
            }`}
        >
          {isRbwStorePage ? (
            <Link
              href="/stores/rbw"
              onClick={(e) => {
                setIsOpen(false);
                setIsSearchOpen(false);
                if (pathname === "/stores/rbw" || pathname === "/stores/rbw/") {
                  e.preventDefault();
                }
                if (typeof window !== "undefined") {
                  try {
                    sessionStorage.removeItem("selectedWash");
                    if (window.location.search) {
                      window.history.replaceState({}, "", "/stores/rbw");
                    }
                  } catch (err) { }
                  window.dispatchEvent(new CustomEvent("RESET_RBW_STOREFRONT"));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="pointer-events-auto block cursor-pointer"
            >
              <div className="relative w-[100px] sm:w-[122px] md:w-[138px] h-[24px] sm:h-[29px] md:h-[31px] flex items-center justify-center">
                <Image
                  src="/RBW.png"
                  alt="RBW"
                  fill
                  priority
                  unoptimized
                  className="object-contain max-xl:brightness-0 max-xl:invert xl:theme-logo-invert select-none"
                />
              </div>
            </Link>
          ) : (
            <Link
              href="/"
              className="pointer-events-auto block font-sans text-lg sm:text-xl tracking-[0.25em] font-medium text-[#141210] uppercase"
            >
              <Logo size="small" forceInvert={true} />
            </Link>
          )}
        </div>

        {/* Mobile drawer */}
        <MobileNav
          isOpen={isOpen}
          isScrolled={isScrolled}
          isLoggedIn={isLoggedIn}
          customerInfo={customerInfo}
          wishlistCount={wishlist.length}
          onClose={() => setIsOpen(false)}
          onLogout={handleLogout}
          onLoginClick={triggerKwikpassLogin}
          theme={theme}
        />
      </nav>

      {/* Search overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        isScrolled={isScrolled}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Headless KwikPass Login Modal */}
      <KwikpassLoginModal
        isOpen={isKwikpassModalOpen}
        onClose={() => setIsKwikpassModalOpen(false)}
        onSuccess={(customer) => {
          setCustomerInfo(customer);
          setIsLoggedIn(true);
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("customer-update"));
        }}
      />
    </>
  );
}
