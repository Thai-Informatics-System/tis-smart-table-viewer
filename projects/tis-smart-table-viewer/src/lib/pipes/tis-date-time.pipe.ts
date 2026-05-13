import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';


@Pipe({
    name: 'tisDateTime',
    standalone: false
})
export class TisDateTimePipe implements PipeTransform {

  transform(value: unknown, format?: string): string {
    const fmt = format || 'dd MMM yyyy hh:mm a';
    if (typeof value == 'string' && value !== '') {
      return DateTime.fromMillis(+value).toFormat(fmt);
    } else if (typeof value == 'number') {
      return DateTime.fromMillis(value).toFormat(fmt);
    } else if (value === null || value === undefined) {
      return '';
    } else {
      return 'Invalid Date';
    }
  }

}
