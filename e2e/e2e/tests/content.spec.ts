import { test, expect } from '../support/fixtures';
import { PAGES, LOCALES, path } from '../support/routes';

test.describe('კონტენტი: placeholder-ები და ცარიელი ბმულები', () => {
  for (const locale of LOCALES) {
    for (const p of PAGES) {
      test(`${p} [${locale}]: lorem არ არის, mailto:null/ცარიელი mailto არ არის`, async ({ page }) => {
        await page.goto(path(p, locale));
        const html = await page.content();
        expect(html, 'lorem ტექსტი').not.toMatch(/lorem/i);
        const bad = await page.$$eval('a[href^="mailto:" i]', (as) =>
          as.map((a) => a.getAttribute('href') ?? '').filter((h) => /^mailto:\s*(null|undefined)?\s*(\?.*)?$/i.test(h)),
        );
        expect(bad).toEqual([]);
      });
    }
  }
});
