const authService = require('../services/authService');
const ApiError = require('../utils/ApiError');

function extractToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new ApiError(401, 'UNAUTHENTICATED', 'Missing or malformed Authorization header');
    }
    req.user = await authService.verifyToken(token);
    req.authToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth, extractToken };
