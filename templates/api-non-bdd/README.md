# Playwright API-Only Test Project (Non-BDD Style)

This project has been scaffolded using `@hari/playwright-core` and is optimized specifically for **API-only testing** without any UI dependencies or digital/web visual overhead.

## Project Structure

```
├── pages/
│   └── api/
│       └── UserApiService.ts    # Service class encapsulating endpoint interactions and validations
├── test-data/
│   ├── dev.json                 # Environment specific JSON test data (Development)
│   └── qa.json                  # Environment specific JSON test data (QA)
├── tests/
│   └── api/
│       └── example.spec.ts      # API Playwright test specs using RequestBuilder, JsonValidator, and XmlValidator
├── .env.example                 # Example configuration file
├── playwright.config.ts         # Baseline Playwright configuration tuned for API-only execution
├── runconfig.json               # Runtime configurations (parallelism, environments, retries, etc.)
└── tsconfig.json                # TypeScript compiler choices
```

## Features Demonstrated

1. **RequestBuilder**: Fluidly builds request endpoints, query parameters, HTTP methods, headers, and payloads.
2. **JsonValidator**: Enforces response structure contract testing via JSON Schema checks (uses `ajv` under the hood).
3. **XmlValidator**: Performs syntactic XML validation and returns parsed JS objects for assertions.
4. **TokenService**: Contains examples (in comments) for automatically retrieving, caching, and injecting OAuth bearer tokens using Client Credentials grant types.

## Running Tests

1. Run `npm install` to load all required packages.
2. Copy `.env.example` to `.env` (or configure `.env.qa`, `.env.dev` etc.).
3. Run the tests:
   ```bash
   npm run test
   ```
