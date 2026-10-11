/**
 * Admin API shapes — source of truth: /workspace/globalai-ge/openapi.yaml (components.schemas.*Write, AdminSettings).
 * Every translatable field is a full Translations object {ka,en,ru}.
 */
export const ADMIN_LOCALES = ["ka", "en", "ru"] as const;
export type AdminLocale = (typeof ADMIN_LOCALES)[number];
/** openapi: Translations (values nullable). */
export type Translations = Record<AdminLocale, string | null>;

/** openapi: ServiceWrite + id. */
export type AdminService = {
  id: number;
  title: Translations;
  slug: Translations;
  summary: Translations;
  body: Translations;
  seo_title: Translations;
  seo_description: Translations;
  og_image: string | null;
  noindex: boolean;
  sort_order: number;
  is_published: boolean;
};

/** openapi: ProjectWrite (= ServiceWrite + category, cover_image, gallery) + id. */
export type AdminProject = Omit<AdminService, never> & {
  category: Translations;
  cover_image: string | null;
  gallery: string[];
};

/** openapi: TeamWrite + id. */
export type AdminTeamMember = {
  id: number;
  name: Translations;
  role: Translations;
  bio: Translations;
  photo: string | null;
  sort_order: number;
  is_published: boolean;
};

export const PAGE_KEYS = ["home", "about", "services", "projects", "contact"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];
export type PageContent = Record<string, string>;

/** openapi: PageWrite. content is keyed by locale, ka required. */
export type AdminPage = {
  key: PageKey;
  content: { ka: PageContent; en: PageContent | null; ru: PageContent | null };
  seo_title: Translations;
  seo_description: Translations;
  og_image: string | null;
  noindex: boolean;
};

export type AdminStat = { value: string; label: Translations };

/** openapi: AdminSettings. */
export type AdminSettings = {
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: Translations;
  socials: { instagram: string | null; facebook: string | null; linkedin: string | null; behance: string | null };
  logo: string | null;
  stats: AdminStat[];
  projects_nav_visible: boolean;
  team_visible: boolean;
  stats_visible: boolean;
};

export type SubmissionStatus = "new" | "read" | "archived";

/** Confirmed by tech lead (Laravel ContactSubmission). Statuses new/read/archived still unconfirmed (ContactSubmission::STATUSES). */
export type ContactSubmission = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  locale: AdminLocale;
  ip: string | null;
  user_agent: string | null;
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
};

export type ApiList<T> = { data: T[]; meta: { total: number } };
export type ApiItem<T> = { data: T };
/** POST /admin/uploads -> {data:{path,url}}. Persist `path`; `url` is preview-only. */
export type UploadResult = { path: string; url: string };

export const ADMIN_COOKIE = "gai_admin_token";

export const emptyT = (): Translations => ({ ka: "", en: "", ru: "" });
