import { Ajv, Schema, ErrorObject } from 'ajv';

export class JsonValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }

  /**
   * Validates JSON data against a provided JSON Schema.
   * Throws an error with detailed validation messages if validation fails.
   * 
   * @param schema The JSON schema to validate against.
   * @param data The JSON data to validate.
   * @returns true if valid, throws an Error if invalid.
   */
  validate(schema: Schema, data: any): boolean {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);
    
    if (!valid) {
      const errors = validate.errors?.map((err: ErrorObject) => {
        return `'${err.instancePath}' ${err.message}`;
      }).join(', ');
      throw new Error(`JSON Schema Validation Failed: ${errors}`);
    }

    return true;
  }

  /**
   * Validates JSON data against a schema and returns the boolean result without throwing.
   */
  isValid(schema: Schema, data: any): boolean {
    const validate = this.ajv.compile(schema);
    return validate(data);
  }
}
