"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { localizedPath } from "@/lib/seo";
import { LogoImage } from "./logo";

const NAV = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "projects", href: "/projects" },
  { key: "contact", href: "/contact" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const activeIndex = NAV.findIndex((item) => item.href === pathname);
  const index = String(activeIndex >= 0 ? activeIndex + 1 : 1).padStart(2, "0");

  return (
    <header>
      <div className="wrap hd">
        <Link className="logo" href="/" data-testid="logo" aria-label={t("home_logo")}>
          <LogoImage testId="logo-img" priority />
        </Link>
        <span className="m" style={{ color: "var(--grey)" }} aria-hidden="true">
          — {index}
        </span>
        <nav id="mobile-menu" aria-label={t("main")} className={isOpen ? "open" : undefined}>
          {NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={isActive ? "on" : undefined}
                aria-current={isActive ? "page" : undefined}
                data-testid={`nav-${item.key}`}
                onClick={() => setIsOpen(false)}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>
        <div className="lang m" role="group" aria-label={t("language")}>
          {routing.locales.map((l) => (
            // Full navigation on purpose: switches <html lang> and messages cleanly.
            <a
              key={l}
              href={localizedPath(pathname, l)}
              hrefLang={l}
              lang={l}
              className={l === locale ? "on" : undefined}
              aria-current={l === locale ? "true" : undefined}
              data-testid={`lang-${l}`}
            >
              {l.toUpperCase()}
            </a>
          ))}
        </div>
        <Link className="cta-h m" href="/contact" data-testid="cta-header">
          {t("cta")}
        </Link>
        <button
          type="button"
          className="burger"
          aria-label={isOpen ? t("menuClose") : t("menuOpen")}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          data-testid="menu-toggle"
          onClick={() => setIsOpen((v) => !v)}
        >
          <i />
          <i />
        </button>
      </div>
    </header>
  );
}
