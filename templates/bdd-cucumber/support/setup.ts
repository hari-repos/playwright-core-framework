import { setWorldConstructor, World, BeforeAll, AfterAll, Before, After, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { chromium, Browser, Page, BrowserContext, request, APIRequestContext, APIResponse } from '@playwright/test';
import { ApiClient } from '@hari/playwright-core';

setDefaultTimeout(60 * 1000);

export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  apiContext?: APIRequestContext;
  apiClient?: ApiClient;
  apiResponse?: any;

  constructor(options: any) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);

let globalBrowser: Browser;

BeforeAll(async function () {
  globalBrowser = await chromium.launch({ headless: true }); // Can be driven by env var
});

AfterAll(async function () {
  if (globalBrowser) {
    await globalBrowser.close();
  }
});

Before(async function (this: CustomWorld) {
  this.browser = globalBrowser;
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.apiContext = await request.newContext();
  this.apiClient = new ApiClient(this.apiContext);
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    if (this.page) {
      const screenshot = await this.page.screenshot({ fullPage: true });
      this.attach(screenshot, 'image/png');
    }
  }

  await this.page?.close();
  await this.apiContext?.dispose();
  await this.context?.close();
});
