import { test, expect } from '@playwright/test';
import { PAGES, path } from '../support/routes';

// შოთას ორიგინალი ლოგო უნდა იყოს, არა ტექსტური wordmark.
const LOGO_SRC = /globalai-logo(-clean)?\.(png|svg|webp)/;

for (const page of PAGES) {
  test(`${page}: header და footer ლოგო = ორიგინალი სურათი @mockup`, async ({ page: p }) => {
    await p.goto(path(page));
    const logos = p.locator('[data-testid="logo"], [data-testid="footer-logo"]');
    await expect(logos.first()).toBeVisible();
    const imgs = p.locator('[data-testid="logo"] img, img[data-testid="logo"], [data-testid="footer-logo"] img, img[data-testid="footer-logo"]');
    expect(await imgs.count(), 'logo უნდა იყოს <img>, არა ტექსტი').toBeGreaterThanOrEqual(1);
    for (const img of await imgs.all()) {
      const src = (await img.getAttribute('src')) ?? '';
      const srcset = (await img.getAttribute('srcset')) ?? '';
      expect(src + ' ' + decodeURIComponent(src + srcset)).toMatch(LOGO_SRC);
      await expect(img).toHaveAttribute('alt', /globalAI/i);
      const ok = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
      expect(ok, 'ლოგოს ფაილი უნდა ჩაიტვირთოს').toBe(true);
    }
  });
}
