import { environment } from '@env';

export function apiPath(...parts: string[]): string {
  return [environment.apiBaseUrl, ...parts].join('/');
}
