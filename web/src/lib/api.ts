import { cacheLife, cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type {
  ApiItem,
  ApiList,
  Page,
  TeamMember,
  Project,
  ProjectDetail,
  Service,
  Settings,
} from "./api-types";
import { mockPage, mockTeam, mockProjects, mockServices, mockSettings } from "./mocks";

export * from "./api-types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";
export const hasApi = BASE_URL.length > 0;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

async function getJson<T>(path: string, locale: Locale): Promise<T> {
  "use cache";
  cacheLife("minutes");
  const url = `${BASE_URL}/api/v1/${path}${path.includes("?") ? "&" : "?"}locale=${locale}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new ApiError(res.status, `GET ${path} failed (${res.status})`);
  return (await res.json()) as T;
}

const list = <T>(data: T[]): ApiList<T> => ({ data, meta: { total: data.length } });

export async function getServices(locale: Locale): Promise<ApiList<Service>> {
  return hasApi ? getJson<ApiList<Service>>("services", locale) : list(mockServices(locale));
}

export async function getProjects(locale: Locale): Promise<ApiList<Project>> {
  return hasApi ? getJson<ApiList<Project>>("projects", locale) : list(mockProjects());
}

export async function getProject(slug: string, locale: Locale): Promise<ApiItem<ProjectDetail> | null> {
  if (!hasApi) return null;
  try {
    return await getJson<ApiItem<ProjectDetail>>(`projects/${encodeURIComponent(slug)}`, locale);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function getPage(key: Page["key"], locale: Locale): Promise<Page | null> {
  if (!hasApi) return mockPage();
  try {
    return (await getJson<ApiItem<Page>>(`pages/${key}`, locale)).data;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function getTeam(locale: Locale): Promise<ApiList<TeamMember>> {
  return hasApi ? getJson<ApiList<TeamMember>>("team", locale) : list(mockTeam());
}

export async function getSettings(locale: Locale): Promise<Settings> {
  if (!hasApi) return mockSettings(locale);
  const res = await getJson<ApiItem<Settings>>("settings", locale);
  return res.data;
}


/** Page blocks for one locale, cached (ISR) under tag "pages" so revalidateTag("pages") refreshes them. */
async function getPageBlocksCached(key: Page["key"], locale: Locale): Promise<Record<string, unknown>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("pages");
  const res = await fetch(`${BASE_URL}/api/v1/pages/${key}?locale=${locale}`, { headers: { Accept: "application/json" } });
  if (!res.ok) return {};
  const content = ((await res.json()) as ApiItem<Page>).data?.content;
  return content && typeof content === "object" && !Array.isArray(content) ? (content as Record<string, unknown>) : {};
}

/**
 * Returns a translator for a public page: CMS block (non-empty string) wins, else built-in message.
 * Block keys: see PAGE_BLOCKS in ./page-blocks.ts.
 */
export async function getPageText(key: Page["key"], locale: Locale) {
  const t = await getTranslations({ locale, namespace: key });
  const blocks = hasApi ? await getPageBlocksCached(key, locale).catch(() => ({}) as Record<string, unknown>) : {};
  const fn = ((k: string, values?: Record<string, string | number>) => {
    const v = blocks[k];
    if (!values && typeof v === "string" && v.trim()) return v;
    return t(k as never, values as never);
  }) as typeof t;
  return Object.assign(fn, { raw: t.raw, rich: t.rich, markup: t.markup, has: t.has });
}
