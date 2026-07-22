# {{PROJECT_NAME}}

This project was generated using `@hari/playwright-core` with native `playwright-bdd` support.

## Features & Capabilities

- **BDD UI Testing**: Define human-readable test steps compiled directly to native Playwright execution.
- **BDD API Testing**: Fully supports fluent request building (`RequestBuilder`), JSON schema validation (`JsonValidator`), syntactic XML validation/parsing (`XmlValidator`), and OAuth credentials token lifecycle management (`TokenService`) inside your step definitions.

## Getting Started

1. Run `npm install` to install dependencies.
2. Copy `.env.example` to `.env`.
3. Write your BDD tests inside `features/` using Gherkin syntax (see `features/api.feature` for reference).
4. Implement step definitions in `steps/` (see `steps/api.steps.ts` for reference).

## Running Tests

First, you MUST generate the spec files from features by running:
`npx bddgen`

Then run Playwright as usual:
`npx playwright test`

Or run both in one step:
`npx bddgen && npx playwright test`

## 📊 Allure Reporting Guidelines

The core framework automatically attaches screenshots, videos, and API request/response logs to your Allure report on failure. 

To categorize your BDD tests in the Allure dashboard, use Gherkin tags in your `.feature` files:

```gherkin
@epic("WebInterface")
@story("HomepageNavigation")
Feature: Digital UI Tests

  @severity("critical")
  Scenario: Homepage has title
    Given I am on the Playwright homepage
```

View your report anytime:
- `npm run report:open` (Serves the dashboard locally)
- `npm run report:download` (Generates a standalone, shareable single-file HTML report)
