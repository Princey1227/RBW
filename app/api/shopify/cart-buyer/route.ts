import { NextResponse } from "next/server";
import { shopifyFetch, UPDATE_CART_BUYER_IDENTITY_MUTATION } from "../../../../utils/shopify";

export async function POST(req: Request) {
  console.log("\n==================== [CART-BUYER API ROUTE CALLED] ====================");
  try {
    const body = await req.json();
    const { cartId, email, phone, address } = body;

    console.log("📥 Received API Payload:", JSON.stringify({ cartId, email, phone, address }, null, 2));

    if (!cartId || typeof cartId !== "string" || cartId.startsWith("local_")) {
      console.error("❌ ERROR: Invalid or missing cartId:", cartId);
      console.log("==================== [CART-BUYER API ROUTE END] ====================\n");
      return NextResponse.json({ error: "Invalid or missing cartId", receivedCartId: cartId }, { status: 400 });
    }

    const buyerIdentity: any = {
      countryCode: "IN",
    };

    if (email && typeof email === "string" && email.trim()) {
      buyerIdentity.email = email.trim();
    }

    if (phone && typeof phone === "string" && phone.trim()) {
      let cleaned = phone.replace(/\D/g, "");
      if (cleaned.length === 10) {
        cleaned = `+91${cleaned}`;
      } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
        cleaned = `+${cleaned}`;
      } else if (!phone.startsWith("+")) {
        cleaned = `+${cleaned}`;
      } else {
        cleaned = phone;
      }
      buyerIdentity.phone = cleaned;
    }

    if (address && typeof address === "object" && (address.address1 || address.city || address.zip)) {
      buyerIdentity.deliveryAddressPreferences = [
        {
          deliveryAddress: {
            address1: address.address1 || "",
            address2: address.address2 || "",
            city: address.city || "",
            province: address.province || "",
            zip: address.zip || "",
            country: address.country || "India",
            firstName: address.firstName || "",
            lastName: address.lastName || "",
            phone: address.phone || buyerIdentity.phone || "",
          },
        },
      ];
    }

    console.log("🚀 Executing Storefront GraphQL cartBuyerIdentityUpdate with variables:", JSON.stringify({ cartId, buyerIdentity }, null, 2));

    const response = await shopifyFetch<{
      cartBuyerIdentityUpdate: {
        cart: {
          id: string;
          checkoutUrl: string;
          buyerIdentity: any;
        };
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>({
      query: UPDATE_CART_BUYER_IDENTITY_MUTATION,
      variables: {
        cartId,
        buyerIdentity,
      },
    });

    const result = response.body?.cartBuyerIdentityUpdate;
    console.log("✅ Storefront Raw Response:", JSON.stringify(result, null, 2));

    if (result?.userErrors && result.userErrors.length > 0) {
      console.error("⚠️ Storefront userErrors returned from Shopify:", JSON.stringify(result.userErrors, null, 2));
    } else {
      console.log("🎉 Success! Updated checkoutUrl:", result?.cart?.checkoutUrl);
    }
    console.log("==================== [CART-BUYER API ROUTE END] ====================\n");

    return NextResponse.json({
      success: true,
      cart: result?.cart,
      checkoutUrl: result?.cart?.checkoutUrl,
      userErrors: result?.userErrors || [],
    });
  } catch (error: any) {
    console.error("💥 CRITICAL ERROR in /api/shopify/cart-buyer route:", error?.response?.data || error?.message || error);
    console.log("==================== [CART-BUYER API ROUTE END] ====================\n");
    return NextResponse.json({ error: error.message || "Failed to update buyer identity" }, { status: 500 });
  }
}
