import { HttpErrorResponse } from '@angular/common/http';

const FALLBACK = 'Something went wrong';

export class ApiError extends Error {
  override readonly name = 'ApiError';

  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function toApiError(err: unknown, fallback = FALLBACK): ApiError {
  if (err instanceof ApiError) {
    return err;
  }

  if (!(err instanceof HttpErrorResponse)) {
    return new ApiError(0, 'UNKNOWN', fallback);
  }

  const { code, message } = err.error?.error ?? {};
  return new ApiError(err.status, code ?? 'HTTP_ERROR', message ?? fallback);
}

export function apiErrorMessage(err: unknown, fallback = FALLBACK): string {
  return toApiError(err, fallback).message;
}
