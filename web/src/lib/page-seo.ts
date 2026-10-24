import "server-only";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { getPage, getProjects, getServices, hasApi } from "@/lib/api";
import { storageUrl } from "@/lib/admin/storage";
import { store } from "@/lib/admin/mock-store";
import { OG_IMAGE, OG_IMAGE_SIZE, PAGE_PATHS, SITE_URL, localizedPath, type PageKey } from "@/lib/seo";

export const OG_LOCALE: Record<Locale, string> = { ka: "ka_GE", en: "en_US", ru: "ru_RU" };

export type ResolvedSeo = {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  noindex: boolean;
};

const emptySeo = (): ResolvedSeo => ({ title: null, description: null, ogImage: null, noindex: false });

function pickLocale(map: { ka?: string | null; en?: string | null; ru?: string | null } | null | undefined, locale: Locale): string | null {
  const value = map?.[locale]?.trim() || map?.ka?.trim() || "";
  return value || null;
}

export async function loadPageSeo(locale: Locale, page: PageKey): Promise<ResolvedSeo> {
  if (!hasApi) {
    const row = store.pages.find((item) => item.key === page);
    return {
      title: pickLocale(row?.seo_title, locale),
      description: pickLocale(row?.seo_description, locale),
      ogImage: row?.og_image ?? null,
      noindex: Boolean(row?.noindex),
    };
  }

  try {
    const data = await getPage(page, locale);
    return {
      title: data?.seo_title?.trim() || null,
      description: data?.seo_description?.trim() || null,
      ogImage: data?.og_image ?? null,
      noindex: Boolean(data?.noindex),
    };
  } catch {
    return emptySeo();
  }
}

export function ogImageUrl(path: string | null | undefined): string {
  return storageUrl(path) || OG_IMAGE;
}

export async function pageMetadata(locale: Locale, page: PageKey): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const seo = await loadPageSeo(locale, page);
  const path = PAGE_PATHS[page];
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = localizedPath(path, l);
  languages["x-default"] = localizedPath(path, routing.defaultLocale);
  const fallbackTitle = page === "home" ? t("home.title") : `${t(`${page}.title`)} — ${t("siteName")}`;
  const title = seo.title || fallbackTitle;
  const description = seo.description || t(`${page}.description`);
  const image = ogImageUrl(seo.ogImage);
  const canonical = localizedPath(path, locale);
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    robots: seo.noindex ? { index: false, follow: false } : { index: true, follow: true },
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: t("siteName"),
      locale: OG_LOCALE[locale],
      type: "website",
      images: [{ url: image, ...(image === OG_IMAGE ? OG_IMAGE_SIZE : {}), alt: "GlobalAI" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export async function hiddenLocalePaths(): Promise<string[]> {
  const hidden: string[] = [];
  for (const key of Object.keys(PAGE_PATHS) as PageKey[]) {
    if (!(await loadPageSeo("ka", key)).noindex) continue;
    for (const locale of routing.locales) hidden.push(localizedPath(PAGE_PATHS[key], locale));
  }

  if (!hasApi) {
    for (const row of store.services) {
      if (!row.noindex) continue;
      const slug = row.slug.ka || row.slug.en || row.slug.ru;
      if (!slug) continue;
      for (const locale of routing.locales) hidden.push(localizedPath(`/services/${slug}`, locale));
    }
    for (const row of store.projects) {
      if (!row.noindex) continue;
      const slug = row.slug.ka || row.slug.en || row.slug.ru;
      if (!slug) continue;
      for (const locale of routing.locales) hidden.push(localizedPath(`/projects/${slug}`, locale));
    }
    return hidden;
  }

  const [services, projects] = await Promise.all([
    getServices("ka").catch(() => ({ data: [], meta: { total: 0 } })),
    getProjects("ka").catch(() => ({ data: [], meta: { total: 0 } })),
  ]);
  for (const row of services.data) {
    if (!row.noindex || !row.slug) continue;
    for (const locale of routing.locales) hidden.push(localizedPath(`/services/${row.slug}`, locale));
  }
  for (const row of projects.data) {
    if (!row.noindex || !row.slug) continue;
    for (const locale of routing.locales) hidden.push(localizedPath(`/projects/${row.slug}`, locale));
  }
  return hidden;
}
