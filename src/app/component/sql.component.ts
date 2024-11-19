import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DbTypePipePipe} from '../pipes/db-type-pipe.pipe';
import {MetaService} from '../service/meta.service';
import _ from 'lodash';
import {async} from 'rxjs';

@Component({
  selector: 'app-sql',
  standalone: true,
  imports: [
    FormsModule,
  ],
  providers: [DbTypePipePipe,],
  template: `
    <div class="container-fluid ">
      <div class="row sql-tran-content">
        <div class="col-9 .mx-auto flex-fill">
          <div class="col-6 mx-auto">
            <form class="d-flex mt-1 mb-1 " role="search">
              <div class="d-flex mx-auto">
                <div class="col">
                  <button (click)="onReplace()" class="btn btn-primary mt-2">replace</button>
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

  constructor(private metaService: MetaService) {
  }

  onReplace = _.debounce(() => {
    this.onReplaceTarget();
  }, 500);

  async onReplaceTarget() {
    if (!this.inSql) {
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
    let targetMap = this.sortMap(replacementMap);
    const regex = new RegExp(_.join([...targetMap.keys()], "|"), "gi");
    const updatedText = src.replace(regex, match => {
      return replacementMap.get(match.toLowerCase()) || match;
    });
    console.log(updatedText);
    return updatedText;
  }

  sortMap(replacementMap: Map<string, string>): Map<string, string> {
    const sortedArray = _.orderBy(
      Array.from(replacementMap.entries()), // 转换 Map 为数组
      [([key]) => key.length],    // 排序依据：按键的长度
      ['desc']                   // 倒序
    );
    return new Map(sortedArray);
  }
}
