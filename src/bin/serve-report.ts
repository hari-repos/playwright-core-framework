#!/usr/bin/env node

import fs from 'fs-extra';
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

const latestRun = runs[0];
if (!latestRun) {
  console.error(`❌ No run directories found in ${reportsDir}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const isSingleFile = args.includes('--single-file');
const targetRunName = args.find(arg => !arg.startsWith('--'));

let targetRunDir: string;
let targetRun: string;

if (targetRunName) {
  targetRunDir = path.join(reportsDir, targetRunName);
  targetRun = targetRunName;
  if (!fs.existsSync(targetRunDir)) {
    console.error(`❌ Specified run directory not found: ${targetRunDir}`);
    process.exit(1);
  }
} else {
  targetRun = latestRun.name;
  targetRunDir = latestRun.path;
}

const allureResultsDir = path.join(targetRunDir, 'allure-results');
const allureReportDir = path.join(targetRunDir, 'allure-report');

if (!fs.existsSync(allureResultsDir)) {
  console.error(`❌ No allure-results found in ${targetRunDir}`);
  process.exit(1);
}



if (isSingleFile) {
  console.log(`📊 Generating SINGLE-FILE Allure report for: ${targetRun}`);
  const singleFileReportDir = path.join(targetRunDir, 'allure-report-single');
  try {
    execSync(`npx allure awesome ${allureResultsDir} -o ${singleFileReportDir} --single-file`, { stdio: 'inherit' });
    console.log(`✅ Single file report generated at ${singleFileReportDir}/index.html`);
  } catch (error) {
    console.error(`❌ Failed to generate single file Allure report`, error);
    process.exit(1);
  }
} else {
  console.log(`📊 Generating and serving Allure report for: ${targetRun}`);
  try {
    execSync(`npx allure generate ${allureResultsDir} -o ${allureReportDir} --clean`, { stdio: 'inherit' });
    execSync(`npx allure open ${allureReportDir}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ Failed to serve Allure report`, error);
    process.exit(1);
  }
}
