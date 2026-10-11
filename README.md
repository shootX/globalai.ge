# globalAI.GE

Corporate website of GlobalAI (globalai.ge): public site, admin panel and Laravel API.

## Structure

| Folder | What |
|---|---|
| `api/` | Laravel 13 / PHP 8.3 REST API (`/api/v1`), PostgreSQL, Sanctum, Pest tests. OpenAPI: `api/openapi.yaml` |
| `web/` | Next.js + TypeScript + Tailwind + shadcn/ui: public site (ka/en/ru) and admin panel |
| `e2e/` | Playwright end-to-end tests |
| `docs/` | PRD, architecture, design, rules, tasks, memory; `docs/design/` holds HTML/PNG mockups |

## Run locally

API:
```bash
cd api
cp .env.example .env        # set DB_*, MAIL_*, APP_URL
composer install
php artisan key:generate
docker compose up -d        # PostgreSQL (optional)
php artisan migrate --seed
php artisan storage:link   # creates api/public/storage (not committed; run on every deploy)
php artisan serve           # http://localhost:8000
php artisan test            # Pest
```

Web:
```bash
cd web
cp .env.production.example .env.local   # NEXT_PUBLIC_API_URL etc.
npm ci
npm run dev                 # http://localhost:3000
npm run build && npm start  # production
```

E2E:
```bash
cd e2e
npm ci && npx playwright install
ADMIN_EMAIL=... ADMIN_PASSWORD=... npx playwright test
```

No secrets are committed: configure everything through environment variables.
