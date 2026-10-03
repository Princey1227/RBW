import { NextResponse } from "next/server";
import { fetchShopifyProducts } from "../../../../utils/shopify";

export const dynamic = "force-dynamic";

export async function GET() {
  console.log("LOG: API route /api/shopify/products GET called.");
  try {
    const products = await fetchShopifyProducts();
    console.log("LOG: API route fetched products successfully. Count:", products.length);
    console.log("LOG: API route returned products:", JSON.stringify(products, null, 2));
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Shopify API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
