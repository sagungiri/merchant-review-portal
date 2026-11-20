
const express = require('express');
const { merchantsRouter } = require('./merchants');
const { authRouter } = require('./auth');
const { allowCors, requireAuth, sendError } = require('./http');
const { permissionsForRole } = require('./permissions');
const { ACCESS_TTL_MS } = require('./tokens');

const PORT = Number(process.env.MOCK_API_PORT) || 3000;

const app = express();
app.disable('x-powered-by');
app.use(allowCors);
app.use(express.json({ limit: '100kb' }));

app.use('/api/auth', authRouter);
app.get('/api/permissions', requireAuth, (req, res) => {
  res.json({ permissions: permissionsForRole(req.user.role) });
});
app.use('/api/merchants', merchantsRouter);

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large') {
    return sendError(res, 413, 'PAYLOAD_TOO_LARGE', 'Request body too large');
  }
  console.error('[mock-api]', err);
  return sendError(res, 500, 'INTERNAL', 'Unexpected server error');
});

app.listen(PORT, () => {
  console.log(`[mock-api] http://localhost:${PORT}`);
  console.log(`[mock-api] access tokens last ${ACCESS_TTL_MS / 1000}s`);
});
