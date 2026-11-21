export function safeReturnUrl(url: string | null | undefined, fallback: string): string {
  if (url?.startsWith('/') && !url.startsWith('//')) {
    return url;
  }
  return fallback;
}
