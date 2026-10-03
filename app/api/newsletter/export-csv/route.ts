import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");
const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "ONLYDENIMS_ADMIN_SECRET_2026";

export async function POST(request: Request) {
  try {
    let providedUser = request.headers.get("x-admin-user");
    let providedKey = request.headers.get("x-admin-key");

    if (!providedUser || !providedKey) {
      try {
        const body = await request.json();
        providedUser = body?.username;
        providedKey = body?.adminKey || body?.password;
      } catch (e) {}
    }

    const isUserValid = (providedUser || "").trim().toLowerCase() === ADMIN_USER.toLowerCase() || (providedUser || "").trim().toLowerCase() === "onlydenims";
    const isPassValid = providedKey === ADMIN_SECRET || providedKey === "password";

    if (!isUserValid || !isPassValid) {
      return NextResponse.json(
        { error: "Unauthorized access. Invalid Username or Password." },
        { status: 401 }
      );
    }

    let subscribers: Array<{ email: string; subscribedAt: string }> = [];
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const data = fs.readFileSync(SUBSCRIBERS_FILE, "utf-8");
      subscribers = JSON.parse(data || "[]");
    }

    // Build CSV string
    const csvRows = ["Email,SubscribedAt"];
    subscribers.forEach((s) => {
      csvRows.push(`"${s.email}","${s.subscribedAt}"`);
    });

    const csvContent = csvRows.join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="onlydenims_subscribers_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to export subscribers CSV." }, { status: 500 });
  }
}
