import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
    name: 'tisDate',
    standalone: false
})
export class TisDatePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): string {
    if (typeof value == 'string' && value !== '') {
      return DateTime.fromMillis(+value).toFormat('dd MMM yyyy');
    } else if (typeof value == 'number') {
      return DateTime.fromMillis(value).toFormat('dd MMM yyyy');
    } else if (value instanceof Date) {
      return DateTime.fromJSDate(value).toFormat('dd MMM yyyy');
    } else {
      return 'Invalid Date';
    }
  }

}
