import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/setup';
import { HomePage } from '../pages/digital/HomePage';

Given('I am on the Playwright homepage', async function (this: CustomWorld) {
  const homePage = new HomePage(this.page!);
  await homePage.goto();
});

Then('the title should contain {string}', async function (this: CustomWorld, title: string) {
  await expect(this.page!).toHaveTitle(new RegExp(title));
});
