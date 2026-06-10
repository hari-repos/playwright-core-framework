import { test, expect, getTestData } from '@hari/playwright-core';
import { HomePage } from '../../pages/digital/HomePage.js';

interface TestData {
  searchQuery: string;
}

test('Digital UI: Homepage has title', async ({ page }) => {
  const data = getTestData<TestData>();
  const homePage = new HomePage(page);
  
  await homePage.goto();
  
  // Example usage of test data (printing for demonstration)
  console.log(`Using test data for search: ${data.searchQuery}`);

  await expect(page).toHaveTitle(/Playwright/);
});
