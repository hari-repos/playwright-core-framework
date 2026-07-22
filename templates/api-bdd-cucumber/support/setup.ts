import { setWorldConstructor, World, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { request, APIRequestContext } from '@playwright/test';
import { ApiClient } from '@hari/playwright-core';

setDefaultTimeout(30 * 1000);

export class CustomWorld extends World {
  apiContext?: APIRequestContext;
  apiClient?: ApiClient;
  apiResponse?: any;
  parsedXml?: any;

  constructor(options: any) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);

Before(async function (this: CustomWorld) {
  this.apiContext = await request.newContext();
  this.apiClient = new ApiClient(this.apiContext);
});

After(async function (this: CustomWorld) {
  await this.apiContext?.dispose();
});
