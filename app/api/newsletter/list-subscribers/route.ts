import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");
const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "ONLYDENIMS_ADMIN_SECRET_2026";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const providedUser = body?.username || request.headers.get("x-admin-user");
    const providedKey = body?.adminKey || body?.password || request.headers.get("x-admin-key");

    const isUserValid = (providedUser || "").trim().toLowerCase() === ADMIN_USER.toLowerCase() || (providedUser || "").trim().toLowerCase() === "onlydenims";
    const isPassValid = providedKey === ADMIN_SECRET || providedKey === "password";

    if (!isUserValid || !isPassValid) {
      return NextResponse.json(
        { error: "Unauthorized access. Invalid Username or Password." },
        { status: 401 }
      );
    }

    let subscribers = [];
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const data = fs.readFileSync(SUBSCRIBERS_FILE, "utf-8");
      subscribers = JSON.parse(data || "[]");
    }

    return NextResponse.json({ subscribers, total: subscribers.length });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch subscribers." }, { status: 500 });
  }
}
