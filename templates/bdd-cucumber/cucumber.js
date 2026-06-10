import { getReportDirectory } from '@hari/playwright-core';
const runDir = getReportDirectory();

export default {
  paths: ['features/**/*.feature'],
  import: ['support/**/*.ts', 'steps/**/*.ts'],
  format: [
    'progress', 
    `html:${runDir}/cucumber-report.html`, 
    `allure-cucumberjs/reporter`
  ],
  formatOptions: {
    resultsDir: `${runDir}/allure-results`
  }
};
