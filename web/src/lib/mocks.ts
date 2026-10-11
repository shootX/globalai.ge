import type { Locale } from "@/i18n/routing";
import type { Page, Project, Service, Settings, TeamMember } from "./api-types";

type L<T> = Record<Locale, T>;

type MockService = { title: string; summary: string; description: string; tags: string[] };

const SERVICES: L<MockService[]> = {
  ka: [
    { title: "ვებ-დეველოპმენტი", summary: "სწრაფი საიტები და ვებ-აპები Next.js-სა და Laravel-ზე.", description: "სწრაფი, SEO-ზე მორგებული საიტები და რთული ვებ-აპლიკაციები — მარკეტინგული გვერდიდან ადმინ-პანელამდე.", tags: ["Next.js / React", "Laravel API", "ადმინ-პანელები", "SEO და სიჩქარე"] },
    { title: "მობილური აპები", summary: "iOS და Android ერთი Flutter კოდით.", description: "iOS და Android აპლიკაციები ერთი Flutter კოდით — ტესტ-ბილდებიდან App Store-სა და Google Play-ში გამოქვეყნებამდე.", tags: ["Flutter", "iOS / Android", "Push შეტყობინებები", "Store-ში გამოქვეყნება"] },
    { title: "AI ინტეგრაცია", summary: "ჩატბოტები, აგენტები და პროცესების ავტომატიზაცია.", description: "ჩატბოტები, AI აგენტები და პროცესების ავტომატიზაცია, რომლებიც თქვენს მონაცემებსა და სისტემებთან მუშაობს.", tags: ["ჩატბოტები", "AI აგენტები", "დოკუმენტების ანალიზი", "ავტომატიზაცია"] },
    { title: "UX/UI დიზაინი", summary: "კვლევაზე დაფუძნებული, სუფთა ინტერფეისები.", description: "კვლევაზე დაფუძნებული ინტერფეისები: wireframe-ებიდან ინტერაქტიულ პროტოტიპამდე და დიზაინ-სისტემამდე.", tags: ["UX კვლევა", "პროტოტიპები", "დიზაინ-სისტემა", "ბრენდინგი"] },
    { title: "Cloud და DevOps", summary: "ინფრასტრუქტურა, CI/CD და მონიტორინგი.", description: "საიმედო ინფრასტრუქტურა, ავტომატური დეპლოი და მონიტორინგი — რომ პროდუქტი 24/7 მუშაობდეს.", tags: ["CI/CD", "Docker", "მონიტორინგი", "უსაფრთხოება"] },
    { title: "პროდუქტის სტრატეგია", summary: "იდეიდან MVP-მდე — სწორი პრიორიტეტებით.", description: "ვეხმარებით იდეის ვალიდაციაში, პრიორიტეტების განსაზღვრასა და MVP-ის სწრაფად გაშვებაში.", tags: ["დისქავერი", "როუდმეპი", "MVP", "ანალიტიკა"] },
  ],
  en: [
    { title: "Web development", summary: "Fast websites and web apps on Next.js and Laravel.", description: "Fast, SEO-ready websites and complex web applications — from a marketing page to an admin panel.", tags: ["Next.js / React", "Laravel API", "Admin panels", "SEO & speed"] },
    { title: "Mobile apps", summary: "iOS and Android from one Flutter codebase.", description: "iOS and Android apps from a single Flutter codebase — from test builds to publishing on the App Store and Google Play.", tags: ["Flutter", "iOS / Android", "Push notifications", "Store publishing"] },
    { title: "AI integration", summary: "Chatbots, agents and process automation.", description: "Chatbots, AI agents and process automation that work with your data and systems.", tags: ["Chatbots", "AI agents", "Document analysis", "Automation"] },
    { title: "UX/UI design", summary: "Research-driven, clean interfaces.", description: "Research-driven interfaces: from wireframes to interactive prototypes and a design system.", tags: ["UX research", "Prototypes", "Design system", "Branding"] },
    { title: "Cloud & DevOps", summary: "Infrastructure, CI/CD and monitoring.", description: "Reliable infrastructure, automated deploys and monitoring — so your product runs 24/7.", tags: ["CI/CD", "Docker", "Monitoring", "Security"] },
    { title: "Product strategy", summary: "From idea to MVP — with the right priorities.", description: "We help validate the idea, set priorities and launch the MVP quickly.", tags: ["Discovery", "Roadmap", "MVP", "Analytics"] },
  ],
  ru: [
    { title: "Веб-разработка", summary: "Быстрые сайты и веб-приложения на Next.js и Laravel.", description: "Быстрые, SEO-оптимизированные сайты и сложные веб-приложения — от лендинга до админ-панели.", tags: ["Next.js / React", "Laravel API", "Админ-панели", "SEO и скорость"] },
    { title: "Мобильные приложения", summary: "iOS и Android на одном коде Flutter.", description: "Приложения для iOS и Android на одном коде Flutter — от тестовых сборок до публикации в App Store и Google Play.", tags: ["Flutter", "iOS / Android", "Push-уведомления", "Публикация в сторах"] },
    { title: "AI-интеграция", summary: "Чат-боты, агенты и автоматизация процессов.", description: "Чат-боты, AI-агенты и автоматизация процессов, работающие с вашими данными и системами.", tags: ["Чат-боты", "AI-агенты", "Анализ документов", "Автоматизация"] },
    { title: "UX/UI-дизайн", summary: "Чистые интерфейсы на основе исследований.", description: "Интерфейсы на основе исследований: от вайрфреймов до интерактивного прототипа и дизайн-системы.", tags: ["UX-исследования", "Прототипы", "Дизайн-система", "Брендинг"] },
    { title: "Cloud и DevOps", summary: "Инфраструктура, CI/CD и мониторинг.", description: "Надёжная инфраструктура, автоматический деплой и мониторинг — чтобы продукт работал 24/7.", tags: ["CI/CD", "Docker", "Мониторинг", "Безопасность"] },
    { title: "Продуктовая стратегия", summary: "От идеи до MVP — с правильными приоритетами.", description: "Помогаем проверить идею, расставить приоритеты и быстро запустить MVP.", tags: ["Discovery", "Роадмап", "MVP", "Аналитика"] },
  ],
};

const SLUGS = ["web-development", "mobile-apps", "ai-integration", "ux-ui-design", "cloud-devops", "product-strategy"];

export type MockServiceRow = MockService & { id: number; slug: string; order: number };

export function mockServiceRows(locale: Locale): MockServiceRow[] {
  return SERVICES[locale].map((s, i) => ({ ...s, id: i + 1, slug: SLUGS[i], order: i + 1 }));
}

export function mockServices(locale: Locale): Service[] {
  return mockServiceRows(locale).map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    sort_order: s.order,
    body: s.description,
    tags: s.tags,
  }));
}

/** Intentionally empty: no real projects yet → UI shows the "მალე." empty state. */
export function mockProjects(): Project[] {
  return [];
}

export function mockPage(): Page | null {
  return null;
}

export function mockTeam(): TeamMember[] {
  return [];
}

const ADDRESS: L<string> = {
  ka: "თბილისი, რუსთაველის გამზ. 1",
  en: "1 Rustaveli Ave, Tbilisi",
  ru: "Тбилиси, пр. Руставели, 1",
};
const HOURS: L<string> = { ka: "ორშ–პარ · 10:00–19:00", en: "Mon–Fri · 10:00–19:00", ru: "Пн–Пт · 10:00–19:00" };

/** Placeholder contact data until the Laravel settings endpoint is live. */
export function mockSettings(locale: Locale): Settings {
  return {
    contact_email: "hello@globalai.ge",
    contact_phone: "+995 555 00 00 00",
    contact_address: ADDRESS[locale],
    working_hours: HOURS[locale],
    socials: { facebook: null, linkedin: null, instagram: null },
    logo: "/brand/globalai-logo.png",
    projects_nav_visible: true,
    team_visible: false,
    stats_visible: false,
  };
}
