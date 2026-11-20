
const PERMISSIONS = [
  { code: 'MERCHANT_VIEW', label: 'View merchants' },
  { code: 'MERCHANT_CREATE', label: 'Create merchants' },
  { code: 'MERCHANT_EDIT', label: 'Edit merchant drafts' },
  { code: 'MERCHANT_ASSIGN', label: 'Assign reviewers' },
  { code: 'MERCHANT_REVIEW', label: 'Approve or reject merchants' },
  { code: 'SENSITIVE_REVEAL', label: 'Reveal masked fields' },
];

const CODES_BY_ROLE = {
  SALES: ['MERCHANT_VIEW', 'MERCHANT_CREATE', 'MERCHANT_EDIT'],
  REVIEWER: ['MERCHANT_VIEW', 'MERCHANT_REVIEW', 'SENSITIVE_REVEAL'],
  ADMIN: PERMISSIONS.map((p) => p.code),
};

function permissionCodesForRole(role) {
  return CODES_BY_ROLE[role] || [];
}

function permissionsForRole(role) {
  const allowed = new Set(permissionCodesForRole(role));
  return PERMISSIONS.filter((p) => allowed.has(p.code));
}

function hasPermission(user, code) {
  return permissionCodesForRole(user?.role).includes(code);
}

module.exports = {
  PERMISSIONS,
  permissionsForRole,
  hasPermission,
};
