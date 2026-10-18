const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// Hosting providers (Render, Railway...) put the API behind a reverse proxy:
// without this every request looks like it comes from the proxy's IP, and
// the login rate limiter would lock out everyone at once instead of one
// attacker. Set TRUST_PROXY=1 (number of proxy hops) in production.
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY));
}

// Standard security headers (nosniff, frame-ancestors, HSTS...). The API
// only serves JSON, so helmet's defaults need no tuning.
app.use(helmet());

// Wide open in dev (no FRONTEND_URL set); locked to the deployed frontend
// origin(s) in production via FRONTEND_URL - comma-separated if the front is
// served from more than one domain. See .env.example.
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : null;
app.use(cors(allowedOrigins ? { origin: allowedOrigins } : {}));

// The biggest legitimate payload is a full session (a few KB of text).
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

app.use(errorHandler);

module.exports = app;
