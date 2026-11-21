export const AppRoutes = {
  login: '/login',
  forbidden: '/forbidden',
  merchants: '/merchants',
  merchantNew: '/merchants/new',
  merchantDetail: (id: string) => `/merchants/${id}`,
  merchantEdit: (id: string) => `/merchants/${id}/edit`,
} as const;
