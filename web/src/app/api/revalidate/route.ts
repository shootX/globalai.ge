import { createHmac, timingSafeEqual } from "crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

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
  const bearer = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers.get("x-revalidate-secret") ?? "";
  const signature = request.headers.get("x-globalai-signature") ?? "";
  const expected = secret ? createHmac("sha256", secret).update(body).digest("hex") : "";
  const allowed = secret !== "" && (same(bearer, secret) || same(headerSecret, secret) || same(signature, expected));

  if (!allowed) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let tag = "";
  try {
    tag = String((JSON.parse(body) as { tag?: unknown }).tag ?? "");
  } catch {
    return NextResponse.json({ message: "Invalid body" }, { status: 422 });
  }

  if (!TAGS.includes(tag as (typeof TAGS)[number])) {
    return NextResponse.json({ message: "Unknown tag" }, { status: 422 });
  }

  revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: true, tag });
}
