<div align="center">
  <img src="https://playwright.dev/img/playwright-logo.svg" width="120" alt="Playwright Logo" />
  <h1>@hari/playwright-core</h1>
  <p><strong>Enterprise-grade Playwright Platform Framework</strong></p>
</div>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-scaffolding-a-new-project">Scaffolding</a> •
  <a href="#-core-modules">Core Modules</a>
</p>

---

`@hari/playwright-core` is a centralized, modular test automation framework built on top of [Playwright](https://playwright.dev/). It provides enterprise-grade abstractions, reusable base fixtures, an intuitive API client, and a powerful CLI tool to scaffold new testing projects consistently across your organization.

## 🚀 Features

- **Project Scaffolding**: Instantly generate complete, standardized testing projects using our built-in CLI.
- **Multiple Test Runners**: Support for native Playwright, `playwright-bdd`, and `@cucumber/cucumber`.
- **Page Object Model (POM)**: Scaffolded templates follow strict, maintainable POM patterns for both UI and API tests.
- **Centralized Core Utilities**: Reusable API clients and environment configurations exported right out of the box.
- **Dynamic Template Injection**: Automatically customize scaffolded files with your target project name.

## 📦 Installation

To use the core utilities in your existing project, install the package via npm:

```bash
npm install @hari/playwright-core
```

*(Ensure you have its peer dependencies `@playwright/test` and `typescript` installed).*

## 🏗️ Scaffolding a New Project

The quickest way to start a new test automation project with enterprise standards is to use the `init` command. This CLI command scaffolds a complete directory structure, configuration files, and sample POM tests.

### Basic Usage

Run the CLI via `npx` in an empty directory:

```bash
npx @hari/playwright-core init --name my-awesome-tests
```

### CLI Options

| Option | Default | Description |
|--------|---------|-------------|
| `--name` | `playwright-tests` | Name of your project (injected into `package.json` and templates). |
| `--type` | `bdd` | The testing style. Choices: `bdd` or `non-bdd`. |
| `--runner` | `playwright-bdd` | (If `type=bdd`) The test runner to use. Choices: `playwright-bdd` or `cucumber`. |

### Examples

**1. Native Playwright (Non-BDD)**
```bash
npx @hari/playwright-core init --name ui-regression --type non-bdd
```

**2. Playwright BDD**
```bash
npx @hari/playwright-core init --name bdd-e2e --type bdd --runner playwright-bdd
```

**3. Cucumber BDD**
```bash
npx @hari/playwright-core init --name cucumber-e2e --type bdd --runner cucumber
```

After scaffolding, follow the printed instructions:
1. Run `npm install`
2. Copy `.env.example` to `.env`
3. Run `npm run test`

## 🛠️ Core Modules

If you are extending the framework or building tests manually, you can import core utilities directly from the package:

```typescript
import { 
  baseFixtures, 
  ApiClient, 
  envConfig 
} from '@hari/playwright-core';
```

### 1. `baseFixtures`
Extended Playwright test fixtures providing custom setups, reporting hooks, or specialized logging to keep your spec files clean.

### 2. `ApiClient`
A wrapper around Playwright's `APIRequestContext` that simplifies API testing. It handles token injection, standardized logging, and common REST operations.

### 3. `envConfig`
A strongly-typed configuration module that parses your `.env` files and exposes your environment variables (like URLs, credentials, and toggles) securely.

### 4. `withBrowserStack`
An opt-in configuration wrapper that connects your Playwright tests to BrowserStack for cloud execution. 

To use it, wrap your base configuration in `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';
import { withBrowserStack } from '@hari/playwright-core';

const baseConfig = defineConfig({
  testDir: './tests',
  projects: [
    { name: 'Chrome', use: { browserName: 'chromium' } },
  ],
});

export default withBrowserStack(baseConfig);
```

To execute tests on BrowserStack, run your tests with the `USE_BROWSERSTACK=true` environment variable and provide your credentials:

```bash
USE_BROWSERSTACK=true BROWSERSTACK_USERNAME=myUser BROWSERSTACK_ACCESS_KEY=myKey npm test
```

If `USE_BROWSERSTACK` is missing or set to `false`, it gracefully falls back to local execution.
Additionally, any Playwright project with `"api"` in its name (e.g., `name: 'API Tests'`) is automatically excluded from BrowserStack execution, keeping API tests fast and local.

---
<div align="center">
  <i>Built for scale. Maintained with ❤️ by hari.</i>
</div>
