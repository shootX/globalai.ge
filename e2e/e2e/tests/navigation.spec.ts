import { test, expect, isMobile } from '../support/fixtures';
import { PAGES, path, IS_MOCKUP } from '../support/routes';

test.describe('ნავიგაცია', () => {
  for (const p of PAGES) {
    test(`${p}: გვერდი იტვირთება, ლოგო და აქტიური პუნქტი ჩანს @mockup`, async ({ page }) => {
      const res = await page.goto(path(p));
      expect(res?.status()).toBeLessThan(400);
      await expect(page.getByTestId('logo')).toBeVisible();
      await expect(page.locator('h1')).toHaveCount(1);
      if (!isMobile(page)) {
        await expect(page.getByTestId(`nav-${p}`)).toHaveAttribute('aria-current', 'page');
      }
    });
  }

  test('desktop: header-ის ბმულები ყველა გვერდზე გადადის @mockup', async ({ page }) => {
    test.skip(isMobile(page), 'desktop only');
    await page.goto(path('home'));
    for (const p of PAGES) {
      await page.getByTestId(`nav-${p}`).click();
      await expect(page).toHaveURL(new RegExp(path(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
    }
  });

  test('mobile: menu-toggle ხსნის მენიუს და ნავიგაცია მუშაობს', async ({ page }) => {
    test.skip(!isMobile(page), 'mobile only');
    test.skip(IS_MOCKUP, 'მაკეტში JS არ არის');
    await page.goto(path('home'));
    const toggle = page.getByTestId('menu-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.getByTestId('nav-services').click();
    await expect(page).toHaveURL(new RegExp(path('services') + '$'));
  });

  test('mobile: menu-toggle ჩანს და აქვს ხელმისაწვდომი სახელი @mockup', async ({ page }) => {
    test.skip(!isMobile(page), 'mobile only');
    await page.goto(path('home'));
    await expect(page.getByTestId('menu-toggle')).toBeVisible();
    await expect(page.getByTestId('menu-toggle')).toHaveAccessibleName(/.+/);
  });

  test('mobile: menu-toggle აქვს aria-expanded/aria-controls @mockup', async ({ page }) => {
    test.skip(!isMobile(page), 'mobile only');
    await page.goto(path('home'));
    await expect(page.getByTestId('menu-toggle')).toHaveAttribute('aria-expanded', /true|false/);
    await expect(page.getByTestId('menu-toggle')).toHaveAttribute('aria-controls', /.+/);
  });
});
