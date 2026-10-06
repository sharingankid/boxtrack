const crypto = require('crypto');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const ApiError = require('../utils/ApiError');

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// Tokens are high-entropy random values, not passwords - a fast SHA-256 is
// appropriate here (bcrypt is reserved for the low-entropy password itself,
// and would be wasteful to run on every authenticated request).
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function login(email, password) {
  if (!email || !password) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'email and password are required');
  }

  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await sessionModel.create({ userId: user.id, tokenHash: hashToken(token), expiresAt });

  return { token, user: { id: user.id, email: user.email } };
}

async function logout(token) {
  await sessionModel.deleteByTokenHash(hashToken(token));
}

async function verifyToken(token) {
  const session = await sessionModel.findValidByTokenHash(hashToken(token));
  if (!session) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Invalid or expired session');
  }
  return { id: session.user_id, email: session.email, role: session.role };
}

module.exports = { login, logout, verifyToken };
