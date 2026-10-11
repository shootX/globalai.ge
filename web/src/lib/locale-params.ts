import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n/routing";

export type LocaleParams = { params: Promise<{ locale: string }> };

export async function resolveLocale(params: LocaleParams["params"]): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return locale;
}
