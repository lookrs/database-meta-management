import {Routes} from '@angular/router';
import {LoginComponent} from './pages/login.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    loadChildren: () => import("./pages/dashboard.routes").then(m => m.dashboardRoutes)
  }
];
