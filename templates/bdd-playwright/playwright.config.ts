import { defineConfig } from '@playwright/test';
import { testDir } from './bdd.config.js';
import { withRunConfig, withBrowserStack } from '@hari/playwright-core';

// Define static base configuration. Dynamic settings like timeouts, 
// browser selection, and environment loading are handled by runconfig.json
const baseConfig = defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [
    ['html'],
    ['allure-playwright']
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Projects are automatically injected from runconfig.json's "browsers" array
});

// withRunConfig reads runconfig.json, loads the correct .env, and merges properties.
// withBrowserStack applies cloud capabilities if useBrowserStack is true.
export default withBrowserStack(withRunConfig(baseConfig));
