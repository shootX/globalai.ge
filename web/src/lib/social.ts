import type { Settings } from "./api-types";

const LABELS: Record<string, string> = { facebook: "Facebook", linkedin: "LinkedIn", instagram: "Instagram", behance: "Behance" };

export type SocialLink = { key: string; label: string; url: string | null };

export function socialLinks(settings: Settings): SocialLink[] {
  return Object.entries(settings.socials ?? {}).map(([key, url]) => ({ key, label: LABELS[key] ?? key, url: url || null }));
}

export const telHref = (phone: string) => `tel:${phone.replace(/\s+/g, "")}`;
