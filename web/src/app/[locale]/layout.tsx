import { Suspense } from "react";
import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getSettings } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { notoGeorgian, spaceGrotesk } from "@/lib/fonts";
import "../globals.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F2F2F0" };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LayoutProps = { children: React.ReactNode; params: Promise<{ locale: string }> };

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params;
  if (!hasLocale(routing.locales, raw)) notFound();
  // Guard: <html lang> must never be empty/undefined.
  const locale = raw || routing.defaultLocale;
  setRequestLocale(locale);
  const [messages, settings] = await Promise.all([getMessages({ locale }), getSettings(locale)]);

  return (
    <html lang={locale} className={`${notoGeorgian.variable} ${spaceGrotesk.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* Suspense: usePathname is runtime-only on the catch-all 404 route. */}
          <Suspense fallback={null}>
            <SiteHeader />
          </Suspense>
          <main>{children}</main>
          <SiteFooter locale={locale} settings={settings} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
