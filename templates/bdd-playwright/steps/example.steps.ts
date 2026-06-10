import { expect, getTestData } from '@hari/playwright-core';
import { Given, Then } from '../bdd.config.js';
import { HomePage } from '../pages/digital/HomePage.js';

Given('I am on the Playwright homepage', async ({ page }) => {
  const data = getTestData<{ searchQuery: string }>();
  console.log(`Using test data for search: ${data.searchQuery}`);

  const homePage = new HomePage(page);
  await homePage.goto();
});

Then('the title should contain {string}', async ({ page }, title) => {
  await expect(page).toHaveTitle(new RegExp(title));
});
