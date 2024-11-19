import {Component, effect, OnInit, signal} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {DbConnInfo} from './types/commType';
import {MetaService} from './service/meta.service';
import {IndexDbService} from './service/index-db.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="container-fluid">
      <div class="row ">
        <nav class="navbar bg-body-tertiary shadow-sm">
          <div class="d-flex flex-row">
            <div class="container-fluid header-content ">
              <span class="navbar-brand h1 align-content-center">Meta Management</span>
              <span class="navbar-brand h1 align-content-center text-bg-warning">重载：先修改连接信息，再点击reload</span>
              @if (!router.url.includes('login')) {
                <a class="icon-link" routerLink="/login">
                  <svg class="bi" aria-hidden="true"></svg>
                  {{ this.conn().dbType }} - {{ this.conn().url }} - {{ this.conn().username }}
                  - {{ this.conn().password }}
                </a>
                <div class="vr"></div>
                <button type="button" (click)="onReload()" class="btn btn-outline-warning btn-sm">reload</button>
                <div class="vr"></div>
                <a class="icon-link" target="_blank" href="https://sql-formatter-org.github.io/sql-formatter/">sql-formatter</a>
              }

            </div>
          </div>
        </nav>
        <router-outlet/>
      </div>

    </div>

  `,
  styles: `
    .header-content {
      display: flex;
      gap: 1rem;
    }
  `,
})
export class AppComponent implements OnInit {
  conn = signal<DbConnInfo>({
    dbType: 0,
    url: '',
    username: '',
    password: ''
  })

  constructor(private metaService: MetaService,
              public router: Router,
              private idbService: IndexDbService) {
    effect(() => this.conn.set(this.metaService.connInfoSignal()), {allowSignalWrites: true});
  }

  ngOnInit(): void {
  }

  async onReload() {
    await this.idbService.clearAllTableMetadata();
    await this.metaService.loadMetadata();
    this.metaService.displayMetadata.set([]);
  }
}
