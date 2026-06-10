import { Fixtures, test as baseTest, PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions } from '@playwright/test';
import { ApiClient } from '../utils/ApiClient.js';
import { envConfig, EnvConfig } from '../config/envConfig.js';

/**
 * Defines the custom fixtures available in tests.
 */
export interface CustomFixtures {
  /**
   * The resolved environment configuration containing base URLs and API endpoints.
   */
  envConfig: EnvConfig;
  
  /**
   * The initialized enterprise API client for making HTTP requests.
   */
  apiClient: ApiClient;

  /**
   * Internal automatic fixture for standardized logging.
   */
  _autoLogging: void;
}

type CoreFixturesType = Fixtures<
  CustomFixtures,
  {},
  PlaywrightTestArgs & PlaywrightTestOptions,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
>;

/**
 * Reusable fixture definitions that can be applied to any Playwright test runner.
 * This is particularly useful for playwright-bdd which requires extending its own test instance.
 */
export const coreFixtures: CoreFixturesType = {
  envConfig: async ({}, use) => {
    // Inject the validated runtime configuration
    await use(envConfig);
  },

  apiClient: async ({ request }, use) => {
    // Create the enterprise API client wrapper with the current context
    const client = new ApiClient(request, envConfig.apiUrl);
    await use(client);
  },

  // Setup global diagnostic hooks as an automatic fixture
  // This prevents 'test.beforeEach() called here' errors during config parsing
  _autoLogging: [async ({}, use, testInfo) => {
    console.log(`[Test Start] ${testInfo.title}`);
    await use();
    if (testInfo.status !== testInfo.expectedStatus) {
      console.warn(`[Test Failed] ${testInfo.title}`);
      console.warn(`Status: ${testInfo.status}`);
      // Additional diagnostic automation hooks can be plugged in here
    }
  }, { auto: true }],
};

/**
 * The extended Playwright test object providing enterprise fixtures (`envConfig`, `apiClient`).
 * Use this in your spec files instead of the default `@playwright/test`.
 */
export const test = baseTest.extend<CustomFixtures>(coreFixtures);

export { expect } from '@playwright/test';
