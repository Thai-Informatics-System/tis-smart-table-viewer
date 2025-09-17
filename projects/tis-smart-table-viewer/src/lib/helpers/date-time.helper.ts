import { DateTime } from 'luxon';

/**
 * Centralized date/time utility helper for consistent date handling across the library.
 * Provides common date formatting and conversion functions to avoid code duplication.
 */
export class DateTimeHelper {
  
  /**
   * Formats a date value for display based on form control type
   * @param value - The date value (Date, DateTime, string, number)
   * @param formControlType - The type of form control ('date', 'date-time', etc.)
   * @returns Formatted date string
   */
  static formatForDisplay(value: any, formControlType: string): string {
    if (!value) return '';
    
    const dateTime = this.toDateTime(value);
    if (!dateTime?.isValid) return '';
    
    switch (formControlType) {
      case 'date':
        return dateTime.toFormat('dd-MM-yyyy');
      case 'date-time':
        return dateTime.toFormat('dd-MM-yyyy HH:mm');
      case 'date-time-with-seconds':
        return dateTime.toFormat('dd-MM-yyyy HH:mm:ss');
      default:
        return dateTime.toFormat('dd-MM-yyyy');
    }
  }
  
  /**
   * Converts various date formats to DateTime object
   * @param value - Date value in various formats
   * @returns DateTime object or null if invalid
   */
  static toDateTime(value: any): DateTime | null {
    if (!value) return null;
    
    if (DateTime.isDateTime(value)) {
      return value;
    }
    
    if (value instanceof Date) {
      return DateTime.fromJSDate(value);
    }
    
    if (typeof value === 'string' && value !== '') {
      // Try parsing as milliseconds first (if numeric string)
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > 0) {
        return DateTime.fromMillis(numValue);
      }
      // Try parsing as ISO string
      return DateTime.fromISO(value);
    }
    
    if (typeof value === 'number') {
      return DateTime.fromMillis(value);
    }
    
    return null;
  }
  
  /**
   * Converts date/DateTime objects to milliseconds for API calls
   * @param value - Date value
   * @returns Milliseconds or original value if not a date
   */
  static toMilliseconds(value: any): any {
    if (!value) return value;
    
    if (value instanceof Date) {
      return DateTime.fromJSDate(value).toMillis();
    }
    
    if (DateTime.isDateTime(value)) {
      return value.toMillis();
    }
    
    return value;
  }
  
  /**
   * Checks if a query parameter key represents a date field
   * @param key - Query parameter key
   * @param value - Query parameter value
   * @returns True if it's a date field
   */
  static isDateQueryParam(key: string, value: string): boolean {
    return key.toLowerCase().includes('date') && value.length === 13;
  }
  
  /**
   * Parses date from query parameters
   * @param value - Query parameter value (milliseconds as string)
   * @returns DateTime object
   */
  static parseFromQueryParam(value: string): DateTime {
    return DateTime.fromMillis(Number(value));
  }
}
