import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';


@Pipe({
    name: 'tisDateTime',
    standalone: false
})
export class TisDateTimePipe implements PipeTransform {

  transform(value: unknown, format?: string): string {
    const fmt = format || 'dd MMM yyyy hh:mm a';

    // Empty / "no date" inputs render blank (0 and "0" are treated as no-date).
    if (value === null || value === undefined || value === '' || value === 0 || value === '0') {
      return '';
    }

    let dt: DateTime;
    if (value instanceof Date) {
      dt = DateTime.fromJSDate(value);
    } else if (typeof value === 'number') {
      dt = DateTime.fromMillis(value);
    } else if (typeof value === 'string') {
      const num = Number(value);
      // Numeric string => epoch millis (unchanged); non-numeric => ISO date.
      dt = !isNaN(num) ? DateTime.fromMillis(num) : DateTime.fromISO(value);
    } else {
      return '';
    }

    // Invalid inputs render blank instead of the literal "Invalid Date".
    return dt.isValid ? dt.toFormat(fmt) : '';
  }

}
