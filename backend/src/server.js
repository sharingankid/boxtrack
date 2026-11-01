require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const port = process.env.PORT || 3000;

// A single buggy request should never take the whole API down mid-class -
// every route handler already catches its own errors (see controllers), so
// these are a last-resort net for anything that slips through.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception - exiting so the process manager restarts us cleanly:', err);
  process.exit(1);
});

const server = app.listen(port, () => {
  console.log(`BoxTrack API listening on port ${port}`);
});

// Hosting providers send SIGTERM on every redeploy: finish the requests in
// flight and close the database pool instead of cutting them off.
function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
