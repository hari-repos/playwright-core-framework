import { Fixtures, test as baseTest, PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions } from '@playwright/test';
import { ApiClient } from '../utils/ApiClient.js';
import { envConfig, EnvConfig } from '../config/envConfig.js';

/**
 * Defines the custom enterprise fixtures available to all Playwright tests.
 * These fixtures are automatically injected into tests when using the extended `test` object.
 * 
 * @example
 * ```typescript
 * test('my test', async ({ envConfig, apiClient }) => {
 *   console.log(envConfig.apiUrl);
 *   await apiClient.get('/users');
 * });
 * ```
 */
export interface CustomFixtures {
  /**
   * The resolved environment configuration.
   * Contains properties like `env` (e.g. 'QA', 'PROD'), `baseURL`, and `apiUrl`.
   * Automatically loaded from your project's `.env.{TEST_ENV}` and `.env` files.
   */
  envConfig: EnvConfig;
  
  /**
   * An initialized enterprise API client wrapper for making HTTP requests.
   * Built on top of Playwright's `request` context, it provides automatic
   * authentication injection, logging, and retry mechanisms.
   */
  apiClient: ApiClient;

/**
   * Internal fixture for standardized test lifecycle logging.
   * Runs automatically for every test to log start and failure events.
   * @internal
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
 * Reusable base fixture definitions.
 * Provides the implementation for `envConfig`, `apiClient`, and internal auto-logging.
 * Can be used to extend custom test runners or integrate with `playwright-bdd`.
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
 * The extended Playwright `test` object.
 * This should be used in place of the default `@playwright/test` import in your spec files.
 * It provides built-in access to enterprise fixtures like `envConfig` and `apiClient`.
 * 
 * @example
 * ```typescript
 * import { test, expect } from '@hari/playwright-core';
 * 
 * test('Check API', async ({ apiClient }) => {
 *   const response = await apiClient.get('/health');
 *   expect(response.status()).toBe(200);
 * });
 * ```
 */
export const test = baseTest.extend<CustomFixtures>({
  ...coreFixtures,
  page: async ({ page }, use, testInfo) => {
    // Yield the page to the test
    await use(page);

    // After the test ends, report the status to BrowserStack if enabled
    if (process.env.USE_BROWSERSTACK === 'true') {
      const status = testInfo.status === 'passed' ? 'passed' : 'failed';
      // Sanitize the error message to avoid breaking JSON serialization
      const reason = testInfo.error?.message?.replace(/\n/g, ' ') || (status === 'passed' ? 'Test completed successfully' : 'Test failed');
      
      try {
        await page.evaluate((_: string) => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionName', arguments: { name: testInfo.title } })}`);
        await page.evaluate((_: string) => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { status, reason } })}`);
        
        // Use getSessionDetails as a deterministic barrier instead of a hard wait.
        // Awaiting this forces a round-trip to the BrowserStack proxy, guaranteeing 
        // that the previous status update commands were fully processed.
        await page.evaluate((_: string) => {}, `browserstack_executor: {"action": "getSessionDetails"}`);
      } catch (e) {
        // Evaluation might fail if the page is already closed, which is fine to ignore on teardown
      }
    }
  }
});

export { expect } from '@playwright/test';
