import * as dotenv from 'dotenv';

// Fallback load of default .env if not already loaded (e.g. running standalone scripts)
dotenv.config();

export type TestEnvironment = string;

export interface EnvConfig {
  env: TestEnvironment;
  baseURL: string;
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
