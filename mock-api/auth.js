const { Router } = require('express');
const { sendError } = require('./http');
const { findUserByEmail, findUserById, toPublicUser } = require('./store');
const {
  clearRefreshCookie,
  consumeRefreshToken,
  issueTokens,
  readRefreshCookie,
  revokeRefreshToken,
  setRefreshCookie,
} = require('./tokens');

const authRouter = Router();

function sendSession(res, user, tokens) {
  setRefreshCookie(res, tokens.refreshToken);
  res.json({
    accessToken: tokens.accessToken,
    expiresInMs: tokens.expiresInMs,
    user: toPublicUser(user),
  });
}

authRouter.post('/login', (req, res) => {
  const user = findUserByEmail(req.body?.email);
  const passwordMatches = user && user.password === String(req.body?.password || '');

  if (!passwordMatches) {
    return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  return sendSession(res, user, issueTokens(user.id));
});

authRouter.post('/refresh', (req, res) => {
  const refreshToken = readRefreshCookie(req) || String(req.body?.refreshToken || '');
  if (!refreshToken) {
    return sendError(res, 400, 'BAD_REQUEST', 'Refresh cookie is missing');
  }

  const result = consumeRefreshToken(refreshToken);
  if (!result) {
    clearRefreshCookie(res);
    return sendError(res, 401, 'REFRESH_FAILED', 'Refresh token invalid, rotated, or expired');
  }

  const user = findUserById(result.userId);
  if (!user) {
    clearRefreshCookie(res);
    return sendError(res, 401, 'REFRESH_FAILED', 'User not found');
  }

  return sendSession(res, user, result.tokens);
});

authRouter.post('/logout', (req, res) => {
  revokeRefreshToken(readRefreshCookie(req));
  clearRefreshCookie(res);
  res.status(204).end();
});

module.exports = { authRouter };
