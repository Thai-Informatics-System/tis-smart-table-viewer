import { DateTimeHelper } from './date-time.helper';
import type { 
  SelectedFilterDisplayValueType, 
  SelectedFiltersGroupedValuesType,
  SelectedFilterDisplayValuesType 
} from '../interfaces';

/**
 * Centralized filter display utility helper for managing filter value formatting and grouping.
 * Handles the complex logic of grouping and displaying filter values in a consistent manner.
 */
export class FilterDisplayHelper {
  
  /**
   * Formats filter values based on form control type for display
   * @param items - Array of filter display values
   * @returns Processed array with formatted display values
   */
  static formatFilterValuesForDisplay(items: SelectedFilterDisplayValueType[]): SelectedFilterDisplayValueType[] {
    return items.map(item => {
      const processedItem = { ...item };
      
      // Handle different form control types
      switch (item.formControlType) {
        case 'input':
        case 'checkbox':
          // No special formatting needed
          break;
        case 'date':
          processedItem.valueKey = DateTimeHelper.formatForDisplay(item.value, 'date');
          break;
        case 'date-time':
          processedItem.valueKey = DateTimeHelper.formatForDisplay(item.value, 'date-time');
          break;
        default:
          // Keep original valueKey if no special handling needed
          break;
      }
      
      return processedItem;
    });
  }
  
  /**
   * Groups filter values by form control attributes
   * @param data - Array of filter display values
   * @returns Grouped filter values
   */
  static groupByFormControlAttributes(data: SelectedFilterDisplayValueType[]): SelectedFiltersGroupedValuesType[] {
    const groups: Record<string, SelectedFiltersGroupedValuesType> = {};
    
    // First format the data for display
    const formattedData = this.formatFilterValuesForDisplay(data);

    formattedData.forEach(item => {
      const key = `${item.formControlName}-${item.formControlType}`;
      
      if (!groups[key]) {
        groups[key] = {
          formControlName: item.formControlName,
          formControlType: item.formControlType,
          arrValues: []
        };
      }
      
      const isSingleValue = this.isSingleValueFormControl(item.formControlType, item.isSingleValue);
      
      // Check if only the last value should be kept due to isSingleValue or duplicated value/valueKey
      if (isSingleValue) {
        groups[key].arrValues = [item]; // Replace with the current item
      } else {
        // Check for duplicate value and valueKey in the current array
        const existingIndex = groups[key].arrValues.findIndex(x => 
          x.value === item.value && x.valueKey === item.valueKey
        );
        
        if (existingIndex !== -1) {
          groups[key].arrValues[existingIndex] = item; // Replace the duplicate
        } else {
          groups[key].arrValues.push(item); // Add new item
        }
      }
    });

    return Object.values(groups);
  }
  
  /**
   * Determines if a form control should only have single values
   * @param formControlType - Type of form control
   * @param explicitSingleValue - Explicit single value flag
   * @returns True if single value control
   */
  static isSingleValueFormControl(formControlType: string, explicitSingleValue?: boolean): boolean {
    if (explicitSingleValue !== undefined) {
      return explicitSingleValue;
    }
    
    return ['input', 'radio', 'date', 'date-time', 'toggle'].includes(formControlType);
  }
  
  /**
   * Updates selected filter values by replacing values for a specific form control
   * @param currentValues - Current selected filter values
   * @param newValues - New values to add/update
   * @param formControlName - Name of the form control being updated
   * @returns Updated filter values and grouped values
   */
  static updateSelectedFilterValues(
    currentValues: SelectedFilterDisplayValuesType,
    newValues: SelectedFilterDisplayValueType | SelectedFilterDisplayValuesType,
    formControlName?: string
  ): { 
    selectedFilterValues: SelectedFilterDisplayValuesType;
    selectedFilterGroupedValues: SelectedFiltersGroupedValuesType[];
  } {
    let targetFormControlName: string;
    let newValuesArray: SelectedFilterDisplayValueType[];
    
    if (Array.isArray(newValues)) {
      newValuesArray = newValues;
      targetFormControlName = formControlName || newValues[0]?.formControlName;
    } else {
      newValuesArray = [newValues];
      targetFormControlName = formControlName || newValues?.formControlName;
    }
    
    // Remove existing values for this form control
    const filteredValues = currentValues.filter(
      sfv => sfv.formControlName !== targetFormControlName
    );
    
    // Group the new values
    const newGroupedValues = this.groupByFormControlAttributes(newValuesArray);
    
    // Add new values for the target form control
    newGroupedValues.forEach(gv => {
      if (gv.formControlName === targetFormControlName) {
        gv.arrValues.forEach(v => {
          filteredValues.push(v);
        });
      }
    });
    
    // Return updated values and all grouped values
    const allGroupedValues = this.groupByFormControlAttributes(filteredValues);
    
    return {
      selectedFilterValues: filteredValues,
      selectedFilterGroupedValues: allGroupedValues
    };
  }
  
  /**
   * Filters selected values to only show those present in query parameters
   * @param selectedValues - All selected filter values
   * @param queryParams - Current query parameters
   * @returns Filtered values for display
   */
  static getValuesForDisplay(
    selectedValues: SelectedFilterDisplayValuesType,
    queryParams: any
  ): SelectedFilterDisplayValuesType {
    return selectedValues.filter(sf => queryParams.hasOwnProperty(sf.formControlName));
  }
  
  /**
   * Removes a specific filter value from the collection
   * @param selectedValues - Current selected filter values
   * @param filterToRemove - Filter value to remove
   * @returns Updated filter values
   */
  static removeFilterValue(
    selectedValues: SelectedFilterDisplayValuesType,
    filterToRemove: SelectedFilterDisplayValueType
  ): SelectedFilterDisplayValuesType {
    return selectedValues.filter(sfv => 
      !(sfv.formControlName === filterToRemove.formControlName && 
        sfv.valueKey === filterToRemove.valueKey)
    );
  }
}
