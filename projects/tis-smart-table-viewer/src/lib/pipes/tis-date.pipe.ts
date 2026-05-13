import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
    name: 'tisDate',
    standalone: false
})
export class TisDatePipe implements PipeTransform {

  transform(value: unknown, format?: string): string {
    const fmt = format || 'dd MMM yyyy';
    if (typeof value == 'string' && value !== '') {
      return DateTime.fromMillis(+value).toFormat(fmt);
    } else if (typeof value == 'number') {
      return DateTime.fromMillis(value).toFormat(fmt);
    } else if (value instanceof Date) {
      return DateTime.fromJSDate(value).toFormat(fmt);
    } else if (value === null || value === undefined) {
      return '';
    } else {
      return 'Invalid Date';
    }
  }

}
