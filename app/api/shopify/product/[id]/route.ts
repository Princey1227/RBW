import { NextResponse } from "next/server";
import { fetchShopifyProductById } from "../../../../../utils/shopify";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const rawParam = params?.id ? String(params.id) : "";
    let decodedId = decodeURIComponent(rawParam);
    
    if (decodedId === "vintage-denim-jacket" || decodedId === "wide-vintage-denim-trucker") {
      decodedId = "white-denim-jacket";
    }
    
    if (!decodedId) {
      return NextResponse.json({ error: "Missing product ID parameter" }, { status: 400 });
    }

    console.log("LOG: API route /api/shopify/product/[id] called for:", decodedId);
    const product = await fetchShopifyProductById(decodedId);
    
    if (!product) {
      console.log("LOG: Product not found for ID:", decodedId);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    console.log("LOG: Product fetched successfully:", product.title);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Shopify Product API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}
