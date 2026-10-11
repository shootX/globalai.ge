import { test, expect } from '../support/fixtures';
import { IS_MOCKUP, LOCALES, PAGES, path, type Locale } from '../support/routes';

const OG: Record<Locale, string> = { ka: 'ka_GE', en: 'en_US', ru: 'ru_RU' };

test.describe('SEO მეტა', () => {
  for (const locale of LOCALES) {
    for (const pageKey of PAGES) {
      test(`${pageKey} [${locale}]: title, description, og, canonical, hreflang, JSON-LD`, async ({ page }) => {
        test.skip(IS_MOCKUP, 'მხოლოდ აპში');
        await page.goto(path(pageKey, locale));
        await expect(page).toHaveTitle(/.+/);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
        for (const property of ['og:title', 'og:description', 'og:image', 'og:locale']) {
          await expect(page.locator(`meta[property="${property}"]`)).toHaveCount(1);
        }
        await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', OG[locale]);
        const canonical = path(pageKey, locale);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));
        for (const hreflang of [...LOCALES, 'x-default']) {
          await expect(page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`)).toHaveCount(1);
        }
        const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('');
        expect(ld).toContain('"@type"');
        if (pageKey === 'home') expect(ld).toContain('Organization');
        if (pageKey === 'services') expect(ld).toContain('Service');
        if (pageKey === 'projects') expect(ld).toContain('CreativeWork');
      });
    }
  }

  test('სერვისის დეტალი: Service JSON-LD', async ({ page }) => {
    test.skip(IS_MOCKUP, 'მხოლოდ აპში');
    const res = await page.goto('/services/web-development');
    test.skip(res?.status() === 404, 'slug არ არის');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('');
    expect(ld).toContain('Service');
  });
});

async function login(page: import('@playwright/test').Page) {
  await page.goto('/admin/login');
  await page.getByTestId('admin-login-email').fill(process.env.ADMIN_EMAIL || 'admin@globalai.ge');
  await page.getByTestId('admin-login-password').fill(process.env.ADMIN_PASSWORD || 'password');
  await page.getByTestId('admin-login-submit').click();
  try {
    await page.waitForURL((url) => !url.pathname.startsWith('/admin/login'), { timeout: 8_000 });
  } catch {
    test.skip(true, 'ადმინში შესვლა ვერ მოხერხდა');
  }
}

test.describe('ადმინი: ტოკენები, ჟურნალი, SEO', () => {
  test.describe.configure({ mode: 'serial' });

  test('ტოკენი ერთხელ ჩანს, კოპირდება და უქმდება', async ({ page }, info) => {
    test.skip(IS_MOCKUP || info.project.name !== 'chromium', 'ერთხელ, აპში');
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page);
    await page.goto('/admin/tokens');
    await expect(page.getByTestId('admin-tokens-page')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow).toBe(false);
    await page.getByTestId('admin-token-name').fill('e2e-bot');
    await page.getByTestId('admin-token-create').click();
    const secret = page.getByTestId('admin-token-secret');
    await expect(secret).toBeVisible();
    await expect(page.getByTestId('admin-token-warning')).toContainText(/.+/);
    const value = (await secret.innerText()).trim();
    expect(value).toMatch(/\d+\|/);
    await page.getByTestId('admin-token-copy').click();
    await page.getByTestId('admin-token-revoke-' + value.split('|')[0]).click();
    await expect(page.getByTestId('admin-revoke-dialog')).toBeVisible();
    await page.getByTestId('admin-revoke-confirm').click();
    await expect(page.getByTestId('admin-token-row-' + value.split('|')[0])).toHaveCount(0);
  });

  test('ჟურნალი: ცხრილი, ფილტრი, diff, ცარიელი მდგომარეობა', async ({ page }, info) => {
    test.skip(IS_MOCKUP || info.project.name !== 'chromium', 'ერთხელ, აპში');
    await login(page);
    await page.goto('/admin/tokens');
    await page.getByTestId('admin-token-name').fill('audit-row');
    await page.getByTestId('admin-token-create').click();
    await expect(page.getByTestId('admin-token-secret')).toBeVisible();
    await page.goto('/admin/audit');
    await expect(page.getByTestId('admin-audit-table')).toBeVisible();
    await page.locator('[data-testid^="admin-audit-row-"]').first().click();
    await expect(page.getByTestId('admin-audit-diff')).toBeVisible();
    await expect(page.getByTestId('admin-diff-added').first()).toBeVisible();
    await page.getByTestId('admin-audit-type').fill('does-not-exist');
    await expect(page.getByTestId('admin-audit-empty')).toBeVisible();
  });

  test('SEO ჩანართი: მრიცხველი და noindex არ ხვდება sitemap-ში', async ({ page, request }, info) => {
    test.skip(IS_MOCKUP || info.project.name !== 'chromium', 'ერთხელ, აპში');
    test.skip(Boolean(process.env.ADMIN_PASSWORD) && !process.env.E2E_ALLOW_SEO_WRITE, 'სამუშაო საიტის SEO არ იცვლება');
    await login(page);
    await page.goto('/admin/pages/about');
    await page.getByTestId('admin-section-seo').click();
    await expect(page.getByTestId('admin-seo-tab')).toBeVisible();
    const title = page.getByTestId('admin-field-seo_title-ka');
    await title.fill('ა'.repeat(61));
    await expect(page.getByTestId('seo-title-count')).toHaveAttribute('data-over', 'true');
    await page.getByTestId('admin-field-seo_description-ka').fill('ბ'.repeat(161));
    await expect(page.getByTestId('seo-description-count')).toHaveAttribute('data-over', 'true');
    await expect(page.getByTestId('admin-seo-preview')).toBeVisible();
    await page.getByTestId('admin-field-noindex').click();
    await page.getByTestId('admin-save').click();
    await expect(page.getByTestId('admin-saved')).toBeVisible();
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();
    const xml = await sitemap.text();
    expect(xml).not.toMatch(/\/about</);
    await page.getByTestId('admin-field-noindex').click();
    await page.getByTestId('admin-save').click();
    await expect(page.getByTestId('admin-saved')).toBeVisible();
  });
});
