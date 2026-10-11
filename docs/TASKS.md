# Tasks

Agents append a dated entry after every task. Read `docs/` first.

## 2026-10-10 — API foundation

- Wrote the product, architecture, design, and agent rules in `docs/`.
- Scaffolded `api/` on Laravel 13 and PHP 8.3 with PostgreSQL, Sanctum, Pest, and spatie/laravel-translatable.
- Added services, projects, pages, team members, contact submissions, settings, and admin users.
- Public reads resolve one locale with Georgian fallback, published rows only, empty lists as `{data:[], meta:{total:0}}`, and slug `alternates` on detail routes.
- Contact form validates, rate-limits at 5/minute/IP, drops the honeypot, and queues mail.
- Admin CRUD, submission status, and image upload sit behind Sanctum. Content saves queue an HMAC revalidation job.
- Added `api/openapi.yaml`, docker-compose for Postgres, `.env.example` without secrets, and a GitHub Actions Pest workflow.
- Left `web/` and `e2e/` as placeholder folders for the other teams.
- Migrations run on PostgreSQL. Pest covers locale fallback, empty lists, alternates, contact validation, the rate limit, the honeypot, admin 401, CRUD, and the revalidation job.

## Later, other teams

- `web/`: Next.js App Router, next-intl, Tailwind, shadcn/ui, the five routes, the logo file.
- `e2e/`: Playwright against those pages.

## 2026-10-11 — Monorepo published to GitHub

- Assembled `api/` (with 2026-10-11 backend fixes, 98 Pest tests), `web/`, `e2e/` and `docs/` (+ `docs/design/` mockups) into one commit on `shootX/globalai.ge` `main`.
- Excluded env files (only examples kept), vendor/, node_modules/, build output, test reports, local access notes and patches. Secret scan run before push.

## 2026-10-11 — Bot admin API

- Bot users (`users.is_bot`, role `admin`) and `php artisan bot:create {name} {--expires=90}` print a hashed Sanctum token once. Tokens expire (default 90 days) and can be revoked. `GET/POST /api/v1/admin/tokens` and `DELETE /api/v1/admin/tokens/{id}` never list the secret. Expired or revoked tokens are 401. Admin API is 120/minute per token.
- Append-only `audit_logs` for content writes, uploads, settings, login, and token create/revoke. Passwords and token secrets are stripped. `GET /api/v1/admin/audit-logs` is paginated; writes return 405.
- SEO `seo_title`, `seo_description`, `og_image`, `noindex` on the five pages and on services/projects. `GET/PUT /api/v1/admin/seo/pages/{key}`. Public JSON is one locale with Georgian fallback. Next metadata, canonical, hreflang, Open Graph, Twitter, JSON-LD, sitemap, and robots follow it.
- Revalidation stays a queued HMAC POST to `POST /api/revalidate`, and also sends `REVALIDATE_SECRET`.
- Admin UI: token page, change log, SEO tab. `docs/BOT_API.md` and `openapi.yaml` describe the bot.

