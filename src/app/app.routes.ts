import { Routes } from '@angular/router';
import { authGuard, loginGuard } from '@core/guards/auth.guard';
import { loadPermissionsGuard } from '@core/guards/permission.guard';
import { Shell } from '@core/layout/shell';
import { Forbidden } from '@core/pages/forbidden';
import { NotFound } from '@core/pages/not-found';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: 'forbidden',
    component: Forbidden,
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard, loadPermissionsGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'merchants' },
      {
        path: 'merchants',
        loadChildren: () =>
          import('./features/merchants/merchants.routes').then((m) => m.merchantsRoutes),
      },
    ],
  },
  { path: '**', component: NotFound },
];
