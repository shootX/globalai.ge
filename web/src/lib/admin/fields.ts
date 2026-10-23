import { z } from "zod";
import { ADMIN_LOCALES, type AdminLocale } from "./types";

export type Field =
  | { kind: "i18n"; name: string; label: string; multiline?: boolean; required?: boolean; slug?: boolean }
  | { kind: "text"; name: string; label: string; required?: boolean; type?: "text" | "email" | "url" | "tel" }
  | { kind: "number"; name: string; label: string }
  | { kind: "switch"; name: string; label: string }
  | { kind: "image"; name: string; label: string }
  | { kind: "gallery"; name: string; label: string }
  | { kind: "select"; name: string; label: string; options: { value: string; label: string }[] };

export const KA_REQUIRED = "ქართული (KA) სავალდებულოა.";
const SLUG_RE = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;
const SLUG_MSG = "slug: მხოლოდ ასოები, ციფრები და „-“.";

const optionalLocale = (slug?: boolean) =>
  z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine((v) => !slug || !v || SLUG_RE.test(v), SLUG_MSG);

/** Translations {ka,en,ru}; ka required when `required`. */
export function i18nSchema(required = false, slug = false) {
  const ka = required
    ? z
        .string({ error: KA_REQUIRED })
        .trim()
        .min(1, KA_REQUIRED)
        .refine((v) => !slug || SLUG_RE.test(v), SLUG_MSG)
    : optionalLocale(slug);
  return z.object({ ka, en: optionalLocale(slug), ru: optionalLocale(slug) });
}

export function buildSchema(fields: Field[]) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) {
    switch (f.kind) {
      case "i18n":
        shape[f.name] = i18nSchema(f.required, f.slug);
        break;
      case "text": {
        let s = z.string().trim();
        if (f.type === "email") s = s.refine((v) => !v || z.email().safeParse(v).success, "ელ-ფოსტის ფორმატი არასწორია.") as never;
        if (f.type === "url") s = s.refine((v) => !v || /^https?:\/\/\S+$/i.test(v), "ბმული უნდა იწყებოდეს http:// ან https://") as never;
        shape[f.name] = f.required ? s.min(1, "სავალდებულო ველი.") : s.nullable().optional();
        break;
      }
      case "number":
        shape[f.name] = z.number({ error: "შეიყვანეთ რიცხვი." }).int().min(0);
        break;
      case "switch":
        shape[f.name] = z.boolean();
        break;
      case "image":
        shape[f.name] = z.string().nullable().optional();
        break;
      case "gallery":
        shape[f.name] = z.array(z.string());
        break;
      case "select":
        shape[f.name] = z.enum(f.options.map((o) => o.value) as [string, ...string[]]);
        break;
    }
  }
  return z.object(shape);
}

/** Which locales currently hold a validation error (to flag the KA/EN/RU tabs). */
export function localesWithErrors(errors: Record<string, unknown>): AdminLocale[] {
  const out = new Set<AdminLocale>();
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if ((ADMIN_LOCALES as readonly string[]).includes(k) && v && typeof v === "object" && "message" in v) out.add(k as AdminLocale);
      else if (k !== "ref") walk(v);
    }
  };
  walk(errors);
  return ADMIN_LOCALES.filter((l) => out.has(l));
}
