import * as dotenv from 'dotenv';

// Fallback load of default .env if not already loaded (e.g. running standalone scripts)
dotenv.config();

/**
 * Type representing the target testing environment (e.g., 'QA', 'DEV', 'STAGING', 'PROD').
 */
export type TestEnvironment = string;

/**
 * Interface defining the environment configuration variables available during runtime.
 */
export interface EnvConfig {
  /**
   * The current test environment (derived from process.env.TEST_ENV).
   */
  env: TestEnvironment;
  
  /**
   * The base URL for UI tests (derived from process.env.BASE_URL).
   */
  baseURL: string;
  
  /**
   * The base URL for API tests (derived from process.env.API_URL).
   */
  apiUrl: string;
}

const getEnvConfig = (): EnvConfig => {
  const env = process.env.TEST_ENV || 'QA';
  const baseURL = process.env.BASE_URL || '';
  const apiUrl = process.env.API_URL || '';

  return {
    env,
    baseURL,
    apiUrl,
  };
};

export const envConfig = getEnvConfig();
