import { NextResponse } from "next/server";

/** Proxies POST /api/v1/contact to Laravel; local mock while NEXT_PUBLIC_API_URL is unset. */
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

export async function POST(request: Request) {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/v1/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": request.headers.get("user-agent") ?? "globalai-web",
        ...(request.headers.get("x-forwarded-for") ? { "X-Forwarded-For": request.headers.get("x-forwarded-for")! } : {}),
      },
      body: await request.text(),
    });
    return new NextResponse(res.body, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" } });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body.name !== "string" || typeof body.email !== "string" || typeof body.message !== "string") {
    return NextResponse.json({ message: "invalid", errors: { form: ["invalid"] } }, { status: 422 });
  }
  return NextResponse.json({ data: { accepted: true } }, { status: 201 });
}
