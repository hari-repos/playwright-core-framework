const { getReportDirectory } = require('@hari/playwright-core');
const runDir = getReportDirectory();

module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['support/**/*.ts', 'steps/**/*.ts'],
    format: [
      'progress', 
      `html:${runDir}/cucumber-report.html`, 
      `allure-cucumberjs/reporter`
    ],
    formatOptions: {
      resultsDir: `${runDir}/allure-results`
    }
  }
};
