import { expect } from '@hari/playwright-core';
import { Given, Then } from '../bdd.config';
import { UserApiService } from '../pages/api/UserApiService';

let apiResponse: any;
let userService: UserApiService;

Given('I fetch users from page {int}', async ({ apiClient }, pageNum) => {
  userService = new UserApiService(apiClient);
  apiResponse = await userService.getUsers(pageNum);
});

Then('the response status should be {int}', async ({}, status) => {
  expect(apiResponse.status()).toBe(status);
});

Then('the response should contain users', async ({}) => {
  const body = await apiResponse.json();
  expect(body.data.length).toBeGreaterThan(0);
});
