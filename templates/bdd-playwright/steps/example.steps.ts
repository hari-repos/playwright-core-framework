import { expect } from '@hari/playwright-core';
import { Given, Then } from '../bdd.config';
import { HomePage } from '../pages/digital/HomePage';

Given('I am on the Playwright homepage', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
});

Then('the title should contain {string}', async ({ page }, title) => {
  await expect(page).toHaveTitle(new RegExp(title));
});
