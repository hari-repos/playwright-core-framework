import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/utils/ApiClient';

function createMockRequestContext(mockResponse: any) {
  const mockMethod = async (url: string, options: any) => ({
    status: () => mockResponse.status || 200,
    statusText: () => mockResponse.statusText || 'OK',
    text: async () => mockResponse.text || '',
    json: async () => mockResponse.json || {},
    headers: () => mockResponse.headers || {},
    url: () => url,
    ok: () => (mockResponse.status || 200) >= 200 && (mockResponse.status || 200) < 300,
  });

  return {
    get: mockMethod,
    post: mockMethod,
    put: mockMethod,
    patch: mockMethod,
    delete: mockMethod,
  } as any;
}

test.describe('ApiClient Unit Tests', () => {
  const originalEnv = process.env;

  test.beforeEach(() => {
    process.env = { ...originalEnv };
  });

  test.afterAll(() => {
    process.env = originalEnv;
  });

  test('should append baseURL correctly to relative endpoints', async () => {
    let capturedUrl = '';
    const mockContext = {
      get: async (url: string) => {
        capturedUrl = url;
        return { status: () => 200 };
      }
    } as any;

    const client = new ApiClient(mockContext, 'https://api.example.com/');
    await client.get('users/1');

    expect(capturedUrl).toBe('https://api.example.com/users/1');
  });

  test('should not append baseURL to absolute endpoints', async () => {
    let capturedUrl = '';
    const mockContext = {
      get: async (url: string) => {
        capturedUrl = url;
        return { status: () => 200 };
      }
    } as any;

    const client = new ApiClient(mockContext, 'https://api.example.com/');
    await client.get('https://other-api.com/data');

    expect(capturedUrl).toBe('https://other-api.com/data');
  });

  test('should inject Bearer token from environment for relative endpoints', async () => {
    process.env.BEARER_TOKEN = 'test-token-123';
    let capturedHeaders: any = {};
    const mockContext = {
      post: async (url: string, options: any) => {
        capturedHeaders = options?.headers || {};
        return { status: () => 201 };
      }
    } as any;

    const client = new ApiClient(mockContext, 'https://api.example.com');
    await client.post('/create', { data: { name: 'Test' } });

    expect(capturedHeaders.Authorization).toBe('Bearer test-token-123');
  });

  test('should NOT inject Bearer token for absolute endpoints', async () => {
    process.env.BEARER_TOKEN = 'test-token-123';
    let capturedHeaders: any = {};
    const mockContext = {
      get: async (url: string, options: any) => {
        capturedHeaders = options?.headers || {};
        return { status: () => 200 };
      }
    } as any;

    const client = new ApiClient(mockContext);
    await client.get('https://public-api.com/info');

    expect(capturedHeaders.Authorization).toBeUndefined();
  });

  test('should retry on 5xx errors and eventually succeed', async () => {
    let attempts = 0;
    const mockContext = {
      get: async () => {
        attempts++;
        if (attempts < 3) {
          return { status: () => 503 };
        }
        return { status: () => 200, json: async () => ({ success: true }) };
      }
    } as any;

    const client = new ApiClient(mockContext);
    const response = await client.get('https://api.example.com/retry-test');

    expect(attempts).toBe(3);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });

  test('should throw error after exhausting retries on 5xx errors', async () => {
    const mockContext = {
      get: async () => {
        return { status: () => 500 };
      }
    } as any;

    const client = new ApiClient(mockContext);
    
    // Default retries is 3, so it should throw after 3 attempts
    await expect(client.get('https://api.example.com/fail')).rejects.toThrow(/after 3 attempts/);
  });
});
