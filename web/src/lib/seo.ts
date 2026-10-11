import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://globalai.ge").replace(/\/+$/, "");

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

export async function pageMetadata(locale: Locale, page: PageKey): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = PAGE_PATHS[page];
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = localizedPath(path, l);
  languages["x-default"] = localizedPath(path, routing.defaultLocale);
  const title = page === "home" ? t("home.title") : `${t(`${page}.title`)} — ${t("siteName")}`;
  const description = t(`${page}.description`);
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: localizedPath(path, locale), languages },
    openGraph: {
      title,
      description,
      url: localizedPath(path, locale),
      siteName: t("siteName"),
      locale: { ka: "ka_GE", en: "en_US", ru: "ru_RU" }[locale],
      type: "website",
      images: [{ url: "/brand/globalai-logo.png", width: 1471, height: 292, alt: "globalAI" }],
    },
  };
}
