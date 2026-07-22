# {{PROJECT_NAME}}

This project was generated using `@hari/playwright-core`. It includes baseline configurations for Digital UI and API testing.

## Features & Capabilities

- **Digital UI Testing**: Enforces Page Object Models (POM) and clean browser context handling.
- **Advanced API Testing**: Out-of-the-box support for fluent request building (`RequestBuilder`), JSON schema validation (`JsonValidator`), syntactic XML validation/parsing (`XmlValidator`), and OAuth credentials token lifecycle management (`TokenService`).

## Getting Started

1. Clone the repository and run `npm install`.
2. Copy `.env.example` to `.env` and fill in the required environment variables.
3. Add your Page Object Models inside `pages/`.
4. Write your Digital UI tests inside `tests/digital/`.
5. Write your API tests inside `tests/api/` (see `tests/api/example.spec.ts` for reference).

## Running Tests

- Run all tests: `npx playwright test`
- Run only API tests: `npx playwright test tests/api`
- Run tests in UI mode: `npx playwright test --ui`

## 📊 Allure Reporting Guidelines

The core framework automatically attaches screenshots, videos, and API request/response logs to your Allure report on failure. 

To make your reports rich and well-organized, project teams should manually annotate their specs:

1. **Categorize your tests** using `allure-playwright`:
```typescript
import * as allure from 'allure-playwright';

test('My Test', async () => {
  allure.epic('My Epic');
  allure.story('My Story');
  allure.severity('critical');
});
```

2. **Break down your test logic** into steps using `test.step()`:
```typescript
await test.step('Login to application', async () => {
  await page.fill('#username', 'user');
  await page.click('#login');
});
```

View your report anytime:
- `npm run report:open` (Serves the dashboard locally)
- `npm run report:download` (Generates a standalone, shareable single-file HTML report)
