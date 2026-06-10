import { test, expect } from '@hari/playwright-core';
import * as allure from 'allure-playwright';
import { UserApiService } from '../../pages/api/UserApiService.js';

test('API: Fetch users from API', async ({ apiClient, envConfig }) => {
  allure.epic('Backend API');
  allure.story('User Service GET /users');
  allure.severity('normal');

  const userService = new UserApiService(apiClient);
  
  let response;
  await test.step('Fetch users page 2', async () => {
    response = await userService.getUsers(2);
  });
  
  await test.step('Verify response status and payload', async () => {
    expect(response.status()).toBe(200);
    const body = await response.json<any[]>();
    expect(body.length).toBeGreaterThan(0);
  });
});
