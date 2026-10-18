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

// Every admin route today just requires `requireAuth` - owner, coach, and
// staff accounts all get the same access (see db/schema.sql's comment on
// `users.role`). This exists so a route can be locked down to specific
// roles later without any schema or auth-flow change: chain it after
// requireAuth, e.g. `router.delete('/:id', requireAuth,
// requireRole('owner'), ...)`. Returns 403 (authenticated but not allowed),
// never 401 (that's reserved for missing/invalid tokens, see requireAuth).
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'Your role does not have access to this resource'));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, extractToken };
