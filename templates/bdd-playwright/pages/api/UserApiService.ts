import { APIRequestContext } from '@playwright/test';

export class UserApiService {
  readonly apiClient: APIRequestContext;

  constructor(apiClient: APIRequestContext) {
    this.apiClient = apiClient;
  }

  async getUsers(page: number = 2) {
    return await this.apiClient.get(`https://reqres.in/api/users?page=${page}`);
  }
}
