import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Increase timeout for integration tests since they install npm packages
test.setTimeout(120000);

test.describe('Scaffolding Integration Tests', () => {
  test.describe.configure({ mode: 'serial' });

  const scratchDir = path.join(process.cwd(), 'scratch-tests');
  const cliPath = path.join(process.cwd(), 'dist', 'bin', 'cli.js');

  let tgzFile = '';

  test.beforeAll(() => {
    // Ensure the framework is built and packed
    execSync('npm run build', { stdio: 'inherit' });
    const packOutput = execSync('npm pack', { encoding: 'utf-8' });
    const tgzName = packOutput.trim().split('\n').pop() as string;
    tgzFile = path.resolve(process.cwd(), tgzName);

    // Create the scratch directory
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }
  });

  test.afterAll(() => {
    if (fs.existsSync(scratchDir)) {
      fs.rmSync(scratchDir, { recursive: true, force: true });
    }
    if (fs.existsSync(tgzFile)) {
      fs.unlinkSync(tgzFile);
    }
  });

  async function runScaffoldTest(projectName: string, type: string, runner?: string) {
    const projectDir = path.join(scratchDir, projectName);
    
    // 1. Clean previous directory if it exists
    if (fs.existsSync(projectDir)) {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
    fs.mkdirSync(projectDir, { recursive: true });

    // 2. Run CLI
    let cmd = `node ${cliPath} init --name ${projectName} --type ${type}`;
    if (runner) {
      cmd += ` --runner ${runner}`;
    }
    
    console.log(`Running: ${cmd}`);
    execSync(cmd, { cwd: projectDir, stdio: 'inherit' });

    // 3. Setup ENV
    fs.copyFileSync(
      path.join(projectDir, '.env.example'),
      path.join(projectDir, '.env')
    );

    // 4. Update package.json to point to the local packed framework tgz
    const pkgPath = path.join(projectDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.devDependencies = pkg.devDependencies || {};
    pkg.devDependencies['@hari/playwright-core'] = `file:${tgzFile}`;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    // Disable network tests to prevent flaky CI failures
    if (fs.existsSync(path.join(projectDir, 'tests/api/example.spec.ts'))) {
      fs.writeFileSync(path.join(projectDir, 'tests/api/example.spec.ts'), "import { test } from '@playwright/test'; test('mock', () => {});");
    }
    if (fs.existsSync(path.join(projectDir, 'tests/digital/example.spec.ts'))) {
      fs.writeFileSync(path.join(projectDir, 'tests/digital/example.spec.ts'), "import { test } from '@playwright/test'; test('mock', () => {});");
    }
    if (fs.existsSync(path.join(projectDir, 'features/api.feature'))) {
      fs.writeFileSync(path.join(projectDir, 'features/api.feature'), "Feature: Mock API\n  Scenario: Mock API\n    Given I am an API mock");
    }
    if (fs.existsSync(path.join(projectDir, 'features/example.feature'))) {
      fs.writeFileSync(path.join(projectDir, 'features/example.feature'), "Feature: Mock UI\n  Scenario: Mock UI\n    Given I am a UI mock");
    }
    if (fs.existsSync(path.join(projectDir, 'steps/api.steps.ts'))) {
      const bddImport = runner === 'playwright-bdd' ? "import { Given } from '../bdd.config.js';" : "import { Given } from '@cucumber/cucumber';";
      fs.writeFileSync(path.join(projectDir, 'steps/api.steps.ts'), `${bddImport} Given('I am an API mock', () => {});`);
    }
    if (fs.existsSync(path.join(projectDir, 'steps/example.steps.ts'))) {
      const bddImport = runner === 'playwright-bdd' ? "import { Given } from '../bdd.config.js';" : "import { Given } from '@cucumber/cucumber';";
      fs.writeFileSync(path.join(projectDir, 'steps/example.steps.ts'), `${bddImport} Given('I am a UI mock', () => {});`);
    }

    // 5. Install dependencies
    execSync(`npm install --no-package-lock`, { cwd: projectDir, stdio: 'inherit' });

    // 5. Run tests
    console.log(`Running tests in ${projectName}...`);
    const env = { 
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      APPDATA: process.env.APPDATA,
      LOCALAPPDATA: process.env.LOCALAPPDATA,
      CI: process.env.CI
    } as NodeJS.ProcessEnv;
    execSync(`npm run test`, { cwd: projectDir, stdio: 'inherit', env });
    
    // Assert successful generation by checking if reports exist or just relying on exit code 0
    expect(true).toBe(true);
  }

  test('should scaffold and run non-bdd project successfully', async () => {
    await runScaffoldTest('test-non-bdd', 'non-bdd');
  });

  test('should scaffold and run bdd-playwright project successfully', async () => {
    await runScaffoldTest('test-bdd-pw', 'bdd', 'playwright-bdd');
  });

  test('should scaffold and run bdd-cucumber project successfully', async () => {
    await runScaffoldTest('test-bdd-cuke', 'bdd', 'cucumber');
  });
});
