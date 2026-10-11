import { test, expect } from '../support/fixtures';
import { ADMIN_PATHS, ADMIN_LOGIN } from '../support/routes';

test.describe('ადმინი ავტორიზაციის გარეშე', () => {
  for (const p of ADMIN_PATHS) {
    test(`${p} → login-ზე გადამისამართება ან 401/403`, async ({ page }) => {
      const res = await page.goto(p);
      const status = res?.status() ?? 0;
      if ([401, 403].includes(status)) return;
      await expect(page).toHaveURL(new RegExp(ADMIN_LOGIN));
    });
  }

  test('admin API ქუქის გარეშე აბრუნებს 401-ს', async ({ request }) => {
    const api = process.env.API_URL ?? process.env.BASE_URL ?? 'http://localhost:3000';
    const res = await request.get(`${api}/api/v1/admin/projects`, { headers: { Accept: 'application/json' } });
    expect(res.status()).toBe(401);
  });
});
