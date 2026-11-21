export const ApiEndpoints = {
  auth: {
    login: 'auth/login',
    refresh: 'auth/refresh',
    logout: 'auth/logout',
  },
  permissions: 'permissions',
  merchants: {
    list: 'merchants',
    byId: (id: string) => `merchants/${id}`,
    assign: (id: string) => `merchants/${id}/assign`,
    review: (id: string) => `merchants/${id}/review`,
  },
} as const;
