import { expect } from '@hari/playwright-core';
import { Given, When, Then } from '../bdd.config.js';
import { UserApiService } from '../pages/api/UserApiService.js';

let apiResponse: any;
let parsedXml: any;
let userService: UserApiService;

Given('I fetch users with limit {int}', async ({ apiClient }, limit) => {
  userService = new UserApiService(apiClient);
  apiResponse = await userService.getUsers(limit);
});

Then('the response status should be {int}', async ({}, status) => {
  expect(apiResponse.status()).toBe(status);
});

Then('the response JSON schema should be valid', async ({}) => {
  const body = await apiResponse.json();
  expect(() => userService.validateUsersSchema(body)).not.toThrow();
});

When('I validate and parse the following XML payload:', async ({ apiClient }, xmlContent) => {
  userService = new UserApiService(apiClient);
  parsedXml = userService.validateAndParseXml(xmlContent);
});

Then('the XML status should be {string}', async ({}, status) => {
  expect(parsedXml.response.status).toBe(status);
});

Then('the XML message should be {string}', async ({}, message) => {
  expect(parsedXml.response.data.message).toBe(message);
});
