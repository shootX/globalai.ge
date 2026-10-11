/**
 * Page content block keys — the single source of truth shared by the public pages and the admin page editor.
 *
 * Public pages read GET /api/v1/pages/{key}?locale=.. and use `content[blockKey]` when it is a non-empty
 * string; otherwise the same key from the built-in messages/<locale>.json namespace (`home`, `about`, ...)
 * is used. Block key == message key, so the admin editor pre-lists exactly these keys.
 * Non-string message entries (about.values, services.steps, projects.filters) and ICU strings with
 * placeholders (contact.mapLabel) stay message-only.
 */
export const PAGE_BLOCKS = {
  home: ["orbLabel", "showreel", "showreelSub", "redcard1", "redcard2", "ctaPrimary", "col1t", "col1", "col2t", "col2", "col3t", "col3", "h1a", "h1b", "ctaSecondary", "scroll", "down", "servicesTitle", "servicesLabel", "projectsTitle", "projectsLabel", "soon1", "soon2", "soon3", "soonCta", "aboutLabel", "aboutTitle1", "aboutTitle2", "aboutText", "aboutCta", "contactLabel", "contactTitle1", "contactTitle2"],
  about: ["label", "title", "intro", "missionLabel", "mission", "p1", "p2", "ctaServices", "valuesTitle", "valuesLabel", "teamTitle", "teamLabel", "ctaBand", "ctaContact"],
  services: ["label", "title", "intro", "processTitle", "processLabel", "ctaBand", "ctaContact"],
  projects: ["label", "title", "intro", "filterLabel", "emptyTitle", "emptyText", "emptyCta", "error", "ctaBand", "ctaContact"],
  contact: ["label", "title", "intro", "email", "phone", "address", "hours", "social", "office"],
} as const;

export type PageBlockKey = keyof typeof PAGE_BLOCKS;
