# {{PROJECT_NAME}}

This project was generated using `@hari/playwright-core` with native `@cucumber/cucumber` support.

## Getting Started

1. Run `npm install` to install dependencies.
2. Copy `.env.example` to `.env`.
3. Write your BDD tests inside `features/` using Gherkin syntax.
4. Implement step definitions in `features/steps/`.

## Running Tests

Run Cucumber JS:
`npx cucumber-js`

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
