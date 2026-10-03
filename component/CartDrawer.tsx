"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "../app/theme-provider";

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, updateQuantity, removeFromCart, addToCart, updateBuyerIdentity, isLoading, setIsCheckingOut } = useCart();
  const { theme } = useTheme();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!cart?.checkoutUrl) return;
    setIsRedirecting(true);
    setIsCheckingOut(true, "ENTERING SECURE CHECKOUT...");

    let finalCheckoutUrl = cart.checkoutUrl;
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
        finalCheckoutUrl = updatedUrl;
      }
    } catch (err) {
      console.error("Pre-checkout identity update error:", err);
    } finally {
      console.log("Redirecting to final Storefront checkoutUrl:", finalCheckoutUrl);
      window.location.href = finalCheckoutUrl;
    }
  };

  const [realAccessories, setRealAccessories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAccessories() {
      try {
        const response = await axios.get("/api/shopify/products");
        let products: any[] = [];
        if (Array.isArray(response.data)) {
          products = response.data;
        } else if (response.data && Array.isArray(response.data.products)) {
          products = response.data.products;
        }

        const filtered = products.filter((p: any) => {
          const tags = (p.tags || []).map((t: any) => (typeof t === "string" ? t.toLowerCase() : ""));
          const type = (p.productType || p.product_type || "").toLowerCase();
          return tags.includes("accessories") || tags.includes("accessory") || type.includes("accessories");
        });

        if (filtered.length > 0) {
          const formatted = filtered.map((p: any) => {
            const rawId = p.id?.toString() || "";
            const vEdge = p.variants?.edges?.[0]?.node || p.variants?.[0];
            const vId = vEdge?.id ? (vEdge.id.toString().startsWith("gid://") ? vEdge.id : `gid://shopify/ProductVariant/${vEdge.id}`) : `gid://shopify/ProductVariant/${rawId}`;
            const price = parseFloat(vEdge?.price?.amount || vEdge?.price || p.priceRange?.minVariantPrice?.amount || "150");
            const imgUrl = p.images?.edges?.[0]?.node?.url || p.images?.[0]?.src || p.image?.src || "/OnlyDenims.png";

            return {
              id: rawId,
              variantId: vId,
              title: p.title,
              price,
              formattedPrice: `₹ ${price.toLocaleString("en-IN")}`,
              image: imgUrl,
            };
          });
          setRealAccessories(formatted);
        }
      } catch (err) {
        console.error("Failed to load real Shopify accessories for CartDrawer:", err);
      }
    }
    fetchAccessories();
  }, []);

  const fallbackAccessoriesList = [
    {
      id: "8692976615658",
      variantId: "gid://shopify/ProductVariant/46132879556842",
      title: "Laptop Bags",
      price: 150,
      formattedPrice: "₹ 150",
      image: "https://cdn.shopify.com/s/files/1/0715/4574/9738/files/LaptopBag.png?v=1783509472",
    },
    {
      id: "8692975042794",
      variantId: "gid://shopify/ProductVariant/46132877820138",
      title: "Card Holders",
      price: 150,
      formattedPrice: "₹ 150",
      image: "https://cdn.shopify.com/s/files/1/0715/4574/9738/files/cardholder.png?v=1783508623",
    },
    {
      id: "8692975894762",
      variantId: "gid://shopify/ProductVariant/46132878835946",
      title: "Luggage Tags",
      price: 150,
      formattedPrice: "₹ 150",
      image: "https://cdn.shopify.com/s/files/1/0715/4574/9738/files/luggagetag.png?v=1783509270",
    },
    {
      id: "8692975141098",
      variantId: "gid://shopify/ProductVariant/46132878016746",
      title: "Coin Purses",
      price: 150,
      formattedPrice: "₹ 150",
      image: "https://cdn.shopify.com/s/files/1/0715/4574/9738/files/Screenshot2026-07-08164030.png?v=1783509162",
    },
  ];

  const displayAccessories = realAccessories.length > 0 ? realAccessories : fallbackAccessoriesList;

  // Calculate totals
  const subtotal = cart?.lines.reduce((acc, item) => {
    const price = parseFloat(item.merchandise.price.amount);
    return acc + price * item.quantity;
  }, 0) || 0;

  const totalItems = cart?.lines.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
              fixed
              top-0
              right-0
              bottom-0
              z-[210]
              w-full
              max-w-md
              shadow-[0_0_50px_rgba(0,0,0,0.3)]
              flex
              flex-col
              transition-colors
              duration-300
              ${theme === "light" ? "bg-white text-slate-900" : "bg-[#0b0f16] text-white border-l border-[#b88a2c]/20"}
            `}
          >
            {/* Header */}
            <div className={`p-6 border-b flex items-center justify-between ${theme === "light" ? "border-slate-100" : "border-[#b88a2c]/10"}`}>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase font-serif">
                  YOUR BAG
                </h2>
                <span className="text-[10px] bg-[#d7a33c]/15 text-[#d7a33c] font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`
                  text-xs
                  tracking-widest
                  font-bold
                  px-3
                  py-1
                  border
                  transition-all
                  ${theme === "light"
                    ? "border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white"
                    : "border-[#d7a33c]/40 text-[#d7a33c] hover:bg-[#d7a33c] hover:text-black"
                  }
                `}
              >
                CLOSE
              </button>
            </div>

            {/* Main Item List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 dark:bg-black/25 backdrop-blur-[1px]">
                  <div className="w-8 h-8 border-2 border-t-transparent border-[#d7a33c] rounded-full animate-spin" />
                </div>
              )}

              {!cart || cart.lines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <p className={`text-sm tracking-wider ${theme === "light" ? "text-slate-400" : "text-white/40"}`}>
                    Your shopping bag is empty.
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="
                      text-[10px]
                      font-bold
                      tracking-[0.2em]
                      border
                      border-[#d7a33c]
                      text-[#d7a33c]
                      px-6
                      py-2.5
                      hover:bg-[#d7a33c]
                      hover:text-black
                      transition-all
                    "
                  >
                    CONTINUE BROWSING
                  </button>
                </div>
              ) : (
                cart.lines.map((item) => (
                  <div
                    key={item.id}
                    className={`
                      flex
                      gap-4
                      pb-6
                      border-b
                      ${theme === "light" ? "border-slate-100" : "border-[#b88a2c]/10"}
                    `}
                  >
                    {/* Item Image */}
                    <div className={`relative w-20 h-24 shrink-0 rounded-md overflow-hidden ${theme === "light" ? "bg-slate-50" : "bg-slate-900"}`}>
                      {item.merchandise.product.featuredImage?.url ? (
                        <Image
                          src={item.merchandise.product.featuredImage.url}
                          alt={item.merchandise.product.featuredImage.altText || item.merchandise.product.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-white/40 bg-white/5">
                          NO IMAGE
                        </div>
                      )}
                    </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider leading-tight">
                              {item.merchandise.product.title.replace(/Denims/gi, 'Denim')}
                            </h4>
                            <span className="text-xs font-extrabold text-[#d7a33c]">
                              ₹ {(parseFloat(item.merchandise.price.amount) * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                          
                          {/* Item Subtitle / Accessory Badge */}
                          {/belt|chain|spray|accessory|accessories/i.test(item.merchandise.product.title) ? (
                            <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#d7a33c]/15 text-[#d7a33c] border border-[#d7a33c]/30">
                              ✨ PAIRED ACCESSORY
                            </span>
                          ) : (
                            <p className={`text-[10px] mt-1 font-semibold uppercase tracking-widest ${theme === "light" ? "text-slate-400" : "text-white/40"}`}>
                              Size: {item.merchandise.title}
                            </p>
                          )}
                        </div>

                      {/* Quantity Selector & Remove Button */}
                      <div className="flex justify-between items-center mt-2">
                        <div className={`flex items-center border ${theme === "light" ? "border-slate-200" : "border-[#b88a2c]/20"}`}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-xs hover:bg-[#d7a33c]/10 hover:text-[#d7a33c] transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-[11px] font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-xs hover:bg-[#d7a33c]/10 hover:text-[#d7a33c] transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className={`
                            text-[10px]
                            font-bold
                            tracking-widest
                            transition-colors
                            ${theme === "light" ? "text-slate-400 hover:text-red-500" : "text-white/30 hover:text-red-400"}
                          `}
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Accessories Upsell Widget */}
            {cart && cart.lines.length > 0 && (
              <div className={`p-4 border-t ${theme === "light" ? "bg-slate-50/90 border-slate-200" : "bg-[#0d121c] border-[#b88a2c]/20"}`}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#d7a33c] flex items-center gap-1.5">
                    <span>✨</span> COMPLETE YOUR LOOK WITH ACCESSORIES
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    FAST ADD
                  </span>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin select-none">
                  {displayAccessories.map((acc: any) => {
                    const isInCart = cart.lines.some((item) =>
                      item.merchandise.product.title.toLowerCase().includes(acc.title.split(" ")[0].toLowerCase())
                    );

                    return (
                      <div
                        key={acc.id}
                        className={`flex-shrink-0 w-[175px] p-2 rounded-lg border flex items-center gap-2.5 transition-all ${
                          theme === "light"
                            ? "bg-white border-slate-200 shadow-sm"
                            : "bg-[#060910] border-[#b88a2c]/20"
                        }`}
                      >
                        <img
                          src={acc.image}
                          alt={acc.title}
                          className="w-10 h-11 object-cover rounded bg-slate-900 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold truncate leading-tight">
                            {acc.title}
                          </p>
                          <p className="text-[10px] font-extrabold text-[#d7a33c] mt-0.5">
                            {acc.formattedPrice}
                          </p>
                          <button
                            type="button"
                            disabled={isInCart}
                            onClick={async () => {
                              await addToCart(
                                acc.variantId,
                                1,
                                {
                                  title: acc.title,
                                  price: acc.price,
                                  image: acc.image,
                                },
                                false
                              );
                            }}
                            className={`mt-1 text-[9px] font-black tracking-wider px-2 py-0.5 rounded transition-all cursor-pointer ${
                              isInCart
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default"
                                : "bg-[#d7a33c] text-black hover:bg-[#f3bf4e] shadow-sm"
                            }`}
                          >
                            {isInCart ? "✓ ADDED" : "+ ADD"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Summary Section */}
            {cart && cart.lines.length > 0 && (
              <div className={`p-6 border-t ${theme === "light" ? "bg-slate-50 border-slate-100" : "bg-[#080b12] border-[#b88a2c]/10"}`}>
                <div className="flex justify-between items-center mb-6">
                  <span className={`text-[11px] tracking-[0.2em] font-semibold ${theme === "light" ? "text-slate-500" : "text-white/50"}`}>
                    ESTIMATED TOTAL
                  </span>
                  <span className="text-xl font-black text-[#d7a33c]">
                    ₹ {subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <a
                  href={cart.checkoutUrl}
                  onClick={handleCheckout}
                  className={`
                    block
                    w-full
                    text-center
                    py-4
                    text-[10px]
                    font-black
                    tracking-[0.25em]
                    uppercase
                    bg-[#d7a33c]
                    text-black
                    hover:bg-[#f3bf4e]
                    transition-all
                    duration-300
                    shadow-[0_10px_20px_rgba(215,163,60,0.15)]
                    ${isRedirecting ? "opacity-75 pointer-events-none" : "cursor-pointer"}
                  `}
                >
                  {isRedirecting ? "PREPARING CHECKOUT..." : "PROCEED TO CHECKOUT"}
                </a>

                <p className={`text-[9px] text-center mt-3 tracking-widest ${theme === "light" ? "text-slate-400" : "text-white/30"}`}>
                  Shipping, taxes, and discounts calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
