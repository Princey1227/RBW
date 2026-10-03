"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "../theme-provider";
import { User, ShoppingBag, Heart, MapPin, Ruler, Bell, LogOut, ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import axios from "axios";

interface CustomerInfo {
  displayName?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync real customer details from Shopify / KwikPass session
  useEffect(() => {
    const handleSync = async () => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("kpToken");
      const savedCustomer = localStorage.getItem("shopifyCustomer");

      if (savedCustomer) {
        try {
          const parsed = JSON.parse(savedCustomer);
          setCustomer(parsed);
          setIsLoggedIn(true);
          setLoading(false);
        } catch (e) {
          console.error("Failed to parse customer details:", e);
        }
      } else if (!token) {
        setIsLoggedIn(false);
        setCustomer(null);
        setLoading(false);
      }

      if (token && token !== "demo_localhost_token") {
        setIsLoggedIn(true);
        try {
          const res = await axios.post("/api/auth/kwikpass-verify", { kpToken: token });
          if (res.data?.success) {
            const existingRaw = localStorage.getItem("shopifyCustomer");
            let merged = res.data.customer;
            if (existingRaw) {
              try {
                const existing = JSON.parse(existingRaw);
                const fName = res.data.customer.firstName || existing.firstName || "";
                const lName = res.data.customer.lastName || existing.lastName || "";
                const dName = (fName || lName) ? `${fName} ${lName}`.trim() : (res.data.customer.displayName || existing.displayName || "");
                merged = {
                  ...existing,
                  ...res.data.customer,
                  firstName: fName,
                  lastName: lName,
                  displayName: dName,
                  defaultAddress: res.data.customer.defaultAddress || existing.defaultAddress || null,
                  addresses: (res.data.customer.addresses && res.data.customer.addresses.length > 0) ? res.data.customer.addresses : (existing.addresses || []),
                };
              } catch (e) {
                console.error("Error merging saved profile:", e);
              }
            }
            localStorage.setItem("shopifyCustomer", JSON.stringify(merged));
            setCustomer(merged);
          }
        } catch (err) {
          console.error("Failed to verify KwikPass token on layout mount:", err);
        }
      }

      setLoading(false);
    };

    handleSync();

    window.addEventListener("storage", handleSync);
    window.addEventListener("customer-update", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("customer-update", handleSync);
    };
  }, []);

  const triggerKwikpassLogin = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("triggerKwikPass", "true");
      const customTrigger = (window as any).triggerKwikpassLogin;
      if (typeof customTrigger === "function") {
        customTrigger();
      } else {
        window.location.href = "/login";
      }
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("kp_logged_out", "true");
      } catch (e) {}
      localStorage.removeItem("kpToken");
      localStorage.removeItem("shopifyCustomer");
      localStorage.removeItem("onlydenims_wishlist");

      // Complete cleanup of KwikPass/GoKwik keys in storage to prevent session stickiness
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.toUpperCase().includes("KWIK") || key.toUpperCase().includes("GOKWIK"))) {
            localStorage.removeItem(key);
            i--; // Adjust index since we removed an item
          }
        }
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.toUpperCase().includes("KWIK") || key.toUpperCase().includes("GOKWIK"))) {
            sessionStorage.removeItem(key);
            i--; // Adjust index since we removed an item
          }
        }
      } catch (storageErr) {
        console.error("Failed to clean up KwikPass storage keys:", storageErr);
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
        console.error("Failed to clear KwikPass cookies on logout:", cookieErr);
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
        console.error("Failed to clean up KwikPass IndexedDB:", idbErr);
      }

      setIsLoggedIn(false);
      setCustomer(null);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("customer-update"));

      // Call KwikPass logout to clear session cookies/iframes
      const inst = (window as any).__KP_LOGIN_SDK_INSTANCE__ || (window as any).KP_LOGIN_SDK_INSTANCE;
      console.log("KwikPass SDK logout debug in layout:", {
        instanceExists: !!inst,
        hasHandleKPLogout: inst ? typeof inst.handleKPLogout : "undefined",
        keys: inst ? Object.keys(inst) : []
      });

      if (inst && typeof inst.handleKPLogout === "function") {
        try {
          console.log("Invoking KwikPass handleKPLogout()");
          inst.handleKPLogout();
        } catch (err) {
          console.error("KwikPass handleKPLogout error in layout:", err);
        }
      } else {
        console.warn("KwikPass handleKPLogout function was NOT found or is not a function!");
      }

      // 1.5 second timeout to allow SDK asynchronous cleanups and postMessage to finalize before page redirects
      setTimeout(() => {
        console.log("Redirecting to homepage after logout");
        window.location.href = "/";
      }, 1500);
    }
  };

  const displayName = customer?.displayName || customer?.email || customer?.phone || "Account Details";
  const firstName = customer?.firstName || (customer?.displayName ? customer.displayName.split(" ")[0] : customer?.email?.split("@")[0]) || "User";

  const navTabs = [
    { name: "Profile", href: "/account/profile", icon: User },
    { name: "Orders", href: "/account/orders", icon: ShoppingBag },
    { name: "Wishlist", href: "/account/wishlist", icon: Heart },
    { name: "Addresses", href: "/account/addresses", icon: MapPin },
    { name: "My Measurements", href: "/account/measurements", icon: Ruler },
    { name: "Notification Preference", href: "/account/notifications", icon: Bell },
  ];

  const isLight = theme === "light";

  // 1. Loading State
  if (loading) {
    return (
      <div className={`min-h-screen pt-[140px] pb-24 flex flex-col items-center justify-center font-sans ${isLight ? "bg-white text-black" : "bg-black text-white"
        }`}>
        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4 ${isLight ? "border-[#1F4E79]" : "border-[#3b82f6]"
          }`} />
        <span className="text-[10px] font-black tracking-[0.25em] text-neutral-400 uppercase">
          Verifying Authentication...
        </span>
      </div>
    );
  }

  // 2. Unauthenticated State: Show KwikPass Authentication Gate
  if (!isLoggedIn && !customer) {
    return (
      <div className={`min-h-screen pt-[120px] pb-24 font-sans antialiased transition-colors duration-300 ${isLight ? "bg-white text-black" : "bg-black text-white"
        }`}>
        <div className="max-w-xl mx-auto px-6 py-16 text-center space-y-8 select-none">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center border ${isLight ? "border-neutral-200 bg-neutral-50 text-[#1F4E79]" : "border-neutral-800 bg-neutral-900 text-[#3b82f6]"
            }`}>
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-3">
            <span className={`text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1 rounded-full border ${isLight ? "border-[#1F4E79]/20 bg-[#1F4E79]/5 text-[#1F4E79]" : "border-[#3b82f6]/20 bg-[#3b82f6]/10 text-[#3b82f6]"
              }`}>
              Passwordless Login
            </span>
            <h1 className="font-serif text-3xl font-bold uppercase">
              Account Login Required
            </h1>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              Please authenticate using your mobile number or email to access your account profile, orders, and size measurements.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={triggerKwikpassLogin}
              className={`w-full sm:w-auto px-8 py-4 text-xs font-black tracking-[0.2em] uppercase rounded-xl transition-all shadow-lg cursor-pointer border-0 flex items-center justify-center gap-2 ${isLight
                  ? "bg-[#1F4E79] text-white hover:bg-black"
                  : "bg-[#3b82f6] text-white hover:bg-white hover:text-black"
                }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Log In via KwikPass
            </button>
            <Link
              href="/"
              className={`w-full sm:w-auto px-6 py-4 text-xs font-bold tracking-widest uppercase rounded-xl border transition-colors ${isLight
                  ? "border-neutral-200 text-black hover:border-black"
                  : "border-neutral-800 text-white hover:border-white"
                }`}
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated State: Clean 2-Column Sidebar Layout
  return (
    <div className={`min-h-screen pt-[104px] pb-24 font-sans antialiased transition-colors duration-300 ${
      isLight ? "bg-white text-black" : "bg-black text-white"
    }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10">

        {/* Profile Header Greeting */}
        <header className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 select-none border-b mb-8 ${
          isLight ? "border-neutral-200" : "border-neutral-800"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-serif shadow-md ${
              isLight ? "bg-black text-white" : "bg-white text-black"
            }`}>
              {(displayName[0] || "A").toUpperCase()}
            </div>
            <div>
              <h1 className={`font-serif text-2xl sm:text-3xl font-bold tracking-wide ${
                isLight ? "text-black" : "text-white"
              }`}>
                {displayName}
              </h1>
              <p className={`text-xs font-medium tracking-wide mt-0.5 ${
                isLight ? "text-neutral-700" : "text-neutral-400"
              }`}>
                {customer?.email || customer?.phone || "Shopify Customer Account"}
              </p>
            </div>
          </div>
        </header>

        {/* Spacious 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 md:gap-12 items-start">
          
          {/* Left Column: Sticky Container with Back-to-store link & ACCOUNT Navigation */}
          <div className="sticky top-[120px] self-start space-y-3 select-none">
            {/* Back to store Link */}
            <Link
              href="/"
              className={`inline-flex items-center gap-2 text-xs font-semibold tracking-wide transition-colors px-1 py-0.5 ${
                isLight ? "text-neutral-800 hover:text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to store</span>
            </Link>

            {/* Account Sidebar Navigation Box */}
            <aside className={`p-4 rounded-2xl border space-y-1.5 text-xs font-semibold transition-colors ${
              isLight 
                ? "bg-[#F5F5F3] border-neutral-300 text-black" 
                : "bg-neutral-900/80 border-neutral-800 text-white"
            }`}>
              <p className={`text-xs font-bold px-3 py-1 border-b mb-2 ${
                isLight ? "text-neutral-700 border-neutral-300" : "text-neutral-400 border-neutral-800"
              }`}>
                Account
              </p>
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href || (pathname === "/account" && tab.href === "/account/profile");
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all w-full ${
                      isActive
                        ? (isLight ? "bg-black text-white font-bold shadow-sm" : "bg-white text-black font-bold shadow-sm")
                        : (isLight ? "text-neutral-800 hover:text-black hover:bg-neutral-200/60 font-medium" : "text-neutral-300 hover:text-white hover:bg-neutral-800/60 font-medium")
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all w-full text-left cursor-pointer border-0 mt-1 ${
                  isLight 
                    ? "text-neutral-800 hover:text-red-600 hover:bg-red-500/10 font-medium" 
                    : "text-neutral-300 hover:text-red-400 hover:bg-red-500/20 font-medium"
                }`}
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Logout</span>
              </button>
            </aside>
          </div>

          {/* Right Column: Main Content Area */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
