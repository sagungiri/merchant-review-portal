import { HttpContextToken, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, User } from '@core/models/user.model';
import { ApiService } from '@core/services/api.service';
import { PermissionService } from '@core/services/permission.service';
import { ApiEndpoints } from '@shared/constants/api-endpoints.constant';
import { AppRoutes } from '@shared/constants/routes.constant';
import {
  catchError,
  EMPTY,
  finalize,
  map,
  Observable,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

export const HAS_REFRESHED = new HttpContextToken(() => false);

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly permissions = inject(PermissionService);
  private readonly router = inject(Router);

  private readonly token = signal<string | null>(null);
  readonly currentUser = signal<User | null>(null);

  private pendingRefresh$: Observable<string> | null = null;

  readonly accessToken = this.token.asReadonly();
  readonly isAuthenticated = computed(() => !!this.accessToken() && !!this.currentUser());

  login(email: string, password: string): Observable<AuthResponse> {
    return this.api
      .post<AuthResponse>(ApiEndpoints.auth.login, { email, password }, { skipAuth: true })
      .pipe(tap((session) => this.saveSession(session)));
  }

  hydrate(): Observable<AuthResponse> {
    if (this.isAuthenticated()) {
      return EMPTY;
    }

    return this.refreshSession().pipe(
      catchError(() => {
        this.clearSession();
        return EMPTY;
      }),
    );
  }

  logout(): void {
    this.api
      .post(ApiEndpoints.auth.logout, {}, { skipAuth: true })
      .pipe(
        catchError(() => EMPTY),
        finalize(() => {
          this.clearSession();
          this.router.navigateByUrl(AppRoutes.login);
        }),
      )
      .subscribe();
  }

  retryWithNewToken(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn,
  ): Observable<HttpEvent<unknown>> {
    return this.waitForFreshAccessToken().pipe(
      switchMap((accessToken) =>
        next(
          request.clone({
            setHeaders: { Authorization: `Bearer ${accessToken}` },
            context: request.context.set(HAS_REFRESHED, true),
            withCredentials: true,
          }),
        ),
      ),
    );
  }

  private waitForFreshAccessToken(): Observable<string> {
    if (this.pendingRefresh$) {
      return this.pendingRefresh$;
    }

    this.pendingRefresh$ = this.refreshSession().pipe(
      map((session) => session.accessToken),
      catchError((err) => {
        this.logout();
        return throwError(() => err);
      }),
      finalize(() => {
        this.pendingRefresh$ = null;
      }),
      shareReplay(1),
    );

    return this.pendingRefresh$;
  }

  private refreshSession(): Observable<AuthResponse> {
    return this.api
      .post<AuthResponse>(ApiEndpoints.auth.refresh, {}, { skipAuth: true })
      .pipe(tap((session) => this.saveSession(session)));
  }

  private saveSession(session: AuthResponse): void {
    this.token.set(session.accessToken);
    this.currentUser.set(session.user);
  }

  private clearSession(): void {
    this.token.set(null);
    this.currentUser.set(null);
    this.permissions.clear();
    this.pendingRefresh$ = null;
  }
}
