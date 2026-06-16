import { defineConfig } from '@playwright/test';
import { withRunConfig, getReportDirectory } from '@hari/playwright-core';
import dotenv from 'dotenv';

const reportDir = getReportDirectory();

// Define static base configuration. Dynamic settings like timeouts, 
// browser selection, and environment loading are handled by runconfig.json
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
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Projects are automatically injected from runconfig.json's "browsers" array
});

// withRunConfig reads runconfig.json, loads the correct .env, and merges properties.
// Cloud execution is natively managed by hari-test-runner and the bstack-node-sdk.
export default withRunConfig(baseConfig);
