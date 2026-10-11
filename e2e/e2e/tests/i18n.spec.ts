import { test, expect } from '../support/fixtures';
import { PAGES, LOCALES, path, IS_MOCKUP } from '../support/routes';

// Firefox: after the full-reload lang switch Playwright's locator can hang on "navigation to finish" (double framenavigated); read lang via evaluate and retry.
const htmlLang = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.lang).catch(() => '');

test.describe('ენები', () => {
  test('ნაგულისხმევი ენა KA: html lang=ka, lang-ka აქტიურია @mockup', async ({ page }) => {
    await page.goto(path('home'));
    await expect(page.locator('html')).toHaveAttribute('lang', 'ka');
    await expect(page.getByTestId('lang-ka')).toHaveAttribute('aria-current', 'true');
  });

  for (const p of PAGES) {
    for (const l of ['en', 'ru'] as const) {
      test(`${p}: ${l}-ზე გადართვა იმავე გვერდზე რჩება და სვამს html lang`, async ({ page }) => {
        await page.goto(path(p));
        const urlRe = (loc: typeof l | 'ka') => new RegExp(path(p, loc).replace(/\//g, '\\/') + '/?$');
        await page.getByTestId(`lang-${l}`).click();
        await page.waitForURL(urlRe(l), { timeout: 15_000 });
        await expect.poll(() => htmlLang(page), { timeout: 15_000 }).toBe(l);
        await page.getByTestId('lang-ka').click();
        await page.waitForURL(urlRe('ka'), { timeout: 15_000 });
        await expect.poll(() => htmlLang(page), { timeout: 15_000 }).toBe('ka');
      });
    }
  }

  test('lang ბმულებს აქვს რეალური href (არა "#") @mockup', async ({ page }) => {
    await page.goto(path('home'));
    for (const l of LOCALES) {
      await expect(page.getByTestId(`lang-${l}`)).not.toHaveAttribute('href', '#');
    }
  });

  for (const p of PAGES) {
    test(`${p}: hreflang ka/en/ru/x-default არსებობს @mockup`, async ({ page }) => {
      await page.goto(path(p));
      for (const h of [...LOCALES, 'x-default']) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${h}"]`)).toHaveCount(1);
      }
    });
  }
});

test.describe('404 გვერდის ენა', () => {
  for (const [url, lang] of [['/qa-not-found-xyz', 'ka'], ['/en/qa-not-found-xyz', 'en'], ['/ru/qa-not-found-xyz', 'ru']] as const) {
    test(`${url} → 404, html lang=${lang}`, async ({ page }) => {
      test.skip(IS_MOCKUP, 'მაკეტში 404 არ არის');
      const res = await page.goto(url);
      expect(res?.status()).toBe(404);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
    });
  }
});
