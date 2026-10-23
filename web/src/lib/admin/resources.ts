import type { Field } from "./fields";
import { emptyT, type Translations } from "./types";

export type ResourceConfig = {
  /** Admin API collection path (openapi: /api/v1/admin/{path}). */
  path: "services" | "projects" | "team";
  route: string;
  label: string;
  title: string;
  singular: string;
  fields: Field[];
  empty: () => Record<string, unknown>;
  primary: (row: Record<string, unknown>) => string;
  secondary?: (row: Record<string, unknown>) => string;
};

const ka = (v: unknown) => ((v as Translations | undefined)?.ka ?? "") || "—";

const seoFields: Field[] = [
  { kind: "i18n", name: "seo_title", label: "SEO სათაური" },
  { kind: "i18n", name: "seo_description", label: "SEO აღწერა", multiline: true },
  { kind: "image", name: "og_image", label: "OG სურათი" },
  { kind: "switch", name: "noindex", label: "noindex" },
];

const serviceFields: Field[] = [
  { kind: "i18n", name: "title", label: "სათაური", required: true },
  { kind: "i18n", name: "slug", label: "Slug (URL)", required: true, slug: true },
  { kind: "i18n", name: "summary", label: "მოკლე აღწერა", multiline: true },
  { kind: "i18n", name: "body", label: "სრული აღწერა", multiline: true },
  ...seoFields,
  { kind: "number", name: "sort_order", label: "რიგითობა (sort_order)" },
  { kind: "switch", name: "is_published", label: "გამოქვეყნებულია" },
];

export const RESOURCES: Record<"services" | "projects" | "team", ResourceConfig> = {
  services: {
    path: "services",
    route: "/admin/services",
    label: "კონტენტი",
    title: "სერვისები",
    singular: "სერვისი",
    fields: serviceFields,
    empty: () => ({ title: emptyT(), slug: emptyT(), summary: emptyT(), body: emptyT(), seo_title: emptyT(), seo_description: emptyT(), og_image: null, noindex: false, sort_order: 0, is_published: false }),
    primary: (r) => ka(r.title),
    secondary: (r) => ka(r.slug),
  },
  projects: {
    path: "projects",
    route: "/admin/projects",
    label: "კონტენტი",
    title: "პროექტები",
    singular: "პროექტი",
    fields: [
      ...serviceFields.slice(0, 4),
      { kind: "i18n", name: "category", label: "მიმართულება (მაგ. ავტო, მობილობა)" },
      { kind: "text", name: "website_url", label: "საიტის ბმული (მაგ. https://autolime.ge)", type: "url" },
      {
        kind: "select",
        name: "status",
        label: "სტატუსი",
        options: [
          { value: "live", label: "მოქმედი" },
          { value: "building", label: "მზადდება" },
        ],
      },
      { kind: "image", name: "cover_image", label: "ქავერი" },
      { kind: "gallery", name: "gallery", label: "გალერეა" },
      ...serviceFields.slice(4),
    ],
    empty: () => ({
      title: emptyT(), slug: emptyT(), summary: emptyT(), body: emptyT(), category: emptyT(), seo_title: emptyT(), seo_description: emptyT(),
      og_image: null, noindex: false, cover_image: null, gallery: [], website_url: "", status: "live", sort_order: 0, is_published: false,
    }),
    primary: (r) => ka(r.title),
    secondary: (r) => ka(r.slug),
  },
  team: {
    path: "team",
    route: "/admin/team",
    label: "ადამიანები",
    title: "გუნდი",
    singular: "გუნდის წევრი",
    fields: [
      { kind: "i18n", name: "name", label: "სახელი", required: true },
      { kind: "i18n", name: "role", label: "პოზიცია", required: true },
      { kind: "i18n", name: "bio", label: "ბიო", multiline: true },
      { kind: "image", name: "photo", label: "ფოტო" },
      { kind: "number", name: "sort_order", label: "რიგითობა (sort_order)" },
      { kind: "switch", name: "is_published", label: "გამოქვეყნებულია" },
    ],
    empty: () => ({ name: emptyT(), role: emptyT(), bio: emptyT(), photo: null, sort_order: 0, is_published: false }),
    primary: (r) => ka(r.name),
    secondary: (r) => ka(r.role),
  },
};
