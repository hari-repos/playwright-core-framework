import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { getReportDirectory } from './reports.js';

/**
 * Interface defining the options that can be provided in `runconfig.json`
 * to override default Playwright configurations without modifying the code.
 * 
 * @example
 * ```json
 * {
 *   "testEnv": "STAGING",
 *   "headless": false,
 *   "retries": 2
 * }
 * ```
 */
export interface RunConfig {
  /** The target test environment (e.g., 'QA', 'DEV'). */
  testEnv?: string;
  /** Global timeout for a single test execution in milliseconds. */
  timeout?: number;
  /** Timeout for assertions (expect) in milliseconds. */
  expectTimeout?: number;
  /** Timeout for individual Playwright actions (click, fill) in milliseconds. */
  actionTimeout?: number;
  /** Timeout for page navigation actions in milliseconds. */
  navigationTimeout?: number;
  /** Number of times to retry failed tests. */
  retries?: number;
  /** 
   * Number of concurrent workers or percentage string (e.g., '50%').
   * Passing a percentage string allows Playwright to scale dynamically based on the logical CPU cores
   * available on the host machine (e.g., '50%' uses 4 cores on an 8-core CPU, and 1 core on a 2-core CPU).
   * This is particularly useful in CI/CD environments with varying VM configurations.
   */
  workers?: number | string;
  /** Optional override for the reporter configuration. */
  reporter?: string;
  /** Flag to forcefully route execution to BrowserStack. */
  useBrowserStack?: boolean;
  /** Flag to run browsers in headless mode. */
  headless?: boolean;
  /** Array of browser names to run the tests against (e.g., ['chromium', 'firefox']). */
  browsers?: string[];
  /** Flag to start the browser maximized. Overrides viewport to null. */
  maximized?: boolean;
}

/**
 * Opt-in utility to wrap a Playwright configuration with values from `runconfig.json`.
 * It will also automatically load the correct `.env` file based on the `testEnv` defined.
 *
 * @param baseConfig The base Playwright configuration defined in your project
 * @param configDir The directory where `runconfig.json` and `.env` files are located (usually `process.cwd()`)
 * @returns The final, modified Playwright configuration ready for execution
 * 
 * @example
 * ```typescript
 * import { defineConfig } from '@playwright/test';
 * import { withRunConfig } from '@hari/playwright-core';
 * 
 * export default withRunConfig(defineConfig({
 *   testDir: './tests',
 * }));
 * ```
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

  const isBrowserStack = process.env.USE_BROWSERSTACK === 'true';

  // 2. Build Modified Configuration
  const finalConfig: PlaywrightTestConfig = { ...baseConfig };

  if (runConfig.timeout !== undefined) finalConfig.timeout = runConfig.timeout;
  if (runConfig.retries !== undefined) finalConfig.retries = runConfig.retries;
  if (runConfig.workers !== undefined) {
    finalConfig.workers = typeof runConfig.workers === 'string' && runConfig.workers.endsWith('%') 
      ? runConfig.workers 
      : Number(runConfig.workers);
  }
  const runDir = getReportDirectory();

  if (runConfig.reporter !== undefined) {
    if (runConfig.reporter.toLowerCase() === 'allure') {
      finalConfig.reporter = [
        ['html', { outputFolder: `${runDir}/html` }], 
        ['allure-playwright', { resultsDir: `${runDir}/allure-results` }]
      ];
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

  // Maximize Window Configuration
  if (runConfig.maximized) {
    // Pass the start-maximized arg to the browser launch options
    finalConfig.use.launchOptions = {
      ...finalConfig.use.launchOptions,
      args: [...(finalConfig.use.launchOptions?.args || []), '--start-maximized']
    };
  }

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

      const shouldMaximizeLocally = runConfig.maximized && !isBrowserStack;

      return {
        name: browser.toLowerCase(),
        use: shouldMaximizeLocally
          ? {
              browserName: browser.toLowerCase() as 'chromium' | 'firefox' | 'webkit',
              viewport: null
            }
          : {
              ...device,
              browserName: browser.toLowerCase() as 'chromium' | 'firefox' | 'webkit'
            }
      };
    });
  }

  // 4. Generate Allure Environment Properties
  try {
    const allureResultsDir = path.resolve(configDir, runDir, 'allure-results');
    if (!fs.existsSync(allureResultsDir)) {
      fs.mkdirSync(allureResultsDir, { recursive: true });
    }
    const envProps = [
      `Test_Environment=${testEnv.toUpperCase()}`,
      `OS=${process.platform}`,
      `Node_Version=${process.version}`,
      `Headless=${finalConfig.use?.headless ?? true}`,
      `Retries=${finalConfig.retries ?? 0}`,
      `Workers=${finalConfig.workers ?? 1}`,
      `BrowserStack=${process.env.USE_BROWSERSTACK === 'true'}`
    ].join('\n');
    fs.writeFileSync(path.join(allureResultsDir, 'environment.properties'), envProps);
  } catch (err) {
    console.warn(`⚠️ Failed to generate Allure environment.properties:`, err);
  }

  return finalConfig;
}
