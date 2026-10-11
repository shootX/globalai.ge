import { test, expect } from '../support/fixtures';
import { path, API, IS_MOCKUP } from '../support/routes';

test.describe('პროექტები', () => {
  test('ცარიელი სია (meta.total=0) → "მალე" და CTA, ბადე და ფილტრები დამალულია', async ({ page }) => {
    test.skip(!IS_MOCKUP, 'მხოლოდ მაკეტზე: გვერდი პროექტებს SSR-ით იღებს, page.route ლაივზე არ მუშაობს');
    await page.route(API.projects, (r) =>
      r.fulfill({ json: { data: [], meta: { total: 0 } } }),
    );
    await page.goto(path('projects'));
    await expect(page.getByTestId('projects-empty')).toBeVisible();
    await expect(page.getByTestId('projects-empty-cta')).toHaveAttribute('href', new RegExp(path('contact')));
    await expect(page.getByTestId('project-0')).toHaveCount(0);
    await expect(page.getByTestId('filter-all')).toHaveCount(0);
  });

  test('სერვერის შეცდომა (500) გვერდს არ ანგრევს', async ({ page }) => {
    await page.route(API.projects, (r) => r.fulfill({ status: 500, json: { message: 'error' } }));
    const res = await page.goto(path('projects'));
    expect(res?.status()).toBeLessThan(500);
    await expect(page.getByTestId('logo')).toBeVisible();
  });

  test('ფილტრები და empty-state მარკაპი არსებობს @mockup', async ({ page }) => {
    test.skip(!IS_MOCKUP, 'მხოლოდ მაკეტზე: ლაივზე 0 პროექტისას ფილტრები/ბარათები დამალულია');
    await page.goto(path('projects'));
    for (const f of ['all', 'web', 'mobile', 'ai']) await expect(page.getByTestId(`filter-${f}`)).toBeVisible();
    await expect(page.getByTestId('filter-all')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('projects-empty-cta')).toBeVisible();
    for (let i = 0; i < 6; i++) await expect(page.getByTestId(`project-${i}`)).toBeVisible();
  });

  test('ფილტრები ღილაკებია (role=button, aria-pressed ყველაზე) @mockup', async ({ page }) => {
    test.skip(!IS_MOCKUP, 'მხოლოდ მაკეტზე: ლაივზე 0 პროექტისას ფილტრები/ბარათები დამალულია');
    await page.goto(path('projects'));
    for (const f of ['all', 'web', 'mobile', 'ai']) {
      await expect(page.getByTestId(`filter-${f}`)).toHaveAttribute('aria-pressed', /true|false/);
    }
  });
});
