import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';


@Pipe({
    name: 'tisDateTime',
    standalone: false
})
export class TisDateTimePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): string {
    if (typeof value == 'string' && value !== '') {
      return DateTime.fromMillis(+value).toFormat('dd MMM yyyy hh:mm a');
    } else if (typeof value == 'number') {
      return DateTime.fromMillis(value).toFormat('dd MMM yyyy hh:mm a');
    } else {
      return 'Invalid Date';
    }
  }

}
