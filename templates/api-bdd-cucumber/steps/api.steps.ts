import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/setup.js';
import { UserApiService } from '../pages/api/UserApiService.js';

Given('I fetch users with limit {int}', async function (this: CustomWorld, limit: number) {
  const userService = new UserApiService(this.apiClient!);
  this.apiResponse = await userService.getUsers(limit);
});

Then('the response status should be {int}', async function (this: CustomWorld, status: number) {
  expect(this.apiResponse!.status()).toBe(status);
});

Then('the response JSON schema should be valid', async function (this: CustomWorld) {
  const userService = new UserApiService(this.apiClient!);
  const body = await this.apiResponse!.json();
  expect(() => userService.validateUsersSchema(body)).not.toThrow();
});

When('I validate and parse the following XML payload:', async function (this: CustomWorld, xmlContent: string) {
  const userService = new UserApiService(this.apiClient!);
  this.parsedXml = userService.validateAndParseXml(xmlContent);
});

Then('the XML status should be {string}', async function (this: CustomWorld, status: string) {
  expect(this.parsedXml.response.status).toBe(status);
});

Then('the XML message should be {string}', async function (this: CustomWorld, message: string) {
  expect(this.parsedXml.response.data.message).toBe(message);
});
