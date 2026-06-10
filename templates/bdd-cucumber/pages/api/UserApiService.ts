import { ApiClient } from '@hari/playwright-core';

export class UserApiService {
  readonly apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getUsers(page: number = 2) {
    return await this.apiClient.get(`https://jsonplaceholder.typicode.com/users`);
  }
}
