/**
 * მისამართები დაფიქსირებულია (PM, 2026-10-10): /, /about, /services, /projects, /contact; ka პრეფიქსის გარეშე.
 * KA = default, პრეფიქსის გარეშე; EN/RU = /en, /ru.
 * MOCKUP=1 → სტატიკური HTML მაკეტები (/workspace/gai-web-mockups).
 */
export const LOCALES = ['ka', 'en', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ka';

export const PAGES = ['home', 'about', 'services', 'projects', 'contact'] as const;
export type PageKey = (typeof PAGES)[number];

export const IS_MOCKUP = process.env.MOCKUP === '1';

const APP_SLUGS: Record<PageKey, string> = {
  home: '/',
  about: '/about',
  services: '/services',
  projects: '/projects',
  contact: '/contact',
};

const MOCKUP_FILES: Record<PageKey, string> = {
  home: '/homepage-editorial.html',
  about: '/about.html',
  services: '/services.html',
  projects: '/projects.html',
  contact: '/contact.html',
};

export function path(page: PageKey, locale: Locale = DEFAULT_LOCALE): string {
  if (IS_MOCKUP) return MOCKUP_FILES[page];
  const slug = APP_SLUGS[page];
  if (locale === DEFAULT_LOCALE) return slug;
  return slug === '/' ? `/${locale}` : `/${locale}${slug}`;
}

export const ADMIN_PATHS = ['/admin', '/admin/projects', '/admin/messages', '/admin/settings', '/admin/tokens', '/admin/audit', '/admin/pages/home', '/admin/services/new'];
export const ADMIN_LOGIN = '/admin/login';

export const API = {
  projects: '**/api/v1/projects*',
  contact: '**/api/v1/contact*',
  adminMe: '**/api/v1/admin/**',
};
