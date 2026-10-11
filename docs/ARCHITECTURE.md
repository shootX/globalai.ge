# Architecture

```
docs/     decisions and agent rules
api/      Laravel 13, PHP 8.3, PostgreSQL, Sanctum, Pest
web/      Next.js App Router, next-intl, Tailwind, shadcn/ui (placeholder)
e2e/      Playwright (placeholder)
```

The browser talks to Next.js. Next.js reads the public API. Admins talk to the API with a bearer token. Saving content queues a signed call so Next.js can drop its cache.

## Locales

`?locale=` is `ka` (default), `en`, or `ru`. Anything else is 422.

Public JSON is one language, not a `{ka,en,ru}` object. Missing strings fall back to `ka`. Lists contain published rows only, ordered by `sort_order` then `id`. An empty list is `200` with `{ "data": [], "meta": { "total": 0 } }`.

Detail routes look the slug up in the requested language only. The body includes:

```json
"alternates": { "ka": "...", "en": "...", "ru": "..." }
```

A missing slug for a language is `null`. Page paths are not translated. Pages are loaded by `key`: `home`, `about`, `services`, `projects`, `contact`.

Translatable columns are PostgreSQL `jsonb` via spatie/laravel-translatable. Georgian is required on the fields that identify a record (service and project title/slug, team name/role, page content). Other copy can be empty and will fall back.

## Public API

`GET /api/v1/services`

`GET /api/v1/services/{slug}`

`GET /api/v1/projects`

`GET /api/v1/projects/{slug}`

`GET /api/v1/team`

`GET /api/v1/pages/{key}`

`GET /api/v1/settings`

`POST /api/v1/contact`

Successful GETs send `Cache-Control: public, max-age=60, stale-while-revalidate=300`.

`team` returns an empty list while `team_visible` is false, even if members are published. `settings.stats` is `[]` while `stats_visible` is false. `projects_nav_visible` is returned as a boolean and does not hide the projects endpoint. The projects page itself renders the empty state when `data` is empty.

`settings` is a whitelist: contact email, phone, address, socials, logo, stats, and the three flags. Address and stat labels are resolved to the requested locale. Unknown keys are never returned.

## Contact

Required: `name`, `email`, `message`, `locale`. Optional: `phone`, `subject`.

`company_website` is a honeypot. A filled value gets the same `201 { "data": { "accepted": true } }` as a real message, and nothing is stored or emailed.

Limit: 5 requests per minute per IP (`429` after that).

A real message is stored with locale, IP, and user agent, then a queued mailable goes to `contact_email` or, if that is empty, `MAIL_ADMIN_ADDRESS`.

## Admin API

`POST /api/v1/admin/login` returns a Sanctum personal access token. `POST /api/v1/admin/logout` revokes the current token.

Everything else under `/api/v1/admin` uses `auth:sanctum`. No token is `401`.

Writes send the full `{ka,en,ru}` object. Validation is per locale. Slugs are unique inside each locale.

Resources: services, projects, pages (bound by `key`), team, settings, submissions (list and status), image upload.

Policies gate every admin action. Models list `$fillable` fields. Controllers persist validated input only. Responses never include passwords, the revalidation secret, or one-time codes.

CORS allows only `CORS_ALLOWED_ORIGINS`.

## Revalidation

Creating, updating, or deleting a service, project, page, or team member, and updating settings, dispatches `RevalidateNextJob` after commit.

The job POSTs to `NEXT_REVALIDATE_URL`:

```json
{ "tag": "services", "timestamp": 1710000000 }
```

Header `X-GlobalAI-Signature` is `hash_hmac('sha256', rawBody, NEXT_REVALIDATE_SECRET)`.

Tags: `services`, `projects`, `pages`, `team`, `settings`. If the URL or secret is empty, the job returns without calling out. Changing a submission status does not revalidate.

## Data

- `users` — admins only. Created with `php artisan admin:create`.
- `services` — translatable slug, title, summary, body, SEO; `sort_order`; `is_published`.
- `projects` — the same, plus translatable category, `cover_image`, `gallery`.
- `pages` — `key`, translatable content blocks and SEO. The five keys are inserted by the migration with empty blocks.
- `team_members` — translatable name, role, bio; photo; `sort_order`; `is_published`.
- `contact_submissions` — name, email, optional phone and subject, message, locale, ip, user_agent, status.
- `settings` — key/value jsonb. Defaults: visibility flags false, empty stats, logo path `/brand/globalai-logo.png`.

## Runtime

`api/docker-compose.yml` runs PostgreSQL 16 and can run the API. Tests and CI use a real Postgres database (`globalai_test` in CI), not SQLite. `APP_DEBUG` is false in `.env.example` and in `.env.production.example`.
