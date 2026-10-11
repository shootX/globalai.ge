import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { hiddenLocalePaths } from "@/lib/page-seo";
import { PAGE_PATHS, SITE_URL, localizedPath, type PageKey } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hidden = new Set(await hiddenLocalePaths());

  return (Object.keys(PAGE_PATHS) as PageKey[]).flatMap((key) => {
    const path = PAGE_PATHS[key];
    return routing.locales
      .map((locale) => localizedPath(path, locale))
      .filter((localized) => !hidden.has(localized))
      .map((localized) => ({
        url: `${SITE_URL}${localized}`,
        changeFrequency: "monthly" as const,
        priority: path === "/" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(routing.locales.map((locale) => [locale, `${SITE_URL}${localizedPath(path, locale)}`])),
        },
      }));
  });
}
