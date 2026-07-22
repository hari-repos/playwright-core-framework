import { test, expect } from '@playwright/test';
import { XmlValidator } from '../../src/utils/validators/XmlValidator.js';

test.describe('XmlValidator', () => {
  const validXml = `<?xml version="1.0" encoding="UTF-8"?>
    <note>
      <to>Tove</to>
      <from>Jani</from>
      <heading>Reminder</heading>
      <body>Don't forget me this weekend!</body>
    </note>
  `;

  const invalidXml = `<?xml version="1.0" encoding="UTF-8"?>
    <note>
      <to>Tove</to>
      <from>Jani</from>
      <heading>Reminder</heading>
      <body>Don't forget me this weekend!
    </note>
  `;

  test('should pass validation for valid xml', () => {
    const validator = new XmlValidator();
    expect(validator.validate(validXml)).toBe(true);
    expect(validator.isValid(validXml)).toBe(true);
  });

  test('should throw error for invalid xml', () => {
    const validator = new XmlValidator();
    expect(() => validator.validate(invalidXml)).toThrow(/XML Validation Failed/);
    expect(validator.isValid(invalidXml)).toBe(false);
  });

  test('should parse XML into object', () => {
    const validator = new XmlValidator();
    const result = validator.parse(validXml);
    expect(result.note.to).toBe('Tove');
    expect(result.note.from).toBe('Jani');
  });
});
