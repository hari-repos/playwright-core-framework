import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import * as dotenv from 'dotenv';
import path from 'path';

// Read process.env.TEST_ENV or default to QA
const testEnv = (process.env.TEST_ENV || 'QA').toLowerCase();

// Load the environment-specific .env file (e.g. .env.dev, .env.qa)
dotenv.config({ path: path.resolve(__dirname, `.env.${testEnv}`) });

// Load default .env as a fallback for shared/base configuration
dotenv.config({ path: path.resolve(__dirname, '.env'), override: false });

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'steps/**/*.ts',
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
