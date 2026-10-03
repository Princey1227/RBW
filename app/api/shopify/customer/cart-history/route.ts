import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("customerId");

    if (!id) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

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

    const numericId = id.toString().replace("gid://shopify/Customer/", "");

    let cartHistory: any[] = [];

    // Fetch custom.cart_history Metafield directly from Shopify Admin API
    try {
      const metafieldsUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${numericId}/metafields.json?namespace=custom&key=cart_history`;
      const res = await axios.get(metafieldsUrl, { headers });
      const mfList = res.data.metafields || [];
      const cartHistoryMf = mfList.find(
        (m: any) => m.namespace === "custom" && m.key === "cart_history"
      ) || mfList[0];

      if (cartHistoryMf && cartHistoryMf.value) {
        const parsed = typeof cartHistoryMf.value === "string" ? JSON.parse(cartHistoryMf.value) : cartHistoryMf.value;
        if (Array.isArray(parsed)) {
          cartHistory = parsed;
        }
      }
    } catch (mfErr: any) {
      console.warn("Could not read custom.cart_history customer metafield:", mfErr.message);
    }

    return NextResponse.json({ success: true, cartHistory });
  } catch (err: any) {
    console.error("Error in GET /api/shopify/customer/cart-history:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function saveToMetafield(customerId: string, key: string, data: any[], storeDomain: string, apiVersion: string, adminToken: string) {
  const numericId = customerId.replace("gid://shopify/Customer/", "").trim();
  const graphqlUrl = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
  
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": adminToken,
  };

  const res = await axios.post(
    graphqlUrl,
    {
      query: `
        mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields { key namespace value }
            userErrors { field message }
          }
        }
      `,
      variables: {
        metafields: [{
          ownerId: `gid://shopify/Customer/${numericId}`,
          namespace: "custom",
          key: key,
          value: JSON.stringify(data),
          type: "json"
        }]
      }
    },
    { headers }
  );

  const userErrors = res.data?.data?.metafieldsSet?.userErrors;
  if (userErrors && userErrors.length > 0) {
    console.error("Metafield save userErrors:", userErrors);
    throw new Error(userErrors[0].message);
  }

  return res.data?.data?.metafieldsSet?.metafields;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, cartHistory } = body;

    if (!customerId || !Array.isArray(cartHistory)) {
      return NextResponse.json(
        { error: "Invalid parameters (customerId and cartHistory array required)" },
        { status: 400 }
      );
    }

    const adminToken = (
      process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ||
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ||
      process.env.SHOPIFY_ADMIN_TOKEN
    )?.trim();
    const storeDomain = (process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN || "shop.onlydenims.com")?.trim();
    const apiVersion = (process.env.SHOPIFY_API_VERSION || "2025-04").trim();

    if (!adminToken || !storeDomain) {
      return NextResponse.json({ error: "Shopify credentials not configured" }, { status: 500 });
    }

    const numericId = customerId.toString().replace("gid://shopify/Customer/", "");

    try {
      await saveToMetafield(numericId, "cart_history", cartHistory, storeDomain, apiVersion, adminToken);
      console.log("Successfully saved cart_history via GraphQL saveToMetafield helper:", numericId);
    } catch (mfErr: any) {
      console.warn("Cart history GraphQL metafield save failed:", mfErr.message);
      return NextResponse.json(
        { error: `Failed to persist cart_history to Shopify: ${mfErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, cartHistory });
  } catch (err: any) {
    console.error("Error in POST /api/shopify/customer/cart-history:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
