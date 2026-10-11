import { routing, type Locale } from "@/i18n/routing";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://globalai.ge").replace(/\/+$/, "");
export const OG_IMAGE = "/brand/globalai-logo.png";

export type PageKey = "home" | "about" | "services" | "projects" | "contact";
export const PAGE_PATHS: Record<PageKey, string> = {
  home: "/",
  about: "/about",
  services: "/services",
  projects: "/projects",
  contact: "/contact",
};

export function localizedPath(path: string, locale: Locale): string {
  if (locale === routing.defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
