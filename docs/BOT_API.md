# Bot API

Bearer tokens let an external bot manage content, SEO, uploads, and deletes. Base URL: `https://api.globalai.ge` (local: `http://localhost:8000`). Every admin path is under `/api/v1/admin`. Send `Authorization: Bearer <token>` and `Accept: application/json`.

Create the first bot on the server:

```bash
php artisan bot:create "Site bot" --expires=90
```

The command prints the Sanctum token once. It is stored only as a SHA-256 hash, expires in the given number of days (default 90, max 365), and can be revoked. A missing, expired, or revoked token returns `401` on every admin route.

Admin routes are limited to 120 requests per minute per token (`429` after that). Login stays on its own limit of 10 per minute per IP and email.

## Locale

Public reads take `?locale=ka|en|ru`. Default is `ka`. A missing translation falls back to Georgian. Admin writes send the full `{ "ka", "en", "ru" }` object. Empty strings are dropped so fallback can work. Georgian is required on identity fields (service and project title/slug, team name/role, page content).

## Tokens

`POST /api/v1/admin/tokens` (admin role)

```json
{ "name": "ci-bot", "expires_in_days": 90 }
```

`201`

```json
{ "data": { "id": 4, "name": "ci-bot", "token": "4|shown-once", "abilities": ["*"], "expires_at": "2027-01-09T12:00:00Z" } }
```

`GET /api/v1/admin/tokens` returns `{ "data": [ { "id", "name", "abilities", "last_used_at", "expires_at", "created_at" } ], "meta": { "total" } }`. The secret is never included.

`DELETE /api/v1/admin/tokens/{id}` → `204`. A non-admin receives `403`.

## Audit log

Every admin write appends a row: `created`, `updated`, `deleted`, `uploaded`, `settings_changed`, `login`, `token_created`, `token_revoked`. Passwords, token secrets, and secret-like values are omitted.

`GET /api/v1/admin/audit-logs?user_id=&model_type=&from=&to=&page=`

```json
{
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "user": { "id": 2, "name": "Site bot" },
      "action": "updated",
      "model_type": "App\\Models\\Page",
      "model": "Page",
      "model_id": 1,
      "old_values": { "noindex": false },
      "new_values": { "noindex": true },
      "ip": "203.0.113.4",
      "created_at": "2026-10-11T12:00:00Z"
    }
  ],
  "meta": { "current_page": 1, "last_page": 1, "per_page": 20, "total": 1 }
}
```

`model_type` accepts a short name (`service`, `page`, `project`, `team`, `setting`, `submission`, `token`, `upload`) or the class name. `POST`, `PUT`, `PATCH`, and `DELETE` on this path return `405`. There is no update or delete API.

## SEO

Five pages: `home`, `about`, `services`, `projects`, `contact`. Services and projects use the same fields on their own write payloads.

`GET /api/v1/admin/seo/pages/home`

`PUT /api/v1/admin/seo/pages/home`

```json
{
  "seo_title": { "ka": "მთავარი", "en": "Home", "ru": null },
  "seo_description": { "ka": "აღწერა", "en": null, "ru": null },
  "og_image": "uploads/og.png",
  "noindex": false
}
```

`seo_title` max 255, `seo_description` max 320. `og_image` is `uploads/…` or `/brand/…`. Public `GET /api/v1/pages/home?locale=en` returns one language. If English is empty, the Georgian value is returned, plus `og_image` and `noindex`.

The same `seo_title`, `seo_description`, `og_image`, and `noindex` fields are accepted on `POST`/`PUT` for services and projects.

## Content

Writes return the admin shape (`{ka,en,ru}`). Lists use `{ "data": [], "meta": { "total": 0 } }`.

`POST /api/v1/admin/login`

```json
{ "email": "admin@globalai.ge", "password": "…" }
```

`200` `{ "data": { "token": "…", "token_type": "Bearer", "user": { "id", "name", "email" } } }`. Bad credentials: `422`.

`POST /api/v1/admin/logout` → `{ "data": { "ok": true } }` and revokes the current token.

Services: `GET/POST /api/v1/admin/services`, `GET/PUT/DELETE /api/v1/admin/services/{id}`.

```json
{
  "title": { "ka": "ვები", "en": "Web", "ru": null },
  "slug": { "ka": "vebi", "en": "web", "ru": null },
  "summary": { "ka": "მოკლე", "en": null, "ru": null },
  "body": { "ka": null, "en": null, "ru": null },
  "seo_title": { "ka": null, "en": null, "ru": null },
  "seo_description": { "ka": null, "en": null, "ru": null },
  "og_image": null,
  "noindex": false,
  "sort_order": 1,
  "is_published": true
}
```

`POST` → `201`. `DELETE` → `204`.

Projects: `GET/POST /api/v1/admin/projects`, `GET/PUT/DELETE /api/v1/admin/projects/{id}`. Same fields as a service, plus:

```json
{
  "category": { "ka": "ვები", "en": "web", "ru": null },
  "cover_image": "uploads/cover.jpg",
  "gallery": ["uploads/one.jpg"]
}
```

Pages: `GET/POST /api/v1/admin/pages`, `GET/PUT/DELETE /api/v1/admin/pages/{key}` where `key` is `home|about|services|projects|contact`.

```json
{
  "content": { "ka": { "intro": "გამარჯობა" }, "en": {}, "ru": {} },
  "seo_title": { "ka": "ჩვენ შესახებ", "en": null, "ru": null },
  "seo_description": { "ka": null, "en": null, "ru": null },
  "og_image": null,
  "noindex": false
}
```

Team: `GET/POST /api/v1/admin/team`, `GET/PUT/DELETE /api/v1/admin/team/{id}`.

```json
{
  "name": { "ka": "ანა", "en": "Ana", "ru": null },
  "role": { "ka": "დიზაინერი", "en": "Designer", "ru": null },
  "bio": { "ka": null, "en": null, "ru": null },
  "photo": "uploads/ana.jpg",
  "sort_order": 1,
  "is_published": true
}
```

Settings: `GET /api/v1/admin/settings`, `PUT /api/v1/admin/settings`.

```json
{
  "contact_email": "hello@globalai.ge",
  "contact_phone": "+995 555 00 00 00",
  "contact_address": { "ka": "თბილისი", "en": "Tbilisi", "ru": null },
  "socials": { "instagram": null, "facebook": null, "linkedin": null, "behance": null },
  "logo": "/brand/globalai-logo.png",
  "stats": [{ "value": "12", "label": { "ka": "პროექტი", "en": null, "ru": null } }],
  "projects_nav_visible": true,
  "team_visible": false,
  "stats_visible": false
}
```

Submissions: `GET /api/v1/admin/submissions`, `GET /api/v1/admin/submissions/{id}`, `PATCH /api/v1/admin/submissions/{id}` with `{ "status": "new"|"read"|"archived" }`, `DELETE /api/v1/admin/submissions/{id}`.

## Uploads

`POST /api/v1/admin/uploads` as `multipart/form-data` field `file`. jpg, png, webp, or gif, max 5 MB.

`201` `{ "data": { "path": "uploads/abc.png", "url": "https://api.globalai.ge/storage/uploads/abc.png" } }`.

Save `path` on the record (`cover_image`, `gallery`, `photo`, `og_image`). `url` is only for preview.

`DELETE /api/v1/admin/uploads?path=uploads/abc.png` → `204`. Paths outside `uploads/` are `422`.

## Revalidation

Creating, updating, or deleting a service, project, page, or team member, updating settings, and updating page SEO queues `RevalidateNextJob` after the database commit. The job `POST`s to `NEXT_REVALIDATE_URL` (the Next.js route `POST /api/revalidate`):

```json
{ "tag": "pages", "timestamp": 1710000000 }
```

Headers: `X-GlobalAI-Signature` is `hash_hmac('sha256', rawBody, secret)` and `X-GlobalAI-Timestamp` (unix seconds, equal to `timestamp` in the body). The raw secret is never sent. Next.js accepts only a valid signature with a timestamp within ±5 minutes. The job retries 3 times (backoff 10s, 60s, 300s). The secret is `REVALIDATE_SECRET`, or `NEXT_REVALIDATE_SECRET` when the first is empty. Tags: `services`, `projects`, `pages`, `team`, `settings`. If the URL or secret is empty, the job does nothing. Submission changes do not revalidate. `noindex` pages stay out of the sitemap and are disallowed in `robots.txt`.

## Errors

`401` missing, expired, or revoked token. `403` token management without the admin role. `404` unknown id or page key. `405` audit-log writes. `422` validation (`errors` is a map of fields to messages; messages follow `Accept-Language`, and the admin UI always sends `ka`). `429` rate limit.
