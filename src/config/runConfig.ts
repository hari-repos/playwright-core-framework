import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

export interface RunConfig {
  testEnv?: string;
  timeout?: number;
  expectTimeout?: number;
  actionTimeout?: number;
  navigationTimeout?: number;
  retries?: number;
  workers?: number | string;
  reporter?: string;
  useBrowserStack?: boolean;
  headless?: boolean;
  browsers?: string[];
}

/**
 * Opt-in utility to wrap a Playwright configuration with values from runconfig.json.
 * It will also automatically load the correct .env file based on the testEnv defined.
 *
 * @param baseConfig The base Playwright configuration
 * @param configDir The directory where runconfig.json and .env files are located (usually process.cwd())
 * @returns The modified Playwright configuration
 */
export function withRunConfig(baseConfig: PlaywrightTestConfig, configDir: string = process.cwd()): PlaywrightTestConfig {
  const runConfigPath = path.resolve(configDir, 'runconfig.json');
  let runConfig: RunConfig = {};

  if (fs.existsSync(runConfigPath)) {
    try {
      const fileContent = fs.readFileSync(runConfigPath, 'utf-8');
      runConfig = JSON.parse(fileContent) as RunConfig;
    } catch (e) {
      console.warn(`⚠️ Could not parse ${runConfigPath}. Proceeding with base configuration.`, e);
    }
  }

  // 1. Load Environment Variables
  const testEnv = (process.env.TEST_ENV || runConfig.testEnv || 'QA').toLowerCase();
  
  // Load the environment-specific .env file (e.g. .env.dev, .env.qa)
  dotenv.config({ path: path.resolve(configDir, `.env.${testEnv}`) });
  
  // Load default .env as a fallback for shared/base configuration
  dotenv.config({ path: path.resolve(configDir, '.env'), override: false });

  // If useBrowserStack is explicitly true in runconfig, set the environment variable
  if (runConfig.useBrowserStack) {
    process.env.USE_BROWSERSTACK = 'true';
  }

  // 2. Build Modified Configuration
  const finalConfig: PlaywrightTestConfig = { ...baseConfig };

  if (runConfig.timeout !== undefined) finalConfig.timeout = runConfig.timeout;
  if (runConfig.retries !== undefined) finalConfig.retries = runConfig.retries;
  if (runConfig.workers !== undefined) {
    finalConfig.workers = typeof runConfig.workers === 'string' && runConfig.workers.endsWith('%') 
      ? runConfig.workers 
      : Number(runConfig.workers);
  }
  if (runConfig.reporter !== undefined) {
    if (runConfig.reporter.toLowerCase() === 'allure') {
      finalConfig.reporter = [['html'], ['allure-playwright']];
    } else {
      finalConfig.reporter = runConfig.reporter;
    }
  }

  // Expect Configuration
  if (runConfig.expectTimeout !== undefined) {
    finalConfig.expect = {
      ...finalConfig.expect,
      timeout: runConfig.expectTimeout
    };
  }

  // Use Configuration (Action & Navigation timeouts, headless mode)
  finalConfig.use = { ...finalConfig.use };
  if (runConfig.actionTimeout !== undefined) finalConfig.use.actionTimeout = runConfig.actionTimeout;
  if (runConfig.navigationTimeout !== undefined) finalConfig.use.navigationTimeout = runConfig.navigationTimeout;
  if (runConfig.headless !== undefined) finalConfig.use.headless = runConfig.headless;

  // 3. Browser Selection Override
  if (runConfig.browsers && Array.isArray(runConfig.browsers) && runConfig.browsers.length > 0) {
    finalConfig.projects = runConfig.browsers.map(browser => {
      // Map common browser names to Playwright device profiles if possible
      let device = {};
      if (browser.toLowerCase() === 'chromium' || browser.toLowerCase() === 'chrome') {
        device = devices['Desktop Chrome'];
      } else if (browser.toLowerCase() === 'firefox') {
        device = devices['Desktop Firefox'];
      } else if (browser.toLowerCase() === 'webkit' || browser.toLowerCase() === 'safari') {
        device = devices['Desktop Safari'];
      } else if (browser.toLowerCase() === 'edge') {
        device = devices['Desktop Edge'];
      }

      return {
        name: browser.toLowerCase(),
        use: {
          ...device,
          browserName: browser.toLowerCase() as 'chromium' | 'firefox' | 'webkit',
        }
      };
    });
  }

  return finalConfig;
}
