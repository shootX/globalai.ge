import "server-only";
import type {
  AdminPage,
  AdminProject,
  AdminService,
  AdminSettings,
  AdminTeamMember,
  ContactSubmission,
  Translations,
} from "./types";
import { mockServiceRows as mockServices } from "@/lib/mocks";

export type MockAudit = {
  id: number;
  user_id: number;
  user: { id: number; name: string };
  action: string;
  model_type: string | null;
  model: string | null;
  model_id: number | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

export type MockToken = {
  id: number;
  name: string;
  expires_at: string;
  created_at: string;
  last_used_at: string | null;
  abilities: string[];
};

/** In-memory mock of the Laravel admin API. Lives only for the lifetime of the Node process. */
type Store = {
  tokens: Set<string>;
  services: AdminService[];
  projects: AdminProject[];
  team: AdminTeamMember[];
  submissions: ContactSubmission[];
  pages: AdminPage[];
  settings: AdminSettings;
  apiTokens: MockToken[];
  audit: MockAudit[];
  seq: number;
  /** Mock storage disk: path -> bytes (served by /api/mock-storage/[...path]). */
  files: Map<string, { type: string; bytes: Buffer }>;
};

const t = (ka: string, en: string, ru: string): Translations => ({ ka, en, ru });
const blank = (): Translations => ({ ka: "", en: "", ru: "" });

function seed(): Store {
  const ka = mockServices("ka");
  const en = mockServices("en");
  const ru = mockServices("ru");
  return {
    tokens: new Set(),
    seq: 100,
    files: new Map(),
    services: ka.map((s, n) => ({
      id: s.id,
      title: t(s.title, en[n].title, ru[n].title),
      slug: t(s.slug, s.slug, s.slug),
      summary: t(s.summary, en[n].summary, ru[n].summary),
      body: t(s.description, en[n].description, ru[n].description),
      seo_title: blank(),
      seo_description: blank(),
      og_image: null,
      noindex: false,
      sort_order: s.order,
      is_published: true,
    })),
    projects: [],
    team: [],
    submissions: [
      {
        id: 1,
        name: "ნიმუში",
        email: "sample@example.com",
        phone: null,
        subject: "ვებ-საიტი",
        message: "ეს არის სატესტო შეტყობინება (mock).",
        locale: "ka",
        ip: "127.0.0.1",
        user_agent: "Mozilla/5.0 (mock)",
        status: "new",
        created_at: "2026-10-10T12:00:00Z",
        updated_at: "2026-10-10T12:00:00Z",
      },
    ],
    pages: [
      {
        key: "home",
        content: {
          ka: { hero_title: "ციფრული პროდუქტები", hero_subtitle: "AI სტუდია თბილისიდან", about_text: "globalAI.GE არის თბილისური სტუდია, რომელიც აერთიანებს დიზაინერებს, დეველოპერებსა და AI სპეციალისტებს." },
          en: { hero_title: "Digital products", hero_subtitle: "AI studio from Tbilisi", about_text: "globalAI.GE is a Tbilisi studio that brings together designers, developers and AI specialists." },
          ru: { hero_title: "Цифровые продукты", hero_subtitle: "AI-студия из Тбилиси", about_text: "globalAI.GE — тбилисская студия, объединяющая дизайнеров, разработчиков и AI-специалистов." },
        },
        seo_title: blank(),
        seo_description: blank(),
        og_image: null,
        noindex: false,
      },
      {
        key: "about",
        content: {
          ka: { intro: "თბილისური სტუდია, რომელიც დიზაინს, კოდსა და ხელოვნურ ინტელექტს ერთ პროდუქტად აერთიანებს.", mission: "ვქმნით ტექნოლოგიას, რომელიც ბიზნესს რეალურად ეხმარება" },
          en: { intro: "A Tbilisi studio that brings design, code and artificial intelligence together into one product.", mission: "We build technology that genuinely helps businesses" },
          ru: { intro: "Тбилисская студия, объединяющая дизайн, код и искусственный интеллект в одном продукте.", mission: "Мы создаём технологии, которые действительно помогают бизнесу" },
        },
        seo_title: blank(),
        seo_description: blank(),
        og_image: null,
        noindex: false,
      },
    ],
    settings: {
      contact_email: "hello@globalai.ge",
      contact_phone: "+995 555 00 00 00",
      contact_address: t("თბილისი, რუსთაველის გამზ. 1", "1 Rustaveli Ave, Tbilisi", "Тбилиси, пр. Руставели, 1"),
      socials: { instagram: null, facebook: null, linkedin: null, behance: null },
      logo: "/brand/globalai-logo.png",
      stats: [],
      projects_nav_visible: true,
      team_visible: false,
      stats_visible: false,
    },
    apiTokens: [],
    audit: [],
  };
}

const g = globalThis as unknown as { __gaiAdminStore?: Store };
export const store: Store = (g.__gaiAdminStore ??= seed());
store.files ??= new Map();
store.apiTokens ??= [];
store.audit ??= [];

const MOCK_USER = { id: 1, name: "Admin" };

export function pushAudit(entry: Omit<MockAudit, "id" | "user_id" | "user" | "ip" | "user_agent" | "created_at"> & Partial<Pick<MockAudit, "old_values" | "new_values">>): MockAudit {
  const row: MockAudit = {
    id: nextId(),
    user_id: MOCK_USER.id,
    user: MOCK_USER,
    action: entry.action,
    model_type: entry.model_type,
    model: entry.model,
    model_id: entry.model_id,
    old_values: entry.old_values ?? null,
    new_values: entry.new_values ?? null,
    ip: "127.0.0.1",
    user_agent: "mock",
    created_at: new Date().toISOString(),
  };
  store.audit.unshift(row);
  return row;
}

export type CollectionName = "services" | "projects" | "team" | "submissions";
export const COLLECTIONS: CollectionName[] = ["services", "projects", "team", "submissions"];

export function nextId(): number {
  store.seq += 1;
  return store.seq;
}
