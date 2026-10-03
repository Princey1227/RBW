import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCustomerId = searchParams.get("customerId");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    const adminToken = (
      process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ||
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ||
      process.env.SHOPIFY_ADMIN_TOKEN
    )?.trim();
    const rawStoreDomain = (process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN || "0v0kas-ia.myshopify.com")?.trim();
    const storeDomain = rawStoreDomain.endsWith(".myshopify.com")
      ? rawStoreDomain
      : (process.env.SHOPIFY_MYSHOPIFY_DOMAIN || "0v0kas-ia.myshopify.com");
    const apiVersion = (process.env.SHOPIFY_API_VERSION || "2025-04").trim();

    if (!adminToken || !storeDomain) {
      return NextResponse.json({ error: "Shopify credentials not configured" }, { status: 500 });
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
      "User-Agent": "OnlyDenims-App/1.0",
    };

    let numericId = rawCustomerId ? rawCustomerId.toString().replace("gid://shopify/Customer/", "").trim() : "";

    // If no numeric ID or if temp_customer, search Shopify for customer by email or phone
    if ((!numericId || numericId === "temp_customer") && (email || phone)) {
      if (email && email.includes("@")) {
        try {
          const searchUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/search.json?query=${encodeURIComponent(`email:${email}`)}`;
          const searchRes = await axios.get(searchUrl, { headers });
          if (searchRes.data.customers && searchRes.data.customers.length > 0) {
            numericId = searchRes.data.customers[0].id.toString();
          }
        } catch (e) {
          console.warn("Error searching customer by email for orders:", e);
        }
      }

      if ((!numericId || numericId === "temp_customer") && phone) {
        const cleaned = phone.replace(/\D/g, "");
        const phone10 = cleaned.slice(-10);
        if (phone10) {
          try {
            const searchUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/search.json?query=${encodeURIComponent(`phone:${phone10}`)}`;
            const searchRes = await axios.get(searchUrl, { headers });
            if (searchRes.data.customers && searchRes.data.customers.length > 0) {
              numericId = searchRes.data.customers[0].id.toString();
            }
          } catch (e) {
            console.warn("Error searching customer by phone for orders:", e);
          }
        }
      }
    }

    if (!numericId || numericId === "temp_customer") {
      return NextResponse.json({ success: true, orders: [] });
    }

    // Fetch customer orders from Shopify Admin REST API (status=any gets open, fulfilled, closed, cancelled)
    const ordersUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${numericId}/orders.json?status=any&limit=50`;
    let rawOrders: any[] = [];
    try {
      const ordersRes = await axios.get(ordersUrl, { headers });
      rawOrders = ordersRes.data.orders || [];
    } catch (ordersErr: any) {
      console.error("Failed to fetch customer orders from Shopify Admin API:", ordersErr.response?.data || ordersErr.message);
      // Fallback endpoint
      try {
        const fallbackUrl = `https://${storeDomain}/admin/api/${apiVersion}/orders.json?customer_id=${numericId}&status=any&limit=50`;
        const fallbackRes = await axios.get(fallbackUrl, { headers });
        rawOrders = fallbackRes.data.orders || [];
      } catch (fbErr: any) {
        console.error("Fallback order fetch failed:", fbErr.message);
      }
    }

    // Collect product IDs to batch fetch featured images for line items
    const productIdsSet = new Set<string>();
    rawOrders.forEach((o: any) => {
      if (Array.isArray(o.line_items)) {
        o.line_items.forEach((li: any) => {
          if (li.product_id) {
            productIdsSet.add(li.product_id.toString());
          }
        });
      }
    });

    // Fetch product images map
    const productImageMap: Record<string, string> = {};
    if (productIdsSet.size > 0) {
      const idsArray = Array.from(productIdsSet);
      // Fetch product images using Admin API
      await Promise.all(
        idsArray.slice(0, 20).map(async (pid) => {
          try {
            const pRes = await axios.get(
              `https://${storeDomain}/admin/api/${apiVersion}/products/${pid}.json?fields=id,image,images`,
              { headers }
            );
            const pData = pRes.data?.product;
            if (pData?.image?.src) {
              productImageMap[pid] = pData.image.src;
            } else if (pData?.images?.[0]?.src) {
              productImageMap[pid] = pData.images[0].src;
            }
          } catch (err) {
            // Ignore individual product image fetch error
          }
        })
      );
    }

    // Format orders for frontend consumption
    const formattedOrders = rawOrders.map((o: any) => {
      const shipping = o.shipping_address || o.billing_address || {};
      const fulfillments = Array.isArray(o.fulfillments)
        ? o.fulfillments.map((f: any) => ({
            id: f.id,
            status: f.status,
            trackingCompany: f.tracking_company || f.tracking_company_name || "Express Courier",
            trackingNumber: f.tracking_number || (f.tracking_numbers ? f.tracking_numbers[0] : ""),
            trackingUrl: f.tracking_url || (f.tracking_urls ? f.tracking_urls[0] : ""),
            createdAt: f.created_at || f.updated_at,
          }))
        : [];

      const lineItems = (o.line_items || []).map((li: any) => {
        const pidStr = li.product_id ? li.product_id.toString() : "";
        const image = productImageMap[pidStr] || li.image?.src || "";
        return {
          id: li.id,
          productId: pidStr,
          variantId: li.variant_id ? `gid://shopify/ProductVariant/${li.variant_id}` : "",
          title: li.title,
          variantTitle: li.variant_title && li.variant_title !== "Default Title" ? li.variant_title : "",
          quantity: li.quantity,
          price: li.price,
          sku: li.sku || "",
          imageUrl: image,
        };
      });

      return {
        id: `gid://shopify/Order/${o.id}`,
        numericId: o.id.toString(),
        orderNumber: o.order_number ? o.order_number.toString() : o.name ? o.name.replace("#", "") : o.id.toString(),
        name: o.name || `#${o.order_number}`,
        processedAt: o.processed_at || o.created_at,
        createdAt: o.created_at,
        totalPrice: o.total_price || "0.00",
        subtotalPrice: o.subtotal_price || "0.00",
        totalTax: o.total_tax || "0.00",
        totalShipping: o.total_shipping_price_set?.shop_money?.amount || (o.shipping_lines?.[0]?.price) || "0.00",
        totalDiscounts: o.total_discounts || "0.00",
        currency: o.currency || o.presentment_currency || "INR",
        financialStatus: o.financial_status || "pending",
        fulfillmentStatus: o.fulfillment_status || "unfulfilled",
        cancelReason: o.cancel_reason || null,
        cancelledAt: o.cancelled_at || null,
        orderStatusUrl: o.order_status_url || "",
        shippingAddress: {
          name: shipping.name || `${shipping.first_name || ""} ${shipping.last_name || ""}`.trim(),
          address1: shipping.address1 || "",
          address2: shipping.address2 || "",
          city: shipping.city || "",
          province: shipping.province || shipping.state || "",
          zip: shipping.zip || "",
          country: shipping.country || "India",
          phone: shipping.phone || "",
        },
        fulfillments,
        lineItems,
      };
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (err: any) {
    console.error("Error in GET /api/shopify/customer/orders:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
