"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { localizedPath } from "@/lib/seo";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { key: "home", href: "/" },
  { key: "projects", href: "/projects" },
  { key: "services", href: "/services" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="site-header">
      <div className="wrap bar">
        <Link className="home" href="/" data-testid="logo" aria-label={t("home_logo")}>
          <Logo priority />
        </Link>
        <nav id="site-nav" aria-label={t("main")} className={isOpen ? "main open" : "main"}>
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              data-testid={`nav-${item.key}`}
              onClick={() => setIsOpen(false)}
            >
              {t(item.key)}
            </Link>
          ))}
          <div className="lang sheet-only" role="group" aria-label={t("language")}>
            {routing.locales.map((l) => (
              <a key={l} href={localizedPath(pathname, l)} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined}>
                {l.toUpperCase()}
              </a>
            ))}
          </div>
        </nav>
        <div className="tools">
          <div className="lang" role="group" aria-label={t("language")}>
            {routing.locales.map((l) => (
              // Full navigation on purpose: switches <html lang> and messages cleanly.
              <a key={l} href={localizedPath(pathname, l)} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined} data-testid={`lang-${l}`}>
                {l.toUpperCase()}
              </a>
            ))}
          </div>
          <ThemeToggle />
          <Link className="btn cta-h" href="/contact" data-testid="cta-header">
            {t("cta")}
          </Link>
          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-label={isOpen ? t("menuClose") : t("menuOpen")}
            aria-expanded={isOpen}
            aria-controls="site-nav"
            data-testid="menu-toggle"
            onClick={() => setIsOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {isOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
