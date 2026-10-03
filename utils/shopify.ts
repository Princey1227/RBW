
// Configure DNS to prefer IPv4 first on Node.js server side.
// This prevents "Error [AggregateError]" issues when IPv6 lookup fails or is slow on the host/ISP.
if (typeof window === "undefined") {
  try {
    const dns = eval("require")("dns");
    if (dns && dns.setDefaultResultOrder) {
      dns.setDefaultResultOrder("ipv4first");
    }
  } catch (e) {
    // Ignore in non-Node environments
  }
}

export async function shopifyFetch<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: Record<string, any>;
}): Promise<{ status: number; body: T } | never> {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-04";

  console.log("LOG: shopifyFetch started...");
  console.log("LOG: domain:", domain);
  console.log("LOG: token (masked):", storefrontAccessToken ? `${storefrontAccessToken.substring(0, 6)}...${storefrontAccessToken.slice(-4)}` : "undefined");
  console.log("LOG: apiVersion:", apiVersion);

  if (!domain || !storefrontAccessToken) {
    throw new Error("Shopify credentials are not configured in environment variables.");
  }

  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;
  console.log("LOG: requesting endpoint:", endpoint);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });

    const body = await response.json();
    console.log("LOG: shopifyFetch response data:", JSON.stringify(body, null, 2));

    if (body.errors) {
      throw new Error(body.errors[0].message);
    }

    return {
      status: response.status,
      body: body.data as T,
    };
  } catch (error: any) {
    if (error.errors && Array.isArray(error.errors)) {
      console.error("Shopify API Fetch Error (AggregateError):");
      error.errors.forEach((err: any, idx: number) => {
        console.error(`  Error [${idx}]:`, err.message || err);
      });
    } else {
      console.error("Shopify API Fetch Error:", error.response?.data || error.message || error);
    }
    throw error;
  }
}


/* ==========================================
   GRAPHQL QUERIES & MUTATIONS
   ========================================== */

// 1. Create a new cart
export const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// 2. Fetch an existing cart by ID
export const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  title
                  handle
                  featuredImage {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// 3. Add item to cart
export const ADD_TO_CART_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// 4. Update cart line item quantity
export const UPDATE_CART_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// 5. Remove cart line item
export const REMOVE_FROM_CART_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// 6. Update cart buyer identity (email, phone, address)
export const UPDATE_CART_BUYER_IDENTITY_MUTATION = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        checkoutUrl
        buyerIdentity {
          email
          phone
          countryCode
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;


export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  availableForSale?: boolean;
  productType?: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  tags: string[];
  options?: Array<{
    name: string;
    values: string[];
  }>;
  variants?: {
    edges: Array<{
      node: {
        id: string;
        title?: string;
        availableForSale?: boolean;
        price?: {
          amount: string;
          currencyCode: string;
        };
        selectedOptions?: Array<{
          name: string;
          value: string;
        }>;
      };
    }>;
  };
}

// Server-side in-memory cache definitions
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const productsCache: { entry: CacheEntry<ShopifyProduct[]> | null } = { entry: null };
const productDetailsCache: Record<string, CacheEntry<ShopifyProduct>> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function fetchShopifyProducts(): Promise<ShopifyProduct[]> {
  // Check in-memory cache first (only on server side)
  if (typeof window === "undefined" && productsCache.entry && Date.now() < productsCache.entry.expiry) {
    console.log("LOG: Returning all products from in-memory cache. Count:", productsCache.entry.data.length);
    return productsCache.entry.data;
  }

  const query = `
    query getProducts($cursor: String) {
      products(first: 250, after: $cursor) {
        edges {
          node {
            id
            title
            handle
            description
            availableForSale
            productType
            options {
              name
              values
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            tags
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  try {
    let allProducts: ShopifyProduct[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const result: {
        status: number;
        body: {
          products: {
            edges: Array<{ node: ShopifyProduct }>;
            pageInfo: {
              hasNextPage: boolean;
              endCursor: string | null;
            };
          };
        };
      } = await shopifyFetch({
        query,
        variables: { cursor },
      });

      const productsPage = result.body.products.edges.map((edge: { node: ShopifyProduct }) => edge.node);
      allProducts = [...allProducts, ...productsPage];
      hasNextPage = result.body.products.pageInfo.hasNextPage;
      cursor = result.body.products.pageInfo.endCursor;
    }

    // Cache products list on server side if not empty
    if (typeof window === "undefined" && allProducts.length > 0) {
      productsCache.entry = {
        data: allProducts,
        expiry: Date.now() + CACHE_TTL_MS,
      };
      console.log("LOG: Cached all products in-memory. Expiry in 5 mins.");
    }

    return allProducts;
  } catch (error) {
    console.error("Error fetching Shopify products:", error);
    return [];
  }
}

export async function fetchShopifyProductById(id: string): Promise<ShopifyProduct | null> {
  // Check in-memory cache first (only on server side)
  if (typeof window === "undefined" && productDetailsCache[id] && Date.now() < productDetailsCache[id].expiry) {
    console.log("LOG: Returning product details from in-memory cache for key:", id);
    return productDetailsCache[id].data;
  }

  const isGid = id.startsWith("gid://");

  const query = isGid
    ? `
      query getProductById($id: ID!) {
        node(id: $id) {
          ... on Product {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            tags
            options {
              name
              values
            }
            variants(first: 250) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    `
    : `
      query getProductByHandle($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          tags
          options {
            name
            values
          }
          variants(first: 250) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    `;

  try {
    let product: ShopifyProduct | null = null;

    if (isGid) {
      const result = await shopifyFetch<{ node: ShopifyProduct }>({
        query,
        variables: { id },
      });
      product = result.body.node || null;
    } else {
      const result = await shopifyFetch<{ product: ShopifyProduct }>({
        query,
        variables: { handle: id },
      });
      product = result.body.product || null;
    }

    // Cache results on server side if found
    if (typeof window === "undefined" && product) {
      const entry = {
        data: product,
        expiry: Date.now() + CACHE_TTL_MS,
      };
      productDetailsCache[id] = entry;
      // Also cache using alternative keys (ID & Handle)
      if (product.id && product.id !== id) {
        productDetailsCache[product.id] = entry;
      }
      if (product.handle && product.handle !== id) {
        productDetailsCache[product.handle] = entry;
      }
      console.log(`LOG: Cached product details for: ${product.title} (Keys: ${id})`);
    }

    return product;
  } catch (error) {
    console.error("Error fetching Shopify product by ID/Handle:", error);
    return null;
  }
}