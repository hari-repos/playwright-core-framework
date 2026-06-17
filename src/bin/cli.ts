#!/usr/bin/env node

import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parses command line arguments to determine initialization options.
 * @returns Object containing scaffolding preferences (type, runner, project name, etc.).
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let isInit = false;
  
  const config = {
    type: 'bdd',
    runner: 'playwright-bdd',
    projectName: 'playwright-tests',
  };

  const argMap: Record<string, keyof typeof config> = {
    '--type': 'type',
    '--runner': 'runner',
    '--name': 'projectName',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === undefined) {
      continue;
    }
    if (arg === 'init') {
      isInit = true;
    } else {
      const key = argMap[arg];
      if (key) {
        const val = args[i + 1];
        if (val) {
          config[key] = val;
          i++;
        }
      }
    }
  }

  return { isInit, ...config };
}

/**
 * Scaffolds and updates the target directory's package.json file.
 * Injects necessary testing dependencies based on the chosen framework and runner.
 * 
 * @param targetDir The directory where the new project is being scaffolded.
 * @param type The testing type ('bdd' or 'non-bdd').
 * @param runner The BDD runner ('playwright-bdd' or 'cucumber').
 * @param projectName The custom project name to inject.
 */
async function updatePackageJson(targetDir: string, type: string, runner: string, projectName: string) {
  const pkgPath = path.join(targetDir, 'package.json');
  let pkg: any = {
    name: projectName,
    version: '1.0.0',
    type: 'module',
    scripts: {},
    devDependencies: {}
  };

  if (fs.existsSync(pkgPath)) {
    pkg = await fs.readJson(pkgPath);
  }
  
  pkg.type = 'module';

  pkg.devDependencies = pkg.devDependencies || {};
  pkg.scripts = pkg.scripts || {};

  pkg.devDependencies['@playwright/test'] = '^1.44.1';
  pkg.devDependencies['typescript'] = '^5.4.5';
  pkg.devDependencies['@types/node'] = '^20.12.12';
  pkg.devDependencies['allure'] = '^3.10.0';
  pkg.devDependencies['@allurereport/plugin-awesome'] = '^3.10.0';
  pkg.devDependencies['browserstack-node-sdk'] = '^1.31.0';
  pkg.devDependencies['@hari/playwright-core'] = '^1.0.0';

  if (type === 'bdd' && runner === 'cucumber') {
    pkg.devDependencies['allure-cucumberjs'] = '^3.0.0-beta.5';
  } else {
    pkg.devDependencies['allure-playwright'] = '^3.10.0';
  }
  pkg.scripts['report:open'] = 'hari-serve-report';
  pkg.scripts['report:download'] = 'hari-serve-report --single-file';

  if (type === 'bdd') {
    if (runner === 'playwright-bdd') {
      pkg.devDependencies['playwright'] = '^1.44.1';
      pkg.devDependencies['playwright-bdd'] = '^9.0.0';
      pkg.scripts['test'] = 'hari-test-runner --type bdd --runner playwright-bdd';
    } else if (runner === 'cucumber') {
      pkg.devDependencies['@cucumber/cucumber'] = '^10.8.0';
      pkg.devDependencies['tsx'] = '^4.11.0';
      pkg.scripts['test'] = 'hari-test-runner --type bdd --runner cucumber';
      // Cucumber uses a different allure reporter, but we provide it for playwright mostly
    }
  } else {
    pkg.scripts['test'] = 'hari-test-runner --runner playwright';
  }

  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  console.log(`📦 Updated package.json with necessary dependencies and scripts.`);
}

/**
 * Main CLI execution function.
 * Validates arguments, selects the correct template, copies files, and
 * orchestrates the dynamic replacement of project names.
 */
async function init() {
  const { isInit, type, runner, projectName } = parseArgs();

  if (!isInit) {
    console.log(`Usage: npx @hari/playwright-core init [--name <projectName>] [--type bdd|non-bdd] [--runner playwright-bdd|cucumber]`);
    process.exit(1);
  }

  let templateSubDir = 'non-bdd';
  if (type === 'bdd') {
    templateSubDir = runner === 'cucumber' ? 'bdd-cucumber' : 'bdd-playwright';
  }

  const targetDir = process.cwd();
  const templatesDir = path.join(__dirname, '..', '..', 'templates', templateSubDir);

  console.log(`🚀 Initializing new @hari/playwright-core project (${templateSubDir}) in ${targetDir}...`);

  try {
    if (!fs.existsSync(templatesDir)) {
      console.error(`❌ Error: Templates directory not found at ${templatesDir}`);
      process.exit(1);
    }

    console.log(`📂 Copying framework templates...`);
    await fs.copy(templatesDir, targetDir);

    // Copy common template configuration files
    const commonDir = path.join(__dirname, '..', '..', 'templates', 'common');
    if (fs.existsSync(commonDir)) {
      console.log(`📂 Copying common template configuration files...`);
      const gitignoreTemplate = path.join(commonDir, '.gitignore.template');
      const targetGitignore = path.join(targetDir, '.gitignore');
      if (fs.existsSync(gitignoreTemplate)) {
        await fs.copy(gitignoreTemplate, targetGitignore);
      }

      const npmrcTemplate = path.join(commonDir, '.npmrc.template');
      const targetNpmrc = path.join(targetDir, '.npmrc');
      if (fs.existsSync(npmrcTemplate)) {
        await fs.copy(npmrcTemplate, targetNpmrc);
      }

      const bstackTemplate = path.join(commonDir, 'browserstack.yml.template');
      const targetBstack = path.join(targetDir, 'browserstack.yml');
      if (fs.existsSync(bstackTemplate)) {
        await fs.copy(bstackTemplate, targetBstack);
      }

      if (type === 'bdd') {
        const vscodeTemplate = path.join(commonDir, '.vscode', 'settings.json');
        const targetVscode = path.join(targetDir, '.vscode', 'settings.json');
        if (fs.existsSync(vscodeTemplate)) {
          await fs.copy(vscodeTemplate, targetVscode);
        }
      }
    }

    const replaceProjectNameInFiles = async (dir: string) => {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          if (file !== 'node_modules' && file !== '.git') {
            await replaceProjectNameInFiles(filePath);
          }
        } else if (stat.isFile()) {
          try {
            let content = await fs.readFile(filePath, 'utf-8');
            if (content.includes('{{PROJECT_NAME}}')) {
              content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
              await fs.writeFile(filePath, content, 'utf-8');
            }
          } catch (e) {
            // Ignore errors for binary files
          }
        }
      }
    };
    await replaceProjectNameInFiles(targetDir);

    await updatePackageJson(targetDir, type, runner, projectName);

    console.log(`✅ Project successfully scaffolded!`);
    console.log(`\nNext Steps:`);
    console.log(`1. Run 'npm install' to install the injected dependencies.`);
    console.log(`2. Copy '.env.example' to '.env' and update your configuration.`);
    if (type === 'bdd' && runner === 'playwright-bdd') {
      console.log(`3. Run 'npm run test' which will execute bddgen and Playwright.\n`);
    } else if (type === 'bdd' && runner === 'cucumber') {
      console.log(`3. Run 'npm run test' to execute cucumber-js.\n`);
    } else {
      console.log(`3. Run 'npm run test' to execute your baseline tests.\n`);
    }
  } catch (error) {
    console.error(`❌ Failed to initialize project:`, error);
    process.exit(1);
  }
}

init();
