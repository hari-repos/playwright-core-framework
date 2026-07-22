import { ApiClient, RequestBuilder, JsonValidator, XmlValidator } from '@hari/playwright-core';

export class UserApiService {
  private apiClient: ApiClient;
  private jsonValidator: JsonValidator;
  private xmlValidator: XmlValidator;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
    this.jsonValidator = new JsonValidator();
    this.xmlValidator = new XmlValidator();
  }

  /**
   * Fetches users from the mock API using RequestBuilder.
   * 
   * @param limit - Optional number of users to retrieve
   */
  async getUsers(limit?: number) {
    const builder = new RequestBuilder('/users', 'GET');
    if (limit !== undefined) {
      builder.withQueryParam('_limit', limit);
    }
    return await this.apiClient.execute(builder);
  }

  /**
   * Validates a JSON response array against a defined schema.
   */
  validateUsersSchema(data: any): boolean {
    const schema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
        },
        required: ['id', 'name', 'email'],
      },
    };
    return this.jsonValidator.validate(schema, data);
  }

  /**
   * Validates and parses an XML payload.
   */
  validateAndParseXml(xmlData: string): any {
    this.xmlValidator.validate(xmlData);
    return this.xmlValidator.parse(xmlData);
  }
}
