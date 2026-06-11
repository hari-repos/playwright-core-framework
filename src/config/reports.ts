/**
 * Retrieves the directory path for storing test reports for the current run.
 * If not already set in the environment variables (`TEST_RUN_DIR`), it generates
 * a timestamped directory name and sets it.
 * 
 * @returns {string} The path to the test report directory.
 */
export function getReportDirectory(): string {
  if (!process.env.TEST_RUN_DIR) {
    const now = new Date();
    // format: YYYY-MM-DDTHH-mm-ss
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    process.env.TEST_RUN_DIR = `reports/run-${timestamp}`;
  }
  return process.env.TEST_RUN_DIR;
}
