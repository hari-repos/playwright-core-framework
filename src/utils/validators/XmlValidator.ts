import { XMLParser } from 'fast-xml-parser';
import { SyntaxValidator } from 'fast-xml-validator';

export class XmlValidator {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
  }

  /**
   * Validates if the provided string is a valid XML document.
   * Throws an error if invalid.
   * 
   * @param xmlData The XML string to validate.
   * @returns true if valid, throws Error if invalid.
   */
  validate(xmlData: string): boolean {
    try {
      SyntaxValidator.validate(xmlData);
      return true;
    } catch (err: any) {
      throw new Error(`XML Validation Failed: ${err.message} at line ${err.line}`);
    }
  }

  /**
   * Validates if the provided string is a valid XML document and returns boolean.
   */
  isValid(xmlData: string): boolean {
    try {
      SyntaxValidator.validate(xmlData);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Parses an XML string into a JavaScript object.
   * 
   * @param xmlData The XML string to parse.
   * @returns The parsed JavaScript object.
   */
  parse(xmlData: string): any {
    return this.parser.parse(xmlData);
  }
}
