import { Suspense } from "react";
import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getSettings } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { archivo, notoGeorgian } from "@/lib/fonts";
import { THEME_SCRIPT } from "@/lib/theme";
import { SITE_URL, localizedPath } from "@/lib/seo";
import "../globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

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
  const sameAs = Object.values(settings.socials ?? {}).filter((url): url is string => Boolean(url));

  return (
    // suppressHydrationWarning: THEME_SCRIPT may set data-theme on <html> before React hydrates.
    <html lang={locale} className={`${notoGeorgian.variable} ${archivo.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${SITE_URL}/#org`,
                name: "GlobalAI",
                url: SITE_URL,
                logo: `${SITE_URL}/brand/globalai-logo.png`,
                ...(settings.contact_email ? { email: settings.contact_email } : {}),
                ...(settings.contact_phone ? { telephone: settings.contact_phone } : {}),
                ...(settings.contact_address ? { address: settings.contact_address } : {}),
                ...(sameAs.length ? { sameAs } : {}),
              },
              {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#site`,
                name: "GlobalAI",
                url: `${SITE_URL}${localizedPath("/", locale)}`,
                inLanguage: locale,
                publisher: { "@id": `${SITE_URL}/#org` },
              },
            ],
          }}
        />
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
