import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService, HAS_REFRESHED } from '@core/services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const accessToken = auth.accessToken();

  const requestWithAuth = request.clone({
    withCredentials: true,
    setHeaders: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  return next(requestWithAuth).pipe(
    catchError((error: HttpErrorResponse) => {
      const alreadyRefreshed = request.context.get(HAS_REFRESHED);
      if (error.status === 401 && !alreadyRefreshed && !isAuthUrl(request.url)) {
        return auth.retryWithNewToken(requestWithAuth, next);
      }
      return throwError(() => error);
    }),
  );
};

function isAuthUrl(url: string): boolean {
  return (
    url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout')
  );
}
