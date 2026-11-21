export type UserRole = 'SALES' | 'REVIEWER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface PermissionItem {
  code: string;
  label: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresInMs: number;
  user: User;
}
