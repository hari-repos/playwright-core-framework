# {{PROJECT_NAME}}

This project was generated using `@hari/playwright-core` with native `playwright-bdd` support.

## Getting Started

1. Run `npm install` to install dependencies.
2. Copy `.env.example` to `.env`.
3. Write your BDD tests inside `features/` using Gherkin syntax.
4. Implement step definitions in `steps/`.

## Running Tests

First, you MUST generate the spec files from features by running:
`npx bddgen`

Then run Playwright as usual:
`npx playwright test`

Or run both in one step:
`npx bddgen && npx playwright test`
