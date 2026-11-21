import { HttpBackend, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiPath } from '@core/configs/api.config';
import { toApiError } from '@core/models/api-error.model';
import { catchError, Observable, throwError } from 'rxjs';

export interface ApiRequestOptions {
  skipAuth?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly anonymous = new HttpClient(inject(HttpBackend));

  get<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('POST', path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  private request<T>(
    method: string,
    path: string,
    body: unknown,
    options?: ApiRequestOptions,
  ): Observable<T> {
    const client = options?.skipAuth ? this.anonymous : this.http;
    return client
      .request<T>(method, apiPath(path), {
        body,
        params: cleanParams(options?.params),
        withCredentials: true,
      })
      .pipe(catchError((err) => throwError(() => toApiError(err))));
  }
}

function cleanParams(params?: Record<string, string | number | boolean | undefined>) {
  if (!params) {
    return undefined;
  }

  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') {
      continue;
    }
    out[key] = String(value);
  }
  return Object.keys(out).length ? out : undefined;
}
