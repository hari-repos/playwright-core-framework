import { test, expect } from '@hari/playwright-core';
import { HomePage } from '../../pages/digital/HomePage';

test('Digital UI: Homepage has title', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await expect(page).toHaveTitle(/Playwright/);
});
