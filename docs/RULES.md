# Rules

## Agents

Every bot and agent reads `docs/` before working and adds a dated entry to `docs/TASKS.md` and `docs/MEMORY.md` after every task.

## Product

- Do not ship placeholder team members, stats, or projects as if they were real.
- Team and stats stay behind `team_visible` and `stats_visible`.
- Projects stay out of the menu until `projects_nav_visible` is true. The page itself is a coming-soon / contact state while the list is empty.
- The logo file is `web/public/brand/globalai-logo.png`. It is the original mark on a transparent background. Do not replace it with a text wordmark.
- Georgian is required. English and Russian fall back to Georgian.
- Page paths do not change by language. Only service and project slugs do.

## API

- Public lists: published only, `sort_order`, `{data, meta.total}`. Empty is 200, not 404.
- Detail responses include `alternates` for `ka`, `en`, and `ru`.
- Admin routes without a bearer token return 401.
- Validate each locale. Do not mass-assign the request body.
- Do not return secrets, passwords, or one-time codes.
- `APP_DEBUG=false` in production. `.env.example` contains no secrets.
- CORS is the configured origin list, not `*`.
- Contact: validate, honeypot `company_website`, 5/minute/IP, queue the admin email.
- Content saves queue the HMAC revalidation job. Do not call Next.js inline in the request.

## Code

- PHP 8.3, Laravel, Pest, PostgreSQL. The web app is Next.js when that team starts.
- Keep controllers thin. Put locale and translation rules in `App\Support`.
- Add a Pest test for behavior you change.
