const crypto = require('crypto');
const bcrypt = require('bcrypt');
const memberModel = require('../models/memberModel');
const wodModel = require('../models/wodModel');
const scoreService = require('./scoreService');
const ApiError = require('../utils/ApiError');
const { assertValidId } = require('../utils/validators');
const { todayIsoDate } = require('../utils/boxTime');

// Same session scheme as the staff accounts (authService.js): a random token
// for the client, only its SHA-256 stored, valid 7 days, revoked on logout.
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const AVATARS = ['manA', 'manB', 'womanA', 'womanB'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUMMY_HASH = bcrypt.hashSync('boxtrack-member-timing-equalizer', 10);

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function requiredName(value, label) {
  const name = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  if (!name || name.length > 60) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${label} is required (60 characters max)`);
  }
  return name;
}

function publicMember(member) {
  const { id, first_name, last_name, email, avatar } = member;
  return { id, first_name, last_name, email, avatar };
}

async function openSession(member) {
  await memberModel.deleteExpiredSessions(member.id);
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await memberModel.createSession({ athleteId: member.id, tokenHash: hashToken(token), expiresAt });
  return { token, member: publicMember(member), expiresAt };
}

async function register(data = {}) {
  const firstName = requiredName(data.first_name, 'first_name');
  const lastName = requiredName(data.last_name, 'last_name');
  const email = typeof data.email === 'string' ? normalizeEmail(data.email) : '';
  if (!EMAIL_RE.test(email) || email.length > 254) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'email must be a valid email address');
  }
  if (typeof data.password !== 'string' || data.password.length < 8 || data.password.length > 128) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'password must be 8 to 128 characters');
  }
  const avatar = data.avatar === undefined ? 'manA' : data.avatar;
  if (!AVATARS.includes(avatar)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `avatar must be one of ${AVATARS.join(', ')}`);
  }

  let member;
  try {
    member = await memberModel.create({
      firstName,
      lastName,
      email,
      passwordHash: await bcrypt.hash(data.password, 10),
      avatar,
    });
  } catch (err) {
    if (err.code === '23505') {
      throw new ApiError(409, 'EMAIL_TAKEN', 'An account already exists for this email');
    }
    throw err;
  }
  return openSession(member);
}

// Same answer and timing for an unknown email and a wrong password, so the
// response never tells which emails have an account.
async function login(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'email and password are required');
  }
  const account = await memberModel.findByEmail(normalizeEmail(email));
  const matches = await bcrypt.compare(password, account ? account.password_hash : DUMMY_HASH);
  if (!account || !matches || !account.active) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }
  return openSession(account);
}

async function logout(token) {
  await memberModel.deleteSession(hashToken(token));
}

async function verifyToken(token) {
  const session = await memberModel.findSession(hashToken(token));
  if (!session) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Invalid or expired session');
  }
  return { member: publicMember(session), expiresAt: session.expires_at };
}

async function listScores(athleteId) {
  const scores = await memberModel.listScores(athleteId);
  return scores.map((score) => ({
    ...score,
    result_display: scoreService.formatResult(score.format, score.result_value, score.extra_reps),
  }));
}

// A member scores their own WOD - today's or a past one, never a session
// that hasn't happened yet. Validation, storage (one score per athlete per
// WOD, a new entry replaces the old one) and ranking are the coach's own
// (scoreService); `recorded_by` stays NULL to tell it apart.
async function submitScore(athleteId, data = {}) {
  assertValidId(data.wod_id, 'wod_id');
  const wodId = Number(data.wod_id);
  const session = await wodModel.findById(wodId);
  if (!session) {
    throw new ApiError(404, 'NOT_FOUND', 'Session not found');
  }
  if (session.session_date > todayIsoDate()) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'This session has not taken place yet');
  }
  const score = await scoreService.recordScore(wodId, { ...data, athlete_id: athleteId }, null);
  return { score, leaderboard: await scoreService.getLeaderboard(wodId) };
}

module.exports = { register, login, logout, verifyToken, listScores, submitScore, AVATARS };
