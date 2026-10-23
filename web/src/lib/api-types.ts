import type { Locale } from "@/i18n/routing";

/** Laravel public API envelope: GET /api/v1/{resource}?locale=xx */
export type ApiList<T> = { data: T[]; meta: { total: number } };
export type ApiItem<T> = { data: T };

/** openapi: ServiceCard (+ ServiceDetail fields). `tags` is NOT in the contract — local mock extra only. */
export type Service = {
  id: number;
  slug: string | null;
  title: string | null;
  summary: string | null;
  sort_order: number;
  body?: string | null;
  tags?: string[];
  noindex?: boolean;
  og_image?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
};

export type ProjectCategory = "web" | "mobile" | "ai";

/** openapi: ProjectCard. */
export type Project = {
  id: number;
  slug: string | null;
  title: string | null;
  summary: string | null;
  category: string | null;
  cover_image: string | null;
  /** Public site of the venture, e.g. https://autolime.ge. */
  website_url?: string | null;
  /** live = running venture, building = in progress. */
  status?: "live" | "building";
  sort_order: number;
  noindex?: boolean;
  og_image?: string | null;
};

/** openapi: ProjectDetail. */
export type ProjectDetail = Project & {
  body: string | null;
  gallery: string[];
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  noindex: boolean;
  alternates: Record<Locale, string | null>;
};

/** openapi: Page. */
export type Page = {
  key: "home" | "about" | "services" | "projects" | "contact";
  content: Record<string, unknown> | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image?: string | null;
  noindex?: boolean;
};

/** openapi: Service detail. */
export type ServiceDetail = Service & {
  body: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  noindex: boolean;
  alternates: Record<Locale, string | null>;
};

/** openapi: TeamMember. */
export type TeamMember = { id: number; name: string | null; role: string | null; bio: string | null; photo: string | null; sort_order: number };

/** openapi: PublicSettings.stats[] */
export type Stat = { value: string | null; label: string | null };

/** openapi: PublicSettings. `working_hours` is NOT in the contract — mock extra, hidden when absent. */
export type Settings = {
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  socials: Record<string, string | null>;
  logo: string | null;
  stats?: Stat[];
  projects_nav_visible: boolean;
  team_visible: boolean;
  stats_visible: boolean;
  working_hours?: string;
};

/** openapi: ContactRequest. */
export type ContactPayload = {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  locale: Locale;
  /** Honeypot — must be empty. */
  company_website?: string;
};
