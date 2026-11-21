
const { Router } = require('express');
const { requireAuth, requirePermission, sendError } = require('./http');
const {
  addRiskEvent,
  applyChanges,
  canEdit,
  canView,
  createMerchant,
  findDefaultAssignee,
  findMerchantById,
  findUserById,
  isDecided,
  listMerchants,
  toListItem,
} = require('./store');

const MAX_PAGE_SIZE = 50;

const merchantsRouter = Router();
merchantsRouter.use(requireAuth);

merchantsRouter.get('/', (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const requestedSize = Number(req.query.pageSize) || 10;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedSize));
  const statusFilter = req.query.status ? String(req.query.status) : '';
  const search = String(req.query.q || '').trim().toLowerCase();

  const visible = [];
  for (const merchant of listMerchants()) {
    if (!canView(req.user, merchant)) continue;
    if (statusFilter && merchant.status !== statusFilter) continue;
    if (search && !merchant.merchantName.toLowerCase().includes(search)) continue;
    visible.push(merchant);
  }

  const start = (page - 1) * pageSize;
  const pageRows = visible.slice(start, start + pageSize);

  res.json({
    items: pageRows.map(toListItem),
    total: visible.length,
    page,
    pageSize,
  });
});

merchantsRouter.get('/:id', (req, res) => {
  const merchant = findMerchantById(req.params.id);
  if (!merchant) {
    return sendError(res, 404, 'NOT_FOUND', 'Merchant not found');
  }
  if (!canView(req.user, merchant)) {
    return sendError(res, 403, 'FORBIDDEN', 'Cannot view this merchant');
  }
  res.json(merchant);
});

merchantsRouter.post('/', requirePermission('MERCHANT_CREATE'), (req, res) => {
  const created = createMerchant(req.user.id, req.body || {});
  res.status(201).json(created);
});

merchantsRouter.patch('/:id', requirePermission('MERCHANT_EDIT'), (req, res) => {
  const merchant = findMerchantById(req.params.id);
  if (!merchant) {
    return sendError(res, 404, 'NOT_FOUND', 'Merchant not found');
  }
  if (!canEdit(req.user, merchant)) {
    return sendError(res, 403, 'FORBIDDEN', 'Cannot edit this merchant');
  }
  if (isDecided(merchant)) {
    return sendError(res, 409, 'CONFLICT', 'Merchant is locked after decision');
  }

  const changes = { ...(req.body || {}) };
  let assignee = null;
  if (changes.status && changes.status !== merchant.status) {
    const submitting = merchant.status === 'DRAFT' && changes.status === 'SUBMITTED';
    if (!submitting) {
      return sendError(res, 409, 'CONFLICT', 'Use assign/review to change workflow status');
    }
    assignee = findDefaultAssignee();
    if (assignee) {
      changes.assignedReviewerId = assignee.id;
      changes.status = 'IN_REVIEW';
    }
  }

  const updated = applyChanges(merchant, changes);
  if (assignee) {
    addRiskEvent(updated, {
      actorId: req.user.id,
      action: 'ASSIGNED',
      note: `Assigned to ${assignee.name}`,
    });
  }
  res.json(updated);
});

merchantsRouter.post('/:id/assign', requirePermission('MERCHANT_ASSIGN'), (req, res) => {
  const merchant = findMerchantById(req.params.id);
  if (!merchant) {
    return sendError(res, 404, 'NOT_FOUND', 'Merchant not found');
  }

  const reviewer = findUserById(String(req.body?.reviewerId || ''));
  if (!reviewer || reviewer.role !== 'REVIEWER') {
    return sendError(res, 400, 'BAD_REQUEST', 'reviewerId must be a REVIEWER user');
  }

  applyChanges(merchant, {
    assignedReviewerId: reviewer.id,
    status: merchant.status === 'SUBMITTED' ? 'IN_REVIEW' : merchant.status,
  });
  addRiskEvent(merchant, {
    actorId: req.user.id,
    action: 'ASSIGNED',
    note: req.body?.note || `Assigned to ${reviewer.name}`,
  });
  res.json(merchant);
});

merchantsRouter.post('/:id/review', requirePermission('MERCHANT_REVIEW'), (req, res) => {
  const merchant = findMerchantById(req.params.id);
  if (!merchant) {
    return sendError(res, 404, 'NOT_FOUND', 'Merchant not found');
  }
  if (req.user.role === 'REVIEWER' && merchant.assignedReviewerId !== req.user.id) {
    return sendError(res, 403, 'FORBIDDEN', 'Not assigned to this merchant');
  }

  const decision = String(req.body?.decision || '').toUpperCase();
  if (decision !== 'APPROVED' && decision !== 'REJECTED') {
    return sendError(res, 400, 'BAD_REQUEST', "decision must be 'APPROVED' or 'REJECTED'");
  }
  if (isDecided(merchant)) {
    return sendError(res, 409, 'CONFLICT', 'Merchant already decided');
  }

  applyChanges(merchant, { status: decision });
  addRiskEvent(merchant, {
    actorId: req.user.id,
    action: decision,
    note: String(req.body?.note || ''),
  });
  res.json(merchant);
});

module.exports = { merchantsRouter };
