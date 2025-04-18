import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'qty',
    standalone: false
})
export class Quantity implements PipeTransform {
  decimalPoints = 4;

  transform(value: number | string): any {
    if(Number(value) > 0){
      let roundValue: any  = this.roundNumber(Number(value), this.decimalPoints);
      let roundValueArr = String(roundValue)?.split('.');
      if(roundValueArr?.length > 1){
        let currentDesimal = roundValueArr[1];
        if(currentDesimal?.length < this.decimalPoints){
          roundValue = `${roundValue}`;
          for (let index = 0; index < (this.decimalPoints - currentDesimal?.length); index++) {
            roundValue = `${roundValue}0`;
          }
        }
      }
      else{
        roundValue = `${roundValueArr[0]}.0000`;
      }
      return roundValue;
    }
    else{
      return 0;
    }
  }

  roundNumber(number: number, decimals = 0) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(number * multiplier) / multiplier;
  }


}