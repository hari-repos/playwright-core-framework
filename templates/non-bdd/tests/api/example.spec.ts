import { test, expect } from '@hari/playwright-core';
import { UserApiService } from '../../pages/api/UserApiService';

test('API: Fetch users from API', async ({ apiClient, envConfig }) => {
  const userService = new UserApiService(apiClient);
  const response = await userService.getUsers(2);
  expect(response.status()).toBe(200);
  
  const body = await response.json<{ page: number; data: any[] }>();
  expect(body.page).toBe(2);
  expect(body.data.length).toBeGreaterThan(0);
});
