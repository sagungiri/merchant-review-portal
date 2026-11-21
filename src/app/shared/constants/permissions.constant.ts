export const Permissions = {
  MERCHANT_VIEW: 'MERCHANT_VIEW',
  MERCHANT_CREATE: 'MERCHANT_CREATE',
  MERCHANT_EDIT: 'MERCHANT_EDIT',
  MERCHANT_ASSIGN: 'MERCHANT_ASSIGN',
  MERCHANT_REVIEW: 'MERCHANT_REVIEW',
  SENSITIVE_REVEAL: 'SENSITIVE_REVEAL',
} as const;

export type PermissionCode = (typeof Permissions)[keyof typeof Permissions];
