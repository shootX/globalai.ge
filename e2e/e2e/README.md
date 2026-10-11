# globalAI.GE — E2E ტესტები (Playwright)

- გაშვება: `npm ci && npx playwright install && npm run e2e` (`BASE_URL`, ნაგულისხმევი `http://localhost:3000`).
- მისამართები მხოლოდ `support/routes.ts`-შია — slug-ის შეცვლისას აქ შეცვალეთ.
- სელექტორები: role/label, შემდეგ `data-testid` (UX მაკეტებიდან).
- API mock-ები `page.route`-ით: `/api/v1/projects`, `/api/v1/contact`.
- მაკეტებზე smoke: `npx http-server /workspace/gai-web-mockups -p 4173` და `npm run e2e:mockup` (მხოლოდ `@mockup` ტესტები).
- CI: `ci.yml.example` — retries 2, trace on-first-retry, რეპორტი artifact-ად.
