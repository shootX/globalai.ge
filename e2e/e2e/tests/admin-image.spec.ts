import { test, expect, request as pwRequest } from '@playwright/test';
import { IS_MOCKUP } from '../support/routes';

// Real-API only. Needs API_ORIGIN, ADMIN_EMAIL, ADMIN_PASSWORD (never hard-code the password).
const API = process.env.API_ORIGIN ?? '';
const EMAIL = process.env.ADMIN_EMAIL ?? '';
const PASS = process.env.ADMIN_PASSWORD ?? '';

function png(r: number, g: number, b: number): Buffer {
  // 1x1 PNG built by hand.
  const zlib = require('zlib') as typeof import('zlib');
  const crc = (buf: Buffer) => { let c = ~0; for (const x of buf) { c ^= x; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; };
  const chunk = (t: string, d: Buffer) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(1, 0); ihdr.writeUInt32BE(1, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(Buffer.from([0, r, g, b]))), chunk('IEND', Buffer.alloc(0))]);
}

test.describe('ადმინი: სურათის შეცვლა (ნამდვილი API)', () => {
  test.skip(IS_MOCKUP || !API || !PASS, 'მხოლოდ ნამდვილ API-ზე (API_ORIGIN/ADMIN_PASSWORD)');
  test.describe.configure({ mode: 'serial' });

  test('cover A → B: შენახვის შემდეგ A იშლება, B რჩება @realapi', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'ერთხელ საკმარისია (საერთო მონაცემები)');
    const api = await pwRequest.newContext({ baseURL: API, extraHTTPHeaders: { Accept: 'application/json' } });
    const login = await api.post('/api/v1/admin/login', { data: { email: EMAIL, password: PASS } });
    const token = (await login.json()).data.token as string;
    const H = { Authorization: `Bearer ${token}` };
    const up = async (buf: Buffer) => (await (await api.post('/api/v1/admin/uploads', { headers: H, multipart: { file: { name: 'QA.png', mimeType: 'image/png', buffer: buf } } })).json()).data.path as string;
    const A = await up(png(255, 0, 0));
    const created = await api.post('/api/v1/admin/projects', { headers: H, data: { title: { ka: 'QA-ui-img' }, slug: { ka: `qa-ui-img-${Date.now()}` }, cover_image: A, is_published: false } });
    const id = (await created.json()).data.id as number;
    let B = '';
    try {
      await page.goto('/admin/login');
      await page.getByTestId('admin-login-email').fill(EMAIL);
      await page.getByTestId('admin-login-password').fill(PASS);
      await page.getByTestId('admin-login-submit').click();
      await page.waitForURL((u) => !u.pathname.startsWith('/admin/login'));
      await page.goto(`/admin/projects/${id}`);
      page.on('dialog', (d) => d.accept());
      const field = page.locator('div.grid').filter({ has: page.getByTestId('admin-field-cover_image') }).last();
      await field.getByTestId('admin-image-remove').filter({ visible: true }).click();
      const resp = page.waitForResponse((r) => r.url().includes('/api/v1/admin/uploads') && r.request().method() === 'POST');
      await page.getByTestId('admin-field-cover_image').setInputFiles({ name: 'QA-B.png', mimeType: 'image/png', buffer: png(0, 255, 0) });
      B = (await (await resp).json()).data.path;
      await page.getByTestId('admin-save').filter({ visible: true }).click();
      await expect(page.getByTestId('admin-saved').filter({ visible: true })).toBeVisible();
      const rec = (await (await api.get(`/api/v1/admin/projects/${id}`, { headers: H })).json()).data;
      expect(rec.cover_image).toBe(B);
      await expect.poll(async () => (await api.get(`/storage/${A}`)).status()).not.toBe(200);
      expect((await api.get(`/storage/${B}`)).status()).toBe(200);
    } finally {
      await api.delete(`/api/v1/admin/projects/${id}`, { headers: H });
      for (const p of [A, B]) if (p) await api.delete('/api/v1/admin/uploads', { headers: H, params: { path: p } });
      await api.post('/api/v1/admin/logout', { headers: H });
      await api.dispose();
    }
  });
});
