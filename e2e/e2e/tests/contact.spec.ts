import { test, expect } from '../support/fixtures';
import { path, API } from '../support/routes';

test.describe('კონტაქტის ფორმა', () => {
  test.beforeEach(async ({ page }) => { await page.goto(path('contact')); });

  test('ველებს აქვს label for-ით, სწორი type და required @mockup', async ({ page }) => {
    for (const f of ['name', 'email', 'subject', 'message']) {
      const el = page.getByTestId(`contact-${f}`);
      const id = await el.getAttribute('id');
      expect(id).toBeTruthy();
      await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
      await expect(el).toHaveAccessibleName(/.+/);
    }
    await expect(page.getByTestId('contact-email')).toHaveAttribute('type', 'email');
    for (const f of ['name', 'email', 'message']) await expect(page.getByTestId(`contact-${f}`)).toHaveAttribute('required', '');
    await expect(page.getByTestId('contact-subject')).not.toHaveAttribute('required', '');
    await expect(page.getByTestId('contact-submit')).toHaveAttribute('type', 'submit');
  });

  test('ცარიელი ფორმა არ იგზავნება (native validation) @mockup', async ({ page }) => {
    let sent = false;
    await page.route(API.contact, (r) => { sent = true; return r.fulfill({ json: {} }); });
    await page.getByTestId('contact-submit').click();
    expect(await page.getByTestId('contact-name').evaluate((e: HTMLInputElement) => e.validity.valueMissing)).toBe(true);
    await expect(page.getByTestId('contact-form')).toBeVisible();
    expect(sent).toBe(false);
  });

  test('არასწორი ელ-ფოსტა ინვალიდია @mockup', async ({ page }) => {
    await page.getByTestId('contact-email').fill('not-an-email');
    expect(await page.getByTestId('contact-email').evaluate((e: HTMLInputElement) => e.validity.typeMismatch)).toBe(true);
  });

  test('წარმატებული გაგზავნა (mock API) → წარმატების შეტყობინება', async ({ page }) => {
    let body: any;
    await page.route(API.contact, async (r) => {
      body = r.request().postDataJSON();
      await r.fulfill({ status: 201, json: { data: { id: 1 } } });
    });
    await page.getByTestId('contact-name').fill('ტესტი');
    await page.getByTestId('contact-email').fill('qa@example.com');
    await page.getByTestId('contact-message').fill('გამარჯობა, ეს QA ტესტია.');
    await page.getByTestId('contact-submit').click();
    await expect(page.getByRole('status').or(page.getByTestId('contact-success'))).toBeVisible();
    expect(body).toMatchObject({ name: 'ტესტი', email: 'qa@example.com' });
  });

  test('სერვერის 422 → შეცდომა ჩანს', async ({ page }) => {
    await page.route(API.contact, (r) =>
      r.fulfill({ status: 422, json: { message: 'invalid', errors: { email: ['invalid'] } } }),
    );
    await page.getByTestId('contact-name').fill('ტესტი');
    await page.getByTestId('contact-email').fill('qa@example.com');
    await page.getByTestId('contact-message').fill('ტესტი');
    await page.getByTestId('contact-submit').click();
    await expect(page.getByTestId('contact-error')).toBeVisible();
  });
});
