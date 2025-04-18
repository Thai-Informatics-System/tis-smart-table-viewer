import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';


@Pipe({
    name: 'tisDateTimeWithSeconds',
    standalone: false
})
export class TisDateTimeWithSecondsPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): string {
    if (typeof value == 'string' && value !== '') {
      return DateTime.fromMillis(+value).toFormat('dd MMM yyyy hh:mm:ss a');
    } else if (typeof value == 'number') {
      return DateTime.fromMillis(value).toFormat('dd MMM yyyy hh:mm:ss a');
    } else {
      return 'Invalid Date';
    }
  }

}
