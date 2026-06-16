#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import { RunConfig } from '../config/runConfig.js';

const configDir = process.cwd();
const runConfigPath = path.resolve(configDir, 'runconfig.json');

let runConfig: RunConfig = {};
if (fs.existsSync(runConfigPath)) {
  try {
    const fileContent = fs.readFileSync(runConfigPath, 'utf-8');
    runConfig = JSON.parse(fileContent) as RunConfig;
  } catch (e) {
    console.warn(`⚠️ Could not parse ${runConfigPath}. Proceeding with base configuration.`, e);
  }
}

// 1. Load Environment Variables to get credentials
const testEnv = (process.env.TEST_ENV || runConfig.testEnv || 'QA').toLowerCase();
dotenv.config({ path: path.resolve(configDir, `.env.${testEnv}`) });
dotenv.config({ path: path.resolve(configDir, '.env'), override: false });

let isBdd = false;
let runnerType = 'playwright'; // 'playwright', 'playwright-bdd', 'cucumber'
let passthroughArgs: string[] = [];

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (!arg) continue;
  
  if (arg === '--type') {
    isBdd = args[i + 1] === 'bdd';
    i++;
  } else if (arg === '--runner') {
    runnerType = args[i + 1] || 'playwright';
    i++;
  } else {
    passthroughArgs.push(arg);
  }
}

const extraFlags = passthroughArgs.length > 0 ? ' ' + passthroughArgs.join(' ') : '';

// 2. Pre-execution hook (BDD generation)
if (isBdd && runnerType === 'playwright-bdd') {
  console.log(`⚙️ Generating BDD features...`);
  try {
    execSync(`npx bddgen`, { stdio: 'inherit', env: process.env });
  } catch (error: any) {
    console.error(`❌ bddgen failed with code ${error.status}`);
    process.exit(error.status || 1);
  }
}

// 3. Resolve the underlying command and SDK wrapper prefix
let sdkCommand = 'playwright';
let commandToRun = 'npx playwright test';

if (runnerType === 'cucumber') {
  sdkCommand = 'cucumber-js';
  commandToRun = 'npx cucumber-js';
  // Inject tsx import directly into the environment, removing the need for cross-env
  process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --import tsx';
} else if (runnerType === 'playwright-bdd' || runnerType === 'playwright') {
  sdkCommand = 'playwright';
  commandToRun = 'npx playwright test';
}

import * as yaml from 'yaml';

// ... (existing imports and config loading remain the same above)
const yamlPath = path.resolve(configDir, 'browserstack.yml');
let bstackConfig: any = {};

if (fs.existsSync(yamlPath)) {
  try {
    const existingYaml = fs.readFileSync(yamlPath, 'utf-8');
    bstackConfig = yaml.parse(existingYaml) || {};
  } catch (e) {
    console.warn(`⚠️ Could not parse existing browserstack.yml. Generating a fresh one.`);
  }
}

if (runConfig.useBrowserStack || process.env.USE_BROWSERSTACK === 'true') {
  console.log(`☁️ BrowserStack execution requested. Updating browserstack.yml...`);

  // Ensure credentials exist (Only if they aren't already embedded in the YAML by the user)
  if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
    console.warn(`⚠️ Missing BROWSERSTACK_USERNAME or BROWSERSTACK_ACCESS_KEY in environment. Assuming they are hardcoded in YAML or CI env.`);
  }

  // Update dynamic properties
  const buildName = process.env.BROWSERSTACK_BUILD_NAME || 'Default Enterprise Build';
  const projectName = path.basename(configDir) || 'Enterprise Project';

  bstackConfig.buildName = buildName;
  bstackConfig.projectName = projectName;
  bstackConfig.userName = bstackConfig.userName || '${BROWSERSTACK_USERNAME}';
  bstackConfig.accessKey = bstackConfig.accessKey || '${BROWSERSTACK_ACCESS_KEY}';

  // Only override platforms if browsers are explicitly specified in runConfig
  if (runConfig.browsers && runConfig.browsers.length > 0) {
    const platforms: any[] = [];
    for (const browser of runConfig.browsers) {
      let browserName = 'Chrome';
      if (browser.toLowerCase().includes('firefox')) browserName = 'Firefox';
      if (browser.toLowerCase().includes('webkit') || browser.toLowerCase().includes('safari')) browserName = 'Safari';
      if (browser.toLowerCase().includes('edge')) browserName = 'Edge';
      
      platforms.push({
        os: 'Windows',
        osVersion: '11',
        browserName: browserName,
        browserVersion: 'latest'
      });
    }
    bstackConfig.platforms = platforms;
  } else if (!bstackConfig.platforms) {
    // Fallback if neither config has platforms
    bstackConfig.platforms = [{
      os: 'Windows',
      osVersion: '11',
      browserName: 'Chrome',
      browserVersion: 'latest'
    }];
  }

  // If local is specified in env, override it. Otherwise, leave user's custom yaml setting.
  if (process.env.BROWSERSTACK_LOCAL) {
    bstackConfig.browserstackLocal = process.env.BROWSERSTACK_LOCAL === 'true';
  }

  // Save the merged config back safely
  const updatedYaml = yaml.stringify(bstackConfig);
  fs.writeFileSync(yamlPath, updatedYaml, 'utf-8');

  // Spawn SDK
  console.log(`🚀 Spawning BrowserStack SDK for command: ${commandToRun}${extraFlags}`);
  try {
    execSync(`npx browserstack-node-sdk ${sdkCommand} ${commandToRun}${extraFlags}`, { stdio: 'inherit', env: process.env });
  } catch (error: any) {
    console.error(`❌ Test execution failed with code ${error.status}`);
    process.exit(error.status || 1);
  }
} else {
  console.log(`💻 Local execution requested. Running: ${commandToRun}${extraFlags}`);
  try {
    execSync(`${commandToRun}${extraFlags}`, { stdio: 'inherit', env: process.env });
  } catch (error: any) {
    console.error(`❌ Test execution failed with code ${error.status}`);
    process.exit(error.status || 1);
  }
}
