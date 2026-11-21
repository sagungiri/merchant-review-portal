const { randomUUID } = require('crypto');
const { merchants: seedMerchants, users: seedUsers } = require('./data');

const DECIDED_STATUSES = new Set(['APPROVED', 'REJECTED']);

const FIELDS_CLIENT_CANNOT_PATCH = new Set(['id', 'createdBy', 'createdAt', 'riskHistory']);

function nowIso() {
  return new Date().toISOString();
}

const users = structuredClone(seedUsers);
const merchants = structuredClone(seedMerchants);

const usersById = new Map(users.map((user) => [user.id, user]));
const usersByEmail = new Map(users.map((user) => [user.email.toLowerCase(), user]));
const merchantsById = new Map(merchants.map((merchant) => [merchant.id, merchant]));

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

function toListItem(merchant) {
  return {
    id: merchant.id,
    merchantName: merchant.merchantName,
    status: merchant.status,
    createdBy: merchant.createdBy,
    assignedReviewerId: merchant.assignedReviewerId,
    updatedAt: merchant.updatedAt,
    createdAt: merchant.createdAt,
  };
}

function findUserById(id) {
  return usersById.get(id) ?? null;
}

function findUserByEmail(email) {
  return usersByEmail.get(String(email || '').trim().toLowerCase()) ?? null;
}

function findDefaultAssignee() {
  return users.find((user) => user.defaultAssignee) ?? null;
}

function findMerchantById(id) {
  return merchantsById.get(id) ?? null;
}

function listMerchants() {
  return merchants;
}

function isDecided(merchant) {
  return DECIDED_STATUSES.has(merchant.status);
}

function canView(user, merchant) {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'SALES') return merchant.createdBy === user.id;
  return merchant.assignedReviewerId === user.id;
}

function canEdit(user, merchant) {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'SALES') return merchant.createdBy === user.id;
  return false;
}

function applyChanges(merchant, changes) {
  for (const [key, value] of Object.entries(changes)) {
    const skip = value === undefined || FIELDS_CLIENT_CANNOT_PATCH.has(key);
    if (skip) continue;
    merchant[key] = value;
  }
  merchant.updatedAt = nowIso();
  return merchant;
}

function addRiskEvent(merchant, { actorId, action, note }) {
  merchant.riskHistory.push({
    id: randomUUID(),
    at: nowIso(),
    actorId,
    action,
    note,
  });
  merchant.updatedAt = nowIso();
}

function createMerchant(ownerId, body = {}) {
  const createdAt = nowIso();
  const merchant = {
    id: randomUUID(),
    merchantName: body.merchantName || 'Untitled Merchant',
    status: 'DRAFT',
    createdBy: ownerId,
    assignedReviewerId: null,
    taxId: body.taxId || '',
    bankAccountLast4: body.bankAccountLast4 || '',
    contactEmail: body.contactEmail || '',
    contactPhone: body.contactPhone || '',
    businessAddress: body.businessAddress || '',
    expectedMonthlyVolume: body.expectedMonthlyVolume || 0,
    riskHistory: [],
    draftStep: body.draftStep || 1,
    updatedAt: createdAt,
    createdAt,
  };

  merchants.unshift(merchant);
  merchantsById.set(merchant.id, merchant);
  return merchant;
}

module.exports = {
  toPublicUser,
  toListItem,
  findUserById,
  findUserByEmail,
  findDefaultAssignee,
  findMerchantById,
  listMerchants,
  isDecided,
  canView,
  canEdit,
  applyChanges,
  addRiskEvent,
  createMerchant,
};
