import { defineConfig } from '@playwright/test';
import { withRunConfig, getReportDirectory } from '@hari/playwright-core';

const reportDir = getReportDirectory();

// Define static base configuration for API-only testing.
const baseConfig = defineConfig({
  testDir: './tests',
  outputDir: `${reportDir}/test-results`,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [
    ['html', { outputFolder: `${reportDir}/html`, open: 'never' }],
    ['allure-playwright', { resultsDir: `${reportDir}/allure-results` }]
  ],
  use: {
    // API testing doesn't need screenshot, video or trace on pages by default
    trace: 'off',
  },
});

// withRunConfig reads runconfig.json, loads the correct .env, and merges properties.
export default withRunConfig(baseConfig);
