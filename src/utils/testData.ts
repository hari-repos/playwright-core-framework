import * as fs from 'fs';
import * as path from 'path';
import { envConfig } from '../config/envConfig.js';

/**
 * Loads and parses test data from a JSON file based on the currently active test environment (`TEST_ENV`).
 * By default, it looks for files like `test-data/qa.json`, `test-data/dev.json` in the project root.
 * 
 * @template T The expected type of the test data object to be returned.
 * @param dirPath The directory containing the environment-specific JSON files. Defaults to `'test-data'`.
 * @returns {T} The parsed test data object strongly typed as `T`.
 * @throws {Error} If the file is not found or fails to parse as valid JSON.
 * 
 * @example
 * ```typescript
 * interface UserData {
 *   adminEmail: string;
 * }
 * 
 * const data = getTestData<UserData>('fixtures/data');
 * console.log(data.adminEmail);
 * ```
 */
export const getTestData = <T>(dirPath: string = 'test-data'): T => {
  const env = (envConfig.env || 'qa').toLowerCase();
  const filePath = path.join(process.cwd(), dirPath, `${env}.json`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test data file not found for environment '${env}' at path: ${filePath}`);
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(rawData) as T;
  } catch (error) {
    throw new Error(`Failed to parse test data file at ${filePath}: ${(error as Error).message}`);
  }
};
