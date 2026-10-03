"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ChevronRight,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  Lock,
  X
} from "lucide-react";
import { useTheme } from "../theme-provider";
import { useCart } from "@/context/CartContext";
import axios from "axios";
import Image from "next/image";

interface OrderAddress {
  address1: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
  phone?: string;
}

interface OrderLineItem {
  title: string;
  quantity: number;
  price: string;
  variantId?: string;
  productId?: string;
  variantTitle?: string;
  imageUrl?: string;
}

interface FulfillmentInfo {
  trackingCompany?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  processedAt: string;
  totalPrice: string;
  currency: string;
  financialStatus: string;
  fulfillmentStatus: string;
  shippingAddress?: OrderAddress;
  fulfillments?: FulfillmentInfo[];
  lineItems: OrderLineItem[];
}

export default function ReturnsPage() {
  const { theme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeReturnOrder, setActiveReturnOrder] = useState<Order | null>(null);
  const [selectedReturnItems, setSelectedReturnItems] = useState<Record<string, boolean>>({});
  const [returnReason, setReturnReason] = useState("size_issue");
  const [returnComments, setReturnComments] = useState("");
  const [returnSubmitted, setReturnSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isLight = theme === "light";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchOrders = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true);
    if (typeof window === "undefined") return;

    let custId = "";
    let email = "";
    let phone = "";

    const saved = localStorage.getItem("shopifyCustomer");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        custId = parsed.id || parsed.customerId || "";
        email = parsed.email || "";
        phone = parsed.phone || "";
      } catch (e) {
        console.error("Failed to parse local customer details:", e);
      }
    }

    if (!custId && !email && !phone) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const url = `/api/shopify/customer/orders?customerId=${encodeURIComponent(custId)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`;
      const res = await axios.get(url);

      if (res.data?.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            parsed.orders = res.data.orders;
            localStorage.setItem("shopifyCustomer", JSON.stringify(parsed));
          } catch (err) {}
        }
      }
    } catch (err) {
      console.error("Failed to fetch live customer orders for returns:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const hasCustomer = typeof window !== "undefined" && !!localStorage.getItem("shopifyCustomer");

  // Collect all purchased items across all orders
  const allPurchasedItems = orders.flatMap((order) => {
    return order.lineItems.map((item, index) => {
      // Calculate return eligibility (30 days from processing date)
      const processedTime = new Date(order.processedAt).getTime();
      const elapsedMs = Date.now() - processedTime;
      const daysElapsed = elapsedMs / (1000 * 60 * 60 * 24);
      const isEligible = daysElapsed <= 30;

      return {
        ...item,
        order,
        lineItemIndex: index,
        isEligible,
        daysRemaining: Math.max(0, Math.ceil(30 - daysElapsed)),
        orderDate: new Date(order.processedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
    });
  });

  const handleInitiateReturn = (order: Order, itemIdx: number) => {
    setActiveReturnOrder(order);
    setReturnSubmitted(false);
    // Pre-select the clicked line item in the modal
    setSelectedReturnItems({ [itemIdx.toString()]: true });
  };

  const handleReturnSubmit = () => {
    if (Object.keys(selectedReturnItems).filter((k) => selectedReturnItems[k]).length === 0) {
      alert("Please select at least one item to return.");
      return;
    }
    setReturnSubmitted(true);
    showToast("Return request submitted successfully!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4 ${
          isLight ? "border-[#1F4E79]" : "border-[#3b82f6]"
        }`} />
        <span className="text-[10px] font-black tracking-[0.25em] text-neutral-400 uppercase">
          LOADING RETURNS PORTAL...
        </span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F2EB] text-[#1C1917] px-4 sm:px-6 md:px-8 lg:px-12 pt-[120px] pb-16 transition-colors duration-300">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[300] bg-black text-white dark:bg-white dark:text-black text-xs font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce border border-neutral-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Title Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-300/60 pb-5 gap-4">
          <div>
            <span className="text-[9px] font-black tracking-[0.3em] text-[#B9965A] uppercase">
              CUSTOMER SUPPORT
            </span>
            <h1 className="font-serif text-3xl font-bold uppercase tracking-wide mt-1">
              Returns & Exchanges
            </h1>
            <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">
              Initiate hassle-free returns or exchanges for your purchased denims.
            </p>
          </div>

          {hasCustomer && (
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-black tracking-widest uppercase rounded-xl border border-stone-350 bg-stone-100 hover:bg-white text-stone-800 transition-all cursor-pointer self-start sm:self-center"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin text-[#B9965A]" : ""}`} />
              {refreshing ? "Syncing..." : "Sync Orders"}
            </button>
          )}
        </div>

        {/* Auth Restricted View */}
        {!hasCustomer ? (
          <div className="text-center py-20 border border-dashed border-stone-300/80 p-8 rounded-2xl bg-[#EDE7DE]/40">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 border border-stone-300 bg-white text-stone-400">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xs font-black tracking-widest uppercase mb-2">Access Restricted</h3>
            <p className="text-[11px] text-stone-600 mb-6 max-w-sm mx-auto leading-relaxed uppercase tracking-wide">
              Please sign in to verify your purchase history and request returns.
            </p>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-login-modal"));
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-black tracking-widest uppercase transition-all rounded-xl cursor-pointer bg-[#1C1917] text-white hover:bg-black"
            >
              SIGN IN / REGISTER
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : allPurchasedItems.length === 0 ? (
          /* Empty Purchases State */
          <div className="text-center py-20 border border-dashed border-stone-300/80 p-8 rounded-2xl bg-[#EDE7DE]/40">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 border border-stone-300 bg-white text-stone-400">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-xs font-black tracking-widest uppercase mb-2">No Purchased Items Found</h3>
            <p className="text-[11px] text-stone-600 mb-6 max-w-xs mx-auto leading-relaxed uppercase tracking-wide">
              You haven't purchased any products yet or orders are being compiled.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-black tracking-widest uppercase transition-all rounded-xl cursor-pointer bg-[#1C1917] text-white hover:bg-black"
            >
              EXPLORE DENIMS
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          /* Purchased Items Grid */
          <div className="grid gap-6 md:grid-cols-2">
            {allPurchasedItems.map((item, idx) => (
              <div
                key={idx}
                className="border border-stone-300/60 rounded-2xl p-4 flex gap-4 bg-white shadow-xs hover:shadow-md transition-shadow relative"
              >
                {/* Product Thumbnail */}
                <div className="relative w-24 h-28 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="120px"
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Details Container */}
                <div className="flex flex-col justify-between min-w-0 flex-1">
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="text-xs font-bold truncate pr-2 text-stone-900">
                        {item.title}
                      </h3>
                      <span className="text-[10px] font-mono font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-md shrink-0">
                        #OD{item.order.orderNumber}
                      </span>
                    </div>

                    <p className="text-[10px] text-stone-500 mt-1 uppercase font-semibold">
                      {item.variantTitle || "Standard"} • Qty: {item.quantity}
                    </p>

                    <p className="text-xs font-extrabold text-stone-900 mt-1.5">
                      ₹{parseFloat(item.price).toLocaleString("en-IN")}
                    </p>

                    <p className="text-[9px] text-stone-400 mt-2 uppercase tracking-wider font-semibold">
                      Purchased on {item.orderDate}
                    </p>
                  </div>

                  {/* Action row */}
                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    {item.isEligible ? (
                      <>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                          {item.daysRemaining} days left to return
                        </span>
                        <button
                          onClick={() => handleInitiateReturn(item.order, item.lineItemIndex)}
                          className="px-3.5 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all bg-[#1C1917] hover:bg-black text-white cursor-pointer inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Return Item
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                          Return window expired
                        </span>
                        <button
                          disabled
                          className="px-3.5 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                        >
                          Return Locked
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RETURN & EXCHANGE MODAL */}
      {activeReturnOrder && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-2xl relative border max-h-[90vh] overflow-y-auto bg-white text-black border-stone-200">
            <button
              onClick={() => setActiveReturnOrder(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-stone-500/20 text-stone-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[9px] font-black tracking-[0.2em] text-[#B9965A] uppercase">
                RETURNS & EXCHANGES PORTAL
              </span>
              <h3 className="font-serif text-xl font-bold mt-0.5">
                Return Items from #OD{activeReturnOrder.orderNumber}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Select products to exchange or return under our 30-day hassle-free return policy.
              </p>
            </div>

            {returnSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wide">Return Request Received!</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Our customer happiness team will arrange a doorstep pickup within 24-48 hours. A reverse shipping label has been dispatched to your email.
                </p>
                <button
                  onClick={() => setActiveReturnOrder(null)}
                  className="mt-4 px-6 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl cursor-pointer bg-black text-white hover:bg-stone-900"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-2">
                    1. Confirm Item(s) to Return
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {activeReturnOrder.lineItems.map((li, idx) => {
                      const isSelected = !!selectedReturnItems[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedReturnItems((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? "border-black bg-stone-100"
                              : "border-stone-200 bg-stone-50"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="accent-black"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{li.title}</p>
                              <p className="text-[10px] text-stone-500">Qty: {li.quantity} • ₹{parseFloat(li.price).toLocaleString("en-IN")}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    2. Reason for Return / Exchange
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full text-xs font-medium p-3 rounded-xl border outline-none bg-stone-50 border-stone-300 text-black"
                  >
                    <option value="size_issue">Size / Fit issue (Too tight or too loose)</option>
                    <option value="defective">Defective or damaged item received</option>
                    <option value="wrong_item">Received incorrect item or color</option>
                    <option value="not_as_described">Item differs from product photos</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    3. Additional Comments (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={returnComments}
                    onChange={(e) => setReturnComments(e.target.value)}
                    placeholder="Specify preferred size exchange or comments..."
                    className="w-full text-xs p-3 rounded-xl border outline-none bg-stone-50 border-stone-300 text-black"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    onClick={() => setActiveReturnOrder(null)}
                    className="px-5 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl border border-stone-300 bg-white hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReturnSubmit}
                    className="px-5 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl bg-black text-white hover:bg-stone-900 cursor-pointer"
                  >
                    Submit Return Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
