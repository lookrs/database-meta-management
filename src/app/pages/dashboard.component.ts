import {Component, computed, OnInit, signal} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';
import {MetaService} from '../service/meta.service';
import {FormsModule} from '@angular/forms';
import {IndexDbService} from '../service/index-db.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgbDropdownModule,
    FormsModule,
  ],

  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-2 col-sm-2 rounded mb-2 mt-2 bg-light">
          <form class="d-flex " role="search">
            <input class="form-control  me-2 shadow-sm" [ngModelOptions]="{standalone: true}" [(ngModel)]="query"
                   type="search" placeholder="Search"
                   aria-label="Search">
            <div class="row">
              <div class="col">
                <div ngbDropdown class="d-inline-block">
                  <button type="button" class="btn btn-outline-primary" id="dropdownForm1" ngbDropdownToggle>
                    search
                  </button>
                  <div ngbDropdownMenu aria-labelledby="dropdownForm1">
                    <form class="px-2 py-3 ">
                      <div class="form-check ">
                        <input class="form-check-input" type="radio" value="table" name="flexRadioType"
                               id="flexRadioDefault1" [ngModelOptions]="{standalone: true}"
                               [(ngModel)]="searchType" checked>
                        <label class="form-check-label" for="flexRadioDefault1">
                          table
                        </label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" value="column" name="flexRadioType"
                               [ngModelOptions]="{standalone: true}" [(ngModel)]="searchType" id="flexRadioDefault2">
                        <label class="form-check-label" for="flexRadioDefault2">
                          column
                        </label>
                      </div>
                      <div class="dropdown-divider"></div>
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
                      <button (click)="onSearchClick()" type="submit" class="btn btn-primary mt-2">confirm</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </form>

        </div>
        <div class="col rounded mb-2 mt-2 bg-light">
          <ul class="nav nav-tabs">
            <li class="nav-item">
              <a class="nav-link " aria-current="page" [routerLink]="['meta',selectTableIdx()]"
                 routerLinkActive="active">Meta</a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" routerLink="sql" routerLinkActive="active">SQL Tran</a>
            </li>
          </ul>
        </div>


      </div>
      <div class="row flex-fill rounded">
        <div class="col-2 tableList rounded p-0 shadow-sm">
          <div class="d-flex flex-column  ">
            <div class="list-group ">
              @for (item of allMeta(); track item.tableName; let i = $index) {
                <a [routerLink]="['meta', i]" (click)="onRouterChange(i)" routerLinkActive="active"
                   class="list-group-item list-group-item-action"
                   aria-current="true">
                  <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{{ item.tableName }}</h5>
                  </div>
                  <small style="color: darkgrey">{{ item.tableComment }}</small>
                </a>
              }
            </div>
          </div>
        </div>


        <div class="col p-2 d-flex flex-column tableList">
          <div class="">
            <router-outlet/>
          </div>
        </div>
      </div>

    </div>


  `,
  styles: `
    .tableList {
      max-height: 62rem !important;
      overflow-y: auto;
    }
  `
})
export class DashboardComponent implements OnInit {

  constructor(private indexDbService: IndexDbService,
              private metaService: MetaService,
              private router: Router) {

  }

  selectTableIdx = signal<number>(0)
  allMeta = computed(() => this.metaService.displayMetadata());
  searchType: string = 'table';
  matchType: string = 'name';
  query: string = '';

  ngOnInit(): void {

    this.metaService.loadMetadata();

  }


  async onSearchClick(): Promise<void> {
    console.log(this.query)
    if (!this.query || this.query.length == 0) {
      await this.metaService.loadMetadata();
      return;
    }
    console.log(this.searchType, '-', this.matchType);
    if (this.searchType === 'table' && this.matchType === 'name') {
      let tableMetadataByTableName = await this.indexDbService.getTableMetadataByTableName(this.query);
      if (tableMetadataByTableName) {
        this.metaService.displayMetadata.set(tableMetadataByTableName)
      }
    }
    if (this.searchType === 'column' && this.matchType === 'name') {
      let tableMetadata = await this.indexDbService.searchTableMetadataByColumnName(this.query);
      if (tableMetadata) {
        const seenTable = new Set<string>();
        // 去重
        let tableMetadataDistinct = tableMetadata.filter(meta => {
          if (seenTable.has(meta.tableName)) {
            return false;
          }
          seenTable.add(meta.tableName);
          return true;
        });
        this.metaService.displayMetadata.set(tableMetadataDistinct)
      }
    }

    if (this.searchType === 'table' && this.matchType === 'comment') {
      let tableMetadata = await this.indexDbService.searchTableMetadataByTableComment(this.query);
      if (tableMetadata) {
        this.metaService.displayMetadata.set(tableMetadata)
      }
    }

    if (this.searchType === 'column' && this.matchType === 'comment') {
      let tableMetadata = await this.indexDbService.searchTableMetadataByColumnComment(this.query);
      if (tableMetadata) {
        const seenTable = new Set<string>();
        // 去重
        let tableMetadataDistinct = tableMetadata.filter(meta => {
          if (seenTable.has(meta.tableName)) {
            return false;
          }
          seenTable.add(meta.tableName);
          return true;
        });
        this.metaService.displayMetadata.set(tableMetadataDistinct)
      }
    }
    // 搜索后选择结果的第一张表
    this.router.navigate(['dashboard', 'meta', 0]);

  }

  onRouterChange(idx: number) {
    this.selectTableIdx.set(idx)
  }

}
