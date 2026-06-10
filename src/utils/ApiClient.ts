import { APIRequestContext, APIResponse } from '@playwright/test';

export class ApiClientResponse {
  constructor(private readonly response: APIResponse) {}

  status() {
    return this.response.status();
  }

  statusText() {
    return this.response.statusText();
  }

  async text() {
    return this.response.text();
  }

  async json<T>(): Promise<T> {
    return (await this.response.json()) as T;
  }

  headers() {
    return this.response.headers();
  }

  url() {
    return this.response.url();
  }

  ok() {
    return this.response.ok();
  }

  // Access the raw Playwright APIResponse if needed
  raw(): APIResponse {
    return this.response;
  }
}

export class ApiClient {
  constructor(
    private requestContext: APIRequestContext,
    private baseURL?: string
  ) {}

  private async request(
    method: string, 
    endpoint: string, 
    options?: Parameters<APIRequestContext['get']>[1], 
    retries = 3
  ): Promise<ApiClientResponse> {
    const url = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
    const token = process.env.BEARER_TOKEN;

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

    if (!response) {
      throw new Error(`[ApiClient] Unknown error occurred during request to ${url}`);
    }

    return new ApiClientResponse(response);
  }

  async get(endpoint: string, options?: Parameters<APIRequestContext['get']>[1]) {
    return this.request('get', endpoint, options);
  }

  async post(endpoint: string, options?: Parameters<APIRequestContext['post']>[1]) {
    return this.request('post', endpoint, options);
  }

  async put(endpoint: string, options?: Parameters<APIRequestContext['put']>[1]) {
    return this.request('put', endpoint, options);
  }

  async patch(endpoint: string, options?: Parameters<APIRequestContext['patch']>[1]) {
    return this.request('patch', endpoint, options);
  }

  async delete(endpoint: string, options?: Parameters<APIRequestContext['delete']>[1]) {
    return this.request('delete', endpoint, options);
  }
}
