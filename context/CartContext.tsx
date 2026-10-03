"use client";

// Cart and Wishlist Context Provider for OnlyDenims (Cross-Device Cart Persistence)
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "./ToastContext";
import {
  shopifyFetch,
  CREATE_CART_MUTATION,
  GET_CART_QUERY,
  ADD_TO_CART_MUTATION,
  UPDATE_CART_MUTATION,
  REMOVE_FROM_CART_MUTATION,
} from "../utils/shopify";
import { CheckoutTransition } from "../component/common/CheckoutTransition";

// Define Types
export interface CartItem {
  id: string; // Cart line ID
  quantity: number;
  merchandise: {
    id: string; // Variant ID
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    product: {
      title: string;
      handle: string;
      featuredImage?: {
        url: string;
        altText: string;
      };
    };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  lines: CartItem[];
}

export interface AddProductDetails {
  title: string;
  price: number;
  image?: string;
}

export interface CartContextType {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (variantId: string, quantity?: number, details?: AddProductDetails, openCart?: boolean) => Promise<Cart | null>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  updateBuyerIdentity: (user?: { email?: string; phone?: string; firstName?: string; lastName?: string; defaultAddress?: any; addresses?: any[] }) => Promise<string | undefined>;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  isCheckingOut: boolean;
  setIsCheckingOut: (val: boolean, message?: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "onlydenims_cart_id";
const LOCAL_CART_FALLBACK_KEY = "onlydenims_local_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCheckingOut, setIsCheckingOutState] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("ENTERING SECURE 1-CLICK CHECKOUT...");

  const setIsCheckingOut = (val: boolean, message?: string) => {
    if (message) setCheckoutMessage(message);
    setIsCheckingOutState(val);
  };

  // Helper to save active cartId to Shopify Customer Metafield (custom.cart_id) for Cross-Device Persistence
  const saveCartToCustomerMetafield = async (cartId: string | null) => {
    if (typeof window === "undefined") return;

    const savedCust = localStorage.getItem("shopifyCustomer");
    if (!savedCust) return;

    try {
      const cust = JSON.parse(savedCust);
      const customerId = cust.id || cust.customerId;
      if (customerId && customerId !== "temp_customer") {
        console.log("💾 [Cross-Device Cart] Saving cartId to Shopify Customer Metafield:", { customerId, cartId });
        await axios.post("/api/shopify/customer/cart-metafield", {
          customerId,
          cartId: cartId && !cartId.startsWith("local_") ? cartId : null,
        }).catch((err) => {
          console.error("Failed to update customer cart_id metafield:", err);
        });
      }
    } catch (err) {
      console.error("Error saving cartId to customer metafield:", err);
    }
  };

  // Helper to restore & merge saved cart from Shopify Customer Metafield on authentication / mount
  const syncCustomerCartAndMetafield = async () => {
    if (typeof window === "undefined") return;

    const savedCust = localStorage.getItem("shopifyCustomer");

    // IF LOGGED OUT: Reset account cart state so logged-out guest does NOT see customer's cart!
    if (!savedCust) {
      console.log("🔒 [CartContext] User is logged out. Clearing account cart state...");
      const currentCartId = localStorage.getItem(CART_STORAGE_KEY);
      if (currentCartId && !currentCartId.startsWith("guest_local_")) {
        setCart(null);
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem("shopify_cart_id");
        localStorage.removeItem(LOCAL_CART_FALLBACK_KEY);
      }
      return;
    }

    try {
      const cust = JSON.parse(savedCust);
      const customerId = cust.id || cust.customerId;
      if (!customerId || customerId === "temp_customer") return;

      // 1. Fetch saved cartId from Shopify Customer Metafield via Admin API
      const res = await axios.get(`/api/shopify/customer/cart-metafield?customerId=${encodeURIComponent(customerId)}`);
      const savedMetafieldCartId = res.data?.cartId;

      console.log("🔍 [Cross-Device Cart] Customer Metafield savedCartId:", savedMetafieldCartId);

      if (savedMetafieldCartId && typeof savedMetafieldCartId === "string" && !savedMetafieldCartId.startsWith("local_")) {
        // 2. Validate saved cart exists and is active on Shopify
        try {
          const response = await shopifyFetch<{ cart: any }>({
            query: GET_CART_QUERY,
            variables: { cartId: savedMetafieldCartId },
          });

          const remoteCart = response.body.cart;

          if (remoteCart && remoteCart.id) {
            console.log("✅ [Cross-Device Cart] Restored valid active cart from Shopify Customer Metafield:", remoteCart.id);
            let finalCart = formatCartData(remoteCart);

            // 3. Merge current guest cart line items into restored cart if guest cart exists and is different
            const currentGuestCartId = localStorage.getItem(CART_STORAGE_KEY);
            if (currentGuestCartId && currentGuestCartId !== savedMetafieldCartId && cart && cart.lines.length > 0) {
              console.log("🔀 [Cross-Device Cart] Merging guest cart lines into restored customer cart...");
              const linesToAdd = cart.lines.map((line) => ({
                merchandiseId: line.merchandise.id,
                quantity: line.quantity,
              }));

              try {
                const mergeRes = await shopifyFetch<{ cartLinesAdd: { cart: any } }>({
                  query: ADD_TO_CART_MUTATION,
                  variables: {
                    cartId: savedMetafieldCartId,
                    lines: linesToAdd,
                  },
                });
                if (mergeRes.body?.cartLinesAdd?.cart) {
                  finalCart = formatCartData(mergeRes.body.cartLinesAdd.cart);
                }
              } catch (mergeErr) {
                console.warn("Failed to merge guest cart lines into restored customer cart:", mergeErr);
              }
            }

            // 4. Associate customer buyer identity with restored cart
            await updateBuyerIdentity(cust);

            // 5. Update local React state and localStorage
            setCart(finalCart);
            localStorage.setItem(CART_STORAGE_KEY, finalCart.id);
            localStorage.setItem("shopify_cart_id", finalCart.id);
            return;
          } else {
            // Cart expired (~10 days) or checked out -> clear customer metafield
            console.warn("⚠️ Customer saved cart expired or completed. Clearing customer cart_id metafield...");
            await axios.post("/api/shopify/customer/cart-metafield", {
              customerId,
              cartId: null,
            });
          }
        } catch (e) {
          console.warn("Failed to validate saved cartId from customer metafield:", e);
        }
      }
    } catch (err) {
      console.error("Error restoring cross-device cart from customer metafield:", err);
    }
  };

  // Load & Sync wishlist from localStorage and Shopify Customer on mount / authentication
  useEffect(() => {
    const syncCustomerWishlist = async () => {
      if (typeof window === "undefined") return;

      const savedCust = localStorage.getItem("shopifyCustomer");
      const localSaved = localStorage.getItem("onlydenims_wishlist");
      let localGuestItems: string[] = [];
      if (localSaved) {
        try {
          localGuestItems = JSON.parse(localSaved);
        } catch (e) {}
      }

      if (savedCust) {
        try {
          const cust = JSON.parse(savedCust);
          const customerId = cust.id || cust.customerId;

          if (customerId && customerId !== "temp_customer") {
            const res = await axios.get(`/api/shopify/customer/wishlist?customerId=${encodeURIComponent(customerId)}`, {
              validateStatus: (status) => status < 500,
            });

            if (res.data?.success && Array.isArray(res.data.wishlist)) {
              const remoteItems: string[] = res.data.wishlist;
              // Merge local guest wishlist with remote customer wishlist
              const mergedWishlist = Array.from(new Set([...remoteItems, ...localGuestItems]));

              setWishlist(mergedWishlist);
              localStorage.setItem("onlydenims_wishlist", JSON.stringify(mergedWishlist));
              cust.wishlist = mergedWishlist;
              localStorage.setItem("shopifyCustomer", JSON.stringify(cust));

              // If local guest items were merged into remote list, update customer metafield in Shopify Admin API
              if (mergedWishlist.length > remoteItems.length) {
                console.log("🔀 [Cross-Device Wishlist] Merged guest wishlist into customer metafield:", mergedWishlist);
                await axios.post("/api/shopify/customer/wishlist", {
                  customerId,
                  wishlist: mergedWishlist,
                }).catch((err) => {
                  console.error("Failed to post merged wishlist to Shopify customer metafield:", err);
                });
              }
              return;
            }
          }
        } catch (e) {
          console.error("Error syncing customer wishlist from Shopify customer metafield:", e);
        }
      }

      // Fallback to local storage if not logged in
      if (localSaved) {
        try {
          setWishlist(JSON.parse(localSaved));
        } catch (e) {
          console.error("Error loading wishlist from localStorage:", e);
        }
      } else {
        setWishlist([]);
      }
    };

    syncCustomerWishlist();
    syncCustomerCartAndMetafield();

    window.addEventListener("storage", syncCustomerWishlist);
    window.addEventListener("customer-update", syncCustomerWishlist);
    window.addEventListener("storage", syncCustomerCartAndMetafield);
    window.addEventListener("customer-update", syncCustomerCartAndMetafield);

    return () => {
      window.removeEventListener("storage", syncCustomerWishlist);
      window.removeEventListener("customer-update", syncCustomerWishlist);
      window.removeEventListener("storage", syncCustomerCartAndMetafield);
      window.removeEventListener("customer-update", syncCustomerCartAndMetafield);
    };
  }, []);

  const toggleWishlist = async (productId: string) => {
    const isAdding = !wishlist.includes(productId);
    const updated = isAdding
      ? [...wishlist, productId]
      : wishlist.filter((id) => id !== productId);

    showToast({
      title: isAdding ? "SAVED TO WISHLIST" : "REMOVED FROM WISHLIST",
      message: isAdding
        ? "Product saved to your personal wishlist."
        : "Product removed from your wishlist.",
      type: "wishlist",
      actionLabel: "VIEW WISHLIST",
      onAction: () => {
        if (typeof window !== "undefined") window.location.href = "/wishlist";
      },
    });

    // 1. Update React state immediately
    setWishlist(updated);

    if (typeof window !== "undefined") {
      // 2. Cache in localStorage
      localStorage.setItem("onlydenims_wishlist", JSON.stringify(updated));

      // 3. Persist to Shopify Customer via API
      const savedCust = localStorage.getItem("shopifyCustomer");
      if (savedCust) {
        try {
          const cust = JSON.parse(savedCust);
          const customerId = cust.id || cust.customerId;
          if (customerId && customerId !== "temp_customer") {
            cust.wishlist = updated;
            localStorage.setItem("shopifyCustomer", JSON.stringify(cust));

            console.log("Posting wishlist update to Shopify API:", { customerId, wishlist: updated });
            await axios.post("/api/shopify/customer/wishlist", {
              customerId,
              wishlist: updated,
            });
          }
        } catch (err) {
          console.error("Failed to persist wishlist to Shopify customer record:", err);
        }
      }
    }
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Initialize and load cart from localStorage (checking Shopify first, falling back to local fallback)
  useEffect(() => {
    async function initCart() {
      if (typeof window === "undefined") return;
      const savedCust = localStorage.getItem("shopifyCustomer");
      const savedCartId = localStorage.getItem(CART_STORAGE_KEY);

      if (!savedCust) {
        // If user is logged out, clear any leftover account cart ID from localStorage
        if (savedCartId && !savedCartId.startsWith("guest_local_")) {
          localStorage.removeItem(CART_STORAGE_KEY);
          localStorage.removeItem("shopify_cart_id");
          localStorage.removeItem(LOCAL_CART_FALLBACK_KEY);
          setCart(null);
          setIsLoading(false);
          return;
        }
      }

      if (savedCartId && !savedCartId.startsWith("local_")) {
        setIsLoading(true);
        try {
          const response = await shopifyFetch<{ cart: any }>({
            query: GET_CART_QUERY,
            variables: { cartId: savedCartId },
          });

          if (response.body.cart) {
            const formatted = formatCartData(response.body.cart);
            setCart(formatted);
            setIsLoading(false);
            saveCartToCustomerMetafield(formatted.id);
            return;
          } else {
            // Cart expired or not found on Shopify's end; clear local ID
            localStorage.removeItem(CART_STORAGE_KEY);
          }
        } catch (e) {
          console.warn("Failed to fetch existing cart from Shopify, falling back to local cache:", e);
        }
      }

      // Local fallback loading
      try {
        const cachedLocal = localStorage.getItem(LOCAL_CART_FALLBACK_KEY);
        if (cachedLocal) {
          setCart(JSON.parse(cachedLocal));
        }
      } catch (err) {
        console.error("Failed to parse cached local cart:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initCart();
  }, []);

  // Helper to format Shopify cart response
  const formatCartData = (shopifyCart: any): Cart => {
    const lines = shopifyCart.lines.edges.map((edge: any) => edge.node) as CartItem[];
    return {
      id: shopifyCart.id,
      checkoutUrl: shopifyCart.checkoutUrl,
      lines,
    };
  };

  // Local fallback state helpers
  const saveLocalCartState = (updatedCart: Cart) => {
    setCart(updatedCart);
    localStorage.setItem(LOCAL_CART_FALLBACK_KEY, JSON.stringify(updatedCart));
    if (updatedCart.id.startsWith("local_")) {
      localStorage.setItem(CART_STORAGE_KEY, updatedCart.id);
    }
  };

  // Create a new cart on Shopify
  const createNewCart = async (variantId: string, quantity = 1): Promise<Cart> => {
    const response = await shopifyFetch<{ cartCreate: { cart: any } }>({
      query: CREATE_CART_MUTATION,
      variables: {
        input: {
          lines: [{ merchandiseId: variantId, quantity }],
        },
      },
    });

    const newCart = formatCartData(response.body.cartCreate.cart);
    localStorage.setItem(CART_STORAGE_KEY, newCart.id);
    localStorage.setItem("shopify_cart_id", newCart.id);
    // Clear local storage cache when moving to Shopify cart
    localStorage.removeItem(LOCAL_CART_FALLBACK_KEY);

    // Save cartId to customer metafield for cross-device persistence
    saveCartToCustomerMetafield(newCart.id);

    // Auto-attach buyer identity if customer details exist in localStorage
    if (typeof window !== "undefined") {
      const savedCust = localStorage.getItem("shopifyCustomer");
      if (savedCust) {
        try {
          const cust = JSON.parse(savedCust);
          updateBuyerIdentity(cust);
        } catch (e) {}
      }
    }

    return newCart;
  };

  // Helper to sync active cart state to Shopify Customer custom.cart_history Metafield
  const syncCartHistoryToShopify = async (currentCart: Cart | null) => {
    if (typeof window === "undefined" || !currentCart) return;

    const savedCust = localStorage.getItem("shopifyCustomer");
    if (savedCust) {
      try {
        const cust = JSON.parse(savedCust);
        const customerId = cust.id || cust.customerId;
        if (customerId && customerId !== "temp_customer") {
          const cartHistory = currentCart.lines.map((line) => ({
            variantId: line.merchandise.id,
            title: line.merchandise.product.title,
            quantity: line.quantity,
            price: line.merchandise.price?.amount || "0",
          }));

          console.log("Posting cart history update to Shopify API:", { customerId, cartHistory });
          await axios.post("/api/shopify/customer/cart-history", {
            customerId,
            cartHistory,
          }).catch((err) => {
            console.error("Failed to sync cart history to Shopify customer record:", err);
          });
        }
      } catch (err) {
        console.error("Error saving cart history to Shopify customer:", err);
      }
    }
  };

  // Add Item to Cart
  const addToCart = async (variantId: string, quantity = 1, details?: AddProductDetails, openCart = true): Promise<Cart | null> => {
    setIsLoading(true);
    let updatedCartState: Cart | null = null;
    try {
      // If we are currently on a local mock cart, try to create a real one. If it fails, catch block will handle local update
      if (!cart || cart.id.startsWith("local_")) {
        const newCart = await createNewCart(variantId, quantity);
        setCart(newCart);
        updatedCartState = newCart;
      } else {
        const response = await shopifyFetch<{ cartLinesAdd: { cart: any } }>({
          query: ADD_TO_CART_MUTATION,
          variables: {
            cartId: cart.id,
            lines: [{ merchandiseId: variantId, quantity }],
          },
        });
        const formatted = formatCartData(response.body.cartLinesAdd.cart);
        setCart(formatted);
        updatedCartState = formatted;
        saveCartToCustomerMetafield(formatted.id);
      }
      if (openCart) {
        setIsOpen(true);
      }

      showToast({
        title: "ADDED TO BAG",
        message: `${details?.title || "Item"} added to your shopping bag.`,
        type: "success",
        image: details?.image,
        actionLabel: "VIEW BAG",
        onAction: () => setIsOpen(true),
      });
    } catch (e) {
      console.warn("Shopify Cart API failed or credentials missing. Performing local state fallback.", e);

      // Fallback local cart logic
      const fallbackPrice = details?.price ?? 1499;
      const fallbackTitle = details?.title ?? "Premium Denim";
      const fallbackImage = details?.image ?? "/raw_jeans_v2.png";

      const currentLines = cart ? [...cart.lines] : [];
      const existingLineIndex = currentLines.findIndex(
        (line) => line.merchandise.id === variantId
      );

      if (existingLineIndex > -1) {
        currentLines[existingLineIndex].quantity += quantity;
      } else {
        currentLines.push({
          id: `local_line_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          quantity,
          merchandise: {
            id: variantId,
            title: "Standard Fit",
            price: {
              amount: fallbackPrice.toString(),
              currencyCode: "INR",
            },
            product: {
              title: fallbackTitle,
              handle: fallbackTitle.toLowerCase().replace(/\s+/g, "-"),
              featuredImage: {
                url: fallbackImage,
                altText: fallbackTitle,
              },
            },
          },
        });
      }

      const updatedCart: Cart = {
        id: cart?.id && cart.id.startsWith("local_") ? cart.id : `local_cart_${Date.now()}`,
        checkoutUrl: "https://onlydenims-dev.myshopify.com/cart",
        lines: currentLines,
      };

      saveLocalCartState(updatedCart);
      updatedCartState = updatedCart;
      if (openCart) {
        setIsOpen(true);
      }
    } finally {
      setIsLoading(false);
      syncCartHistoryToShopify(updatedCartState);
    }
    return updatedCartState;
  };

  // Update Item Quantity
  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart) return;
    setIsLoading(true);
    let updatedCartState: Cart | null = null;
    try {
      if (quantity <= 0) {
        await removeFromCart(lineId);
        return;
      }

      if (cart.id.startsWith("local_")) {
        // Fallback local update
        const updatedLines = cart.lines.map((line) =>
          line.id === lineId ? { ...line, quantity } : line
        );
        updatedCartState = { ...cart, lines: updatedLines };
        saveLocalCartState(updatedCartState);
      } else {
        const response = await shopifyFetch<{ cartLinesUpdate: { cart: any } }>({
          query: UPDATE_CART_MUTATION,
          variables: {
            cartId: cart.id,
            lines: [{ id: lineId, quantity }],
          },
        });
        updatedCartState = formatCartData(response.body.cartLinesUpdate.cart);
        setCart(updatedCartState);
        saveCartToCustomerMetafield(updatedCartState.id);
      }
    } catch (e) {
      console.error("Error updating cart quantity:", e);
      // Fallback local update on failure
      const updatedLines = cart.lines.map((line) =>
        line.id === lineId ? { ...line, quantity } : line
      );
      updatedCartState = { ...cart, lines: updatedLines };
      saveLocalCartState(updatedCartState);
    } finally {
      setIsLoading(false);
      syncCartHistoryToShopify(updatedCartState);
    }
  };

  // Remove Item from Cart
  const removeFromCart = async (lineId: string) => {
    if (!cart) return;
    setIsLoading(true);
    let updatedCartState: Cart | null = null;
    try {
      if (cart.id.startsWith("local_")) {
        // Fallback local remove
        const updatedLines = cart.lines.filter((line) => line.id !== lineId);
        updatedCartState = { ...cart, lines: updatedLines };
        saveLocalCartState(updatedCartState);
      } else {
        const response = await shopifyFetch<{ cartLinesRemove: { cart: any } }>({
          query: REMOVE_FROM_CART_MUTATION,
          variables: {
            cartId: cart.id,
            lineIds: [lineId],
          },
        });
        updatedCartState = formatCartData(response.body.cartLinesRemove.cart);
        setCart(updatedCartState);
        saveCartToCustomerMetafield(updatedCartState.id);
      }
    } catch (e) {
      console.error("Error removing item from cart:", e);
      // Fallback local remove on failure
      const updatedLines = cart.lines.filter((line) => line.id !== lineId);
      updatedCartState = { ...cart, lines: updatedLines };
      saveLocalCartState(updatedCartState);
    } finally {
      setIsLoading(false);
      syncCartHistoryToShopify(updatedCartState);
    }
  };

  // Update cart buyer identity on Shopify
  const updateBuyerIdentity = async (user?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    defaultAddress?: any;
    addresses?: any[];
  }): Promise<string | undefined> => {
    console.group("🔍 [CartContext] updateBuyerIdentity Invoked");
    try {
      if (typeof window === "undefined") {
        console.log("Window is undefined (SSR), skipping identity update.");
        console.groupEnd();
        return;
      }

      let activeCartId = cart?.id || localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem("shopify_cart_id");

      console.log("🛒 Active Cart ID:", activeCartId || "NONE (null)");
      console.log("👤 Passed User Identity Input:", user);

      let email = user?.email;
      let phone = user?.phone;
      let firstName = user?.firstName;
      let lastName = user?.lastName;
      let address = user?.defaultAddress || (user?.addresses && user.addresses[0]);

      // Always try fallback/enrichment from localStorage ('shopifyCustomer')
      const savedCust = localStorage.getItem("shopifyCustomer");
      if (savedCust) {
        try {
          const cust = JSON.parse(savedCust);
          email = email || cust.email;
          phone = phone || cust.phone;
          firstName = firstName || cust.firstName;
          lastName = lastName || cust.lastName;
          address = address || cust.defaultAddress || (cust.addresses && cust.addresses[0]);
          console.log("📦 Customer details loaded for buyer identity:", { email, phone, firstName, address });
        } catch (e) {}
      }

      if (!email && !phone) {
        console.warn("⚠️ Cannot update buyer identity: Neither email nor phone is available.");
        console.groupEnd();
        return;
      }

      // Format phone to E.164 (+91 format for India)
      if (phone && typeof phone === "string") {
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length === 10) {
          phone = `+91${cleaned}`;
        } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
          phone = `+${cleaned}`;
        } else if (!phone.startsWith("+")) {
          phone = `+${cleaned}`;
        }
      }
      console.log("📞 Formatted E.164 Phone:", phone);

      if (!activeCartId || activeCartId.startsWith("local_")) {
        console.warn("⚠️ No active Shopify cartId found (or cart is local fallback). Identity will be attached when a Shopify cart is created.");
        console.groupEnd();
        return;
      }

      const formattedAddress = address ? {
        address1: address.address1 || address.line1 || address.street || "",
        address2: address.address2 || address.line2 || "",
        city: address.city || "",
        province: address.province || address.state || "",
        zip: address.zip || address.pincode || address.postal_code || "",
        country: address.country || "India",
        firstName: firstName || address.firstName || address.first_name || "",
        lastName: lastName || address.lastName || address.last_name || "",
        phone: phone || address.phone || "",
      } : null;

      console.log("📡 Sending POST /api/shopify/cart-buyer payload:", { cartId: activeCartId, email, phone, address: formattedAddress });

      const res = await axios.post("/api/shopify/cart-buyer", {
        cartId: activeCartId,
        email,
        phone,
        address: formattedAddress,
      });

      console.log("📥 Received /api/shopify/cart-buyer response:", res.data);

      if (res.data?.success && res.data?.checkoutUrl) {
        console.log("🎉 SUCCESS! Shopify Cart updated with buyer identity. New Checkout URL:", res.data.checkoutUrl);
        const newUrl = res.data.checkoutUrl;
        setCart((prev) => (prev ? { ...prev, checkoutUrl: newUrl } : null));
        console.groupEnd();
        return newUrl;
      } else if (res.data?.userErrors?.length > 0) {
        console.error("❌ SHOPIFY USER ERRORS:", res.data.userErrors);
      }
    } catch (err: any) {
      console.error("💥 FAILED to update cart buyer identity:", err?.response?.data || err?.message || err);
    } finally {
      console.groupEnd();
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isLoading,
        setIsOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        updateBuyerIdentity,
        wishlist,
        toggleWishlist,
        isWishlisted,
        isCheckingOut,
        setIsCheckingOut,
      }}
    >
      {children}
      <CheckoutTransition isVisible={isCheckingOut} message={checkoutMessage} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
