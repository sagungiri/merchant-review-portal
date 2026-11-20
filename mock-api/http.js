const { hasPermission } = require('./permissions');
const { findUserById, toPublicUser } = require('./store');
const { verifyAccessToken } = require('./tokens');

function sendError(res, status, code, message) {
  return res.status(status).json({
    error: { code, message },
  });
}

function allowCors(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Missing bearer token');
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return sendError(res, 401, 'TOKEN_EXPIRED', 'Access token invalid or expired');
  }

  const user = findUserById(payload.sub);
  if (!user) {
    return sendError(res, 401, 'UNAUTHORIZED', 'User not found');
  }

  req.user = toPublicUser(user);
  next();
}

function requirePermission(code) {
  return (req, res, next) => {
    if (!hasPermission(req.user, code)) {
      return sendError(res, 403, 'FORBIDDEN', 'Insufficient permissions');
    }
    next();
  };
}

module.exports = {
  sendError,
  allowCors,
  requireAuth,
  requirePermission,
};
