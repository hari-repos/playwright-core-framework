# {{PROJECT_NAME}}

This project was generated using `@hari/playwright-core`. It includes baseline configurations for Digital UI and API testing.

## Getting Started

1. Clone the repository and run `npm install`.
2. Copy `.env.example` to `.env` and fill in the required environment variables.
3. Add your Page Object Models inside `pages/`.
4. Write your Digital UI tests inside `tests/digital/`.
5. Write your API tests inside `tests/api/`.

## Running Tests

- Run all tests: `npx playwright test`
- Run only API tests: `npx playwright test tests/api`
- Run tests in UI mode: `npx playwright test --ui`
