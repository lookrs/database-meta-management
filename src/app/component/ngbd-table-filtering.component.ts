import {Component, effect, OnInit, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {map, startWith} from 'rxjs';
import {NgbHighlight} from '@ng-bootstrap/ng-bootstrap';
import {Column} from '../types/commType';
import {ActivatedRoute} from '@angular/router';
import {MetaService} from '../service/meta.service';


@Component({
  selector: 'app-ngbd-table-filtering',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgbHighlight
  ],
  template: `
    <form>
      <div class="mb-3 row">
        <label for="table-filtering-search" class="col-xs-3 col-sm-auto col-form-label">Full text search:</label>
        <div class="col-xs-3 col-sm-auto">
          <input id="table-filtering-search" class="form-control" type="text" [formControl]="filter"/>
        </div>
      </div>
    </form>

    <table class="table table-striped ">
      <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">name</th>
        <th scope="col">comment</th>
        <th scope="col">type</th>
        <th scope="col">nullable</th>
        <th scope="col">defaultValue</th>
      </tr>
      </thead>
      <tbody>
        @for (item of currentColumns(); track item.name; let i = $index) {
          <tr>
            <th scope="row">{{ i + 1 }}</th>
            <td>
              <ngb-highlight [result]="item.name" [term]="filter.value"/>
            </td>
            <td>
              <ngb-highlight [result]="item.comment" [term]="filter.value"/>
            </td>
            <td>
              <ngb-highlight [result]="item.type " [term]="filter.value"/>
            </td>
            <td>
              @if (item.nullable) {
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" value="" checked disabled>
                </div>
              } @else {
                <input class="form-check-input" type="checkbox" value=""  disabled>
              }
            </td>
            <td>
              <ngb-highlight [result]="item.defaultValue" [term]="filter.value"/>
            </td>
          </tr>
        } @empty {
          <tr>
            <td colspan="6" style="text-align: center">No meta found</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: ``
})
export class NgbdTableFilteringComponent implements OnInit {
  filter = new FormControl('', {nonNullable: true});
  currentColumns = signal<Column[]>([]);

  constructor(private route: ActivatedRoute, private metaService: MetaService) {
    this.filter.valueChanges.pipe(
      startWith(''),
      map((text) => this.search(text)),
    ).subscribe({
      next: data => this.currentColumns.set(data)
    });
    effect(() => {
      this.currentColumns.set(this.metaService.displayMetadata()[this.idxSignal()]?.columns);
    }, {allowSignalWrites: true});
  }

  idxSignal = signal(0);


  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      let idx = paramMap.get('idx');
      this.idxSignal.set(Number(idx))
    });

  }


  search(text: string): Column[] {
    return this.metaService.displayMetadata()[this.idxSignal()]?.columns.filter((column) => {
      const term = text.toLowerCase();
      return (
        column.name.toLowerCase().includes(term) || column.comment.toLowerCase().includes(term)
      );
    });

  }

}
