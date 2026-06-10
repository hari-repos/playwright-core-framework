import type { PlaywrightTestConfig } from '@playwright/test';

/**
 * Opt-in utility to wrap a Playwright configuration with BrowserStack capabilities.
 * 
 * If BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY are not present in the environment,
 * it will return the base configuration unchanged, allowing for seamless local execution.
 * 
 * @param baseConfig The base Playwright configuration
 * @returns The modified Playwright configuration with BrowserStack connection options
 */
export function withBrowserStack(baseConfig: PlaywrightTestConfig): PlaywrightTestConfig {
  // Explicitly require USE_BROWSERSTACK=true to connect, allowing easy local toggling.
  if (process.env.USE_BROWSERSTACK !== 'true') {
    return baseConfig; // Fallback to local execution
  }

  if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
    console.warn('⚠️ USE_BROWSERSTACK is true, but BROWSERSTACK_USERNAME or BROWSERSTACK_ACCESS_KEY is missing. Falling back to local execution.');
    return baseConfig;
  }

  // Standardize the build name across all company projects
  const buildName = process.env.BROWSERSTACK_BUILD_NAME || 'Default Enterprise Build';

  return {
    ...baseConfig,
    projects: baseConfig.projects?.map(project => {
      // Do not execute API tests in BrowserStack
      if (project.name?.toLowerCase().includes('api')) {
        return project;
      }

      const caps = {
        'browser': project.use?.browserName || 'chromium',
        'browser_version': 'latest',
        'os': 'Windows',
        'os_version': '11',
        'name': project.name || 'Default Test Run',
        'build': buildName,
        'browserstack.username': process.env.BROWSERSTACK_USERNAME,
        'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
        // Recommended configurations for stability
        'browserstack.local': process.env.BROWSERSTACK_LOCAL === 'true' ? 'true' : 'false',
        'browserstack.playwrightVersion': '1.latest', // Using latest playwright 1.x version
      };

      return {
        ...project,
        use: {
          ...project.use,
          connectOptions: {
            wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`,
          }
        }
      };
    })
  };
}
