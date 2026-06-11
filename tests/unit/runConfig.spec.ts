import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { withRunConfig } from '../../src/config/runConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('runConfig Unit Tests', () => {
const uniqueId = `${process.pid}-${Math.random().toString(36).substring(7)}`;
  const testConfigDir = path.join(__dirname, `temp-config-${uniqueId}`);
  const runConfigPath = path.join(testConfigDir, 'runconfig.json');

  test.beforeAll(() => {
    if (!fs.existsSync(testConfigDir)) {
      fs.mkdirSync(testConfigDir);
    }
  });

  test.afterAll(() => {
    if (fs.existsSync(testConfigDir)) {
      fs.rmSync(testConfigDir, { recursive: true, force: true });
    }
  });

  test.afterEach(() => {
    if (fs.existsSync(runConfigPath)) {
      fs.unlinkSync(runConfigPath);
    }
  });

  test('should return base config if runconfig.json does not exist', () => {
    const baseConfig = { timeout: 10000 };
    const mergedConfig = withRunConfig(baseConfig, testConfigDir);
    
    expect(mergedConfig.timeout).toBe(10000);
  });

  test('should merge values from runconfig.json', () => {
    fs.writeFileSync(runConfigPath, JSON.stringify({
      timeout: 20000,
      retries: 2,
      headless: true
    }));

    const baseConfig = { timeout: 10000, use: { headless: false } };
    const mergedConfig = withRunConfig(baseConfig, testConfigDir);
    
    expect(mergedConfig.timeout).toBe(20000);
    expect(mergedConfig.retries).toBe(2);
    expect(mergedConfig.use?.headless).toBe(true);
  });

  test('should override browsers if provided in runconfig.json', () => {
    fs.writeFileSync(runConfigPath, JSON.stringify({
      browsers: ['firefox', 'webkit']
    }));

    const baseConfig = { projects: [{ name: 'chromium' }] };
    const mergedConfig = withRunConfig(baseConfig, testConfigDir);
    
    expect(mergedConfig.projects).toHaveLength(2);
    expect(mergedConfig.projects![0].name).toBe('firefox');
    expect(mergedConfig.projects![1].name).toBe('webkit');
  });

  test('should handle percentage string workers', () => {
    fs.writeFileSync(runConfigPath, JSON.stringify({
      workers: '50%'
    }));

    const baseConfig = {};
    const mergedConfig = withRunConfig(baseConfig, testConfigDir);
    
    expect(mergedConfig.workers).toBe('50%');
  });
});
