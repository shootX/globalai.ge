"use client";

import type { AdminLocale, Translations } from "@/lib/admin/types";
import { adminOps } from "@/lib/admin/ops-copy";

const t = adminOps("ka");

export function SeoPreview({ title, description }: { title: string; description: string }) {
  const titleOver = title.length > 60;
  const descriptionOver = description.length > 160;
  return (
    <div data-testid="admin-seo-preview" className="grid gap-3 border border-border bg-white p-4">
      <p className="micro text-[#3D4A5C]">{t.preview}</p>
      <p className="text-lg text-primary">{title || "—"}</p>
      <p className="text-sm text-[#3D4A5C]">{description || "—"}</p>
      <p data-testid="seo-title-count" data-over={titleOver ? "true" : "false"} className={titleOver ? "text-sm font-semibold text-destructive" : "text-sm text-[#3D4A5C]"}>
        {t.titleCount} {title.length}/60
      </p>
      <p data-testid="seo-description-count" data-over={descriptionOver ? "true" : "false"} className={descriptionOver ? "text-sm font-semibold text-destructive" : "text-sm text-[#3D4A5C]"}>
        {t.descriptionCount} {description.length}/160
      </p>
    </div>
  );
}

export function seoText(value: Translations | undefined, locale: AdminLocale): string {
  return value?.[locale] ?? "";
}
