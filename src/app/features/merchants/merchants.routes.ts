import { Routes } from '@angular/router';
import { permissionGuard } from '@core/guards/permission.guard';
import { Permissions } from '@shared/constants/permissions.constant';

export const merchantsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/merchant-list').then((m) => m.MerchantList),
    canActivate: [permissionGuard],
    data: { permission: Permissions.MERCHANT_VIEW },
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/merchant-form').then((m) => m.MerchantForm),
    canActivate: [permissionGuard],
    data: { permission: Permissions.MERCHANT_CREATE },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/merchant-detail').then((m) => m.MerchantDetail),
    canActivate: [permissionGuard],
    data: { permission: Permissions.MERCHANT_VIEW },
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/merchant-form').then((m) => m.MerchantForm),
    canActivate: [permissionGuard],
    data: { permission: Permissions.MERCHANT_EDIT },
  },
];
