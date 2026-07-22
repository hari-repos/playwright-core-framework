import { test, APIRequestContext, APIResponse } from '@playwright/test';
import { TokenService, TokenConfig } from './TokenService.js';
import { RequestBuilder } from './RequestBuilder.js';

/**
 * A wrapper around Playwright's `APIResponse` that provides convenient methods
 * for accessing response data, status, and headers.
 * 
 * @example
 * ```typescript
 * const response = await apiClient.get('/users/1');
 * console.log(response.status()); // 200
 * const user = await response.json<User>();
 * ```
 */
export class ApiClientResponse {
  /**
   * Creates a new instance of `ApiClientResponse`.
   * @param response - The raw Playwright `APIResponse` object.
   */
  constructor(private readonly response: APIResponse) {}

  /**
   * Gets the HTTP status code of the response.
   * @returns {number} The HTTP status code.
   */
  status(): number {
    return this.response.status();
  }

  /**
   * Gets the HTTP status text of the response.
   * @returns {string} The HTTP status text.
   */
  statusText(): string {
    return this.response.statusText();
  }

  /**
   * Gets the response body as a string.
   * @returns {Promise<string>} A promise that resolves to the response body string.
   */
  async text(): Promise<string> {
    return this.response.text();
  }

  /**
   * Parses the response body as JSON.
   * @template T The expected type of the JSON response.
   * @returns {Promise<T>} A promise that resolves to the parsed JSON object.
   */
  async json<T>(): Promise<T> {
    return (await this.response.json()) as T;
  }

  /**
   * Gets the response headers.
   * @returns {Record<string, string>} An object containing the response headers.
   */
  headers(): Record<string, string> {
    return this.response.headers();
  }

  /**
   * Gets the URL of the response.
   * @returns {string} The response URL.
   */
  url(): string {
    return this.response.url();
  }

  /**
   * Indicates whether the response was successful (status in the range 200-299).
   * @returns {boolean} True if the response was successful, false otherwise.
   */
  ok(): boolean {
    return this.response.ok();
  }

  /**
   * Access the raw Playwright `APIResponse` object if needed.
   * @returns {APIResponse} The underlying Playwright APIResponse.
   */
  raw(): APIResponse {
    return this.response;
  }
}

/**
 * An enterprise-grade API client wrapper built on top of Playwright's `APIRequestContext`.
 * Provides standardized logging, bearer token injection, and automatic retries for robust API testing.
 * 
 * @example
 * ```typescript
 * test('create user', async ({ apiClient }) => {
 *   const response = await apiClient.post('/users', { data: { name: 'John Doe' } });
 *   expect(response.ok()).toBeTruthy();
 * });
 * ```
 */
export class ApiClient {
  /**
   * Creates a new instance of `ApiClient`.
   * @param requestContext - The Playwright `APIRequestContext` used to make requests.
   * @param baseURL - An optional base URL to prepend to all endpoint paths.
   */
  constructor(
    private requestContext: APIRequestContext,
    private baseURL?: string,
    private tokenConfig?: TokenConfig
  ) {}

  private async request(
    method: string, 
    endpoint: string, 
    options?: Parameters<APIRequestContext['get']>[1], 
    retries = 3
  ): Promise<ApiClientResponse> {
    const isAbsoluteUrl = /^https?:\/\//i.test(endpoint);
    const url = (this.baseURL && !isAbsoluteUrl)
      ? `${this.baseURL.replace(/\/$/, '')}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
      : endpoint;
    let token = !isAbsoluteUrl ? process.env.BEARER_TOKEN : undefined;
    
    // Automatically fetch and inject token if tokenConfig is provided
    if (this.tokenConfig && !isAbsoluteUrl) {
      token = await TokenService.getToken(this.requestContext, this.tokenConfig);
    }

    const reqOptions = {
      ...options,
      headers: {
        ...options?.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    console.log(`[ApiClient] ${method.toUpperCase()} ${url}`);
    if (reqOptions.data) {
      console.log(`[ApiClient] Payload: ${JSON.stringify(reqOptions.data)}`);
    }

    let response: APIResponse | null = null;
    let attempt = 0;
    let responseBody = '';

    await test.step(`${method.toUpperCase()} ${url}`, async () => {
      // Attach Request Details
      const requestDetails = {
        method: method.toUpperCase(),
        url,
        headers: reqOptions.headers,
        payload: reqOptions.data,
      };
      await test.info().attach('API Request', {
        body: JSON.stringify(requestDetails, null, 2),
        contentType: 'application/json',
      });

      while (attempt < retries) {
        try {
          switch (method.toLowerCase()) {
            case 'get':
              response = await this.requestContext.get(url, reqOptions);
              break;
            case 'post':
              response = await this.requestContext.post(url, reqOptions);
              break;
            case 'put':
              response = await this.requestContext.put(url, reqOptions);
              break;
            case 'patch':
              response = await this.requestContext.patch(url, reqOptions);
              break;
            case 'delete':
              response = await this.requestContext.delete(url, reqOptions);
              break;
            default:
              throw new Error(`Unsupported method: ${method}`);
          }

          const status = response.status();
          console.log(`[ApiClient] Response Status: ${status}`);

          try {
            responseBody = await response.text();
          } catch {
            responseBody = 'Failed to read response body';
          }

          const responseDetails = {
            status,
            statusText: response.statusText(),
            headers: response.headers(),
            body: responseBody.startsWith('{') || responseBody.startsWith('[') ? JSON.parse(responseBody) : responseBody
          };

          await test.info().attach(`API Response (Attempt ${attempt + 1})`, {
            body: JSON.stringify(responseDetails, null, 2),
            contentType: 'application/json',
          });

          // Retry on 5xx errors
          if (status >= 500 && status < 600) {
            throw new Error(`Server Error: ${status}`);
          }

          break; // Success or non-5xx, break the retry loop
        } catch (error: any) {
          attempt++;
          console.warn(`[ApiClient] Attempt ${attempt} failed: ${error.message}`);
          if (attempt >= retries) {
            throw new Error(`[ApiClient] Request failed after ${retries} attempts. Last error: ${error.message}`);
          }
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    });

    if (!response) {
      throw new Error(`[ApiClient] Unknown error occurred during request to ${url}`);
    }

    return new ApiClientResponse(response);
  }

  /**
   * Sends an HTTP GET request to the specified endpoint.
   * 
   * @param endpoint - The URL endpoint (appended to baseURL if configured).
   * @param options - Additional Playwright request options (headers, params, etc.).
   * @returns {Promise<ApiClientResponse>} A promise that resolves to the wrapped response.
   * 
   * @example
   * ```typescript
   * const res = await apiClient.get('/products', { params: { category: 'books' } });
   * ```
   */
  async get(endpoint: string, options?: Parameters<APIRequestContext['get']>[1]): Promise<ApiClientResponse> {
    return this.request('get', endpoint, options);
  }

  /**
   * Executes a request configured via the RequestBuilder.
   * 
   * @param builder - The RequestBuilder instance containing the request configuration.
   * @returns {Promise<ApiClientResponse>}
   * 
   * @example
   * ```typescript
   * const builder = new RequestBuilder('/users').withMethod('POST').withBody({ name: 'Alice' });
   * const res = await apiClient.execute(builder);
   * ```
   */
  async execute(builder: RequestBuilder): Promise<ApiClientResponse> {
    return this.request(
      builder.getMethod(),
      builder.buildEndpoint(),
      builder.buildOptions()
    );
  }

  /**
   * Sends an HTTP POST request to the specified endpoint.
   * 
   * @param endpoint - The URL endpoint (appended to baseURL if configured).
   * @param options - Additional Playwright request options (data, headers, etc.).
   * @returns {Promise<ApiClientResponse>} A promise that resolves to the wrapped response.
   * 
   * @example
   * ```typescript
   * const res = await apiClient.post('/users', { data: { name: 'Alice' } });
   * ```
   */
  async post(endpoint: string, options?: Parameters<APIRequestContext['post']>[1]): Promise<ApiClientResponse> {
    return this.request('post', endpoint, options);
  }

  /**
   * Sends an HTTP PUT request to the specified endpoint.
   * 
   * @param endpoint - The URL endpoint (appended to baseURL if configured).
   * @param options - Additional Playwright request options (data, headers, etc.).
   * @returns {Promise<ApiClientResponse>} A promise that resolves to the wrapped response.
   * 
   * @example
   * ```typescript
   * const res = await apiClient.put('/users/1', { data: { name: 'Bob' } });
   * ```
   */
  async put(endpoint: string, options?: Parameters<APIRequestContext['put']>[1]): Promise<ApiClientResponse> {
    return this.request('put', endpoint, options);
  }

  /**
   * Sends an HTTP PATCH request to the specified endpoint.
   * 
   * @param endpoint - The URL endpoint (appended to baseURL if configured).
   * @param options - Additional Playwright request options (data, headers, etc.).
   * @returns {Promise<ApiClientResponse>} A promise that resolves to the wrapped response.
   * 
   * @example
   * ```typescript
   * const res = await apiClient.patch('/users/1', { data: { status: 'active' } });
   * ```
   */
  async patch(endpoint: string, options?: Parameters<APIRequestContext['patch']>[1]): Promise<ApiClientResponse> {
    return this.request('patch', endpoint, options);
  }

  /**
   * Sends an HTTP DELETE request to the specified endpoint.
   * 
   * @param endpoint - The URL endpoint (appended to baseURL if configured).
   * @param options - Additional Playwright request options (data, headers, etc.).
   * @returns {Promise<ApiClientResponse>} A promise that resolves to the wrapped response.
   * 
   * @example
   * ```typescript
   * const res = await apiClient.delete('/users/1');
   * ```
   */
  async delete(endpoint: string, options?: Parameters<APIRequestContext['delete']>[1]): Promise<ApiClientResponse> {
    return this.request('delete', endpoint, options);
  }
}
