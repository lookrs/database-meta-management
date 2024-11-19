import {Routes} from '@angular/router';
import {DashboardComponent} from './dashboard.component';
import {MetaComponent} from '../component/meta.component';
import {SqlComponent} from '../component/sql.component';


export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {path: '', redirectTo: 'meta/0', pathMatch: 'full'}, // 默认子路由
      {path: 'meta/:idx', component: MetaComponent},
      {path: 'sql', component: SqlComponent},
    ]
  }
];
