import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

/**
 * API Route: /api/shopify/customer/wishlist
 * GET: Fetch saved wishlist array from Shopify Customer Metafield (custom.wishlist)
 * POST: Save or update wishlist array in Shopify Customer Metafield
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

    let wishlist: string[] = [];

    // 1. Fetch custom.wishlist Metafield directly from Shopify Admin API
    try {
      const metafieldsUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${numericId}/metafields.json?namespace=custom&key=wishlist`;
      const res = await axios.get(metafieldsUrl, { headers });
      const mfList = res.data.metafields || [];
      const wishlistMf = mfList.find(
        (m: any) => m.namespace === "custom" && m.key === "wishlist"
      ) || mfList[0];

      if (wishlistMf && wishlistMf.value) {
        const val = wishlistMf.value;
        const parsed = typeof val === "string" ? JSON.parse(val) : val;
        if (Array.isArray(parsed)) {
          wishlist = parsed.map((item: any) => item.toString());
          return NextResponse.json({ success: true, wishlist });
        }
      }
    } catch (mfErr: any) {
      console.warn("Could not read custom.wishlist customer metafield:", mfErr.message);
    }

    // 2. Fallback: Read from customer note if metafield not found
    try {
      const custUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${numericId}.json`;
      const custRes = await axios.get(custUrl, { headers });
      const customer = custRes.data.customer;
      if (customer && customer.note && customer.note.includes("WISHLIST:")) {
        const match = customer.note.match(/WISHLIST:(\[.*?\])/);
        if (match && match[1]) {
          wishlist = JSON.parse(match[1]);
        }
      }
    } catch (custErr: any) {
      console.warn("Could not read customer note:", custErr.message);
    }

    return NextResponse.json({ success: true, wishlist });
  } catch (err: any) {
    console.error("Error in GET /api/shopify/customer/wishlist:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function saveToMetafield(
  customerId: string,
  key: string,
  data: string[],
  storeDomain: string,
  apiVersion: string,
  adminToken: string
) {
  const numericId = customerId.replace("gid://shopify/Customer/", "").trim();
  const graphqlUrl = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": adminToken,
  };

  const jsonValue = JSON.stringify(data);

  // Try GraphQL metafieldsSet mutation (supports both list.product_reference and json/single_line_text_field)
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
        metafields: [
          {
            ownerId: `gid://shopify/Customer/${numericId}`,
            namespace: "custom",
            key: key,
            value: jsonValue,
            type: "json",
          },
        ],
      },
    },
    { headers }
  );

  const userErrors = res.data?.data?.metafieldsSet?.userErrors;
  if (userErrors && userErrors.length > 0) {
    console.warn("GraphQL Metafield save userErrors, retrying with single_line_text_field:", userErrors);
    // Retry with single_line_text_field
    const retryRes = await axios.post(
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
          metafields: [
            {
              ownerId: `gid://shopify/Customer/${numericId}`,
              namespace: "custom",
              key: key,
              value: jsonValue,
              type: "single_line_text_field",
            },
          ],
        },
      },
      { headers }
    );
    return retryRes.data?.data?.metafieldsSet?.metafields;
  }

  return res.data?.data?.metafieldsSet?.metafields;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, wishlist } = body;

    if (!customerId || !Array.isArray(wishlist)) {
      return NextResponse.json(
        { error: "Invalid parameters (customerId and wishlist array required)" },
        { status: 400 }
      );
    }

    const { adminToken, storeDomain, apiVersion } = getShopifyCredentials();

    if (!adminToken || !storeDomain) {
      return NextResponse.json({ error: "Shopify credentials not configured" }, { status: 500 });
    }

    const numericId = customerId.toString().replace("gid://shopify/Customer/", "");
    const wishlistJson = JSON.stringify(wishlist);
    let saved = false;

    // 1. Upsert custom.wishlist Metafield using saveToMetafield helper
    try {
      await saveToMetafield(numericId, "wishlist", wishlist, storeDomain, apiVersion, adminToken);
      saved = true;
      console.log("Successfully saved wishlist via GraphQL saveToMetafield helper:", numericId);
    } catch (mfErr: any) {
      console.warn("GraphQL saveToMetafield failed, falling back to REST/note:", mfErr.message);
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
      "User-Agent": "OnlyDenims-App/1.0",
    };

    // 2. Sync to customer note as secondary backup
    try {
      const custUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${numericId}.json`;
      const getCust = await axios.get(custUrl, { headers });
      let currentNote = getCust.data.customer?.note || "";

      if (currentNote.includes("WISHLIST:")) {
        currentNote = currentNote.replace(/WISHLIST:\[.*?\]/g, `WISHLIST:${wishlistJson}`).trim();
      } else {
        currentNote = currentNote ? `${currentNote}\nWISHLIST:${wishlistJson}` : `WISHLIST:${wishlistJson}`;
      }

      await axios.put(
        custUrl,
        { customer: { id: numericId, note: currentNote } },
        { headers }
      );
      saved = true;
      console.log("Successfully updated customer note with wishlist backup:", numericId);
    } catch (noteErr: any) {
      console.warn("Customer note update failed:", noteErr.response?.data || noteErr.message);
    }

    if (!saved) {
      return NextResponse.json(
        { error: "Failed to persist wishlist to Shopify customer record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, wishlist });
  } catch (err: any) {
    console.error("Error in POST /api/shopify/customer/wishlist:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
