import { DateTimeHelper } from './date-time.helper';

/**
 * Centralized query parameter utility helper for consistent URL parameter handling.
 * Provides common functions for parsing, validating, and transforming query parameters.
 */
export class QueryParamsHelper {
  
  /**
   * Parses query parameters from URL and handles type conversions
   * @param url - Full URL string
   * @returns Parsed query parameters object
   */
  static parseQueryParams(url: string): Record<string, string | string[]> {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const paramsObj: Record<string, string | string[]> = {};

    params.forEach((value, key) => {
      // Check if the parameter already exists (for handling multiple values)
      if (paramsObj.hasOwnProperty(key)) {
        // If it's not already an array, convert it to an array
        if (!Array.isArray(paramsObj[key])) {
          paramsObj[key] = [paramsObj[key] as string];
        }
        // Push the new value to the existing array
        (paramsObj[key] as string[]).push(value);
      } else {
        // Assign the value to the key in the object
        paramsObj[key] = value;
      }
    });

    return paramsObj;
  }
  
  /**
   * Checks if a query parameter value is valid (not empty, null, or undefined)
   * @param value - Query parameter value
   * @returns True if valid
   */
  static isValidParam(value: any): boolean {
    return value && value !== '' && value !== 'null' && value !== 'undefined';
  }
  
  /**
   * Processes a query parameter value and handles arrays
   * @param value - Raw query parameter value
   * @returns Processed value (string or array)
   */
  static processParamValue(value: string): string | string[] {
    if (value.includes(',')) {
      return value.split(',');
    }
    return value;
  }
  
  /**
   * Processes query parameters for filter form with type conversions
   * @param queryParams - Raw query parameters
   * @param columnsCodeMapping - Column mapping for transformations
   * @returns Processed filter and sort objects
   */
  static processForFilters(
    queryParams: any, 
    columnsCodeMapping: any[]
  ): { filterParams: any; sortParams: any; pageIndex: number; pageSize: number; search: string } {
    const filterParams: any = {};
    const sortParams: any = {};
    let pageIndex = 0;
    let pageSize = 10;
    let search = '';

    for (const key in queryParams) {
      if (!this.isValidParam(queryParams[key])) continue;

      let fixedKeyMatched = false;
      const value = queryParams[key];

      // Handle fixed parameters
      if (key.toLowerCase() === 'pageindex') {
        pageIndex = Number(value);
        fixedKeyMatched = true;
      } else if (key.toLowerCase() === 'pagesize') {
        pageSize = Number(value);
        fixedKeyMatched = true;
      } else if (key.toLowerCase() === 'sortby') {
        sortParams.sortBy = value;
        fixedKeyMatched = true;
      } else if (key.toLowerCase() === 'sortorder') {
        sortParams.sortOrder = value;
        fixedKeyMatched = true;
      } else if (key.toLowerCase() === 'search') {
        search = value;
        fixedKeyMatched = true;
      } else if (DateTimeHelper.isDateQueryParam(key, value)) {
        // Handle date parameters
        filterParams[key] = DateTimeHelper.parseFromQueryParam(value);
        fixedKeyMatched = true;
      }

      if (!fixedKeyMatched) {
        filterParams[key] = this.processParamValue(value);
        
        // Apply transformation if mapping exists
        const mapping = columnsCodeMapping.find(ccm => ccm.filterFormKey === key);
        if (mapping?.transformQueryParamFn) {
          filterParams[key] = mapping.transformQueryParamFn(filterParams[key]);
        }
      }
    }

    return { filterParams, sortParams, pageIndex, pageSize, search };
  }
  
  /**
   * Builds query string from filter data with proper encoding
   * @param filterData - Filter form data
   * @param sortParams - Sort parameters
   * @param pageIndex - Current page index
   * @param pageSize - Current page size  
   * @param search - Search term
   * @returns URLSearchParams object
   */
  static buildQueryString(
    filterData: any, 
    sortParams: any, 
    pageIndex: number, 
    pageSize: number, 
    search: string
  ): URLSearchParams {
    const qs = new URLSearchParams();
    
    // Process filter data
    if (filterData) {
      const processedFilter = { ...filterData };
      
      // Convert date objects to milliseconds
      for (const key in processedFilter) {
        processedFilter[key] = DateTimeHelper.toMilliseconds(processedFilter[key]);
      }
      
      // Append filter parameters
      Object.keys(processedFilter).forEach(key => {
        const value = processedFilter[key];
        if (this.isValidParam(value)) {
          if (value === '*') {
            qs.append(key, '');
          } else {
            qs.append(key, value);
          }
        }
      });
    }
    
    // Append sort parameters
    if (sortParams) {
      Object.keys(sortParams).forEach(key => {
        if (this.isValidParam(sortParams[key])) {
          qs.append(key, sortParams[key]);
        }
      });
    }
    
    // Append pagination and search
    qs.append('pageIndex', pageIndex.toString());
    qs.append('pageSize', pageSize.toString());
    
    if (search !== '') {
      qs.append('search', search);
    }
    
    return qs;
  }
}
