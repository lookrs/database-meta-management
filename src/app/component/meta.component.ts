import {Component, OnInit} from '@angular/core';
import {NgbdTableFilteringComponent} from './ngbd-table-filtering.component';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-meta',
  standalone: true,
  imports: [
    NgbdTableFilteringComponent
  ],
  providers: [DecimalPipe],
  template: `
    <div class="shadow-sm p-1">
      <app-ngbd-table-filtering></app-ngbd-table-filtering>
    </div>

  `,
  styles: ``
})
export class MetaComponent implements OnInit {
  constructor() {
  }

  ngOnInit() {

  }
}
