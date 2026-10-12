const rateLimit = require('express-rate-limit');

// /api/auth/login is the only unauthenticated write endpoint exposed to the
// internet - without this, nothing stops repeated password guessing.
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // The integration suite runs --runInBand (one process, shared store) and
  // legitimately calls /login far more than 10 times per run.
  skip: () => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    res.status(429).json({
      error: { code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts, please try again later.' },
    });
  },
});

module.exports = loginRateLimiter;
