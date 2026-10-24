import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { getProjects, getServices, hasApi } from "@/lib/api";
import { hiddenLocalePaths } from "@/lib/page-seo";
import { PAGE_PATHS, SITE_URL, localizedPath, type PageKey } from "@/lib/seo";

type Entry = MetadataRoute.Sitemap[number];

/** One entry per locale, each listing every language version of the same page. */
function entries(paths: Partial<Record<Locale, string>>, priority: number, hidden: Set<string>): Entry[] {
  const languages = Object.fromEntries(
    routing.locales.filter((l) => paths[l]).map((l) => [l, `${SITE_URL}${localizedPath(paths[l] as string, l)}`]),
  );
  return routing.locales
    .filter((l) => paths[l] && !hidden.has(localizedPath(paths[l] as string, l)))
    .map((l) => ({
      url: `${SITE_URL}${localizedPath(paths[l] as string, l)}`,
      changeFrequency: "monthly" as const,
      priority,
      alternates: { languages },
    }));
}

/** Detail pages: the same record (by id) can have a different slug per language. */
async function detailPaths(load: typeof getProjects | typeof getServices, base: string) {
  const byId = new Map<number, Partial<Record<Locale, string>>>();
  const lists = await Promise.all(routing.locales.map((l) => load(l).then((r) => [l, r.data] as const).catch(() => [l, []] as const)));
  for (const [l, rows] of lists) {
    for (const row of rows) {
      if (!row.slug || !row.title || row.noindex) continue;
      byId.set(row.id, { ...byId.get(row.id), [l]: `${base}/${row.slug}` });
    }
  }
  return [...byId.values()];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hidden = new Set(await hiddenLocalePaths());
  const pages = (Object.keys(PAGE_PATHS) as PageKey[]).flatMap((key) => {
    const path = PAGE_PATHS[key];
    return entries(Object.fromEntries(routing.locales.map((l) => [l, path])), path === "/" ? 1 : 0.7, hidden);
  });
  if (!hasApi) return pages;
  const [projects, services] = await Promise.all([detailPaths(getProjects, "/projects"), detailPaths(getServices, "/services")]);
  return [...pages, ...projects.flatMap((p) => entries(p, 0.6, hidden)), ...services.flatMap((p) => entries(p, 0.5, hidden))];
}
