import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DbTypePipePipe} from '../pipes/db-type-pipe.pipe';
import {MetaService} from '../service/meta.service';
import {NgbDropdown, NgbDropdownMenu, NgbDropdownToggle} from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';

@Component({
  selector: 'app-sql',
  standalone: true,
  imports: [
    FormsModule,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,

  ],
  providers: [DbTypePipePipe,],
  template: `
    <div class="container-fluid ">
      <div class="row sql-tran-content">
        <div class="col-9 .mx-auto flex-fill">
          <div class="col-6 mx-auto">
            <form class="d-flex mt-1 mb-1 " role="search">
              <input class="form-control me-2 shadow-sm" type="search" placeholder="tables" aria-label="Search">
              <div class="row">
                <div class="col">
                  <div ngbDropdown class="d-inline-block">
                    <button type="button" class="btn btn-outline-primary" id="dropdownForm1" ngbDropdownToggle>
                      replace
                    </button>
                    <div ngbDropdownMenu aria-labelledby="dropdownForm1">
                      <form class="px-2 py-3 ">
                        <div class="form-check ">
                          <input class="form-check-input" type="radio" value="name" name="flexRadioMethod"
                                 id="flexRadioDefault3" [(ngModel)]="matchType" [ngModelOptions]="{standalone: true}"
                                 checked>
                          <label class="form-check-label" for="flexRadioDefault3">
                            name
                          </label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="radio" value="comment" name="flexRadioMethod"
                                 id="flexRadioDefault4" [(ngModel)]="matchType" [ngModelOptions]="{standalone: true}">
                          <label class="form-check-label" for="flexRadioDefault4">
                            comment
                          </label>
                        </div>
                        <button (click)="onReplace()" type="submit" class="btn btn-primary mt-2">confirm</button>

                      </form>
                    </div>
                  </div>
                </div>
              </div>

            </form>
          </div>
        </div>

        <div class="col-6">
          <div class="input-group p-0 m-0">
            <span class="input-group-text ">SQL to transform</span>
            <textarea [(ngModel)]="inSql" class="form-control sql-area" aria-label="With textarea"></textarea>
          </div>
        </div>
        <div class="col-6">

          <div class="input-group">
            <span class="input-group-text ">Output</span>
            <textarea [(ngModel)]="outSql" class="form-control sql-area" aria-label="With textarea"></textarea>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: `
    .sql-tran-content {
      max-height: 62rem !important;
      overflow-y: auto;
    }

    .sql-area {
      min-height: 42rem !important;
      max-height: 62rem !important;
      overflow-y: auto;
    }
  `
})
export class SqlComponent {
  inSql: string = '';
  outSql: string = '';
  matchType: string = 'name';

  constructor(private metaService: MetaService) {
  }

  async onReplace() {
    if (!this.inSql){
      return;
    }
    await this.metaService.loadMetadata();
    const resultMap = new Map<string, string>();
    this.metaService.displayMetadata().forEach(metadata => {
      resultMap.set(metadata.tableComment, metadata.tableName);
      metadata.columns.forEach(column => {
        resultMap.set(column.comment, column.name);
      })
    });
    this.outSql = this.replaceSql(this.inSql, resultMap);
  }

  replaceSql(src: string, replacementMap: Map<string, string>): string {
    console.log('replaceSql');
    const regex = new RegExp(_.join([...replacementMap.keys()], "|"), "gi");
    const updatedText = src.replace(regex, match => {
      return replacementMap.get(match.toLowerCase()) || match;
    });
    console.log(updatedText);
    return updatedText;
  }
}
