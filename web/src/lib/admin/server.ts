import "server-only";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";
export const isMock = API_BASE.length === 0;
export const mockLoginAllowed = isMock && process.env.NODE_ENV !== "production";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8,
};

export function readToken(request: Request): string | null {
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === ADMIN_COOKIE) return decodeURIComponent(v.join("="));
  }
  return null;
}

export const unauthorized = () => NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
