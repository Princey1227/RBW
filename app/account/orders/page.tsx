"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ChevronRight,
  FileText,
  RotateCcw,
  Truck,
  RefreshCw,
  ExternalLink,
  PackageCheck,
  MapPin,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Lock
} from "lucide-react";
import { useTheme } from "../../theme-provider";
import { useCart } from "@/context/CartContext";
import axios from "axios";

interface OrderLineItem {
  id?: string | number;
  productId?: string;
  variantId?: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: string;
  sku?: string;
  imageUrl?: string;
}

interface FulfillmentInfo {
  id?: string | number;
  status?: string;
  trackingCompany?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt?: string;
}

interface OrderAddress {
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
  phone?: string;
}

interface Order {
  id: string;
  numericId?: string;
  orderNumber: string;
  name?: string;
  processedAt: string;
  createdAt?: string;
  totalPrice: string;
  subtotalPrice?: string;
  totalTax?: string;
  totalShipping?: string;
  totalDiscounts?: string;
  currency: string;
  financialStatus: string;
  fulfillmentStatus: string;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  orderStatusUrl?: string;
  shippingAddress?: OrderAddress;
  fulfillments?: FulfillmentInfo[];
  lineItems: OrderLineItem[];
}

export default function OrdersPage() {
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Modals state
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [activeReturnOrder, setActiveReturnOrder] = useState<Order | null>(null);

  // Return modal form state
  const [selectedReturnItems, setSelectedReturnItems] = useState<Record<string, boolean>>({});
  const [returnReason, setReturnReason] = useState("size_issue");
  const [returnComments, setReturnComments] = useState("");
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  // Action Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const isLight = theme === "light";

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
        if (parsed.orders && parsed.orders.length > 0 && !showRefreshSpinner && orders.length === 0) {
          setOrders(parsed.orders);
        }
      } catch (e) {
        console.error("Failed to parse local customer details:", e);
      }
    }

    try {
      const url = `/api/shopify/customer/orders?customerId=${encodeURIComponent(custId)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`;
      const res = await axios.get(url);

      if (res.data?.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);

        // Update localStorage customer cache with latest order registry
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            parsed.orders = res.data.orders;
            localStorage.setItem("shopifyCustomer", JSON.stringify(parsed));
          } catch (err) {}
        }
      }
    } catch (err) {
      console.error("Failed to fetch live customer orders from Shopify API:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(id);
    showToast(`Copied Order #${text} to clipboard!`);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleBuyAgain = async (item: OrderLineItem, orderNo: string) => {
    const variantId = item.variantId || item.productId || `mock_var_${Date.now()}`;
    const priceNum = parseFloat(item.price) || 1850;
    try {
      await addToCart(variantId, 1, {
        title: item.title,
        price: priceNum,
        image: item.imageUrl || "/black_jeans.png"
      }, true);
      showToast(`Added "${item.title}" from Order #${orderNo} to cart.`);
    } catch (err) {
      showToast(`Failed to add item to cart.`);
    }
  };

  const handleBuyAllAgain = async (order: Order) => {
    try {
      for (const item of order.lineItems) {
        const variantId = item.variantId || item.productId || `mock_var_${Date.now()}`;
        const priceNum = parseFloat(item.price) || 1850;
        await addToCart(variantId, item.quantity, {
          title: item.title,
          price: priceNum,
          image: item.imageUrl || "/black_jeans.png"
        }, false);
      }
      showToast(`All items from Order #${order.orderNumber} added to cart!`);
    } catch (e) {
      showToast("Error adding products to cart");
    }
  };

  const handleDownloadInvoice = (order: Order) => {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) {
      alert("Please allow popups to download/print the invoice PDF.");
      return;
    }

    const dateFormatted = new Date(order.processedAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const itemsHtml = order.lineItems.map((li, idx) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 12px; font-size: 13px; font-weight: bold;">
          ${li.title}
          ${li.variantTitle ? `<br/><span style="font-size:11px; color:#666; font-weight:normal;">${li.variantTitle}</span>` : ""}
        </td>
        <td style="padding: 12px; font-size: 13px; text-align: center;">${li.quantity}</td>
        <td style="padding: 12px; font-size: 13px; text-align: right;">₹${parseFloat(li.price).toLocaleString("en-IN")}</td>
        <td style="padding: 12px; font-size: 13px; text-align: right; font-weight: bold;">₹${(parseFloat(li.price) * li.quantity).toLocaleString("en-IN")}</td>
      </tr>
    `).join("");

    const totalNum = parseFloat(order.totalPrice) || 0;
    const subtotalNum = parseFloat(order.subtotalPrice || order.totalPrice) || totalNum;
    const shippingNum = parseFloat(order.totalShipping || "0") || 0;
    const taxNum = parseFloat(order.totalTax || "0") || 0;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice_OD_${order.orderNumber}.pdf</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .brand { font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
            .invoice-title { text-align: right; }
            .invoice-title h1 { font-size: 20px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
            .invoice-title p { margin: 4px 0 0 0; font-size: 12px; color: #666; }
            .details-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .details-block h4 { margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; }
            .details-block p { margin: 2px 0; font-size: 13px; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8f8f8; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; }
            .totals { width: 300px; margin-left: auto; font-size: 13px; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
            .totals-row.grand { font-size: 16px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 6px; }
            .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 11px; color: #777; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">ONLY DENIMS</div>
              <p style="font-size: 11px; color: #555; margin: 4px 0 0 0;">Premium Craftsmanship & Authenticity</p>
              <p style="font-size: 11px; color: #777; margin: 2px 0 0 0;">onlydenims26@gmail.com | www.onlydenims.com</p>
            </div>
            <div class="invoice-title">
              <h1>TAX INVOICE</h1>
              <p>Invoice No: <strong>INV-OD-${order.orderNumber}</strong></p>
              <p>Order ID: <strong>#OD${order.orderNumber}</strong></p>
              <p>Date: <strong>${dateFormatted}</strong></p>
            </div>
          </div>

          <div class="details-grid">
            <div class="details-block">
              <h4>Billed & Shipped To</h4>
              <p><strong>${order.shippingAddress?.name || "Customer"}</strong></p>
              <p>${order.shippingAddress?.address1 || ""}</p>
              ${order.shippingAddress?.address2 ? `<p>${order.shippingAddress.address2}</p>` : ""}
              <p>${order.shippingAddress?.city || ""}, ${order.shippingAddress?.province || ""} ${order.shippingAddress?.zip || ""}</p>
              <p>${order.shippingAddress?.country || "India"}</p>
              <p>Phone: ${order.shippingAddress?.phone || "N/A"}</p>
            </div>
            <div class="details-block" style="text-align: right;">
              <h4>Payment & Order Status</h4>
              <p>Payment Status: <strong>${(order.financialStatus || "PAID").toUpperCase()}</strong></p>
              <p>Fulfillment Status: <strong>${(order.fulfillmentStatus || "DELIVERED").toUpperCase()}</strong></p>
              <p>Currency: <strong>${order.currency || "INR"}</strong></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Item Description</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th style="text-align: right; width: 100px;">Unit Price</th>
                <th style="text-align: right; width: 110px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>₹${subtotalNum.toLocaleString("en-IN")}</span>
            </div>
            <div class="totals-row">
              <span>Shipping & Handling:</span>
              <span>${shippingNum === 0 ? "FREE" : `₹${shippingNum.toLocaleString("en-IN")}`}</span>
            </div>
            ${taxNum > 0 ? `
              <div class="totals-row">
                <span>Estimated Tax (GST 12%):</span>
                <span>₹${taxNum.toLocaleString("en-IN")}</span>
              </div>
            ` : ""}
            <div class="totals-row grand">
              <span>Grand Total:</span>
              <span>₹${totalNum.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for shopping with Only Denims! For returns, exchanges, or assistance, visit www.onlydenims.com/account/orders</p>
            <p style="margin-top: 4px;">This is a computer-generated invoice and requires no signature.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getFulfillmentBadge = (status: string) => {
    const clean = status ? status.toLowerCase() : "unfulfilled";

    if (clean === "fulfilled" || clean === "delivered") {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border ${
          isLight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-950/60 text-emerald-400 border-emerald-800"
        }`}>
          <CheckCircle2 className="w-3 h-3" />
          DELIVERED
        </span>
      );
    } else if (clean === "shipped" || clean === "in_transit" || clean === "out_for_delivery") {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border ${
          isLight ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-blue-950/60 text-blue-400 border-blue-800"
        }`}>
          <Truck className="w-3 h-3 animate-pulse" />
          IN TRANSIT
        </span>
      );
    } else if (clean === "cancelled") {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border ${
          isLight ? "bg-red-50 text-red-700 border-red-200" : "bg-red-950/60 text-red-400 border-red-800"
        }`}>
          <AlertCircle className="w-3 h-3" />
          CANCELLED
        </span>
      );
    } else {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border ${
          isLight ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-amber-950/60 text-amber-400 border-amber-800"
        }`}>
          <Clock className="w-3 h-3" />
          PROCESSING
        </span>
      );
    }
  };

  const getFinancialBadge = (status: string) => {
    const clean = status ? status.toLowerCase() : "pending";
    if (clean === "paid") {
      return (
        <span className="text-[9px] font-bold tracking-widest text-emerald-500 uppercase">
          • PAID
        </span>
      );
    } else if (clean === "refunded") {
      return (
        <span className="text-[9px] font-bold tracking-widest text-purple-400 uppercase">
          • REFUNDED
        </span>
      );
    } else {
      return (
        <span className="text-[9px] font-bold tracking-widest text-amber-500 uppercase">
          • PENDING (COD / PREPAID)
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-pulse select-none">
        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4 ${
          isLight ? "border-[#1F4E79]" : "border-[#3b82f6]"
        }`} />
        <span className="text-[10px] font-black tracking-[0.25em] text-neutral-400 uppercase">
          FETCHING SHOPIFY ORDER REGISTRY...
        </span>
      </div>
    );
  }

  const hasCustomer = typeof window !== "undefined" && !!localStorage.getItem("shopifyCustomer");

  return (
    <div className={`space-y-8 font-sans antialiased transition-colors duration-300 ${
      isLight ? "bg-white text-black" : "bg-black text-white"
    }`}>
      
      {/* Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[300] bg-black text-white dark:bg-white dark:text-black text-xs font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce border border-neutral-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Title & Refresh Strip */}
      <div className={`flex items-center justify-between border-b pb-4 ${
        isLight ? "border-neutral-200" : "border-neutral-900"
      }`}>
        <div>
          <h2 className="font-serif text-xl font-bold uppercase tracking-wide flex items-center gap-2">
            <span>Order History</span>
            {hasCustomer && orders.length > 0 && (
              <span className={`text-xs font-mono font-normal px-2 py-0.5 rounded-full border ${
                isLight ? "bg-neutral-100 border-neutral-300 text-neutral-600" : "bg-neutral-900 border-neutral-800 text-neutral-400"
              }`}>
                {orders.length}
              </span>
            )}
          </h2>
          <p className={`text-[10px] tracking-wider uppercase mt-1 ${
            isLight ? "text-neutral-500" : "text-neutral-400"
          }`}>
            Track shipments live, download PDF tax invoices, or request exchanges.
          </p>
        </div>

        {hasCustomer && (
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-lg border transition-all cursor-pointer ${
              isLight
                ? "border-neutral-300 hover:border-black bg-neutral-50 hover:bg-white text-neutral-800"
                : "border-neutral-800 hover:border-white bg-neutral-900 hover:bg-neutral-800 text-neutral-200"
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin text-[#3b82f6]" : ""}`} />
            {refreshing ? "Syncing..." : "Refresh"}
          </button>
        )}
      </div>

      {/* Zero Orders State or Unauthenticated View */}
      {!hasCustomer ? (
        <div className={`text-center py-20 border border-dashed p-8 rounded-2xl ${
          isLight ? "border-neutral-200 bg-neutral-50/50" : "border-neutral-900 bg-neutral-950/20"
        }`}>
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 border ${
            isLight ? "bg-white border-neutral-200 text-neutral-400" : "bg-neutral-900 border-neutral-800 text-neutral-500"
          }`}>
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xs font-black tracking-widest uppercase mb-2">Access Restricted</h3>
          <p className="text-[11px] text-neutral-400 mb-6 max-w-xs mx-auto leading-relaxed">
            Please sign in to your Only Denims account to view order history and initiate return or exchange requests.
          </p>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-login-modal"));
            }}
            className={`inline-flex items-center gap-2 px-6 py-3 text-xs font-black tracking-widest uppercase transition-all rounded-xl cursor-pointer ${
              isLight ? "bg-[#1C1917] text-white hover:bg-black" : "bg-white text-black hover:bg-neutral-200"
            }`}
          >
            SIGN IN / REGISTER
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className={`text-center py-20 border border-dashed p-8 rounded-2xl ${
          isLight ? "border-neutral-200 bg-neutral-50/50" : "border-neutral-900 bg-neutral-950/20"
        }`}>
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 border ${
            isLight ? "bg-white border-neutral-200 text-neutral-400" : "bg-neutral-900 border-neutral-800 text-neutral-500"
          }`}>
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-xs font-black tracking-widest uppercase mb-2">No Orders Located</h3>
          <p className="text-[11px] text-neutral-400 mb-6 max-w-xs mx-auto leading-relaxed">
            You haven't placed any denim orders yet. Explore our latest selvedge and baggy collections.
          </p>
          <Link
            href="/shop"
            className={`inline-flex items-center gap-2 px-6 py-3 text-xs font-black tracking-widest uppercase transition-all rounded-xl cursor-pointer ${
              isLight ? "bg-[#1F4E79] text-white hover:bg-black" : "bg-[#3b82f6] text-white hover:bg-white hover:text-black"
            }`}
          >
            EXPLORE PRODUCTS
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-6">
          {orders.map((order) => {
            const date = new Date(order.processedAt || Date.now()).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const totalFormatted = parseFloat(order.totalPrice || "0").toLocaleString("en-IN", {
              style: "currency",
              currency: order.currency || "INR",
              maximumFractionDigits: 0,
            });

            const isExpanded = expandedOrderId === order.id;
            const primaryFulfillment = order.fulfillments && order.fulfillments.length > 0 ? order.fulfillments[0] : null;

            return (
              <div
                key={order.id}
                className={`border rounded-2xl p-6 space-y-6 transition-all shadow-sm ${
                  isLight
                    ? "border-neutral-200 bg-white hover:border-neutral-350"
                    : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                }`}
              >
                {/* Order Top Summary Bar */}
                <div className={`flex flex-wrap justify-between items-center gap-4 border-b pb-4 ${
                  isLight ? "border-neutral-100" : "border-neutral-900"
                }`}>
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <span className={`text-[9px] font-black tracking-widest uppercase ${
                        isLight ? "text-neutral-600" : "text-neutral-400"
                      }`}>
                        Order Reference
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <h4 className="font-serif italic font-bold text-base">
                          #OD{order.orderNumber}
                        </h4>
                        <button
                          onClick={() => copyToClipboard(order.orderNumber, order.id)}
                          className="text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer p-0.5 transition-colors"
                          title="Copy order number"
                        >
                          {copiedOrderId === order.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className={`text-[9px] font-black tracking-widest uppercase ${
                        isLight ? "text-neutral-600" : "text-neutral-400"
                      }`}>
                        Date Placed
                      </span>
                      <p className="text-[11px] font-semibold mt-0.5">
                        {date}
                      </p>
                    </div>

                    <div>
                      <span className={`text-[9px] font-black tracking-widest uppercase ${
                        isLight ? "text-neutral-600" : "text-neutral-400"
                      }`}>
                        Total Amount
                      </span>
                      <p className={`text-[11px] font-mono font-bold mt-0.5 ${
                        isLight ? "text-[#1F4E79]" : "text-[#3b82f6]"
                      }`}>
                        {totalFormatted}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getFinancialBadge(order.financialStatus)}
                    {getFulfillmentBadge(order.fulfillmentStatus)}
                  </div>
                </div>

                {/* Tracking Banner if Shipped or In Transit */}
                {primaryFulfillment && (primaryFulfillment.trackingNumber || primaryFulfillment.trackingUrl) && (
                  <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                    isLight ? "bg-blue-50/70 border-blue-200 text-blue-900" : "bg-blue-950/40 border-blue-800 text-blue-200"
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-[#3b82f6] shrink-0" />
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[10px]">
                          Courier: {primaryFulfillment.trackingCompany || "Express Courier"}
                        </span>
                        {primaryFulfillment.trackingNumber && (
                          <p className="font-mono text-[11px] text-neutral-450 dark:text-neutral-300">
                            AWB / Tracking #: <span className="font-bold">{primaryFulfillment.trackingNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {primaryFulfillment.trackingUrl ? (
                      <a
                        href={primaryFulfillment.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black tracking-wider uppercase bg-[#1F4E79] dark:bg-[#3b82f6] text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Track Package Live
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        onClick={() => setActiveTrackingOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black tracking-wider uppercase bg-[#1F4E79] dark:bg-[#3b82f6] text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        View Timeline
                      </button>
                    )}
                  </div>
                )}

                {/* Line Items List */}
                <div className="space-y-4">
                  {order.lineItems.map((item, idx) => {
                    const priceFormatted = parseFloat(item.price || "0").toLocaleString("en-IN", {
                      style: "currency",
                      currency: order.currency || "INR",
                      maximumFractionDigits: 0,
                    });

                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b last:border-b-0 border-neutral-100 dark:border-neutral-900">
                        <div className="flex gap-4 items-center min-w-0">
                          <div className={`w-14 h-16 rounded-xl overflow-hidden shrink-0 border flex items-center justify-center relative ${
                            isLight ? "bg-neutral-50 border-neutral-200" : "bg-neutral-900 border-neutral-800"
                          }`}>
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag className="w-5 h-5 text-neutral-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5 className="font-serif italic font-bold text-sm truncate">
                              {item.title}
                            </h5>
                            {item.variantTitle && (
                              <span className="inline-block text-[10px] font-semibold text-neutral-450 uppercase tracking-wider">
                                Fit/Size: {item.variantTitle}
                              </span>
                            )}
                            <div className="flex items-center gap-3 text-[10px] text-neutral-400 tracking-wider mt-1 font-mono">
                              <span>Qty: {item.quantity}</span>
                              <span>•</span>
                              <span className="font-bold text-black dark:text-white">{priceFormatted}</span>
                              {item.sku && (
                                <>
                                  <span>•</span>
                                  <span className="text-[9px]">SKU: {item.sku}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleBuyAgain(item, order.orderNumber)}
                          className={`self-start sm:self-center px-3 py-1.5 border text-[9px] font-black tracking-widest uppercase transition-colors rounded-lg bg-transparent cursor-pointer shrink-0 ${
                            isLight
                              ? "border-neutral-300 text-black hover:border-black hover:bg-neutral-50"
                              : "border-neutral-800 text-white hover:border-white hover:bg-neutral-900"
                          }`}
                        >
                          Buy Again
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Expandable Order Details Drawer toggle */}
                {isExpanded && (
                  <div className={`pt-4 border-t space-y-4 text-xs animate-fadeIn ${
                    isLight ? "border-neutral-200 bg-neutral-50/70 p-4 rounded-xl" : "border-neutral-900 bg-neutral-900/40 p-4 rounded-xl"
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Shipping Address */}
                      <div>
                        <h6 className="font-black text-[10px] tracking-widest uppercase text-neutral-600 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#3b82f6]" />
                          Delivery Address
                        </h6>
                        {order.shippingAddress ? (
                          <div className="space-y-0.5 text-neutral-700 dark:text-neutral-300 text-[11px] leading-relaxed">
                            <p className="font-bold text-black dark:text-white">{order.shippingAddress.name || "Customer"}</p>
                            <p>{order.shippingAddress.address1}</p>
                            {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                            <p>{order.shippingAddress.city}, {order.shippingAddress.province} - {order.shippingAddress.zip}</p>
                            <p>{order.shippingAddress.country || "India"}</p>
                            {order.shippingAddress.phone && <p className="font-mono text-[10px] mt-1">Phone: {order.shippingAddress.phone}</p>}
                          </div>
                        ) : (
                          <p className="text-neutral-400 italic text-[11px]">Address record unavailable</p>
                        )}
                      </div>

                      {/* Financial Breakdown */}
                      <div className="space-y-1.5 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-neutral-200 dark:border-neutral-800">
                        <h6 className="font-black text-[10px] tracking-widest uppercase text-neutral-600 dark:text-neutral-400 mb-2">
                          Payment Breakdown
                        </h6>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-neutral-450">Subtotal:</span>
                          <span className="font-mono">₹{parseFloat(order.subtotalPrice || order.totalPrice).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-neutral-450">Shipping:</span>
                          <span className="font-mono">{parseFloat(order.totalShipping || "0") === 0 ? "FREE" : `₹${parseFloat(order.totalShipping || "0").toLocaleString("en-IN")}`}</span>
                        </div>
                        {parseFloat(order.totalDiscounts || "0") > 0 && (
                          <div className="flex justify-between text-[11px] text-emerald-500">
                            <span>Discount Applied:</span>
                            <span className="font-mono">-₹{parseFloat(order.totalDiscounts || "0").toLocaleString("en-IN")}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs font-bold pt-2 border-t border-neutral-200 dark:border-neutral-800">
                          <span>Total Amount:</span>
                          <span className="font-mono text-[#1F4E79] dark:text-[#3b82f6]">
                            {totalFormatted}
                          </span>
                        </div>
                      </div>
                    </div>

                    {order.orderStatusUrl && (
                      <div className="pt-2">
                        <a
                          href={order.orderStatusUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#1F4E79] dark:text-[#3b82f6] hover:underline"
                        >
                          View Shopify Customer Receipt
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Action Strip */}
                <div className={`flex flex-wrap items-center gap-3 pt-4 border-t ${
                  isLight ? "border-neutral-100" : "border-neutral-900"
                }`}>
                  <button
                    onClick={() => setActiveTrackingOrder(order)}
                    className={`px-4 py-2 text-[9px] font-black tracking-widest uppercase transition-all rounded-xl flex items-center gap-1.5 cursor-pointer ${
                      isLight ? "bg-[#1F4E79] text-white hover:bg-black" : "bg-white text-black hover:bg-[#3b82f6] hover:text-white"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Track Shipment
                  </button>

                  <button
                    onClick={() => handleBuyAllAgain(order)}
                    className={`px-4 py-2 border text-[9px] font-black tracking-widest uppercase transition-all rounded-xl bg-transparent cursor-pointer ${
                      isLight ? "border-neutral-200 text-black hover:border-black hover:bg-neutral-50" : "border-neutral-800 text-white hover:border-white hover:bg-neutral-900"
                    }`}
                  >
                    Reorder All
                  </button>

                  <button
                    onClick={() => {
                      setActiveReturnOrder(order);
                      setReturnSubmitted(false);
                      setSelectedReturnItems({});
                    }}
                    className={`px-4 py-2 border text-[9px] font-black tracking-widest uppercase transition-all rounded-xl bg-transparent cursor-pointer flex items-center gap-1.5 ${
                      isLight ? "border-neutral-200 text-black hover:border-red-500 hover:text-red-500" : "border-neutral-800 text-white hover:border-red-500 hover:text-red-500"
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Return / Exchange
                  </button>

                  <button
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className={`px-3 py-2 text-[9px] font-black tracking-widest uppercase transition-all rounded-xl border bg-transparent cursor-pointer ${
                      isLight ? "border-neutral-200 text-neutral-600 hover:border-black" : "border-neutral-800 text-neutral-400 hover:border-white"
                    }`}
                  >
                    {isExpanded ? "Hide Details" : "View Breakdown"}
                  </button>

                  <button
                    onClick={() => handleDownloadInvoice(order)}
                    className={`px-3 py-2 text-[9px] font-black tracking-widest uppercase transition-colors bg-transparent border-0 cursor-pointer p-0 ml-auto flex items-center gap-1.5 ${
                      isLight ? "text-[#1F4E79] hover:underline" : "text-[#3b82f6] hover:underline"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Invoice PDF
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* TRACKING TIMELINE MODAL */}
      {activeTrackingOrder && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-2xl relative border ${
            isLight ? "bg-white text-black border-neutral-200" : "bg-neutral-950 text-white border-neutral-800"
          }`}>
            <button
              onClick={() => setActiveTrackingOrder(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-neutral-500/20 text-neutral-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[9px] font-black tracking-[0.2em] text-[#3b82f6] uppercase">
                SHIPMENT TIMELINE
              </span>
              <h3 className="font-serif text-xl font-bold mt-0.5">
                Tracking Order #OD{activeTrackingOrder.orderNumber}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Real-time delivery progress via OnlyDenims Logistics.
              </p>
            </div>

            {/* Timeline Progress */}
            <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-300 dark:before:bg-neutral-800">
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
                <h4 className="text-xs font-bold uppercase">Order Placed & Payment Verified</h4>
                <p className="text-[10px] text-neutral-400">
                  {new Date(activeTrackingOrder.processedAt).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="relative">
                <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeTrackingOrder.fulfillmentStatus !== "unfulfilled" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white animate-pulse"
                }`}>
                  {activeTrackingOrder.fulfillmentStatus !== "unfulfilled" ? "✓" : "•"}
                </span>
                <h4 className="text-xs font-bold uppercase">Quality Inspection & Packaging</h4>
                <p className="text-[10px] text-neutral-400">Handcrafted & Quality Verified in Warehouse</p>
              </div>

              <div className="relative">
                <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  ["shipped", "fulfilled", "delivered"].includes(activeTrackingOrder.fulfillmentStatus?.toLowerCase())
                    ? "bg-emerald-500 text-white"
                    : "bg-neutral-300 dark:bg-neutral-800 text-neutral-500"
                }`}>
                  {["shipped", "fulfilled", "delivered"].includes(activeTrackingOrder.fulfillmentStatus?.toLowerCase()) ? "✓" : "3"}
                </span>
                <h4 className="text-xs font-bold uppercase">Dispatched with Express Courier</h4>
                <p className="text-[10px] text-neutral-400">
                  {activeTrackingOrder.fulfillments?.[0]?.trackingCompany || "Express Air Cargo"}
                  {activeTrackingOrder.fulfillments?.[0]?.trackingNumber ? ` (AWB: ${activeTrackingOrder.fulfillments[0].trackingNumber})` : ""}
                </p>
              </div>

              <div className="relative">
                <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  ["fulfilled", "delivered"].includes(activeTrackingOrder.fulfillmentStatus?.toLowerCase())
                    ? "bg-emerald-500 text-white"
                    : "bg-neutral-300 dark:bg-neutral-800 text-neutral-500"
                }`}>
                  {["fulfilled", "delivered"].includes(activeTrackingOrder.fulfillmentStatus?.toLowerCase()) ? "✓" : "4"}
                </span>
                <h4 className="text-xs font-bold uppercase">Delivered to Address</h4>
                <p className="text-[10px] text-neutral-400">
                  {activeTrackingOrder.shippingAddress?.city || "Destination Address"}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTrackingOrder(null)}
                className={`px-5 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl border cursor-pointer ${
                  isLight ? "border-neutral-300 bg-black text-white" : "border-neutral-800 bg-white text-black"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN & EXCHANGE MODAL */}
      {activeReturnOrder && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-2xl relative border max-h-[90vh] overflow-y-auto ${
            isLight ? "bg-white text-black border-neutral-200" : "bg-neutral-950 text-white border-neutral-800"
          }`}>
            <button
              onClick={() => setActiveReturnOrder(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-neutral-500/20 text-neutral-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[9px] font-black tracking-[0.2em] text-red-500 uppercase">
                RETURNS & EXCHANGES PORTAL
              </span>
              <h3 className="font-serif text-xl font-bold mt-0.5">
                Return Items from #OD{activeReturnOrder.orderNumber}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Select products to exchange or return under our 14-day hassle-free return policy.
              </p>
            </div>

            {returnSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wide">Return Request Received!</h4>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Our customer happiness team will arrange a doorstep pickup within 24-48 hours. A reverse shipping label has been dispatched to your email.
                </p>
                <button
                  onClick={() => setActiveReturnOrder(null)}
                  className={`mt-4 px-6 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl cursor-pointer ${
                    isLight ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-2">
                    1. Select Item(s) to Return
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
                              ? (isLight ? "border-black bg-neutral-100" : "border-white bg-neutral-900")
                              : (isLight ? "border-neutral-200 bg-neutral-50" : "border-neutral-800 bg-neutral-900/40")
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="accent-black dark:accent-white"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{li.title}</p>
                              <p className="text-[10px] text-neutral-400">Qty: {li.quantity} • ₹{parseFloat(li.price).toLocaleString("en-IN")}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">
                    2. Reason for Return / Exchange
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className={`w-full text-xs font-medium p-3 rounded-xl border outline-none ${
                      isLight ? "bg-neutral-50 border-neutral-300 text-black" : "bg-neutral-900 border-neutral-800 text-white"
                    }`}
                  >
                    <option value="size_issue">Size / Fit issue (Too tight or too loose)</option>
                    <option value="defective">Defective or damaged item received</option>
                    <option value="wrong_item">Received incorrect item or color</option>
                    <option value="not_as_described">Item differs from product photos</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">
                    3. Additional Comments (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={returnComments}
                    onChange={(e) => setReturnComments(e.target.value)}
                    placeholder="Specify preferred replacement size or return note..."
                    className={`w-full text-xs p-3 rounded-xl border outline-none ${
                      isLight ? "bg-neutral-50 border-neutral-300 text-black" : "bg-neutral-900 border-neutral-800 text-white"
                    }`}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    onClick={() => setActiveReturnOrder(null)}
                    className={`px-4 py-2.5 text-xs font-bold uppercase rounded-xl border cursor-pointer ${
                      isLight ? "border-neutral-300 text-neutral-700" : "border-neutral-800 text-neutral-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (Object.keys(selectedReturnItems).filter((k) => selectedReturnItems[k]).length === 0) {
                        alert("Please select at least one item to return.");
                        return;
                      }
                      setReturnSubmitted(true);
                    }}
                    className={`px-6 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl border cursor-pointer ${
                      isLight ? "bg-red-600 text-white border-red-600 hover:bg-black" : "bg-red-600 text-white border-red-600 hover:bg-red-500"
                    }`}
                  >
                    Submit Return Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
