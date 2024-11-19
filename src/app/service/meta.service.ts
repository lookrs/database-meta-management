import {Injectable, signal} from '@angular/core';
import {IndexDbService} from './index-db.service';
import {ApiService} from '../api/api.service';
import {Observable} from 'rxjs';
import {DbConnInfo, Supports, TableMetadata} from '../types/commType';


@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private readonly info: DbConnInfo = {
    dbType: 0,
    username: 'postgres-dummy',
    password: 'admin123-dummy',
    url: 'jdbc:postgresql://dummy:5432/meta1'
  }
  private readonly metaPromise: Promise<void>;

  displayMetadata = signal<TableMetadata[]>([]);
  connInfoSignal = signal<DbConnInfo>(this.info);


  constructor(private indexDb: IndexDbService, private apiService: ApiService) {
    this.metaPromise = new Promise((resolve) => {
    });
  }


  getSupports(): Observable<Supports[]> {
    return this.apiService.get('support');
  }

  async loadMetadata(): Promise<void> {
    if (await this.indexDb.isUsersTableEmpty()) {
      this.apiService.post<TableMetadata[]>('load', this.connInfoSignal()).subscribe({
        next: (data) => {
          this.displayMetadata.set(data);
          data.forEach((meta) => {
            this.indexDb.addTableMetadata(meta);
          })
        }
      });
    } else {
      let allTableMetadata = await this.indexDb.getAllTableMetadata();
      this.displayMetadata.set(allTableMetadata);
    }
  }
}
