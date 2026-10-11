import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_COOKIE } from "@/lib/admin/types";
import { API_BASE, cookieOptions, isMock, mockLoginAllowed } from "@/lib/admin/server";
import { store } from "@/lib/admin/mock-store";

const schema = z.object({ email: z.email(), password: z.string().min(1) });

/** BFF login: exchanges credentials for a Sanctum token and keeps it in an httpOnly cookie. */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "invalid", errors: { email: ["invalid"] } }, { status: 422 });

  let token: string | null = null;
  if (isMock) {
    if (!mockLoginAllowed) {
      return NextResponse.json({ message: "API is not configured (NEXT_PUBLIC_API_URL)." }, { status: 503 });
    }
    token = `mock-${crypto.randomUUID()}`;
    store.tokens.add(token);
  } else {
    const res = await fetch(`${API_BASE}/api/v1/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Language": "ka" },
      body: JSON.stringify({ ...parsed.data, device_name: "globalai-web-admin" }),
    });
    const body = (await res.json().catch(() => ({}))) as { token?: string; data?: { token?: string }; message?: string };
    if (!res.ok) return NextResponse.json({ message: body.message ?? "Login failed" }, { status: res.status });
    token = body.token ?? body.data?.token ?? null;
    if (!token) return NextResponse.json({ message: "No token in response" }, { status: 502 });
  }

  const out = NextResponse.json({ data: { ok: true } });
  out.cookies.set(ADMIN_COOKIE, token, cookieOptions);
  return out;
}
