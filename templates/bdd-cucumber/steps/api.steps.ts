import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/setup';
import { UserApiService } from '../pages/api/UserApiService';

Given('I fetch users from page {int}', async function (this: CustomWorld, pageNum: number) {
  const userService = new UserApiService(this.apiClient!);
  this.apiResponse = await userService.getUsers(pageNum);
});

Then('the response status should be {int}', async function (this: CustomWorld, status: number) {
  expect(this.apiResponse!.status()).toBe(status);
});

Then('the response should contain users', async function (this: CustomWorld) {
  const body = await this.apiResponse!.json();
  expect(body.data.length).toBeGreaterThan(0);
});
