

const ACCESS_TTL_MS = 90_000;
const REFRESH_TTL_MS = 1 * 24 * 60 * 60_000;
const REFRESH_COOKIE = 'mrp_refresh';

const refreshSessions = new Map();

function encode(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decode(token) {
  try {
    return JSON.parse(Buffer.from(token, 'base64url').toString());
  } catch {
    return null;
  }
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function issueTokens(userId) {
  const now = Date.now();
  const refreshId = createId();

  refreshSessions.set(refreshId, {
    userId,
    expiresAt: now + REFRESH_TTL_MS,
    rotated: false,
  });

  return {
    accessToken: encode({
      typ: 'access',
      sub: userId,
      exp: now + ACCESS_TTL_MS,
      jti: createId(),
    }),
    refreshToken: encode({
      typ: 'refresh',
      sub: userId,
      exp: now + REFRESH_TTL_MS,
      jti: refreshId,
    }),
    expiresInMs: ACCESS_TTL_MS,
  };
}

function verifyAccessToken(token) {
  const payload = decode(token);
  if (!payload) return null;
  if (payload.typ !== 'access') return null;
  if (Date.now() >= payload.exp) return null;
  return payload;
}

function consumeRefreshToken(token) {
  const payload = decode(token);
  if (!payload || payload.typ !== 'refresh' || !payload.jti) {
    return null;
  }

  const session = refreshSessions.get(payload.jti);
  if (!session) return null;
  if (session.rotated) return null;
  if (Date.now() >= session.expiresAt) return null;

  session.rotated = true;
  return {
    userId: session.userId,
    tokens: issueTokens(session.userId),
  };
}

function revokeRefreshToken(token) {
  const payload = decode(token);
  if (!payload?.jti) return;
  const session = refreshSessions.get(payload.jti);
  if (session) session.rotated = true;
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

function refreshCookieHeader(value, maxAgeSec) {
  return [
    `${REFRESH_COOKIE}=${encodeURIComponent(value)}`,
    'HttpOnly',
    'Path=/api/auth',
    'SameSite=Lax',
    `Max-Age=${maxAgeSec}`,
  ].join('; ');
}

function setRefreshCookie(res, refreshToken) {
  res.setHeader('Set-Cookie', refreshCookieHeader(refreshToken, Math.floor(REFRESH_TTL_MS / 1000)));
}

function clearRefreshCookie(res) {
  res.setHeader('Set-Cookie', refreshCookieHeader('', 0));
}

function readRefreshCookie(req) {
  return readCookie(req, REFRESH_COOKIE);
}

module.exports = {
  ACCESS_TTL_MS,
  REFRESH_COOKIE,
  issueTokens,
  verifyAccessToken,
  consumeRefreshToken,
  revokeRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  readRefreshCookie,
};
