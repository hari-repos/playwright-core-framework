import { createBdd } from 'playwright-bdd';
import { test, expect } from '@hari/playwright-core';
import { HomePage } from '../pages/digital/HomePage';

const { Given, Then } = createBdd(test);

Given('I am on the Playwright homepage', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
});

Then('the title should contain {string}', async ({ page }, title) => {
  await expect(page).toHaveTitle(new RegExp(title));
});
