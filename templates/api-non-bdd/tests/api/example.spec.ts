import { test, expect } from '@hari/playwright-core';
import * as allure from 'allure-playwright';
import { UserApiService } from '../../pages/api/UserApiService.js';

test('API: Fetch and Validate Users API', async ({ apiClient }) => {
  allure.epic('Backend API');
  allure.story('User Service GET /users');
  allure.severity('normal');

  const userService = new UserApiService(apiClient);
  
  let response;
  await test.step('Fetch users with limit using RequestBuilder', async () => {
    response = await userService.getUsers(5);
  });
  
  await test.step('Verify response status and JSON schema', async () => {
    expect(response.status()).toBe(200);
    const body = await response.json<any[]>();
    expect(body.length).toBe(5);
    
    // Validate JSON Schema
    expect(() => userService.validateUsersSchema(body)).not.toThrow();
  });

  await test.step('Validate and Parse XML payload using XmlValidator', async () => {
    const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
      <response>
        <status>success</status>
        <data>
          <message>Hello from XML API</message>
        </data>
      </response>
    `;
    const parsed = userService.validateAndParseXml(mockXml);
    expect(parsed.response.status).toBe('success');
    expect(parsed.response.data.message).toBe('Hello from XML API');
  });
});

/*
// EXAMPLE: Authenticated API Client Setup with OAuth Token Service
// To configure automatic token injection, pass a TokenConfig to the ApiClient constructor:
test('API: Authenticated Request Example', async ({ playwright }) => {
  const tokenConfig = {
    authUrl: 'https://auth.example.com/oauth/token',
    clientId: process.env.CLIENT_ID || 'my-client',
    clientSecret: process.env.CLIENT_SECRET || 'my-secret',
    scope: 'read:users',
  };
  
  // Create an authenticated client that automatically handles token retrieval and caching:
  // const authClient = new ApiClient(request, 'https://api.example.com', tokenConfig);
  // const response = await authClient.get('/secure-data');
});
*/
