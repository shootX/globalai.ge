# Memory

## 2026-10-10

- Company site for globalAI.GE, a digital agency in Georgia. Five pages: home, about, services, projects, contact.
- `ka` is primary and has no URL prefix. `en` and `ru` use `/en` and `/ru`. Paths match across languages. Only a service or a project has a per-locale slug.
- Stack locked: Laravel API + PostgreSQL in `api/`; Next.js App Router + next-intl + Tailwind + shadcn/ui in `web/`; Playwright in `e2e/`. This pass owns the API and the docs. `web/` and `e2e/` are placeholders.
- Design is editorial Swiss-minimal. Accent `#FF3A17`, ink `#15233B`, background `#F2F2F0`, panels `#E8E8E5`, secondary `#3D4A5C`, dividers `#D4D4D0`. Noto Sans Georgian 900 for headlines, Space Grotesk for the rest.
- Logo path is `web/public/brand/globalai-logo.png` (original, transparent). Do not invent a wordmark. The file is not in the repo yet; the web team places it.
- No placeholder content goes live. Migrations insert empty page blocks and visibility flags set to false. They do not insert fake team, stats, or projects. The public team list is empty until `team_visible`. Stats are omitted until `stats_visible`. `projects_nav_visible` only controls the menu.
- Translatable fields are jsonb `{ka,en,ru}`. Public responses are a single locale with ka fallback. Detail payloads include `alternates`.
- Admin auth is Sanctum personal access tokens. There is no seeded password. `php artisan admin:create` prompts for one.
- Revalidation is a queued HMAC POST. Header `X-GlobalAI-Signature`. Tags: services, projects, pages, team, settings. Submission updates do not send it.
- Honeypot field name is `company_website`. A hit returns 201 and stores nothing.
- Contact rate limit is 5 per minute per IP.
- `APP_DEBUG` defaults to false. `.env.example` has empty secrets. The docker-compose Postgres password `globalai` is a local database default only.
- Pest (21 tests) passes against PostgreSQL. Migrations create the five empty pages and the visibility flags set to false.

## 2026-10-11

- Canonical public repo: https://github.com/shootX/globalai.ge (PUBLIC). Layout: `api/`, `web/`, `e2e/`, `docs/`. Never commit `.env`, credentials or `LOCAL_ACCESS.md`.
