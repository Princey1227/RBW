import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "ONLYDENIMS_ADMIN_SECRET_2026";

function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SUBSCRIBERS_FILE)) {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2));
  }
}

// POST endpoint: PUBLIC - Allows website visitors to subscribe
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, brand } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    ensureFileExists();

    const fileData = fs.readFileSync(SUBSCRIBERS_FILE, "utf-8");
    const subscribers: Array<{ email: string; subscribedAt: string; brand?: string }> = JSON.parse(fileData || "[]");

    const normalizedEmail = email.trim().toLowerCase();
    const existing = subscribers.find((s) => s.email === normalizedEmail && (s.brand || "GENERAL") === (brand || "GENERAL"));

    if (!existing) {
      subscribers.push({
        email: normalizedEmail,
        brand: brand ? String(brand).trim().toUpperCase() : "GENERAL",
        subscribedAt: new Date().toISOString(),
      });
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
    }

    return NextResponse.json({
      success: true,
      message: brand 
        ? `You're on the list! We'll notify you as soon as ${brand} launches.`
        : "Successfully subscribed to ONLY DENIMS updates!",
      alreadySubscribed: !!existing,
      totalSubscribers: subscribers.length,
    });
  } catch (err: any) {
    console.error("Error saving newsletter subscription:", err);
    return NextResponse.json(
      { error: "Failed to process subscription." },
      { status: 500 }
    );
  }
}

// GET endpoint: PROTECTED - Requires admin secret key
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providedKey = searchParams.get("key") || request.headers.get("x-admin-key");

    if (providedKey !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized access. Valid admin secret key required." },
        { status: 401 }
      );
    }

    ensureFileExists();
    const fileData = fs.readFileSync(SUBSCRIBERS_FILE, "utf-8");
    const subscribers = JSON.parse(fileData || "[]");
    return NextResponse.json({ subscribers, total: subscribers.length });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch subscribers." }, { status: 500 });
  }
}
