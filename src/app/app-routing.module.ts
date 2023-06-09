import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './pages/auth/login/login.component';

import { AuthGuardService } from './shared/service/auth-service/auth-guard.service';
import { AuthGuard } from './auth/auth.guard';
import { CajaMovimientosComponent } from './pages/cajas/caja-movimientos/caja-movimientos.component';

export const AppRoutes: Routes = [

  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(m => m.AdminLayoutModule)
      }]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: "caja-movimientos",
    component: CajaMovimientosComponent
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(AppRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
