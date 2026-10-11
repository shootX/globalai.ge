import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/types";
import { API_BASE, isMock, readToken } from "@/lib/admin/server";
import { store } from "@/lib/admin/mock-store";

export async function POST(request: Request) {
  const token = readToken(request);
  if (token) {
    if (isMock) store.tokens.delete(token);
    else
      await fetch(`${API_BASE}/api/v1/admin/logout`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      }).catch(() => undefined);
  }
  const out = NextResponse.json({ data: { ok: true } });
  out.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return out;
}
