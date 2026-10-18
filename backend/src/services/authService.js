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

// Compared against when the email doesn't exist, so an unknown email takes
// as long to reject as a wrong password - otherwise the response time alone
// tells an attacker which emails have an account.
const DUMMY_HASH = bcrypt.hashSync('boxtrack-timing-equalizer', 10);

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

async function login(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'email and password are required');
  }

  const user = await userModel.findByEmail(normalizeEmail(email));
  const passwordMatches = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !passwordMatches) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // Housekeeping: expired tokens are already rejected by verifyToken, this
  // just keeps the table from growing forever.
  await sessionModel.deleteExpiredForUser(user.id);

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await sessionModel.create({ userId: user.id, tokenHash: hashToken(token), expiresAt });

  return { token, user: { id: user.id, email: user.email, role: user.role } };
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

module.exports = { login, logout, verifyToken, normalizeEmail };
