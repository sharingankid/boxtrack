// Minimal request logger - no new dependency for something this small.
// One line per request: method, path, status, duration.
function requestLogger(req, res, next) {
  const startedAt = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}

module.exports = requestLogger;
