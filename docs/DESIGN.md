# Design

"Monument". The logo spans the full width of the home hero; everything else is small and pushed to the corners. Big type for project names, lots of black, one lime accent. Two themes share one structure.

## Tokens

Defined as CSS variables in `web/src/app/globals.css`.

| Token | Dark (default) | Light | Use |
| --- | --- | --- | --- |
| `--ground` | `#0b0b0c` | `#f3f2ee` | Page background |
| `--raise` | `#151517` | `#e8e7e1` | Cards and inset panels |
| `--ink` | `#f2f1ec` | `#0d0d0e` | Text and headlines |
| `--mute` | `#8f8e88` | `#5f5e58` | Labels and secondary text |
| `--line` | `#26262a` | `#d6d5ce` | Hairline dividers |
| `--lime` | `#d4f57a` | `#d4f57a` | Field colour: model section, CTA band, chips |
| `--accent` | `#d4f57a` | `#4a7300` | Lime-coloured text; deeper olive on light so it stays readable |

## Theme

- No `data-theme` on `<html>` = follow the OS. `data-theme="light|dark"` = the visitor's choice.
- `ThemeToggle` stores the choice in `localStorage["gai-theme"]`; `THEME_SCRIPT` (`web/src/lib/theme.ts`) applies it in `<head>` before first paint.

## Type

- Text and Georgian headlines: Noto Sans Georgian (variable weight and width).
- Latin display (project names, numbers, language switch): Archivo (variable width).
- Admin panel keeps Space Grotesk for labels.

## Logo

- `web/public/brand/globalai-logo-dark.svg` (for dark ground) and `globalai-logo-light.svg` (for light ground): the original mark traced to vector with the new colours. `components/logo.tsx` renders both and CSS shows the one that matches the theme.
- `globalai-logo-mask.svg`: one-colour version used as a CSS mask for the footer watermark.
- `globalai-logo.png`: the original raster file, still used for Organization JSON-LD and the settings `logo` default.
- Never redraw the logo as a text wordmark.

## Share image

`web/public/brand/og-default.png`, 1200×630. Used when a page has no `og_image` of its own.

## Layout notes

- Home: hero sentence + monument logo, thesis, ventures list (big names, status chip, cover image follows the pointer on desktop), lime "model" section, three audience cards, contact CTA with copy-email.
- Inner pages: large page title, then content, then the lime CTA band.
- Empty projects: a short coming-soon line and a contact link. No fake case studies.
- Team and stats regions are not rendered while their flags are false.
