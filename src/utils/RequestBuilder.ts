import { APIRequestContext } from '@playwright/test';

type RequestOptions = Parameters<APIRequestContext['get']>[1];

export class RequestBuilder {
  private endpoint: string;
  private pathVariables: Record<string, string | number> = {};
  private queryParams: Record<string, string | number | boolean> = {};
  private headers: Record<string, string> = {};
  private payload?: any;
  private failOnStatusCode?: boolean;
  private timeout?: number;
  private method: string = 'GET';

  /**
   * Initializes the RequestBuilder with a base endpoint.
   * Path variables can be indicated with `{varName}` or `:varName`.
   * @example
   * new RequestBuilder('/users/{userId}/posts')
   * new RequestBuilder('/users/:userId/posts')
   */
  constructor(endpoint: string, method: string = 'GET') {
    this.endpoint = endpoint;
    this.method = method;
  }

  /**
   * Sets the HTTP method for the request.
   */
  withMethod(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'): this {
    this.method = method;
    return this;
  }

  getMethod(): string {
    return this.method;
  }

  /**
   * Replaces a path variable in the endpoint.
   */
  withPathVariable(name: string, value: string | number): this {
    this.pathVariables[name] = value;
    return this;
  }

  /**
   * Adds a query parameter to the request.
   */
  withQueryParam(name: string, value: string | number | boolean): this {
    this.queryParams[name] = value;
    return this;
  }

  /**
   * Adds multiple query parameters to the request.
   */
  withQueryParams(params: Record<string, string | number | boolean>): this {
    this.queryParams = { ...this.queryParams, ...params };
    return this;
  }

  /**
   * Adds a header to the request.
   */
  withHeader(name: string, value: string): this {
    this.headers[name] = value;
    return this;
  }

  /**
   * Adds multiple headers to the request.
   */
  withHeaders(headers: Record<string, string>): this {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  /**
   * Appends a Bearer token to the Authorization header.
   */
  withBearerToken(token: string): this {
    this.headers['Authorization'] = `Bearer ${token}`;
    return this;
  }

  /**
   * Sets the request payload (JSON or form data).
   */
  withBody(data: any): this {
    this.payload = data;
    return this;
  }

  /**
   * Configures whether the request should fail on non-2xx status codes (Playwright specific).
   */
  withFailOnStatusCode(fail: boolean): this {
    this.failOnStatusCode = fail;
    return this;
  }

  /**
   * Sets the request timeout in milliseconds.
   */
  withTimeout(timeoutMs: number): this {
    this.timeout = timeoutMs;
    return this;
  }

  /**
   * Builds the final endpoint string by injecting path variables and query parameters.
   */
  buildEndpoint(): string {
    let finalEndpoint = this.endpoint;

    // Replace path variables
    for (const [key, value] of Object.entries(this.pathVariables)) {
      // support both /users/:id and /users/{id}
      finalEndpoint = finalEndpoint.replace(`:${key}`, String(value));
      finalEndpoint = finalEndpoint.replace(`{${key}}`, String(value));
    }

    // Append query params
    if (Object.keys(this.queryParams).length > 0) {
      const urlSearchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(this.queryParams)) {
        urlSearchParams.append(key, String(value));
      }
      const separator = finalEndpoint.includes('?') ? '&' : '?';
      finalEndpoint += `${separator}${urlSearchParams.toString()}`;
    }

    return finalEndpoint;
  }

  /**
   * Builds the Playwright RequestOptions object.
   */
  buildOptions(): RequestOptions {
    const options: RequestOptions = {};

    if (Object.keys(this.headers).length > 0) {
      options.headers = this.headers;
    }

    if (this.payload !== undefined) {
      options.data = this.payload;
    }

    if (this.failOnStatusCode !== undefined) {
      options.failOnStatusCode = this.failOnStatusCode;
    }

    if (this.timeout !== undefined) {
      options.timeout = this.timeout;
    }

    return options;
  }
}
