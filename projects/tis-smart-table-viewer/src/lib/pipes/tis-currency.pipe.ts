import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tisCurrency',
  standalone: false
})
export class TisCurrencyPipe implements PipeTransform {

  transform(value: number | string | null | undefined, decimals: number | string = 2): string {
    // Support string decimals passed from template format config
    if (typeof decimals === 'string') {
      decimals = parseInt(decimals, 10);
      if (isNaN(decimals)) decimals = 2;
    }
    // Handle null, undefined, or empty values
    if (value === null || value === undefined || value === '') {
      return '';
    }

    // Convert to number
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Handle invalid numbers
    if (isNaN(numValue)) {
      return '';
    }

    // Round to specified decimal places
    const fixedValue = numValue.toFixed(decimals);
    
    // Split into integer and decimal parts
    const [integerPart, decimalPart] = fixedValue.split('.');

    // Add commas every 3 digits
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Return formatted value with decimal part
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }

}
