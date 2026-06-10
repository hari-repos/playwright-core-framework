#!/usr/bin/env node

import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';

const reportsDir = path.join(process.cwd(), 'reports');

if (!fs.existsSync(reportsDir)) {
  console.error(`❌ No reports directory found at ${reportsDir}`);
  process.exit(1);
}

const runs = fs.readdirSync(reportsDir)
  .filter(dir => dir.startsWith('run-'))
  .map(dir => ({
    name: dir,
    path: path.join(reportsDir, dir),
    time: fs.statSync(path.join(reportsDir, dir)).mtime.getTime()
  }))
  .sort((a, b) => b.time - a.time);

if (runs.length === 0) {
  console.error(`❌ No run directories found in ${reportsDir}`);
  process.exit(1);
}

const latestRun = runs[0].name;
const latestRunDir = runs[0].path;
const allureResultsDir = path.join(latestRunDir, 'allure-results');
const allureReportDir = path.join(latestRunDir, 'allure-report');

if (!fs.existsSync(allureResultsDir)) {
  console.error(`❌ No allure-results found in ${latestRunDir}`);
  process.exit(1);
}

console.log(`📊 Generating and serving Allure report for: ${latestRun}`);

try {
  execSync(`npx allure generate ${allureResultsDir} -o ${allureReportDir} --clean`, { stdio: 'inherit' });
  execSync(`npx allure open ${allureReportDir}`, { stdio: 'inherit' });
} catch (error) {
  console.error(`❌ Failed to serve Allure report`, error);
  process.exit(1);
}
