/**
 * Centralized collection management utility helper for common array and object operations.
 * Provides reusable functions for managing collections, selections, and data structures.
 */
export class CollectionHelper {
  
  /**
   * Safely clears an array if it exists
   * @param array - Array to clear
   */
  static clearArray(array: any[]): void {
    if (Array.isArray(array)) {
      array.length = 0;
    }
  }
  
  /**
   * Safely clears a Set if it exists
   * @param set - Set to clear
   */
  static clearSet(set: Set<any>): void {
    if (set instanceof Set) {
      set.clear();
    }
  }
  
  /**
   * Safely clears a Map if it exists
   * @param map - Map to clear
   */
  static clearMap(map: Map<any, any>): void {
    if (map instanceof Map) {
      map.clear();
    }
  }
  
  /**
   * Gets a consistent identifier for a row based on available keys
   * @param row - Row object
   * @param primaryKey - Primary key property name (default: 'id')
   * @param fallbackKey - Fallback key property name
   * @returns Row identifier or JSON string as last resort
   */
  static getRowIdentifier(row: any, primaryKey: string = 'id', fallbackKey?: string): string | number {
    if (!row) return '';
    
    // Try primary key first
    if (row[primaryKey] !== undefined && row[primaryKey] !== null) {
      return row[primaryKey];
    }
    
    // Try fallback key if provided
    if (fallbackKey && row[fallbackKey] !== undefined && row[fallbackKey] !== null) {
      return row[fallbackKey];
    }
    
    // Last resort: stringify the object (not recommended for large objects)
    return JSON.stringify(row);
  }
  
  /**
   * Creates a hash from an array of objects for cache validation
   * @param items - Array of items to hash
   * @param keyExtractor - Function to extract key from each item
   * @returns Hash string
   */
  static createArrayHash<T>(items: T[], keyExtractor: (item: T) => string): string {
    if (!Array.isArray(items)) return '';
    return JSON.stringify(items.map(keyExtractor));
  }
  
  /**
   * Safely filters an array with predicate function
   * @param array - Array to filter
   * @param predicate - Filter predicate function
   * @returns Filtered array or empty array if input is invalid
   */
  static safeFilter<T>(array: T[], predicate: (item: T) => boolean): T[] {
    if (!Array.isArray(array)) return [];
    return array.filter(predicate);
  }
  
  /**
   * Safely maps an array with transform function
   * @param array - Array to map
   * @param transform - Transform function
   * @returns Mapped array or empty array if input is invalid
   */
  static safeMap<T, U>(array: T[], transform: (item: T) => U): U[] {
    if (!Array.isArray(array)) return [];
    return array.map(transform);
  }
  
  /**
   * Safely finds an item in array
   * @param array - Array to search
   * @param predicate - Find predicate function
   * @returns Found item or undefined
   */
  static safeFind<T>(array: T[], predicate: (item: T) => boolean): T | undefined {
    if (!Array.isArray(array)) return undefined;
    return array.find(predicate);
  }
  
  /**
   * Creates a Map from an array for O(1) lookups
   * @param array - Array to convert
   * @param keyExtractor - Function to extract key from each item
   * @returns Map with keys and items
   */
  static createLookupMap<T>(array: T[], keyExtractor: (item: T) => string): Map<string, T> {
    const map = new Map<string, T>();
    if (!Array.isArray(array)) return map;
    
    array.forEach(item => {
      const key = keyExtractor(item);
      map.set(key, item);
    });
    
    return map;
  }
  
  /**
   * Checks if two arrays have the same items (order doesn't matter)
   * @param array1 - First array
   * @param array2 - Second array
   * @param keyExtractor - Function to extract comparison key
   * @returns True if arrays contain same items
   */
  static arraysEqual<T>(
    array1: T[], 
    array2: T[], 
    keyExtractor?: (item: T) => any
  ): boolean {
    if (!Array.isArray(array1) || !Array.isArray(array2)) return false;
    if (array1.length !== array2.length) return false;
    
    if (keyExtractor) {
      const keys1 = array1.map(keyExtractor).sort();
      const keys2 = array2.map(keyExtractor).sort();
      return JSON.stringify(keys1) === JSON.stringify(keys2);
    } else {
      return JSON.stringify([...array1].sort()) === JSON.stringify([...array2].sort());
    }
  }
  
  /**
   * Safely removes items from a Set based on a predicate
   * @param set - Set to modify
   * @param predicate - Function to determine if item should be removed
   */
  static removeFromSet<T>(set: Set<T>, predicate: (item: T) => boolean): void {
    if (!(set instanceof Set)) return;
    
    const itemsToRemove: T[] = [];
    set.forEach(item => {
      if (predicate(item)) {
        itemsToRemove.push(item);
      }
    });
    
    itemsToRemove.forEach(item => set.delete(item));
  }
  
  /**
   * Safely clones an array to prevent mutation issues
   * @param array - Array to clone
   * @returns Cloned array or empty array if input is invalid
   */
  static cloneArray<T>(array: T[]): T[] {
    if (!Array.isArray(array)) return [];
    return [...array];
  }
  
  /**
   * Performs safe property access with default value
   * @param obj - Object to access
   * @param path - Property path (e.g., 'user.profile.name')
   * @param defaultValue - Default value if property doesn't exist
   * @returns Property value or default
   */
  static getNestedProperty(obj: any, path: string, defaultValue: any = null): any {
    if (!obj || !path) return defaultValue;
    
    // If there is no '.', just return the direct property
    if (!path.includes('.')) {
      return obj[path] !== undefined ? obj[path] : defaultValue;
    }
    
    // Otherwise, traverse the nested properties
    try {
      return path.split('.').reduce((acc, part) => {
        return acc && acc[part] !== undefined ? acc[part] : defaultValue;
      }, obj);
    } catch {
      return defaultValue;
    }
  }
}
