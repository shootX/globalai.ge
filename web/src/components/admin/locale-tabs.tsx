"use client";

import { ADMIN_LOCALES, type AdminLocale } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const NAMES: Record<AdminLocale, string> = { ka: "ქართული", en: "English", ru: "Русский" };

type LocaleTabsProps = { value: AdminLocale; onChange: (l: AdminLocale) => void; errored: AdminLocale[] };

/** KA/EN/RU content tabs shared by every translatable form. */
export function LocaleTabs({ value, onChange, errored }: LocaleTabsProps) {
  return (
    <div role="tablist" aria-label="კონტენტის ენა" className="inline-flex border border-primary">
      {ADMIN_LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          id={`tab-${l}`}
          aria-selected={value === l}
          aria-controls="locale-panel"
          data-testid={`admin-tab-${l}`}
          onClick={() => onChange(l)}
          className={cn(
            "micro flex items-center gap-2 px-4 py-2.5",
            value === l ? "bg-primary text-primary-foreground" : "bg-transparent text-primary hover:bg-muted",
          )}
        >
          {l.toUpperCase()}
          <span className="sr-only">{NAMES[l]}</span>
          {l === "ka" ? <span aria-hidden="true">*</span> : null}
          {errored.includes(l) ? (
            <span className="inline-block size-2 rounded-full bg-brand" aria-label="შეცდომა" role="img" />
          ) : null}
        </button>
      ))}
    </div>
  );
}
