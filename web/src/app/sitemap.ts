import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { PAGE_PATHS, SITE_URL, localizedPath } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(PAGE_PATHS).flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${localizedPath(path, locale)}`,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}${localizedPath(path, l)}`])),
      },
    })),
  );
}
