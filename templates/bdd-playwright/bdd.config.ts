import { createBdd } from 'playwright-bdd';
import { test } from '@hari/playwright-core';

export const { Given, When, Then, step } = createBdd(test);
