import { Routes } from '@angular/router';
import { permissionGuard } from '@core/guards/permission.guard';
import { Permissions } from '@shared/constants/permissions.constant';

export const merchantsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/merchant-list/merchant-list').then((m) => m.MerchantList),
    canActivate: [permissionGuard],
    data: { permission: Permissions.MERCHANT_VIEW },
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/merchant-create/merchant-create').then((m) => m.MerchantCreate),
    canActivate: [permissionGuard],
    data: { permission: Permissions.MERCHANT_CREATE },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/merchant-detail/merchant-detail').then((m) => m.MerchantDetail),
    canActivate: [permissionGuard],
    data: { permission: Permissions.MERCHANT_VIEW },
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/merchant-edit/merchant-edit').then((m) => m.MerchantEdit),
    canActivate: [permissionGuard],
    data: { permission: Permissions.MERCHANT_EDIT },
  },
];
