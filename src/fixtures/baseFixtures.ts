import { test as baseTest } from '@playwright/test';
import { ApiClient } from '../utils/ApiClient';
import { envConfig, EnvConfig } from '../config/envConfig';

export interface CustomFixtures {
  envConfig: EnvConfig;
  apiClient: ApiClient;
}

export const test = baseTest.extend<CustomFixtures>({
  envConfig: async ({}, use) => {
    // Inject the validated runtime configuration
    await use(envConfig);
  },

  apiClient: async ({ request }, use) => {
    // Create the enterprise API client wrapper with the current context
    const client = new ApiClient(request, envConfig.apiUrl);
    await use(client);
  },
});

// Setup global diagnostic hooks
test.beforeEach(async ({}, testInfo) => {
  console.log(`[Test Start] ${testInfo.title}`);
});

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    console.warn(`[Test Failed] ${testInfo.title}`);
    console.warn(`Status: ${testInfo.status}`);
    // Additional diagnostic automation hooks can be plugged in here
  }
});

export { expect } from '@playwright/test';
