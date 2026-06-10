import { test, expect, getTestData } from '@hari/playwright-core';
import * as allure from 'allure-playwright';
import { HomePage } from '../../pages/digital/HomePage.js';

interface TestData {
  searchQuery: string;
}

test('Digital UI: Homepage has title', async ({ page }) => {
  allure.epic('Web Interface');
  allure.story('Homepage Navigation');
  allure.severity('critical');

  const data = getTestData<TestData>();
  const homePage = new HomePage(page);
  
  await test.step('Navigate to Homepage', async () => {
    await homePage.goto();
  });
  
  await test.step('Verify title and test data', async () => {
    console.log(`Using test data for search: ${data.searchQuery}`);
    await expect(page).toHaveTitle(/Playwright/);
  });
});
