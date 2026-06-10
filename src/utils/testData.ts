import * as fs from 'fs';
import * as path from 'path';
import { envConfig } from '../config/envConfig.js';

/**
 * Loads test data from a JSON file based on the current test environment.
 * Default location is `test-data/${env}.json` in the project root.
 * 
 * @param dirPath The directory containing the environment-specific JSON files. Defaults to 'test-data'.
 * @returns The parsed test data object.
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
