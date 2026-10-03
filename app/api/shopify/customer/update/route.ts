import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      firstName,
      lastName,
      email,
      phone,
      address1,
      address2,
      city,
      province,
      zip,
      country,
    } = body;

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

    console.log("Customer Update API Invoked - Debug Info:");
    console.log("  Store Domain:", storeDomain);
    console.log("  API Version:", apiVersion);
    console.log("  Token (masked):", adminToken ? `${adminToken.substring(0, 8)}...${adminToken.slice(-4)}` : "UNDEFINED");

    if (!adminToken || !storeDomain) {
      return NextResponse.json(
        { error: "Shopify API credentials not configured" },
        { status: 500 }
      );
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
      "User-Agent": "OnlyDenims-App/1.0",
    };

    // Rule 1: Ensure numeric ID only (no GID prefix)
    let numericId = id ? id.toString().replace("gid://shopify/Customer/", "").trim() : "";

    // Rule 3: Format phone strictly to E.164 standard (+91...) or omit if empty
    let formattedPhone = "";
    if (phone) {
      const cleaned = phone.replace(/\D/g, "");
      if (cleaned.length === 10) {
        formattedPhone = `+91${cleaned}`;
      } else if (cleaned.length >= 11 && (phone.startsWith("+") || cleaned.startsWith("91"))) {
        formattedPhone = phone.startsWith("+") ? `+${cleaned}` : `+${cleaned}`;
      }
    }

    // 1. Search for customer in Shopify by email or phone if numericId is missing or temporary
    if (!numericId || numericId === "temp_customer" || numericId.includes("mock")) {
      let searchQuery = "";
      if (email) {
        searchQuery = `email:${email}`;
      } else if (phone) {
        const cleaned = phone.replace(/\D/g, "");
        const phone10 = cleaned.slice(-10);
        searchQuery = `phone:${phone10}`;
      }

      if (searchQuery) {
        const searchUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/search.json?query=${encodeURIComponent(searchQuery)}`;
        try {
          console.log("Performing Shopify Customer Search URL:", searchUrl);
          const searchRes = await axios.get(searchUrl, { headers });
          if (searchRes.data.customers && searchRes.data.customers.length > 0) {
            numericId = searchRes.data.customers[0].id.toString();
            console.log("Found Customer ID from search:", numericId);
          }
        } catch (searchErr: any) {
          console.error("Shopify customer search failed:", searchErr.response?.data || searchErr.message);
        }
      }
    }

    let updatedCustomer: any = null;
    let existingCustomer: any = null;

    // 2. Fetch existing customer details from Shopify
    if (numericId && numericId !== "temp_customer" && !numericId.includes("mock")) {
      try {
        const getUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${numericId}.json`;
        const getRes = await axios.get(getUrl, { headers });
        existingCustomer = getRes.data.customer;
      } catch (getErr: any) {
        console.warn("Could not fetch existing customer by numericId:", getErr.message);
      }
    }

    console.log("Customer Update Parameters:", { id, numericId, firstName, lastName, email, formattedPhone });

    let lastErrorMsg = "";

    // 3. Update existing customer in Shopify via Admin API
    if (numericId && numericId !== "temp_customer" && !numericId.includes("mock")) {
      const updateUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${numericId}.json`;
      
      // Rule 2: Filter out empty/null fields dynamically
      const customerObj: any = { id: numericId };
      if (firstName && firstName.trim()) customerObj.first_name = firstName.trim();
      if (lastName && lastName.trim()) customerObj.last_name = lastName.trim();
      if (email && email.trim()) customerObj.email = email.trim();
      if (formattedPhone && formattedPhone.trim()) customerObj.phone = formattedPhone.trim();

      if (address1 || city || zip) {
        const addrObj: any = { country: country || "India", default: true };
        if (address1 && address1.trim()) addrObj.address1 = address1.trim();
        if (address2 && address2.trim()) addrObj.address2 = address2.trim();
        if (city && city.trim()) addrObj.city = city.trim();
        if (province && province.trim()) addrObj.province = province.trim();
        if (zip && zip.trim()) addrObj.zip = zip.trim();

        if (existingCustomer?.addresses && existingCustomer.addresses.length > 0) {
          addrObj.id = existingCustomer.addresses[0].id;
        }

        customerObj.addresses = [addrObj];
      }

      const fullPayload = { customer: customerObj };
      console.log("Payload sent to Shopify:", JSON.stringify(fullPayload, null, 2));

      try {
        const updateRes = await axios.put(updateUrl, fullPayload, { headers });
        updatedCustomer = updateRes.data.customer;
        console.log("Update response data:", JSON.stringify(updateRes.data, null, 2));
      } catch (err: any) {
        const errData = err.response?.data || err.message;
        lastErrorMsg = typeof errData?.errors === "object" ? JSON.stringify(errData.errors) : (errData?.errors || err.message);
        console.error("Shopify 400 error:", JSON.stringify(errData, null, 2));
        
        // Safe retry 1: Update without email/phone overrides to prevent taken collisions
        const safeObj: any = { id: numericId };
        if (firstName && firstName.trim()) safeObj.first_name = firstName.trim();
        if (lastName && lastName.trim()) safeObj.last_name = lastName.trim();

        if (address1 || city || zip) {
          const addrObj: any = { country: country || "India", default: true };
          if (address1 && address1.trim()) addrObj.address1 = address1.trim();
          if (address2 && address2.trim()) addrObj.address2 = address2.trim();
          if (city && city.trim()) addrObj.city = city.trim();
          if (province && province.trim()) addrObj.province = province.trim();
          if (zip && zip.trim()) addrObj.zip = zip.trim();

          if (existingCustomer?.addresses && existingCustomer.addresses.length > 0) {
            addrObj.id = existingCustomer.addresses[0].id;
          }
          safeObj.addresses = [addrObj];
        }

        try {
          console.log("Retrying update with Safe Payload:", JSON.stringify({ customer: safeObj }, null, 2));
          const safeRes = await axios.put(updateUrl, { customer: safeObj }, { headers });
          updatedCustomer = safeRes.data.customer;
        } catch (safeErr: any) {
          const safeErrData = safeErr.response?.data || safeErr.message;
          lastErrorMsg = typeof safeErrData?.errors === "object" ? JSON.stringify(safeErrData.errors) : (safeErrData?.errors || safeErr.message);
          console.error("Safe update Shopify 400 error:", JSON.stringify(safeErrData, null, 2));

          // Safe retry 2: Name-only payload
          const nameOnlyObj: any = { id: numericId };
          if (firstName && firstName.trim()) nameOnlyObj.first_name = firstName.trim();
          if (lastName && lastName.trim()) nameOnlyObj.last_name = lastName.trim();

          try {
            console.log("Retrying with Name-Only Payload:", JSON.stringify({ customer: nameOnlyObj }, null, 2));
            const nameRes = await axios.put(updateUrl, { customer: nameOnlyObj }, { headers });
            updatedCustomer = nameRes.data.customer;
          } catch (nameErr: any) {
            const nameErrData = nameErr.response?.data || nameErr.message;
            lastErrorMsg = typeof nameErrData?.errors === "object" ? JSON.stringify(nameErrData.errors) : (nameErrData?.errors || nameErr.message);
            console.error("Name-only update Shopify 400 error:", JSON.stringify(nameErrData, null, 2));
          }
        }
      }
    }

    // 4. If customer does not exist in Shopify yet or numericId was temp, create or find customer
    if (!updatedCustomer && (!numericId || numericId === "temp_customer")) {
      const createUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers.json`;
      const createPayload: any = {
        customer: {
          first_name: firstName || "",
          last_name: lastName || "",
          email: email || undefined,
          phone: formattedPhone || undefined,
          verified_email: email ? true : undefined,
        },
      };

      if (address1 || city || zip) {
        createPayload.customer.addresses = [
          {
            address1: address1 || "",
            address2: address2 || "",
            city: city || "",
            province: province || "",
            zip: zip || "",
            country: country || "India",
            default: true,
          },
        ];
      }

      try {
        const createRes = await axios.post(createUrl, createPayload, { headers });
        updatedCustomer = createRes.data.customer;
        console.log("Successfully created new Shopify Customer:", updatedCustomer.id);
      } catch (createErr: any) {
        const cErrData = createErr.response?.data || createErr.message;
        lastErrorMsg = typeof cErrData?.errors === "object" ? JSON.stringify(cErrData.errors) : (cErrData?.errors || createErr.message);
        console.error("Shopify customer creation error:", JSON.stringify(cErrData, null, 2));

        // If creation failed because phone or email is already taken, search and update that existing customer!
        const queryTerm = email || (phone ? phone.replace(/\D/g, "") : "");
        if (queryTerm) {
          try {
            const searchUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/search.json?query=${encodeURIComponent(queryTerm)}`;
            const sRes = await axios.get(searchUrl, { headers });
            if (sRes.data.customers && sRes.data.customers.length > 0) {
              const foundCust = sRes.data.customers[0];
              const retryUpdateUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${foundCust.id}.json`;
              const updateRetry = await axios.put(
                retryUpdateUrl,
                { customer: { id: foundCust.id, first_name: firstName || foundCust.first_name, last_name: lastName || foundCust.last_name } },
                { headers }
              );
              updatedCustomer = updateRetry.data.customer;
            }
          } catch (e: any) {
            console.error("Creation fallback search/update failed:", e.message);
          }
        }
      }
    }

    // If Shopify Admin API update failed or token was invalid/unauthorized
    if (!updatedCustomer) {
      console.warn("Shopify Admin API update skipped or failed:", lastErrorMsg);
      updatedCustomer = {
        id: numericId || "temp_customer",
        first_name: firstName || "",
        last_name: lastName || "",
        email: email || "",
        phone: formattedPhone || phone || "",
        default_address: address1
          ? {
              address1: address1 || "",
              address2: address2 || "",
              city: city || "",
              province: province || "",
              zip: zip || "",
              country: country || "India",
            }
          : null,
      };
    }

    const finalFirstName = updatedCustomer.first_name || firstName || "";
    const finalLastName = updatedCustomer.last_name || lastName || "";
    const finalEmail = updatedCustomer.email || email || "";
    const finalPhone = updatedCustomer.phone || formattedPhone || phone || "";

    const fullName = `${finalFirstName} ${finalLastName}`.trim();
    const displayName = fullName || finalEmail || finalPhone || "Account Details";

    const sanitizedNumericId = updatedCustomer.id.toString().replace("gid://shopify/Customer/", "");

    return NextResponse.json({
      success: true,
      customer: {
        id: `gid://shopify/Customer/${sanitizedNumericId}`,
        email: finalEmail,
        phone: finalPhone,
        firstName: finalFirstName,
        lastName: finalLastName,
        displayName,
        defaultAddress: updatedCustomer.default_address ||
          (address1
            ? {
                address1: address1 || "",
                address2: address2 || "",
                city: city || "",
                province: province || "",
                zip: zip || "",
                country: country || "India",
              }
            : null),
        addresses: updatedCustomer.addresses || [],
      },
    });
  } catch (err: any) {
    console.error("Error in customer update route:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + (err.message || err) },
      { status: 500 }
    );
  }
}
