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

## 2026-10-11 — Bot operator

- `docs/PRD.md`, `ARCHITECTURE.md`, `RULES.md`, and `DESIGN.md` were read before this change. Revalidation stays queued (RULES: do not call Next.js inline). The webhook is still `POST /api/revalidate` with HMAC `X-GlobalAI-Signature`, and now also `Authorization: Bearer` plus `X-Revalidate-Secret` from `REVALIDATE_SECRET` (falls back to `NEXT_REVALIDATE_SECRET`).
- Bot accounts are normal users with `is_bot=true` and `role=admin`. `bot:create` prints the plaintext token once. Sanctum stores the hash. `expires_at` is required; a null or past expiry is 401. Login tokens also expire in 90 days.
- Audit rows are append-only. Secret keys (`password`, `token`, `secret`) and `id|plaintext` values are removed before insert. Token list responses do not include the secret.
- Page SEO is per record, not per locale, for `og_image` and `noindex`. Title and description stay `{ka,en,ru}` and fall back to `ka`. `noindex` removes every locale URL of that page from the sitemap and adds those paths to `robots.txt` disallow.
- Admin chrome stays Georgian. New strings also exist in `messages/en.json` and `messages/ru.json` under `adminOps`. Accent buttons use `#C8290B` with white text. Secondary copy uses `#3D4A5C`.
- Pest uses `globalai_test` only (`phpunit.xml`). Do not point tests at the live `globalai` database.


## 2026-10-23 — Monument redesign

- Theme lives on `<html data-theme>`; no attribute follows the OS. `THEME_SCRIPT` must stay in `web/src/lib/theme.ts` (not the client component), because a server layout importing a string from a `"use client"` file gets a client reference, not the string.
- Page text: block key == message key. `web/src/lib/page-blocks.ts` `PAGE_BLOCK_GROUPS` is the list the admin editor shows. Add a new editable string there and in all three `messages/*.json`.
- The admin editor saves every prefilled block, because the API requires a non-empty `content.ka`. After the first save the CMS text wins over later changes to `messages/*.json`.
- `api/composer.lock` currently needs PHP 8.4 (symfony 8.1). A PHP 8.3 machine cannot `composer install` it as is.

## 2026-10-24 — No project hover image

- The cover that followed the cursor was only in `web/src/components/venture-list.tsx` (`.peek` in `globals.css`). Home and `/projects` both render that list. It is gone. Do not add it back; `docs/DESIGN.md` no longer describes it. The detail page cover (`img.cover`) stays.
- `.venture-list > :last-child { border-bottom }` only styled the peek node (it was the last child and `position: fixed`), so that rule was removed with it. Row separators are still each row's `border-top`.
- Projects page copy comes from `messages/*.json` until a CMS block with the same key is non-empty. The live `pages/projects` content is `{blocks: ...}`, so it does not override `intro`. Georgian intro is now `პლატფორმები, რომლებიც უკვე მუშაობენ, და ის, რაც მზადდება.`
- Russian list chips use `projects.filters.live/building` (`Работают` / `Готовятся`), which is plural because those strings are also the filter buttons. Home chips use the singular `statusLive` / `statusBuilding`. Left as-is.
- `GET /projects/{slug}?locale=ru` is 404 for autolime and geoapi (`alternates.ru` is null) even though the Russian list returns those slugs, so `/ru/projects/autolime` does not open the project. That is content/API slug data, not a UI string.
