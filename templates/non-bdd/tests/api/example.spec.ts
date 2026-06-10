import { test, expect } from '@hari/playwright-core';
import { UserApiService } from '../../pages/api/UserApiService.js';

test('API: Fetch users from API', async ({ apiClient, envConfig }) => {
  const userService = new UserApiService(apiClient);
  const response = await userService.getUsers(2);
  expect(response.status()).toBe(200);
  
  const body = await response.json<any[]>();
  expect(body.length).toBeGreaterThan(0);
});
