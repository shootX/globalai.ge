import { createHmac, timingSafeEqual } from "crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const MAX_SKEW_SECONDS = 300;
const TAGS = ["services", "projects", "pages", "team", "settings"] as const;

function same(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET || process.env.NEXT_REVALIDATE_SECRET || "";
  const body = await request.text();
  const signature = request.headers.get("x-globalai-signature") ?? "";
  const expected = secret ? createHmac("sha256", secret).update(body).digest("hex") : "";
  if (secret === "" || !same(signature, expected)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let tag = "";
  let bodyTimestamp = NaN;
  try {
    const parsed = JSON.parse(body) as { tag?: unknown; timestamp?: unknown };
    tag = String(parsed.tag ?? "");
    bodyTimestamp = Number(parsed.timestamp);
  } catch {
    return NextResponse.json({ message: "Invalid body" }, { status: 422 });
  }

  const headerTimestamp = Number(request.headers.get("x-globalai-timestamp") ?? NaN);
  const now = Math.floor(Date.now() / 1000);
  if (
    !Number.isFinite(headerTimestamp) ||
    headerTimestamp !== bodyTimestamp ||
    Math.abs(now - headerTimestamp) > MAX_SKEW_SECONDS
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!TAGS.includes(tag as (typeof TAGS)[number])) {
    return NextResponse.json({ message: "Unknown tag" }, { status: 422 });
  }

  revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: true, tag });
}
