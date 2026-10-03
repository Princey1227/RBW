import { NextResponse } from 'next/server';

const storeDomain = (
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  process.env.SHOPIFY_STORE_DOMAIN ||
  'shop.onlydenims.com'
)?.trim();

const apiVersion = (
  process.env.SHOPIFY_API_VERSION ||
  '2025-04'
)?.trim();

const adminToken = (
  process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ||
  process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ||
  process.env.SHOPIFY_ADMIN_TOKEN
)?.trim();

const storefrontToken = (
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_TOKEN
)?.trim();

const ADMIN_URL = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
const STOREFRONT_URL = `https://${storeDomain}/api/${apiVersion}/graphql.json`;

// ─── Admin API: Find existing customer by phone ───────────────────────────────
async function getCustomerByPhone(phone: string) {
  if (!adminToken) {
    console.warn('[checkout route] Missing Shopify Admin token');
    return null;
  }

  try {
    const res = await fetch(ADMIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({
        query: `{
          customers(first: 1, query: "phone:${phone}") {
            edges {
              node {
                id
                email
                phone
                defaultAddress {
                  firstName lastName
                  address1 address2
                  city province zip country
                }
              }
            }
          }
        }`,
      }),
    });

    const data = await res.json();
    return data?.data?.customers?.edges?.[0]?.node ?? null;
  } catch (err) {
    console.error('[checkout route] Error fetching customer by phone:', err);
    return null;
  }
}

// ─── Storefront API: Create cart ──────────────────────────────────────────────
async function createCart(lineItems: any[], buyerIdentity: any) {
  if (!storefrontToken) {
    console.error('[checkout route] Missing Shopify Storefront token');
    return null;
  }

  try {
    const res = await fetch(STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({
        query: `
          mutation cartCreate($input: CartInput!) {
            cartCreate(input: $input) {
              cart {
                id
                checkoutUrl
                buyerIdentity { email phone }
              }
              userErrors { field message }
            }
          }
        `,
        variables: {
          input: {
            lines: lineItems,
            buyerIdentity,
          },
        },
      }),
    });

    const data = await res.json();
    if (data?.data?.cartCreate?.userErrors?.length > 0) {
      console.error('[checkout route] cartCreate userErrors:', data.data.cartCreate.userErrors);
    }
    return data?.data?.cartCreate?.cart ?? null;
  } catch (err) {
    console.error('[checkout route] Error in createCart mutation:', err);
    return null;
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { phone, email, lineItems = [] } = await req.json();

    // Format and normalize phone to E.164
    let formattedPhone = phone;
    if (phone) {
      const digits = phone.toString().replace(/\D/g, '');
      if (phone.toString().startsWith('+')) {
        formattedPhone = phone.toString();
      } else if (digits.length === 10) {
        formattedPhone = `+91${digits}`;
      } else if (digits.length === 12 && digits.startsWith('91')) {
        formattedPhone = `+${digits}`;
      } else {
        formattedPhone = `+${digits}`;
      }
    }

    // Try to find existing Shopify customer
    const customer = formattedPhone ? await getCustomerByPhone(formattedPhone) : null;

    let buyerIdentity: any;

    if (customer) {
      // ── Returning customer: pre-fill everything ──────────────────────────────
      buyerIdentity = {
        email: customer.email || (email && typeof email === 'string' && email.trim() ? email.trim() : undefined),
        phone: customer.phone || formattedPhone,
        countryCode: 'IN',
        ...(customer.defaultAddress && {
          deliveryAddressPreferences: [
            {
              deliveryAddress: {
                firstName: customer.defaultAddress.firstName || '',
                lastName: customer.defaultAddress.lastName || '',
                address1: customer.defaultAddress.address1 || '',
                address2: customer.defaultAddress.address2 ?? '',
                city: customer.defaultAddress.city || '',
                province: customer.defaultAddress.province || '',
                zip: customer.defaultAddress.zip || '',
                country: customer.defaultAddress.country || 'India',
                phone: customer.phone || formattedPhone,
              },
            },
          ],
        }),
      };
    } else {
      // ── New customer: pass phone + email only, Shopify creates profile on order
      buyerIdentity = {
        ...(formattedPhone && { phone: formattedPhone }),
        countryCode: 'IN',
        ...(email && typeof email === 'string' && email.trim() && { email: email.trim() }),
      };
    }

    const cart = await createCart(lineItems, buyerIdentity);

    if (!cart) {
      return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
    }

    return NextResponse.json({
      cart,
      isNewCustomer: !customer, // useful for frontend analytics/tracking
    });
  } catch (error: any) {
    console.error('[checkout route] Unhandled error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
