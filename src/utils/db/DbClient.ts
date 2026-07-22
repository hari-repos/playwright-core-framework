/**
 * Interface representing a generic database connection client.
 * Individual teams should provide their own driver-specific implementations
 * (e.g., using 'pg', 'mysql2', or 'mongodb') that conform to this interface.
 */
export interface IDbClient {
  /**
   * Connects to the database.
   */
  connect(): Promise<void>;

  /**
   * Disconnects from the database.
   */
  disconnect(): Promise<void>;

  /**
   * Executes a query against the database.
   * 
   * @param query The SQL or NoSQL query string.
   * @param params Optional parameters for the query.
   * @returns The raw result from the database driver.
   */
  query<T = any>(query: string, params?: any[]): Promise<T>;
}

/**
 * A basic abstract class for a SQL Database Client that teams can extend.
 */
export abstract class AbstractSqlDbClient implements IDbClient {
  protected connectionString: string;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract query<T = any>(query: string, params?: any[]): Promise<T>;

  /**
   * Helper utility to safely extract the first row of a query result.
   */
  async queryFirst<T = any>(query: string, params?: any[]): Promise<T | null> {
    const results = await this.query<T[]>(query, params);
    if (Array.isArray(results) && results.length > 0) {
      return results[0] ?? null;
    }
    return null;
  }
}
