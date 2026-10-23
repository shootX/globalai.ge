/**
 * Page content block keys — the single source of truth shared by the public pages and the admin page editor.
 *
 * Public pages read GET /api/v1/pages/{key}?locale=.. and use `content[blockKey]` when it is a non-empty
 * string; otherwise the same key from the built-in messages/<locale>.json namespace (`home`, `about`, ...)
 * is used. Block key == message key, so the admin editor lists exactly these keys, grouped by section,
 * with a plain-language label and the current built-in text as the starting value.
 * Non-string message entries (about.values, services.steps, projects.filters) and ICU strings with
 * placeholders (contact.mapLabel) stay message-only.
 */
export type BlockGroup = { title: string; blocks: { key: string; label: string; long?: boolean }[] };

export const PAGE_BLOCK_GROUPS = {
  home: [
    {
      title: "პირველი ეკრანი",
      blocks: [
        { key: "heroLead", label: "სათაური: დასაწყისი" },
        { key: "heroAccent", label: "სათაური: გამოყოფილი (ფერადი) ნაწილი" },
        { key: "heroTail", label: "სათაური: დასასრული" },
        { key: "heroSide", label: "მოკლე აღწერა მარჯვნივ", long: true },
        { key: "ctaPrimary", label: "მთავარი ღილაკი" },
        { key: "ctaSecondary", label: "მეორე ღილაკი" },
        { key: "heroFoot", label: "ტექსტი ლოგოს ქვეშ, მარცხნივ" },
        { key: "heroMore", label: "ბმული ლოგოს ქვეშ, მარჯვნივ" },
      ],
    },
    {
      title: "კომპანია",
      blocks: [
        { key: "aboutLabel", label: "სექციის სახელი" },
        { key: "thesisLead", label: "დიდი ფრაზა: დასაწყისი", long: true },
        { key: "thesisAccent", label: "დიდი ფრაზა: გამოყოფილი ნაწილი" },
        { key: "thesisTail", label: "დიდი ფრაზა: დასასრული" },
        { key: "aboutText", label: "აღწერა", long: true },
        { key: "aboutStrong", label: "გამოკვეთილი წინადადება", long: true },
        { key: "aboutCta", label: "ბმული კომპანიის გვერდზე" },
      ],
    },
    {
      title: "პროექტები",
      blocks: [
        { key: "venturesTitle", label: "სექციის სახელი" },
        { key: "venturesNote", label: "შენიშვნა მარჯვნივ" },
        { key: "statusLive", label: "სტატუსი: მოქმედი" },
        { key: "statusBuilding", label: "სტატუსი: მზადდება" },
        { key: "nextTitle", label: "ბოლო ხაზი: სათაური" },
        { key: "nextMeta", label: "ბოლო ხაზი: პერიოდი" },
        { key: "nextText", label: "ბოლო ხაზი: აღწერა", long: true },
      ],
    },
    {
      title: "მოდელი (ლაიმისფერი სექცია)",
      blocks: [
        { key: "modelLabel", label: "სექციის სახელი" },
        { key: "modelTitle", label: "სათაური" },
        { key: "step1Title", label: "ნაბიჯი 1: სათაური" },
        { key: "step1Text", label: "ნაბიჯი 1: ტექსტი", long: true },
        { key: "step2Title", label: "ნაბიჯი 2: სათაური" },
        { key: "step2Text", label: "ნაბიჯი 2: ტექსტი", long: true },
        { key: "step3Title", label: "ნაბიჯი 3: სათაური" },
        { key: "step3Text", label: "ნაბიჯი 3: ტექსტი", long: true },
        { key: "step4Title", label: "ნაბიჯი 4: სათაური" },
        { key: "step4Text", label: "ნაბიჯი 4: ტექსტი", long: true },
      ],
    },
    {
      title: "ვისთან ვმუშაობთ",
      blocks: [
        { key: "partnersLabel", label: "სექციის სახელი" },
        { key: "partnersTitle", label: "სათაური" },
        { key: "aud1Title", label: "ბარათი 1: სათაური" },
        { key: "aud1Text", label: "ბარათი 1: ტექსტი", long: true },
        { key: "aud1Cta", label: "ბარათი 1: ბმული" },
        { key: "aud2Title", label: "ბარათი 2: სათაური" },
        { key: "aud2Text", label: "ბარათი 2: ტექსტი", long: true },
        { key: "aud2Cta", label: "ბარათი 2: ბმული" },
        { key: "aud3Title", label: "ბარათი 3: სათაური" },
        { key: "aud3Text", label: "ბარათი 3: ტექსტი", long: true },
        { key: "aud3Cta", label: "ბარათი 3: ბმული" },
      ],
    },
    {
      title: "კონტაქტი და ფუტერი",
      blocks: [
        { key: "contactTitle", label: "სათაური" },
        { key: "contactCta", label: "ღილაკი" },
        { key: "contactNote", label: "შენიშვნა ღილაკის ქვეშ" },
        { key: "copy", label: "კოპირების ღილაკი" },
        { key: "copied", label: "კოპირების შემდეგ" },
        { key: "footerTagline", label: "ფუტერის აღწერა (ყველა გვერდზე)", long: true },
      ],
    },
  ],
  about: [
    {
      title: "სათაური",
      blocks: [
        { key: "label", label: "სექციის სახელი" },
        { key: "title", label: "სათაური" },
        { key: "intro", label: "შესავალი", long: true },
      ],
    },
    {
      title: "მისია",
      blocks: [
        { key: "missionLabel", label: "სექციის სახელი" },
        { key: "mission", label: "მისია (დიდი ტექსტი)", long: true },
        { key: "p1", label: "აბზაცი 1", long: true },
        { key: "p2", label: "აბზაცი 2", long: true },
        { key: "ctaServices", label: "ბმული" },
      ],
    },
    {
      title: "პრინციპები, გუნდი, ბოლო ზოლი",
      blocks: [
        { key: "valuesLabel", label: "პრინციპები: სექციის სახელი" },
        { key: "valuesTitle", label: "პრინციპები: სათაური" },
        { key: "teamLabel", label: "გუნდი: სექციის სახელი" },
        { key: "teamTitle", label: "გუნდი: სათაური" },
        { key: "ctaBand", label: "ბოლო ზოლის სათაური" },
        { key: "ctaContact", label: "ბოლო ზოლის ღილაკი" },
      ],
    },
  ],
  services: [
    {
      title: "სათაური",
      blocks: [
        { key: "label", label: "სექციის სახელი" },
        { key: "title", label: "სათაური" },
        { key: "intro", label: "შესავალი", long: true },
      ],
    },
    {
      title: "პროცესი და ბოლო ზოლი",
      blocks: [
        { key: "processLabel", label: "პროცესი: სექციის სახელი" },
        { key: "processTitle", label: "პროცესი: სათაური" },
        { key: "ctaBand", label: "ბოლო ზოლის სათაური" },
        { key: "ctaContact", label: "ბოლო ზოლის ღილაკი" },
      ],
    },
  ],
  projects: [
    {
      title: "სათაური",
      blocks: [
        { key: "label", label: "სექციის სახელი" },
        { key: "title", label: "სათაური" },
        { key: "intro", label: "შესავალი", long: true },
      ],
    },
    {
      title: "სია და ცარიელი მდგომარეობა",
      blocks: [
        { key: "filterLabel", label: "ფილტრის სახელი" },
        { key: "visit", label: "ბმული: საიტზე გადასვლა" },
        { key: "more", label: "ბმული: დეტალურად" },
        { key: "emptyTitle", label: "როცა პროექტი არ არის: სათაური" },
        { key: "emptyText", label: "როცა პროექტი არ არის: ტექსტი", long: true },
        { key: "emptyCta", label: "როცა პროექტი არ არის: ღილაკი" },
        { key: "error", label: "შეცდომის ტექსტი", long: true },
        { key: "ctaBand", label: "ბოლო ზოლის სათაური" },
        { key: "ctaContact", label: "ბოლო ზოლის ღილაკი" },
      ],
    },
  ],
  contact: [
    {
      title: "სათაური",
      blocks: [
        { key: "label", label: "სექციის სახელი" },
        { key: "title", label: "სათაური" },
        { key: "intro", label: "შესავალი", long: true },
        { key: "formTitle", label: "ფორმის სათაური" },
      ],
    },
    {
      title: "საკონტაქტო ბლოკის სახელები",
      blocks: [
        { key: "email", label: "ელ-ფოსტა" },
        { key: "phone", label: "ტელეფონი" },
        { key: "address", label: "მისამართი" },
        { key: "hours", label: "სამუშაო საათები" },
        { key: "social", label: "სოციალური" },
        { key: "office", label: "ოფისი" },
      ],
    },
  ],
} as const satisfies Record<string, readonly BlockGroup[]>;

export type PageBlockKey = keyof typeof PAGE_BLOCK_GROUPS;

/** Flat key list per page (kept for callers that only need the keys). */
export const PAGE_BLOCKS: Record<PageBlockKey, readonly string[]> = {
  home: keysOf("home"),
  about: keysOf("about"),
  services: keysOf("services"),
  projects: keysOf("projects"),
  contact: keysOf("contact"),
};

function keysOf(page: PageBlockKey): string[] {
  return (PAGE_BLOCK_GROUPS[page] as readonly BlockGroup[]).flatMap((g) => g.blocks.map((b) => b.key));
}
