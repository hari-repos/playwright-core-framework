import { test, expect } from '@playwright/test';
import { withBrowserStack } from '../../src/config/browserStack';
import type { PlaywrightTestConfig } from '@playwright/test';

test.describe('browserStack Config Unit Tests', () => {
  let originalUseBrowserStack: string | undefined;
  let originalUser: string | undefined;
  let originalKey: string | undefined;
  let originalBuildName: string | undefined;

  test.beforeEach(() => {
    originalUseBrowserStack = process.env.USE_BROWSERSTACK;
    originalUser = process.env.BROWSERSTACK_USERNAME;
    originalKey = process.env.BROWSERSTACK_ACCESS_KEY;
    originalBuildName = process.env.BROWSERSTACK_BUILD_NAME;
  });

  test.afterEach(() => {
    const restore = (key: string, val: string | undefined) => {
      if (val === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = val;
      }
    };
    restore('USE_BROWSERSTACK', originalUseBrowserStack);
    restore('BROWSERSTACK_USERNAME', originalUser);
    restore('BROWSERSTACK_ACCESS_KEY', originalKey);
    restore('BROWSERSTACK_BUILD_NAME', originalBuildName);
  });

  const baseConfig: PlaywrightTestConfig = {
    projects: [
      { name: 'Desktop UI', use: { browserName: 'chromium' } },
      { name: 'API Tests', use: { browserName: 'chromium' } }
    ]
  };

  test('should return base config if USE_BROWSERSTACK is not true', () => {
    process.env.USE_BROWSERSTACK = 'false';
    const config = withBrowserStack(baseConfig);
    expect(config).toBe(baseConfig);
  });

  test('should return base config if credentials are missing', () => {
    process.env.USE_BROWSERSTACK = 'true';
    delete process.env.BROWSERSTACK_USERNAME;
    delete process.env.BROWSERSTACK_ACCESS_KEY;
    const config = withBrowserStack(baseConfig);
    expect(config).toBe(baseConfig);
  });

  test('should inject browserStack connectOptions into projects', () => {
    process.env.USE_BROWSERSTACK = 'true';
    process.env.BROWSERSTACK_USERNAME = 'testuser';
    process.env.BROWSERSTACK_ACCESS_KEY = 'testkey';
    
    const config = withBrowserStack(baseConfig);
    
    // Non-API project should be modified
    const uiProject = config.projects?.find(p => p.name === 'Desktop UI');
    expect(uiProject?.use?.connectOptions?.wsEndpoint).toContain('wss://cdp.browserstack.com/playwright');
    expect(uiProject?.use?.connectOptions?.wsEndpoint).toContain('testuser');
    expect(uiProject?.use?.connectOptions?.wsEndpoint).toContain('testkey');
    
    // API project should not be modified
    const apiProject = config.projects?.find(p => p.name === 'API Tests');
    expect(apiProject?.use?.connectOptions).toBeUndefined();
  });

  test('should not crash when project name is undefined', () => {
    process.env.USE_BROWSERSTACK = 'true';
    process.env.BROWSERSTACK_USERNAME = 'testuser';
    process.env.BROWSERSTACK_ACCESS_KEY = 'testkey';

    const baseConfigWithNoName: PlaywrightTestConfig = {
      projects: [
        { use: { browserName: 'chromium' } }
      ]
    };

    const config = withBrowserStack(baseConfigWithNoName);
    const project = config.projects?.[0];
    expect(project?.use?.connectOptions?.wsEndpoint).toContain('wss://cdp.browserstack.com/playwright');
  });
});
