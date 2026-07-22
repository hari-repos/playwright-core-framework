import { test, expect } from '@playwright/test';
import { RequestBuilder } from '../../src/utils/RequestBuilder.js';

test.describe('RequestBuilder', () => {
  test('should build basic endpoint with method', () => {
    const builder = new RequestBuilder('/users').withMethod('POST');
    expect(builder.buildEndpoint()).toBe('/users');
    expect(builder.getMethod()).toBe('POST');
    expect(builder.buildOptions()).toEqual({});
  });

  test('should replace path variables', () => {
    const builder = new RequestBuilder('/users/{userId}/posts/:postId')
      .withPathVariable('userId', 123)
      .withPathVariable('postId', 'abc');
    
    expect(builder.buildEndpoint()).toBe('/users/123/posts/abc');
  });

  test('should append query parameters', () => {
    const builder = new RequestBuilder('/search')
      .withQueryParam('q', 'playwright')
      .withQueryParams({ page: 2, sort: 'desc' });
    
    expect(builder.buildEndpoint()).toBe('/search?q=playwright&page=2&sort=desc');
  });

  test('should set headers and body', () => {
    const builder = new RequestBuilder('/submit')
      .withMethod('POST')
      .withHeader('X-Custom', 'value')
      .withBearerToken('my-token')
      .withBody({ hello: 'world' });

    const options = builder.buildOptions();
    expect(options?.headers).toEqual({
      'X-Custom': 'value',
      'Authorization': 'Bearer my-token'
    });
    expect(options?.data).toEqual({ hello: 'world' });
  });
});
