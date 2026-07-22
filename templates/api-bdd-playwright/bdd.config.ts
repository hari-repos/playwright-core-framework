import { createBdd, test as bddTest, defineBddConfig } from 'playwright-bdd';
import { coreFixtures, type CustomFixtures } from '@hari/playwright-core';

export const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.ts', 'bdd.config.ts'],
});

export const test = bddTest.extend<CustomFixtures>(coreFixtures);

export const { Given, When, Then } = createBdd(test);
