import { NextResponse } from "next/server";
import { fetchShopifyProducts } from "../../../utils/shopify";

let cachedCatalog: string | null = null;
let cachedProducts: any[] = [];
let lastFetchTime = 0;

async function getLiveStoreCatalogText(): Promise<string> {
  // 1. First check if catalogue is already present in cache
  if (cachedCatalog && cachedProducts.length > 0) {
    return cachedCatalog;
  }

  // 2. If not present in cache, fetch fresh catalogue from Shopify API
  try {
    const products = await fetchShopifyProducts();
    if (products && products.length > 0) {
      cachedProducts = products;
      const lines = products.map((p) => {
        const amount = p.priceRange?.minVariantPrice?.amount || "0";
        const priceFormatted = parseFloat(amount).toLocaleString("en-IN");
        return `• ${p.title}: ₹ ${priceFormatted}`;
      });
      cachedCatalog = lines.join("\n");
      return cachedCatalog;
    }
  } catch (e) {
    console.warn("Failed to fetch live Shopify products for chat prompt:", e);
  }

  return `• Jeans / Denim Pants: ₹ 1,850 (Fits: Ankle, Slim, Comfort, Straight, Baggy, Bootcut)\n• Jackets: ₹ 2,499 (Heavy twill selvedge)\n• Shorts: ₹ 1,999 (Comfort cut raw denim)\n• Accessories: Starting at ₹ 150 (Caps, belts, denim totes)`;
}

function getLiveCategoryPrice(categoryKeyword: string, defaultPriceFormatted: string): string {
  if (!cachedProducts || cachedProducts.length === 0) return defaultPriceFormatted;

  const matching = cachedProducts.filter((p) => {
    const title = (p.title || "").toLowerCase();
    const type = (p.productType || p.product_type || "").toLowerCase();
    const tags = (p.tags || []).map((t: any) => (typeof t === "string" ? t.toLowerCase() : ""));

    return (
      title.includes(categoryKeyword) ||
      type.includes(categoryKeyword) ||
      tags.some((t: string) => t.includes(categoryKeyword))
    );
  });

  if (matching.length === 0) return defaultPriceFormatted;

  const prices = matching
    .map((p) => parseFloat(p.priceRange?.minVariantPrice?.amount || "0"))
    .filter((p) => p > 0);

  if (prices.length === 0) return defaultPriceFormatted;
  const minPrice = Math.min(...prices);
  return `₹ ${minPrice.toLocaleString("en-IN")}`;
}

export async function POST(req: Request) {
  try {
    const { messages, userName } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1]?.content || "";
    const liveCatalogueText = await getLiveStoreCatalogText();

    const userSessionInfo = userName
      ? `CURRENT USER SESSION: User is LOGGED IN as "${userName}". If asked "what is my name?" or "who am I?", address them warmly as ${userName}.`
      : `CURRENT USER SESSION: User is NOT logged in (Browsing as Guest). If asked "what is my name?" or "who am I?", inform them politely that they are currently browsing as a guest, and invite them to log in at https://onlydenims.com/account/orders.`;

    // System prompt with strict conciseness rules and comprehensive ONLY DENIMS knowledge
    const systemPrompt = `You are the ONLY DENIMS AI Shopping Assistant. You represent the official ONLY DENIMS online store.

${userSessionInfo}
ASSISTANT IDENTITY: Your name is "ONLY DENIMS AI Assistant". If asked "what is your name?", "who are you?", "your name", or about your identity, ALWAYS state warmly: "I am the ONLY DENIMS AI Assistant! I am here to help you explore our raw denim catalog, track orders, check prices, and answer any questions."

CRITICAL RESPONSE RULES (STRICTLY FOLLOW AT ALL TIMES):
1. COMPLETE SENTENCES: Always write full, complete sentences. Never cut off mid-sentence.
2. SHORT & CONCISE: Keep your response clear and direct (under 2 to 4 sentences).
3. NO WALLS OF TEXT: Never write long essays or unsolicited introductions.
4. DIRECT CATEGORY FOCUS: Answer specifically about the exact product category requested by the user. If the user asks about jeans, reply ONLY about jeans. If asked about accessories, reply ONLY about accessories. Do NOT list unrelated categories unless specifically asked for a full catalog summary.
5. ACCURATE PRICING & CATALOGUE: Always quote exact store prices and products as listed below. NEVER state an incorrect price.
6. RELEVANT URLS ONLY: Do NOT force a URL in every response. Only include a URL link if the user specifically asks where to view something (e.g. tracking, wishlist, or catalogue). If included, place it at the very end as a full link string like https://onlydenims.com/account/orders. Do NOT attach a URL if you are returning an [ACTION:BUY:...] action tag.
7. DIRECT CART PURCHASING: If the user expresses purchase intent (e.g., "i want to buy raw ankle size 32", "add baggy jeans to cart"), include an action tag at the end of your message in this exact format: [ACTION:BUY:{"title":"Raw Indigo Ankle Fit Jeans","price":1850,"size":"32"}].
8. SECURITY & CREDENTIALS PROTECTION: Never ask for, generate, or reveal private credentials, passwords, login tokens, OTPs, or payment card numbers. If asked, state that you do not handle or access private security credentials and direct them to https://onlydenims.com/account/orders.
9. NO UNAUTHORIZED DISCOUNTS: Never issue, promise, or invent custom discount codes, promo codes, or manual price reductions. All products are priced as listed in the catalogue with free prepaid shipping across India.
10. MULTILINGUAL SUPPORT: Always detect and respond in the exact language used by the user (e.g. English, Hindi, Hinglish, Marathi, Gujarati, Tamil, Spanish, etc.) while keeping exact product names, prices, and links intact.

ONLY DENIMS LIVE PRODUCT CATALOGUE & PRICING:
${liveCatalogueText}

ADDITIONAL STORE KNOWLEDGE BASE:
- Account, Orders & Tracking:
  • Track Order / Order Status: View live order status and shipment tracking. URL: https://onlydenims.com/account/orders
  • Order History / My Orders: Access all past purchases and order details. URL: https://onlydenims.com/account/orders
  • Wishlist / Saved Items: Save favorite fits with the heart icon. URL: https://onlydenims.com/wishlist

- Signature Denim Washes:
  • Raw Indigo: 14.5 oz heavy selvedge, spun on vintage shuttle looms in Mumbai, India.
  • Carbon Black: 13.0 oz deep-dyed sulfur black twill.
  • Alabaster White: Natural undyed raw cotton twill.

- Partner Brand Stores on Platform:
  • RBW Store (Red Blue White): LIVE NOW. Flagship brand featuring raw selvedge jeans (starting at ₹ 1,850) and heavy denim jackets (₹ 2,499). URL: https://onlydenims.com/stores/rbw
  • IJNS, THINC, Second Army, WIDE: COMING SOON. These partner stores are launching soon on ONLY DENIMS. If asked, inform the user they are launching soon and prices will be available once live.

- Checkout & Online Payment Integration:
  • Checkout System: GoKwik 1-Click Fast Checkout (replaces standard Shopify checkout for fast 1-tap checkout).
  • Payment Methods: Instant UPI (Google Pay, PhonePe, Paytm, BHIM), Cash on Delivery (COD), Credit/Debit Cards, NetBanking, and EMI.
  • Shipping: Free prepaid shipping across India. Standard delivery in 3-5 business days.
  • Returns & Exchanges: 7-day hassle-free size exchange & returns.
  • Support Email: onlydenims26@gmail.com
  • Support & Contact Page: https://onlydenims.com/contact
  • Contacting Us: If asked how to contact ONLY DENIMS, get in touch, or request support email, ALWAYS provide the support email onlydenims26@gmail.com and the link https://onlydenims.com/contact.
  • Shirts & Item Availability: ONLY DENIMS specializes in Raw Denim Jeans (Ankle, Slim, Baggy, etc.), Selvedge Denim Jackets, Shorts, and Accessories. If asked about shirts or item availability ("shirt milti hai", "is shirt available"), clarify what we offer and link to https://onlydenims.com/shop.

Provide answers politely, stylishly, and very briefly. Include full URLs at the end ONLY when relevant.`;

    let apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    try {
      const fs = require("fs");
      const path = require("path");
      const envLocalPath = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(envLocalPath)) {
        const content = fs.readFileSync(envLocalPath, "utf-8");
        const match = content.match(/^GEMINI_API_KEY=(.+)$/m);
        if (match && match[1]) apiKey = match[1].trim();
      }
    } catch (e) {}

    if (!apiKey) {
      // Intelligent fallback when GEMINI_API_KEY is not yet populated in .env
      const fallbackReply = generateFallbackResponse(lastMessage, userName);
      return NextResponse.json({ reply: fallbackReply });
    }

    // Prepare contents array for Gemini REST API
    const geminiContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Primary fast Gemini models list on Google v1beta REST API
    const fastModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

    // Fetch with 6 second timeout limit for live AI responses
    const fetchModelResponse = async (modelName: string): Promise<string | null> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        };
        const res = await fetch(geminiUrl, {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            contents: geminiContents,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1000, // Sufficient limit for 100% complete, untruncated sentences
            },
          }),
        });

        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) return text.trim();
        } else {
          const errText = await res.text();
          console.error(`Gemini API model ${modelName} returned HTTP ${res.status}:`, errText);
        }
      } catch (e: any) {
        clearTimeout(timeoutId);
        console.error(`Gemini API model ${modelName} fetch error:`, e?.message || e);
      }
      return null;
    };

    // Attempt fastest model, or parallel fallback
    let replyText: string | null = await fetchModelResponse("gemini-flash-latest");

    if (!replyText) {
      const results = await Promise.all([
        fetchModelResponse("gemini-pro-latest"),
        fetchModelResponse("gemini-3.6-flash"),
        fetchModelResponse("gemini-3.5-flash"),
      ]);
      replyText = results.find((r) => r !== null) || null;
    }

    if (!replyText) {
      replyText = generateFallbackResponse(lastMessage, userName);
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error("Chat API endpoint error:", error);
    return NextResponse.json(
      { reply: "Our denim assistant is momentarily offline. Explore our catalogue at https://onlydenims.com/shop or contact support." },
      { status: 500 }
    );
  }
}

// Fallback logic when API key is missing or endpoint is offline
function generateFallbackResponse(query: string, userName?: string | null): string {
  const q = query.toLowerCase().trim();
  const isTamil = /[\u0B80-\u0BFF]/.test(query);
  const isTelugu = /[\u0C00-\u0C7F]/.test(query);
  const isKannada = /[\u0C80-\u0CFF]/.test(query);
  const isMalayalam = /[\u0D00-\u0D7F]/.test(query);
  const isBengali = /[\u0980-\u09FF]/.test(query);
  const isGujarati = /[\u0A80-\u0AFF]/.test(query);

  const isMarwari =
    q.includes("म्हूं") ||
    q.includes("म्हाने") ||
    q.includes("म्हारो") ||
    q.includes("चावूं") ||
    q.includes("चावे") ||
    q.includes("छूं") ||
    q.includes("छै") ||
    q.includes("खरीदणी") ||
    q.includes("खरीदणो");

  const isMarathi =
    !isMarwari &&
    !isTamil && !isTelugu && !isKannada && !isMalayalam && !isBengali && !isGujarati &&
    (q.includes("तुझं") ||
    q.includes("माझं") ||
    q.includes("काय") ||
    q.includes("आहे") ||
    q.includes("आहात") ||
    q.includes("नाव") ||
    q.includes("मिळेल") ||
    q.includes("मिळतात") ||
    q.includes("कोण") ||
    q.includes("आमचे") ||
    q.includes("तुमचे") ||
    q.includes("संपर्क") ||
    q.includes("कींमत") ||
    q.includes("किंमत") ||
    q.includes("tujha") ||
    q.includes("majha") ||
    q.includes("kay") ||
    q.includes("ahe") ||
    q.includes("miltat"));

  const isHindi =
    !isMarwari &&
    !isMarathi &&
    (q.includes("mera") ||
    q.includes("meri") ||
    q.includes("mere") ||
    q.includes("naam") ||
    q.includes("kaun") ||
    q.includes("kya") ||
    q.includes("hai") ||
    q.includes("hain") ||
    q.includes("ho") ||
    q.includes("batao") ||
    q.includes("bta") ||
    q.includes("btao") ||
    q.includes("bata") ||
    q.includes("daam") ||
    q.includes("dam") ||
    q.includes("kahan") ||
    q.includes("kaha") ||
    q.includes("kaise") ||
    q.includes("kaisa") ||
    q.includes("mujhe") ||
    q.includes("apka") ||
    q.includes("aapka") ||
    q.includes("aapki") ||
    q.includes("aapke") ||
    q.includes("mai") ||
    q.includes("main") ||
    q.includes("ter") ||
    q.includes("tum") ||
    q.includes("tumhara") ||
    q.includes("ka") ||
    q.includes("ke") ||
    q.includes("ki") ||
    q.includes("ko") ||
    q.includes("par") ||
    q.includes("se") ||
    q.includes("bhai") ||
    q.includes("karo") ||
    q.includes("karein") ||
    q.includes("dena") ||
    q.includes("do") ||
    q.includes("de") ||
    q.includes("raha") ||
    q.includes("rahi") ||
    /[\u0900-\u097F]/.test(query));

  if (
    q.includes("discount") ||
    q.includes("coupon") ||
    q.includes("promo") ||
    q.includes("cheaper") ||
    q.includes("offer")
  ) {
    if (isMarwari) {
      return "ONLY DENIMS रा सगळा प्रोडक्ट्स ऑफिशियल स्टोर रेट्स पर फ्री शिपिंग रे सागे आवे है।";
    }
    if (isMarathi) {
      return "ONLY DENIMS चे सर्व उत्पादने अधिकृत स्टोअर किमतीवर मोफत शिपिंगसह उपलब्ध आहेत. आम्ही चॅटवर कोणताही कस्टम डिस्काउंट कोड देत नाही.";
    }
    return isHindi
      ? "ONLY DENIMS ke sabhi products official store prices par available hain free shipping ke saath. Hum chat par koi custom discount code nahi dete."
      : "All ONLY DENIMS products are offered at official store prices with free prepaid shipping across India. We do not issue custom discount codes via chat.";
  }
  if (q.includes("credential") || q.includes("password") || q.includes("otp") || q.includes("token")) {
    if (isMarathi) {
      return "सुरक्षेसाठी आमचा AI सहाय्यक खाजगी पासवर्ड किंवा OTP हाताळत नाही. कृपया तुमच्या अकाउंट पोर्टलवर साइन इन करा:\nhttps://onlydenims.com/account/orders";
    }
    return isHindi
      ? "Security ke liye humara AI assistant private passwords ya OTP access nahi karta. Apne account portal mein sign in karein:\nhttps://onlydenims.com/account/orders"
      : "For security, our AI assistant does not handle private passwords or login credentials. Please sign in securely under your account portal.\nhttps://onlydenims.com/account/orders";
  }

  // Bot Identity Questions ("what is your name", "who are you", "तुझं नाव काय आहे", "apka naam kya hai")
  if (
    q.includes("your name") ||
    q.includes("who are you") ||
    q.includes("what is your name") ||
    q.includes("apka naam") ||
    q.includes("aapka naam") ||
    q.includes("tera naam") ||
    q.includes("तुझं नाव") ||
    q.includes("तुमचे नाव") ||
    q.includes("नाव काय") ||
    q.includes("aap kaun") ||
    q.includes("tu kaun") ||
    q.includes("bot name")
  ) {
    if (isMarwari) {
      return "मैं ONLY DENIMS AI Assistant हूं। मैं थाने म्हाका raw denim catalog, order tracking, sizes और prices देखबा में हेल्प कर सकूं हूं।";
    }
    if (isMarathi) {
      return "मी ONLY DENIMS AI Assistant आहे! मी तुम्हाला आमचे raw denim catalog, order tracking, sizes आणि prices पाहण्यात मदत करू शकतो.";
    }
    return isHindi
      ? "Main ONLY DENIMS AI Assistant hoon! Main aapko humare raw denim catalog, order tracking, fits aur prices check karne mein help kar sakta hoon."
      : "I am the ONLY DENIMS AI Assistant! I am here to help you explore our raw denim catalog, track orders, check prices, and answer any questions.";
  }

  // User Identity Questions ("mera naam kya hai", "who am i", "माझं नाव काय आहे", "my name")
  if (
    q.includes("my name") ||
    q.includes("who am i") ||
    q.includes("mera naam") ||
    q.includes("माझं नाव") ||
    q.includes("मी कोण") ||
    q.includes("mai kaun") ||
    q.includes("main kaun") ||
    q.includes("my identity")
  ) {
    if (isMarathi) {
      if (userName) {
        return `तुम्ही सध्या ${userName} म्हणून logged in आहात! मी तुम्हाला तुमच्या orders किंवा wishlist मध्ये कशी मदत करू शकेन?`;
      }
      return "तुम्ही सध्या guest user म्हणून browse करत आहात. तुमची profile पाहण्यासाठी account मध्ये sign in करा:\nhttps://onlydenims.com/account/orders";
    }
    if (userName) {
      return isHindi
        ? `Aap abhi ${userName} ke naam se logged in hain! Main aapki orders ya wishlist mein kaise help kar sakta hoon?`
        : `You are currently logged in as ${userName}! How can I assist you with your orders or wishlist today?`;
    }
    return isHindi
      ? "Aap abhi guest user ki tarah browse kar rahe hain. Apni profile details dekhne ke liye account mein sign in karein:\nhttps://onlydenims.com/account/orders"
      : "You are currently browsing as a guest. Please sign into your account to view your profile details:\nhttps://onlydenims.com/account/orders";
  }

  // Contact Questions ("contact", "email", "baat", "support", "संपर्क")
  if (
    q.includes("contact") ||
    q.includes("email") ||
    q.includes("support") ||
    q.includes("reach") ||
    q.includes("help") ||
    q.includes("baat") ||
    q.includes("sampark") ||
    q.includes("संपर्क") ||
    q.includes("mail") ||
    q.includes("phone")
  ) {
    if (isMarathi) {
      return "तुम्ही आमच्या support team शी direct email द्वारे संपर्क साधू शकता: onlydenims26@gmail.com किंवा आमच्या contact page वर संदेश पाठवू शकता:\nhttps://onlydenims.com/contact";
    }
    return isHindi
      ? "Aap humari support team se direct email par contact kar sakte hain: onlydenims26@gmail.com ya contact page par message bhej sakte hain:\nhttps://onlydenims.com/contact"
      : "You can reach our support team via email at onlydenims26@gmail.com or submit an inquiry on our contact page:\nhttps://onlydenims.com/contact";
  }

  if (
    q.includes("buy") ||
    q.includes("cart") ||
    q.includes("purchase") ||
    q.includes("khareedna") ||
    q.includes("खरीद") ||
    q.includes("खरीदणी") ||
    q.includes("खरीदना") ||
    q.includes("जींस") ||
    q.includes("जीन्स") ||
    (q.includes("want") && (q.includes("ankle") || q.includes("baggy") || q.includes("slim") || q.includes("jeans") || q.includes("jacket") || q.includes("shorts") || q.includes("accessories") || q.includes("cap")))
  ) {
    const sizeMatch = q.match(/\b(28|30|32|34|36|38|40)\b/);
    const size = sizeMatch ? sizeMatch[1] : "FREE";
    let title = "Raw Indigo Jeans";
    let price = 1850;

    if (q.includes("ankle")) title = "Raw Indigo Ankle Fit Jeans";
    else if (q.includes("baggy")) title = "Carbon Black Baggy Fit Jeans";
    else if (q.includes("slim")) title = "Raw Indigo Slim Fit Jeans";
    else if (q.includes("jacket")) { title = "Raw Denim Jacket"; price = 2499; }
    else if (q.includes("shorts")) { title = "Raw Denim Shorts"; price = 1999; }
    else if (q.includes("accessories") || q.includes("cap") || q.includes("belt")) { title = "Denim Patchwork Cap"; price = 150; }

    if (isMarwari) {
      return `म्हे थाने ${title} ₹ ${price.toLocaleString('en-IN')} में तैयार कर दीनी है! झटपट खरीदबा री खातर नीचे बटन दबावो:\n[ACTION:BUY:{"title":"${title}","price":${price},"size":"${size}"}]`;
    }
    if (isMarathi) {
      return `मी तुमचे ${title} ₹ ${price.toLocaleString('en-IN')} मध्ये तयार केले आहे! ते थेट खरेदीसाठी खालील बटणावर क्लिक करा.\n[ACTION:BUY:{"title":"${title}","price":${price},"size":"${size}"}]`;
    }
    return isHindi
      ? `Maine aapka ${title} ₹ ${price.toLocaleString('en-IN')} mein ready kar diya hai! Bag mein add karne ke liye neeche button par click karein.\n[ACTION:BUY:{"title":"${title}","price":${price},"size":"${size}"}]`
      : `I have prepared your ${title} for ₹ ${price.toLocaleString('en-IN')}! Click the button below to add it directly to your shopping bag.\n[ACTION:BUY:{"title":"${title}","price":${price},"size":"${size}"}]`;
  }

  if (q.includes("track") || q.includes("where is my order") || q.includes("tracking") || q.includes("mera order") || q.includes("kahan hai")) {
    if (isMarathi) {
      return "तुम्ही तुमचे थेट ऑर्डर स्टेटस आणि ट्रॅकिंग तपशील अकाउंट पोर्टलवर पाहू शकता:\nhttps://onlydenims.com/account/orders";
    }
    return isHindi
      ? "Aap apna live order status aur tracking updates account portal par dekh sakte hain:\nhttps://onlydenims.com/account/orders"
      : "You can view your live order status and real-time shipment updates under your account portal.\nhttps://onlydenims.com/account/orders";
  }
  if (q.includes("order") || q.includes("purchase") || q.includes("history")) {
    if (isMarathi) {
      return "तुमचे सर्व मागील ऑर्डर्स अकाउंट पोर्टलवर तपासा:\nhttps://onlydenims.com/account/orders";
    }
    return isHindi
      ? "Apne sabhi past orders aur tracking details account portal mein check karein:\nhttps://onlydenims.com/account/orders"
      : "Access all your past orders, invoices, and shipment tracking in your account portal.\nhttps://onlydenims.com/account/orders";
  }
  if (q.includes("wishlist") || q.includes("saved") || q.includes("heart") || q.includes("favorite")) {
    if (isMarathi) {
      return "तुमचे आवडते फिट्स विशलिस्टमध्ये सेव्ह करण्यासाठी प्रोडक्ट कार्डवरील हार्ट आयकॉनवर क्लिक करा:\nhttps://onlydenims.com/wishlist";
    }
    return isHindi
      ? "Apne favorite fits ko wishlist mein save karne ke liye product card par heart icon dabaayein:\nhttps://onlydenims.com/wishlist"
      : "Tap the heart icon on any product card to save your favorite fits to your wishlist.\nhttps://onlydenims.com/wishlist";
  }
  if (q.includes("jacket") || q.includes("jackets")) {
    const p = getLiveCategoryPrice("jacket", "₹ 2,499");
    if (isMarathi) {
      return `आमचे Heavy Twill Selvedge Denim Jackets ${p} पासून सुरू होतात.`;
    }
    return isHindi
      ? `Humari Heavy Twill Selvedge Denim Jackets ${p} se start hoti hain.`
      : `Our Heavy Twill Selvedge Denim Jackets start at ${p}.`;
  }
  if (q.includes("shorts") || q.includes("short")) {
    const p = getLiveCategoryPrice("short", "₹ 1,999");
    if (isMarathi) {
      return `आमचे Comfort Cut Raw Denim Shorts ${p} पासून सुरू होतात.`;
    }
    return isHindi
      ? `Humare Comfort Cut Raw Denim Shorts ${p} se start hote hain.`
      : `Our Comfort Cut Raw Denim Shorts start at ${p}.`;
  }
  if (q.includes("accessory") || q.includes("accessories") || q.includes("cap") || q.includes("belt") || q.includes("tote")) {
    const p = getLiveCategoryPrice("cap", "₹ 150");
    if (isMarathi) {
      return `आमच्या Accessories ${p} पासून सुरू होतात (caps, belts आणि denim totes).`;
    }
    return isHindi
      ? `Humari Accessories ${p} se start hoti hain (caps, belts aur denim totes).`
      : `Our Accessories start at ${p} for caps, belts, and denim totes.`;
  }
  if (q.includes("jeans") || q.includes("denim")) {
    const p = getLiveCategoryPrice("jeans", "₹ 1,850");
    if (isMarathi) {
      return `आमची raw denim jeans ${p} पासून सुरू होते across all 6 precision fits (Ankle, Slim, Comfort, Straight, Baggy, and Bootcut).`;
    }
    return isHindi
      ? `Humari raw denim jeans ${p} se start hoti hain across all 6 precision fits (Ankle, Slim, Comfort, Straight, Baggy, and Bootcut).`
      : `Our raw denim jeans start at ${p} across all 6 precision fits (Ankle, Slim, Comfort, Straight, Baggy, and Bootcut).`;
  }
  if (q.includes("fit") || q.includes("size") || q.includes("baggy") || q.includes("slim") || q.includes("bootcut") || q.includes("ankle") || q.includes("comfort") || q.includes("straight")) {
    if (isMarathi) {
      return "आम्ही ६ अचूक फिट्स ऑफर करतो: Ankle, Slim, Comfort, Straight, Baggy, आणि Bootcut (sizes 28 ते 42).";
    }
    return isHindi
      ? "Hum 6 precision fits offer karte hain: Ankle, Slim, Comfort, Straight, Baggy, aur Bootcut (sizes 28 se 42)."
      : "We offer 6 precision fits: Ankle, Slim, Comfort, Straight, Baggy, and Bootcut (sizes 28 to 42).";
  }
  if (q.includes("price") || q.includes("cost") || q.includes("daam") || q.includes("rate") || q.includes("kitne") || q.includes("किंमत")) {
    const pJeans = getLiveCategoryPrice("jeans", "₹ 1,850");
    const pAcc = getLiveCategoryPrice("cap", "₹ 150");
    const pJackets = getLiveCategoryPrice("jacket", "₹ 2,499");
    if (isMarathi) {
      return `आमच्या Accessories ${pAcc} पासून, Jeans ${pJeans} पासून आणि Denim Jackets ${pJackets} पासून सुरू होतात.`;
    }
    return isHindi
      ? `Humari Accessories ${pAcc} se, Jeans ${pJeans} se aur Denim Jackets ${pJackets} se start hoti hain.`
      : `Our Accessories start at ${pAcc}, Jeans start at ${pJeans}, and Denim Jackets at ${pJackets}.`;
  }
  if (q.includes("shirt") || q.includes("tshirt") || q.includes("t-shirt") || q.includes("top") || q.includes("hoodie") || q.includes("sweater") || q.includes("shoe") || q.includes("शर्ट")) {
    if (isMarathi) {
      return "सध्या ONLY DENIMS वर आम्ही Raw Denim Jeans, Selvedge Denim Jackets, Shorts आणि Accessories (caps, belts) ऑफर करतो. संपूर्ण कलेक्शन येथे पहा:\nhttps://onlydenims.com/shop";
    }
    return isHindi
      ? "Filhaal ONLY DENIMS par hum Raw Denim Jeans, Selvedge Denim Jackets, Shorts aur Accessories (caps, belts) offer karte hain. Full collection yahan dekhein:\nhttps://onlydenims.com/shop"
      : "Currently, ONLY DENIMS specializes in Raw Denim Jeans, Heavy Twill Selvedge Denim Jackets, Shorts, and Accessories. Explore our full collection at:\nhttps://onlydenims.com/shop";
  }

  if (q.includes("milti") || q.includes("milta") || q.includes("bechte") || q.includes("available") || q.includes("catalog") || q.includes("collection") || q.includes("kya kya") || q.includes("मिळेल")) {
    if (isMarathi) {
      return "ONLY DENIMS वर तुम्हाला Raw Selvedge Jeans (₹ 1,850 पासून), Denim Jackets (₹ 2,499) आणि Denim Accessories (₹ 150 पासून) मिळतात! संपूर्ण shop एक्सप्लोर करा:\nhttps://onlydenims.com/shop";
    }
    return isHindi
      ? "ONLY DENIMS par aapko Raw Selvedge Jeans (₹ 1,850 se), Denim Jackets (₹ 2,499) aur Denim Accessories (₹ 150 se) milti hain! Full shop explore karein:\nhttps://onlydenims.com/shop"
      : "On ONLY DENIMS, you can shop Raw Selvedge Jeans (from ₹ 1,850), Denim Jackets (₹ 2,499), and Denim Accessories (from ₹ 150). Explore our shop:\nhttps://onlydenims.com/shop";
  }

  if (q.includes("rbw")) {
    if (isMarathi) {
      return "RBW Store ONLY DENIMS वर सुरु आहे! उत्पादने ₹ 1,850 पासून सुरू होतात:\nhttps://onlydenims.com/stores/rbw";
    }
    return isHindi
      ? "RBW Store ONLY DENIMS par live hai! Products ₹ 1,850 se start hote hain:\nhttps://onlydenims.com/stores/rbw"
      : "RBW Store is live now on ONLY DENIMS! Items start at ₹ 1,850 for raw denim jeans up to ₹ 2,499 for heavy twill jackets.\nhttps://onlydenims.com/stores/rbw";
  }

  if (isTamil) {
    return "வணக்கம்! நான் ONLY DENIMS AI உதவி பெற்றவர். எங்களின் ரா டெனிம் ஜீன்ஸ் (₹ 1,850 முதல்), ஜாக்கெட்டுகள் மற்றும் பாகங்களை இங்கே காண்க:\nhttps://onlydenims.com/shop";
  }
  if (isTelugu) {
    return "నమస్కారం! నేను ONLY DENIMS AI అసిస్టెంట్. మా రా డెనిమ్ జీన్స్ (₹ 1,850 నుండి), జాకెట్లు మరియు ఉపకరణాలను ఇక్కడ చూడండి:\nhttps://onlydenims.com/shop";
  }
  if (isKannada) {
    return "ನಮಸ್ಕಾರ! ನಾನು ONLY DENIMS AI ಸಹಾಯಕ. ನಮ್ಮ ರಾ ಡೆನಿಮ್ ಜೀನ್ಸ್ (₹ 1,850 ರಿಂದ), ಜಾಕೆಟ್‌ಗಳು ಮತ್ತು ಪರಿಕರಗಳನ್ನು ಇಲ್ಲಿ ನೋಡಿ:\nhttps://onlydenims.com/shop";
  }
  if (isMalayalam) {
    return "നമസ്കാരം! ഞാൻ ONLY DENIMS AI അസിസ്റ്റൻ്റാണ്. ഞങ്ങളുടെ റോ ഡെനിം ജീൻസ് (₹ 1,850 മുതൽ), ജാക്കറ്റുകൾ, ആക്സസറികൾ എന്നിവ ഇവിടെ കാണുക:\nhttps://onlydenims.com/shop";
  }
  if (isBengali) {
    return "নমস্কার! আমি ONLY DENIMS AI অ্যাসিস্ট্যান্ট। আমাদের র ডেনিম জিন্স (₹ ১,৮৫০ থেকে), জ্যাকেট এবং অ্যাকসেসরিজ এখানে দেখুন:\nhttps://onlydenims.com/shop";
  }
  if (isGujarati) {
    return "નમસ્તે! હું ONLY DENIMS AI અસિસ્ટન્ટ છું. અમારા રો ડેનિમ જીન્સ (₹ 1,850 થી), જેકેટ્સ અને એક્સેસરીઝ જુઓ:\nhttps://onlydenims.com/shop";
  }
  if (isMarathi) {
    return "नमस्कार! मी ONLY DENIMS AI Assistant आहे. तुम्ही मला तुमचे orders, wishlist, jeans fits किंवा prices बद्दल विचारू शकता!";
  }
  if (isHindi) {
    return "Namaste! Main ONLY DENIMS AI Assistant hoon. Aap mujhse apne orders, wishlist, jeans fits, ya prices ke baare mein pooch sakte hain!";
  }
  return "Hey there! Welcome to ONLY DENIMS. Ask me about your orders, wishlist, jeans fits, or prices!";
}
