import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { getTestData } from '@hari/playwright-core';
import { CustomWorld } from '../support/setup.js';
import { HomePage } from '../pages/digital/HomePage.js';

Given('I am on the Playwright homepage', async function (this: CustomWorld) {
  const data = getTestData<{ searchQuery: string }>();
  console.log(`Using test data for search: ${data.searchQuery}`);

  const homePage = new HomePage(this.page!);
  await homePage.goto();
});

Then('the title should contain {string}', async function (this: CustomWorld, title: string) {
  await expect(this.page!).toHaveTitle(new RegExp(title));
});
