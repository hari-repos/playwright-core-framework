import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Playwright Test does not support jest.mock(). We will rely on actual envConfig.
// Let's test testData using actual file generation.

import { getTestData } from '../../src/utils/testData.js';
import { envConfig } from '../../src/config/envConfig.js';

test.describe('testData Unit Tests', () => {
  const testDataDir = path.join(process.cwd(), 'test-data-scratch');
  const envFile = path.join(testDataDir, `${envConfig.env.toLowerCase()}.json`);

  test.beforeAll(() => {
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir);
    }
  });

  test.afterAll(() => {
    if (fs.existsSync(envFile)) {
      fs.unlinkSync(envFile);
    }
    if (fs.existsSync(testDataDir)) {
      fs.rmdirSync(testDataDir);
    }
  });

  test('should load data from current environment JSON file', () => {
    fs.writeFileSync(envFile, JSON.stringify({ key: 'value', num: 42 }));

    const data = getTestData<{ key: string, num: number }>('test-data-scratch');
    expect(data).toBeDefined();
    expect(data.key).toBe('value');
    expect(data.num).toBe(42);
  });

  test('should throw an error if environment JSON file is missing', () => {
    if (fs.existsSync(envFile)) {
      fs.unlinkSync(envFile);
    }
    
    expect(() => getTestData('test-data-scratch')).toThrow(/Test data file not found/);
  });
});
