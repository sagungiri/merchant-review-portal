import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '@core/services/permission.service';
import { AppRoutes } from '@shared/constants/routes.constant';
import { catchError, map, of } from 'rxjs';

export const loadPermissionsGuard: CanActivateFn = () => {
  const permissions = inject(PermissionService);
  const router = inject(Router);

  return permissions.load().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree([AppRoutes.forbidden]))),
  );
};

export const permissionGuard: CanActivateFn = (route) => {
  const permissions = inject(PermissionService);
  const router = inject(Router);
  const code = route.data['permission'] as string | undefined;

  if (!code || permissions.hasPermissionCode(code)) {
    return true;
  }

  return router.createUrlTree([AppRoutes.forbidden]);
};
