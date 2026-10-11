# Design

Editorial Swiss minimal. Lots of air, a hard accent, Georgian headlines set very heavy.

## Tokens

| Token | Hex | Use |
| --- | --- | --- |
| accent | `#FF3A17` | Links, the one loud action, small marks |
| ink | `#15233B` | Text and headlines |
| bg | `#F2F2F0` | Page background |
| panels | `#E8E8E5` | Cards and inset panels |
| secondary | `#3D4A5C` | Labels and secondary text |
| dividers | `#D4D4D0` | Rules and borders |

## Type

- Headlines: Noto Sans Georgian, weight 900.
- Everything else: Space Grotesk.

## Logo

`web/public/brand/globalai-logo.png`

The original logo, transparent background. Never redraw it as a text wordmark. The settings `logo` value defaults to `/brand/globalai-logo.png`.

## Layout notes for the web team

- One column of type on a warm off-white field. Panels are barely different from the page.
- Dividers are hairlines in `#D4D4D0`, not shadows.
- The accent is rare. Most of the page is ink on bg.
- Georgian headlines need the 900 cut of Noto Sans Georgian. Do not fall back to a latin display face for `ka`.
- Empty projects: a short coming-soon line and a contact link. No fake case studies.
- Team and stats regions are not rendered while their flags are false.
