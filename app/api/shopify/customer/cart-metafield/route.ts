import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

/**
 * API Route: /api/shopify/customer/cart-metafield
 * GET: Fetch saved cart_id from Shopify Customer Metafield
 * POST: Save or clear cart_id in Shopify Customer Metafield
 */

const getShopifyCredentials = () => {
  const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN?.trim();
  const rawStoreDomain = (
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
    process.env.SHOPIFY_STORE_DOMAIN ||
    "0v0kas-ia.myshopify.com"
  )?.trim();
  const storeDomain = rawStoreDomain.endsWith(".myshopify.com")
    ? rawStoreDomain
    : (process.env.SHOPIFY_MYSHOPIFY_DOMAIN || "0v0kas-ia.myshopify.com");
  const apiVersion = (process.env.SHOPIFY_API_VERSION || "2025-04").trim();

  return { adminToken, storeDomain, apiVersion };
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("customerId");

    if (!rawId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    const { adminToken, storeDomain, apiVersion } = getShopifyCredentials();

    if (!adminToken || !storeDomain) {
      return NextResponse.json({ error: "Shopify Admin API credentials not configured" }, { status: 500 });
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
      "User-Agent": "OnlyDenims-App/1.0",
    };

    const numericId = rawId.toString().replace("gid://shopify/Customer/", "");

    // Fetch custom.cart_id customer metafield from Shopify Admin API
    const metafieldsUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${numericId}/metafields.json?namespace=custom&key=cart_id`;
    const res = await axios.get(metafieldsUrl, { headers });
    const mfList = res.data.metafields || [];
    const cartIdMf = mfList.find(
      (m: any) => m.namespace === "custom" && m.key === "cart_id"
    ) || mfList[0];

    if (cartIdMf && cartIdMf.value) {
      return NextResponse.json({ success: true, cartId: cartIdMf.value });
    }

    return NextResponse.json({ success: true, cartId: null });
  } catch (error: any) {
    console.error("Error reading customer cart_id metafield:", error.response?.data || error.message);
    return NextResponse.json({ success: false, cartId: null, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId: rawId, cartId } = body;

    if (!rawId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    const { adminToken, storeDomain, apiVersion } = getShopifyCredentials();

    if (!adminToken || !storeDomain) {
      return NextResponse.json({ error: "Shopify Admin API credentials not configured" }, { status: 500 });
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
      "User-Agent": "OnlyDenims-App/1.0",
    };

    const numericId = rawId.toString().replace("gid://shopify/Customer/", "");
    const customerGid = `gid://shopify/Customer/${numericId}`;

    // Update customer custom.cart_id metafield via Shopify Admin GraphQL API (metafieldsSet)
    const graphqlUrl = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

    const mutation = `
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      metafields: [
        {
          ownerId: customerGid,
          namespace: "custom",
          key: "cart_id",
          value: cartId ? cartId.toString() : "",
          type: "single_line_text_field",
        },
      ],
    };

    const gqlRes = await axios.post(graphqlUrl, { query: mutation, variables }, { headers });

    const userErrors = gqlRes.data?.data?.metafieldsSet?.userErrors || [];
    if (userErrors.length > 0) {
      console.warn("GraphQL userErrors on customer cart_id metafield update:", userErrors);
    }

    // Fallback: Also try REST API metafield endpoint for maximum compatibility
    try {
      const restUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${numericId}/metafields.json`;
      await axios.post(
        restUrl,
        {
          metafield: {
            namespace: "custom",
            key: "cart_id",
            value: cartId ? cartId.toString() : "",
            type: "single_line_text_field",
          },
        },
        { headers }
      );
    } catch (e) {
      // Ignore REST duplicate errors if GraphQL already updated it
    }

    return NextResponse.json({ success: true, cartId });
  } catch (error: any) {
    console.error("Error updating customer cart_id metafield:", error.response?.data || error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
