const memberService = require('../services/memberService');
const ApiError = require('../utils/ApiError');
const { extractToken } = require('./auth');

// Member routes only: checks member_sessions, never the staff `sessions`
// table, so a member token and a coach token can't stand in for each other.
async function requireMember(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new ApiError(401, 'UNAUTHENTICATED', 'Missing or malformed Authorization header');
    }
    const { member, expiresAt } = await memberService.verifyToken(token);
    req.member = member;
    req.memberExpiresAt = expiresAt;
    req.authToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireMember };
