# Playwright API-Only Test Project (BDD Cucumber Style)

This project has been scaffolded using `@hari/playwright-core` and is optimized specifically for **API-only BDD testing** using Cucumber.js (`@cucumber/cucumber`).

## Project Structure

```
├── features/
│   └── api.feature              # Gherkin feature files describing API scenarios
├── steps/
│   └── api.steps.ts             # Cucumber step definitions
├── pages/
│   └── api/
│       └── UserApiService.ts    # Service class encapsulating endpoint interactions and validations
├── support/
│   └── setup.ts                 # Cucumber hooks and World setup (API-only setup, no browser launched)
├── test-data/
│   ├── dev.json                 # Environment specific JSON test data (Development)
│   └── qa.json                  # Environment specific JSON test data (QA)
├── .env.example                 # Example configuration file
├── cucumber.js                  # Configuration mapping features, steps, support files and reporters
├── runconfig.json               # Runtime configurations (parallelism, environments, retries, etc.)
└── tsconfig.json                # TypeScript compiler choices
```

## Features Demonstrated

1. **Gherkin & BDD Syntax**: Express testing scenarios using human-readable Feature, Scenario, Given, When, Then steps.
2. **RequestBuilder**: Fluidly builds request endpoints, query parameters, HTTP methods, headers, and payloads.
3. **JsonValidator**: Enforces response structure contract testing via JSON Schema checks (uses `ajv` under the hood).
4. **XmlValidator**: Performs syntactic XML validation and returns parsed JS objects for assertions.
5. **TokenService**: Contains examples for automatically retrieving, caching, and injecting OAuth bearer tokens.

## Running Tests

1. Run `npm install` to load all required packages.
2. Copy `.env.example` to `.env` (or configure `.env.qa`, `.env.dev` etc.).
3. Run the tests:
   ```bash
   npm run test
   ```
