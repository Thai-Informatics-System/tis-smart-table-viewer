/**
 * Centralized validation utility helper for common validation tasks.
 * Provides reusable validation functions to avoid code duplication.
 */
export class ValidationHelper {
  
  /**
   * Checks if a value is not null, undefined, or empty string
   * @param value - Value to check
   * @returns True if value has content
   */
  static hasValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }
  
  /**
   * Checks if any values in an object are non-empty
   * @param obj - Object to check
   * @returns True if any value is non-empty
   */
  static hasNonEmptyValue(obj: any): boolean {
    if (!obj) return false;
    return Object.values(obj).some(value => this.hasValue(value));
  }
  
  /**
   * Checks if a form has any non-empty values
   * @param formData - Form data object
   * @returns True if form has any data
   */
  static hasFormData(formData: any): boolean {
    if (!formData) return false;
    return this.hasNonEmptyValue(formData);
  }
  
  /**
   * Validates if an array has items
   * @param array - Array to check
   * @returns True if array exists and has items
   */
  static hasItems(array: any[]): boolean {
    return Array.isArray(array) && array.length > 0;
  }
  
  /**
   * Checks if a URL is valid
   * @param url - URL string to validate
   * @returns True if URL is valid
   */
  static isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Validates if a string is a valid number
   * @param value - Value to check
   * @returns True if value is a valid number
   */
  static isValidNumber(value: any): boolean {
    return !isNaN(Number(value)) && isFinite(Number(value));
  }
  
  /**
   * Checks if an object has a specific property with a valid value
   * @param obj - Object to check
   * @param property - Property name
   * @returns True if property exists and has a value
   */
  static hasProperty(obj: any, property: string): boolean {
    return obj && obj.hasOwnProperty(property) && this.hasValue(obj[property]);
  }
  
  /**
   * Validates if a selection model row has the required key
   * @param row - Row object
   * @param keyName - Key property name
   * @returns True if row has the key property with a value
   */
  static hasRowKey(row: any, keyName: string): boolean {
    return row && this.hasProperty(row, keyName);
  }
  
  /**
   * Checks if a filter value should be processed (not null, empty, or invalid)
   * @param value - Filter value
   * @returns True if filter value is valid for processing
   */
  static isValidFilterValue(value: any): boolean {
    if (!this.hasValue(value)) return false;
    
    // Check for common invalid filter values
    const invalidValues = ['null', 'undefined', '*'];
    if (typeof value === 'string' && invalidValues.includes(value)) {
      return value === '*'; // Special case: '*' is valid but gets converted to empty string
    }
    
    return true;
  }
  
  /**
   * Validates pagination parameters
   * @param pageIndex - Page index
   * @param pageSize - Page size
   * @returns Object with validation results
   */
  static validatePagination(pageIndex: any, pageSize: any): { 
    isValid: boolean; 
    pageIndex: number; 
    pageSize: number; 
  } {
    const validPageIndex = this.isValidNumber(pageIndex) ? Number(pageIndex) : 0;
    const validPageSize = this.isValidNumber(pageSize) ? Number(pageSize) : 10;
    
    return {
      isValid: validPageIndex >= 0 && validPageSize > 0,
      pageIndex: Math.max(0, validPageIndex),
      pageSize: Math.max(1, validPageSize)
    };
  }
}
