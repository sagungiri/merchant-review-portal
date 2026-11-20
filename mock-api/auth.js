const { Router } = require('express');
const { sendError } = require('./http');
const { findUserByEmail, findUserById, toPublicUser } = require('./store');
const { consumeRefreshToken, issueTokens } = require('./tokens');

const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const user = findUserByEmail(req.body?.email);
  const passwordMatches = user && user.password === String(req.body?.password || '');

  if (!passwordMatches) {
    return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  res.json({
    ...issueTokens(user.id),
    user: toPublicUser(user),
  });
});

authRouter.post('/refresh', (req, res) => {
  const refreshToken = String(req.body?.refreshToken || '');
  if (!refreshToken) {
    return sendError(res, 400, 'BAD_REQUEST', 'refreshToken is required');
  }

  const result = consumeRefreshToken(refreshToken);
  if (!result) {
    return sendError(res, 401, 'REFRESH_FAILED', 'Refresh token invalid, rotated, or expired');
  }

  const user = findUserById(result.userId);
  if (!user) {
    return sendError(res, 401, 'REFRESH_FAILED', 'User not found');
  }

  res.json({
    ...result.tokens,
    user: toPublicUser(user),
  });
});

module.exports = { authRouter };
