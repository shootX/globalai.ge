import { test as base, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const test = base.extend<{ axe: (page: Page) => AxeBuilder }>({
  axe: async ({}, use) => {
    await use((page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']));
  },
});
export { expect };

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 768;
