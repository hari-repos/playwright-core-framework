import { test, expect } from '@playwright/test';
import { JsonValidator } from '../../src/utils/validators/JsonValidator.js';

test.describe('JsonValidator', () => {
  const schema = {
    type: 'object',
    properties: {
      foo: { type: 'string' },
      bar: { type: 'number', maximum: 10 }
    },
    required: ['foo'],
    additionalProperties: false
  };

  test('should pass validation for valid data', () => {
    const validator = new JsonValidator();
    const data = { foo: 'hello', bar: 5 };
    
    expect(validator.validate(schema, data)).toBe(true);
    expect(validator.isValid(schema, data)).toBe(true);
  });

  test('should throw error for invalid data', () => {
    const validator = new JsonValidator();
    const data = { foo: 'hello', bar: 15 }; // bar > 10
    
    expect(() => validator.validate(schema, data)).toThrow(/JSON Schema Validation Failed/);
    expect(validator.isValid(schema, data)).toBe(false);
  });

  test('should throw error for missing required properties', () => {
    const validator = new JsonValidator();
    const data = { bar: 5 }; // missing foo
    
    expect(() => validator.validate(schema, data)).toThrow(/JSON Schema Validation Failed: '' must have required property 'foo'/);
    expect(validator.isValid(schema, data)).toBe(false);
  });
});
