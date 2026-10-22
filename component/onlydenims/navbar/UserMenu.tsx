"use client";

import React from "react";
import Link from "next/link";
import { User, Heart, Bell } from "lucide-react";

interface CustomerInfo {
  displayName?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  orders?: Array<{
    id: string;
    orderNumber: string;
    processedAt: string;
    totalPrice: string;
    currency: string;
    fulfillmentStatus: string;
  }>;
}

interface UserMenuProps {
  isLoggedIn: boolean;
  showDropdown: boolean;
  mounted: boolean;
  theme: "light" | "dark";
  customerInfo: CustomerInfo | null;
  wishlistCount: number;
  onUserClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onCloseDropdown: () => void;
  onLogout: () => void;
  onLoginClick: () => void;
}

export default function UserMenu({
  isLoggedIn,
  showDropdown,
  mounted,
  theme,
  customerInfo,
  wishlistCount,
  onUserClick,
  onMouseEnter,
  onMouseLeave,
  onCloseDropdown,
  onLogout,
  onLoginClick,
}: UserMenuProps) {
  const [hasLoggedOut, setHasLoggedOut] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setHasLoggedOut(localStorage.getItem("kp_logged_out") === "true");
    }
  }, [isLoggedIn]);

  const dropdownStyle = {
    "--foreground": theme === "light" ? "#17140F" : "#F5F1E8",
    "--background": theme === "light" ? "#FFFFFF" : "#000000",
  } as React.CSSProperties;

  return (
    <div
      className="relative hidden md:block"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Trigger button */}
      <button
        onClick={(e) => {
          if (isLoggedIn) {
            onUserClick(e);
          } else {
            e.preventDefault();
            e.stopPropagation();
            onLoginClick();
          }
        }}
        className="transition-colors duration-300 relative flex items-center gap-1.5 cursor-pointer text-[14px] sm:text-[15px] font-semibold border-0 bg-transparent text-inherit hover:opacity-100 p-1"
        aria-label="User Account"
      >
        <div className="relative">
          <User className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
          {isLoggedIn && (
            <span className="absolute -top-[1px] -right-[1px] h-1.5 w-1.5 rounded-full bg-[#d7a33c]" />
          )}
        </div>
        <span className="capitalize">
          {isLoggedIn
            ? (customerInfo?.firstName || (customerInfo?.displayName ? customerInfo.displayName.split(" ")[0] : null) || "Profile")
            : "Login"}
        </span>
      </button>

      {/* Logged-in dropdown */}
      {isLoggedIn && showDropdown && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full pt-2 w-64 z-[200]"
        >
          <div
            style={dropdownStyle}
            className="rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-foreground/10 bg-background text-foreground py-2 overflow-hidden"
          >
            {/* Member header */}
            <div className="px-4 py-2 border-b border-foreground/5 bg-foreground/5">
              <p className="text-[9px] font-black tracking-[0.2em] text-[#d7a33c] uppercase">
                MY ACCOUNT
              </p>
              <p className="text-[11px] font-bold truncate mt-0.5">
                {customerInfo?.displayName || customerInfo?.email || customerInfo?.phone || "Account Details"}
              </p>
              <p className="text-[9px] text-foreground/50 truncate font-mono">
                {customerInfo?.email ||
                  customerInfo?.phone ||
                  "Synchronizing profile..."}
              </p>
            </div>

            {/* Order history */}
            {customerInfo?.orders && customerInfo.orders.length > 0 ? (
              <div className="px-4 py-2 border-b border-foreground/5 max-h-36 overflow-y-auto">
                <p className="text-[9px] font-black tracking-[0.1em] text-foreground/45 uppercase mb-1.5">
                  Recent Orders
                </p>
                <div className="space-y-2">
                  {customerInfo.orders.map((order) => (
                    <div
                      key={order.id}
                      className="text-[10px] flex justify-between items-start leading-tight"
                    >
                      <div>
                        <span className="font-bold text-foreground/80">
                          #{order.orderNumber}
                        </span>
                        <p className="text-[8px] text-foreground/40 font-mono">
                          {new Date(order.processedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">
                          {parseFloat(order.totalPrice).toLocaleString("en-IN", {
                            style: "currency",
                            currency: order.currency || "INR",
                            maximumFractionDigits: 0,
                          })}
                        </span>
                        <p className="text-[7px] font-bold uppercase tracking-wider text-[#d7a33c]">
                          {order.fulfillmentStatus}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : customerInfo ? (
              <div className="px-4 py-2 text-[9px] text-foreground/40 italic border-b border-foreground/5">
                No orders placed yet.
              </div>
            ) : null}

            {/* Nav links */}
            <div className="py-1 text-xs">
              <Link
                href="/account"
                onClick={onCloseDropdown}
                className="flex items-center justify-between px-4 py-2 hover:bg-foreground/5 transition-colors font-medium tracking-wide"
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                  <span>My Profile</span>
                </div>
              </Link>
              <Link
                href="/account/orders"
                onClick={onCloseDropdown}
                className="block px-4 py-2 hover:bg-foreground/5 transition-colors font-medium tracking-wide"
              >
                Order History Page
              </Link>
              <Link
                href="/account/wishlist"
                onClick={onCloseDropdown}
                className="flex items-center justify-between px-4 py-2 hover:bg-foreground/5 transition-colors font-medium tracking-wide"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                  <span>Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#d7a33c]/15 text-[#d7a33c]">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href="/account/notifications"
                onClick={onCloseDropdown}
                className="flex items-center justify-between px-4 py-2 hover:bg-foreground/5 transition-colors font-medium tracking-wide"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                  <span>Notification Preferences</span>
                </div>
              </Link>
              <Link
                href="/account/measurements"
                onClick={onCloseDropdown}
                className="block px-4 py-2 hover:bg-foreground/5 transition-colors font-medium tracking-wide"
              >
                My Measurements
              </Link>
            </div>

            {/* Sign out */}
            <div className="border-t border-foreground/5 pt-1 mt-1">
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/5 transition-colors font-bold uppercase tracking-wider cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
