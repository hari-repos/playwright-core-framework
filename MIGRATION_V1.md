# Migration Guide: Upgrading to v1.0.0

Version `1.0.0` introduces a unified CLI runner and migrates cloud execution from a raw CDP wrapper to the official `browserstack-node-sdk` for enhanced stability, perfect 1-to-1 session mapping, and out-of-the-box compatibility with the Playwright VSCode extension.

Because of this architectural shift, the legacy `withBrowserStack` configuration wrapper has been completely removed. If you scaffolded a project prior to `1.0.0`, you must follow these quick steps to upgrade your project.

---

### Step 1: Remove `withBrowserStack` from your Playwright Config

Open your `playwright.config.ts` and remove the `withBrowserStack` wrapper.

**Before:**
```typescript
import { withRunConfig, withBrowserStack } from '@hari/playwright-core';
...
export default withBrowserStack(withRunConfig(baseConfig));
```

**After:**
```typescript
import { withRunConfig } from '@hari/playwright-core';
...
export default withRunConfig(baseConfig);
```

---

### Step 2: Install the BrowserStack SDK

Run the following command in your project root to install the official BrowserStack SDK:
```bash
npm install browserstack-node-sdk --save-dev
```

---

### Step 3: Update your `package.json` scripts

We have introduced a smart test runner CLI (`hari-test-runner`) that intercepts your tests and securely merges your `runconfig.json` with the BrowserStack SDK on the fly. 

Update your `package.json` scripts so that the `"test"` command uses the new runner:

**Before:**
```json
"scripts": {
  "test": "npm run bddgen && playwright test"
}
```

**After:**
```json
"scripts": {
  "test": "hari-test-runner --runner playwright"
}
```
*(If you are using Playwright-BDD, use `"hari-test-runner --type bdd --runner playwright-bdd"`)*
*(If you are using Cucumber, use `"hari-test-runner --type bdd --runner cucumber"`)*

---

### Step 4: Add `browserstack.yml`

Create a file named `browserstack.yml` in your project root. The `hari-test-runner` uses this file as a base template to inject advanced configurations without exposing credentials.

```yaml
userName: ${BROWSERSTACK_USERNAME}
accessKey: ${BROWSERSTACK_ACCESS_KEY}

platforms:
  - os: Windows
    osVersion: 11
    browserName: Chrome
    browserVersion: latest

# Advanced Configuration
browserstackLocal: false
buildName: Default Enterprise Build
projectName: Enterprise Project
```

You are now fully upgraded! Running `npm run test` will seamlessly execute locally or securely execute in the cloud using the official SDK depending on your `runconfig.json` settings.
