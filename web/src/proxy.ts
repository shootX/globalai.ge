import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { ADMIN_COOKIE } from "./lib/admin/types";

const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const hasToken = Boolean(request.cookies.get(ADMIN_COOKIE)?.value);
    const isLogin = pathname === "/admin/login";
    if (!hasToken && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    if (hasToken && isLogin) return NextResponse.redirect(new URL("/admin", request.url));
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  return intl(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|sitemap.xml|robots.txt|.*\\..*).*)"],
};
