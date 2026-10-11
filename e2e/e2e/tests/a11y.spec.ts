import { test, expect } from '../support/fixtures';
import { PAGES, path } from '../support/routes';

test.describe('ხელმისაწვდომობა', () => {
  for (const p of PAGES) {
    test(`${p}: axe — სერიოზული/კრიტიკული დარღვევები არ არის @mockup`, async ({ page, axe }) => {
      await page.goto(path(p));
      const { violations } = await axe(page).analyze();
      const bad = violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
      expect(bad.map((v) => `${v.id}: ${v.nodes.length} → ${v.nodes.slice(0,3).map(n=>n.target.join(' ')).join(' | ')}`)).toEqual([]);
    });

    test(`${p}: viewport ზუმს არ კრძალავს @mockup`, async ({ page }) => {
      await page.goto(path(p));
      const content = (await page.locator('meta[name="viewport"]').getAttribute('content')) ?? '';
      expect(content).toContain('width=device-width');
      expect(content).not.toMatch(/user-scalable\s*=\s*(no|0)/i);
      expect(content).not.toMatch(/maximum-scale\s*=\s*1(\.0)?\b/i);
    });
  }
});
