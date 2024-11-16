import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dbTypePipe',
  standalone: true
})
export class DbTypePipePipe implements PipeTransform {

  private paymentMethodMap: Record<number, string> = {
    0: 'POSTGRESQL',
    1: 'MYSQL',
    2: 'H2',
  };

  transform(value: number): string {
    return this.paymentMethodMap[value] || 'Unknown';
  }
}
