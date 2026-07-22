import { test, expect } from '@playwright/test';
import { getReportDirectory } from '../../src/config/reports.js';

test.describe('reports Config Unit Tests', () => {
  let originalDir: string | undefined;

  test.beforeEach(() => {
    originalDir = process.env.TEST_RUN_DIR;
    delete process.env.TEST_RUN_DIR;
  });

  test.afterEach(() => {
    if (originalDir === undefined) {
      delete process.env.TEST_RUN_DIR;
    } else {
      process.env.TEST_RUN_DIR = originalDir;
    }
  });

  test('should generate a timestamped directory if TEST_RUN_DIR is not set', () => {
    const dir = getReportDirectory();
    expect(dir).toMatch(/^reports\/run-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/);
    // ensure it caches in env
    expect(process.env.TEST_RUN_DIR).toBe(dir);
  });

  test('should return existing TEST_RUN_DIR if already set', () => {
    process.env.TEST_RUN_DIR = 'custom-reports-dir';
    const dir = getReportDirectory();
    expect(dir).toBe('custom-reports-dir');
  });
});
