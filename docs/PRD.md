# Product

globalAI.GE is the site of a digital agency in Georgia. This repository is the starting monorepo. The API and these docs are in place. `web/` and `e2e/` are placeholders for the other teams.

## Pages

Five pages, same path in every language:

| Page | Georgian | English | Russian |
| --- | --- | --- | --- |
| Home | `/` | `/en` | `/ru` |
| About | `/about` | `/en/about` | `/ru/about` |
| Services | `/services` | `/en/services` | `/ru/services` |
| Projects | `/projects` | `/en/projects` | `/ru/projects` |
| Contact | `/contact` | `/en/contact` | `/ru/contact` |

Georgian has no prefix. English and Russian are prefixed. A single service or project is the only URL that changes by language (`/services/{slug}`, `/projects/{slug}` and the `/en` and `/ru` versions). The API returns `alternates` so the frontend can link the other languages.

## Languages

`ka` is primary and required. `en` and `ru` are optional. If a translation is missing, the API returns the Georgian value.

## What visitors can do

- Read the five pages.
- Browse published services and open one.
- Open Projects. Until real projects exist, the page is a coming-soon state that points to contact. The menu item appears only when an admin turns `projects_nav_visible` on.
- Send the contact form. Phone and subject are optional.
- See the team and the stats only after an admin turns `team_visible` and `stats_visible` on and real data exists. Those blocks stay hidden rather than shipping placeholder people or numbers.

## What an admin can do

- Sign in and out.
- Create, edit, publish, reorder, and delete services, projects, and team members.
- Edit the five pages, including content blocks and SEO per language.
- Edit contact details, socials, the logo path, stats, and the three visibility flags.
- Upload images (cover, gallery, team photo).
- Read contact submissions and mark them `new`, `read`, or `archived`.

## Not in this slice

Accounts for visitors, payments, a blog, and the Next.js UI. No placeholder copy, team, stats, or projects are seeded as if they were real.
