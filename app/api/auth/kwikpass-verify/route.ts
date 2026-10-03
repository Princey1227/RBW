import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import * as jose from "jose";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { kpToken, phone: directPhone, email: directEmail, firstName: directFirstName, lastName: directLastName } = await req.json();

    if (!kpToken && !directPhone && !directEmail) {
      return NextResponse.json({ error: "Missing authentication parameters (kpToken, phone, or email)" }, { status: 400 });
    }

    const secretStr = process.env.GOKWIK_JWE_SECRET;
    if (!secretStr) {
      return NextResponse.json({ error: "Server configuration error: GOKWIK_JWE_SECRET is not set" }, { status: 500 });
    }
    let userData: any = null;

    if (kpToken) {
      try {
        // Decode the secret-key using base64url as per KwikPass Headless custom documentation
        const secretKey = jose.base64url.decode(secretStr);
        const { plaintext } = await jose.compactDecrypt(kpToken, secretKey);
        const decryptedPayload = new TextDecoder().decode(plaintext);
        userData = JSON.parse(decryptedPayload);
        console.log("Successfully decrypted KwikPass JWE. userData from JWE:", JSON.stringify(userData, null, 2));
      } catch (decryptError: any) {
        console.error("JWE Compact Decrypt failed, trying jwtDecrypt:", decryptError.message);
        try {
          const secretKey = jose.base64url.decode(secretStr);
          const { payload } = await jose.jwtDecrypt(kpToken, secretKey);
          userData = payload;
          console.log("Successfully decrypted KwikPass JWE via jwtDecrypt. userData from JWE:", JSON.stringify(userData, null, 2));
        } catch (jwtErr: any) {
          console.error("jwtDecrypt also failed. Falling back to sha256 hash method:", jwtErr.message);
          try {
            const key = createHash("sha256").update(secretStr).digest();
            const { plaintext } = await jose.compactDecrypt(kpToken, key);
            userData = JSON.parse(new TextDecoder().decode(plaintext));
            console.log("Successfully decrypted KwikPass JWE via SHA256 key. userData from JWE:", JSON.stringify(userData, null, 2));
          } catch (e) {
            console.error("Could not decrypt token with any method:", e);
            return NextResponse.json({ error: "Invalid token structure" }, { status: 400 });
          }
        }
      }
    } else {
      userData = {
        phone: directPhone || "",
        email: directEmail || "",
        first_name: directFirstName || "KwikPass",
        last_name: directLastName || "Member"
      };
      console.log("Received direct customer data payload:", userData);
    }

    // Robust field extraction supporting multiple KwikPass SDK variations
    const email = userData?.email || userData?.email_id || directEmail || "";
    let rawPhone = userData?.phone || userData?.phone_number || userData?.mobile || directPhone || "";
    let phone = rawPhone ? rawPhone.toString() : "";
    if (phone) {
      const cleaned = phone.replace(/\D/g, "");
      if (cleaned.length === 10) {
        phone = `+91${cleaned}`;
      } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
        phone = `+${cleaned}`;
      } else if (!phone.startsWith("+")) {
        phone = `+${cleaned}`;
      }
    }

    const rawFirstName = userData?.first_name || userData?.firstName || directFirstName || "";
    const rawLastName = userData?.last_name || userData?.lastName || directLastName || "";
    const firstName = (rawFirstName === "KwikPass" || rawFirstName === "Member") ? "" : rawFirstName;
    const lastName = (rawLastName === "KwikPass" || rawLastName === "Member") ? "" : rawLastName;

    // Extract address if provided by KwikPass payload
    let kpAddress: any = null;
    const rawAddr = userData?.address || userData?.default_address || (Array.isArray(userData?.addresses) ? userData.addresses[0] : null);
    if (rawAddr && typeof rawAddr === "object") {
      kpAddress = {
        address1: rawAddr.address1 || rawAddr.line1 || rawAddr.street || "",
        address2: rawAddr.address2 || rawAddr.line2 || "",
        city: rawAddr.city || "",
        province: rawAddr.province || rawAddr.state || "",
        zip: rawAddr.zip || rawAddr.pincode || rawAddr.postal_code || "",
        country: rawAddr.country || "India",
        phone: rawAddr.phone || phone || "",
        firstName: rawAddr.first_name || rawAddr.firstName || firstName || "",
        lastName: rawAddr.last_name || rawAddr.lastName || lastName || "",
      };
    } else if (userData?.address1 || userData?.city || userData?.zip || userData?.pincode) {
      kpAddress = {
        address1: userData.address1 || userData.line1 || "",
        address2: userData.address2 || userData.line2 || "",
        city: userData.city || "",
        province: userData.province || userData.state || "",
        zip: userData.zip || userData.pincode || "",
        country: userData.country || "India",
        phone: phone || "",
        firstName: firstName || "",
        lastName: lastName || "",
      };
    }

    console.log("Extracted Customer Details from KwikPass:", { email, phone, firstName, lastName, kpAddress });

    const adminToken = (
      process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ||
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ||
      process.env.SHOPIFY_ADMIN_TOKEN
    )?.trim();
    const rawStoreDomain = (process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN || "0v0kas-ia.myshopify.com")?.trim();
    // Shopify Admin API requires .myshopify.com domain directly (custom domains cause 301 redirects that break POST/PUT requests in production)
    const storeDomain = rawStoreDomain.endsWith(".myshopify.com")
      ? rawStoreDomain
      : (process.env.SHOPIFY_MYSHOPIFY_DOMAIN || "0v0kas-ia.myshopify.com");
    const apiVersion = (process.env.SHOPIFY_API_VERSION || "2025-04").trim();

    console.log("KwikPass Verify API Invoked - Debug Info:");
    console.log("  Raw Store Domain:", rawStoreDomain);
    console.log("  Admin Store Domain:", storeDomain);
    console.log("  API Version:", apiVersion);
    console.log("  Token (masked):", adminToken ? `${adminToken.substring(0, 8)}...${adminToken.slice(-4)}` : "UNDEFINED");

    if (!adminToken || !storeDomain) {
      console.error("Shopify Admin credentials missing in environment variables!");
      return NextResponse.json({ error: "Shopify API credentials are not configured in environment" }, { status: 500 });
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
      "User-Agent": "OnlyDenims-App/1.0",
    };

    // Helper search function to handle email and phone lookup
    const findShopifyCustomer = async (custEmail: string, custPhone: string) => {
      // 1. Search by email if email is available
      if (custEmail && custEmail.includes("@")) {
        const emailQuery = `email:${custEmail}`;
        const searchUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/search.json?query=${encodeURIComponent(emailQuery)}`;
        try {
          console.log("Searching Shopify Customer by email:", custEmail);
          const searchRes = await axios.get(searchUrl, { headers });
          if (searchRes.data.customers && searchRes.data.customers.length > 0) {
            console.log("Found Shopify customer by email. Customer ID:", searchRes.data.customers[0].id);
            return searchRes.data.customers[0];
          }
        } catch (searchErr: any) {
          console.error("Shopify search by email failed:", searchErr.response?.data || searchErr.message);
        }
      }

      // 2. Search by phone (using last 10 digits for maximum reliability in India)
      if (custPhone) {
        const cleaned = custPhone.replace(/\D/g, "");
        const phone10 = cleaned.slice(-10);
        if (phone10) {
          const phoneQuery = `phone:${phone10}`;
          const searchUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/search.json?query=${encodeURIComponent(phoneQuery)}`;
          try {
            console.log("Searching Shopify Customer by phone (last 10 digits):", phone10);
            const searchRes = await axios.get(searchUrl, { headers });
            if (searchRes.data.customers && searchRes.data.customers.length > 0) {
              console.log("Found Shopify customer by phone. Customer ID:", searchRes.data.customers[0].id);
              return searchRes.data.customers[0];
            }
          } catch (searchErr: any) {
            console.error("Shopify search by phone failed:", searchErr.response?.data || searchErr.message);
          }
        }
      }

      return null;
    };

    // 1. Search for customer in Shopify by email or phone
    let customer = await findShopifyCustomer(email, phone);

    // 2. If customer exists in Shopify: Update with any new/missing details from KwikPass if needed
    if (customer) {
      const numericId = customer.id.toString().replace("gid://shopify/Customer/", "");
      const shopifyHasValidName = customer.first_name && customer.first_name !== "KwikPass" && customer.first_name.trim().length > 0;
      const shopifyHasEmail = customer.email && customer.email.length > 0;
      const shopifyHasAddress = (customer.addresses && customer.addresses.length > 0) || customer.default_address;

      const shouldUpdateName = !shopifyHasValidName && firstName.trim().length > 0;
      const shouldUpdateEmail = !shopifyHasEmail && email.trim().length > 0;
      const shouldUpdateAddr = !shopifyHasAddress && kpAddress && kpAddress.address1;

      if (shouldUpdateName || shouldUpdateEmail || shouldUpdateAddr) {
        const updateUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${numericId}.json`;
        const updatePayload: any = { id: numericId };

        if (shouldUpdateName) {
          updatePayload.first_name = firstName;
          if (lastName) updatePayload.last_name = lastName;
        }
        if (shouldUpdateEmail) {
          updatePayload.email = email;
        }
        if (shouldUpdateAddr && kpAddress) {
          updatePayload.addresses = [{
            address1: kpAddress.address1,
            address2: kpAddress.address2 || "",
            city: kpAddress.city || "",
            province: kpAddress.province || "",
            zip: kpAddress.zip || "",
            country: kpAddress.country || "India",
            default: true
          }];
        }

        try {
          console.log("Updating existing Shopify Customer with missing KwikPass info:", JSON.stringify(updatePayload));
          const updateRes = await axios.put(updateUrl, { customer: updatePayload }, { headers });
          if (updateRes.data?.customer) {
            customer = updateRes.data.customer;
          }
        } catch (updateErr: any) {
          console.error("Failed to update existing customer in Shopify:", updateErr.response?.data || updateErr.message);
        }
      }
    }

    // 3. If customer not found in Shopify, create a new customer record in Shopify
    if (!customer) {
      const createUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers.json`;
      const customerPayload: any = {
        customer: {
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          email: email || undefined,
          phone: phone || undefined,
          verified_email: email ? true : undefined,
        }
      };

      if (kpAddress && (kpAddress.address1 || kpAddress.city || kpAddress.zip)) {
        customerPayload.customer.addresses = [{
          address1: kpAddress.address1 || "",
          address2: kpAddress.address2 || "",
          city: kpAddress.city || "",
          province: kpAddress.province || "",
          zip: kpAddress.zip || "",
          country: kpAddress.country || "India",
          default: true
        }];
      }

      console.log("Creating new Shopify Customer with payload:", JSON.stringify(customerPayload));
      try {
        const createRes = await axios.post(createUrl, customerPayload, { headers });
        customer = createRes.data.customer;
        console.log("Successfully created new Shopify Customer. Customer ID:", customer.id);
      } catch (createErr: any) {
        const errData = createErr.response?.data || createErr.message;
        console.error("Shopify customer creation failed:", JSON.stringify(errData, null, 2));

        // If creation failed because phone or email is already taken, retry lookup
        const errors = createErr.response?.data?.errors;
        const phoneTaken = errors?.phone?.some((msg: string) => msg.includes("taken"));
        const emailTaken = errors?.email?.some((msg: string) => msg.includes("taken"));

        if (phoneTaken || emailTaken || createErr.response?.status === 422) {
          console.log("Customer already exists in Shopify. Retrying search...");
          customer = await findShopifyCustomer(email, phone);
        }

        if (!customer) {
          customer = {
            id: "temp_customer",
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            addresses: kpAddress ? [kpAddress] : []
          };
        }
      }
    }

    // 4. Fetch recent orders, wishlist, and cart_history for this customer from Shopify
    let orders: any[] = [];
    let wishlist: string[] = [];
    let cartHistory: any[] = [];
    if (customer && customer.id && customer.id !== "temp_customer") {
      const numericId = customer.id.toString().replace("gid://shopify/Customer/", "");
      const ordersUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${numericId}/orders.json?status=any&limit=50`;
      try {
        const ordersRes = await axios.get(ordersUrl, { headers });
        orders = ordersRes.data.orders || [];
      } catch (ordersErr: any) {
        console.error("Failed to fetch customer orders:", ordersErr.response?.data || ordersErr.message);
      }

      // Fetch customer custom.wishlist Metafield directly from Shopify on login
      try {
        const mfUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${numericId}/metafields.json?namespace=custom&key=wishlist`;
        const mfRes = await axios.get(mfUrl, { headers });
        const mfList = mfRes.data.metafields || [];
        const wishlistMf = mfList.find(
          (m: any) => m.namespace === "custom" && m.key === "wishlist"
        ) || mfList[0];

        if (wishlistMf && wishlistMf.value) {
          const parsed = typeof wishlistMf.value === "string" ? JSON.parse(wishlistMf.value) : wishlistMf.value;
          if (Array.isArray(parsed)) wishlist = parsed;
        }
      } catch (e) {
        if (customer.note && customer.note.includes("WISHLIST:")) {
          const match = customer.note.match(/WISHLIST:(\[.*?\])/);
          if (match && match[1]) {
            try {
              wishlist = JSON.parse(match[1]);
            } catch (err) { }
          }
        }
      }

      // Fetch customer custom.cart_history Metafield directly from Shopify on login
      try {
        const cartMfUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${numericId}/metafields.json?namespace=custom&key=cart_history`;
        const cartMfRes = await axios.get(cartMfUrl, { headers });
        const cartMfList = cartMfRes.data.metafields || [];
        const cartMf = cartMfList.find(
          (m: any) => m.namespace === "custom" && m.key === "cart_history"
        ) || cartMfList[0];

        if (cartMf && cartMf.value) {
          const parsed = typeof cartMf.value === "string" ? JSON.parse(cartMf.value) : cartMf.value;
          if (Array.isArray(parsed)) cartHistory = parsed;
        }
      } catch (e) {
        console.warn("Could not fetch customer cart_history on login:", e);
      }
    }

    // Determine final name and address fields, prioritizing Shopify's existing data if present
    const resFirstName = (customer.first_name && customer.first_name !== "KwikPass") ? customer.first_name : (firstName || "");
    const resLastName = (customer.last_name && customer.last_name !== "Member") ? customer.last_name : (lastName || "");
    const resEmail = customer.email || email || "";
    const resPhone = customer.phone || phone || "";
    const fullName = `${resFirstName} ${resLastName}`.trim();
    const displayName = fullName || resEmail || resPhone || "Account Details";

    const defaultAddress = customer.default_address || (customer.addresses && customer.addresses.length > 0 ? customer.addresses[0] : kpAddress || null);

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id ? `gid://shopify/Customer/${customer.id.toString().replace("gid://shopify/Customer/", "")}` : "temp_customer",
        email: resEmail,
        phone: resPhone,
        firstName: resFirstName,
        lastName: resLastName,
        displayName,
        wishlist,
        cartHistory,
        defaultAddress: defaultAddress ? {
          address1: defaultAddress.address1 || "",
          address2: defaultAddress.address2 || "",
          city: defaultAddress.city || "",
          province: defaultAddress.province || "",
          zip: defaultAddress.zip || "",
          country: defaultAddress.country || "India",
          phone: defaultAddress.phone || resPhone,
          firstName: defaultAddress.first_name || defaultAddress.firstName || resFirstName,
          lastName: defaultAddress.last_name || defaultAddress.lastName || resLastName,
        } : null,
        addresses: customer.addresses || (kpAddress ? [kpAddress] : []),
        orders: orders.map((o: any) => ({
          id: o.id,
          orderNumber: o.order_number,
          processedAt: o.processed_at,
          totalPrice: o.total_price,
          currency: o.currency,
          financialStatus: o.financial_status,
          fulfillmentStatus: o.fulfillment_status || "unfulfilled",
          lineItems: o.line_items.map((li: any) => ({
            title: li.title,
            quantity: li.quantity,
            price: li.price
          }))
        }))
      }
    });

  } catch (err: any) {
    console.error("Error in kwikpass-verify route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
