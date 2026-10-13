const scoreModel = require('../models/scoreModel');
const wodModel = require('../models/wodModel');
const ApiError = require('../utils/ApiError');

const CATEGORIES = ['RX', 'Scaled', 'Modified'];
// Lower is better for a race against the clock; everything else (rounds,
// reps, kg) is "more is better" - see schema.sql for why this lives on the
// WOD's format rather than on each score.
const TIME_BASED_FORMATS = ['FOR_TIME', 'CHIPPER'];

function isTimeBased(format) {
  return TIME_BASED_FORMATS.includes(format);
}

async function getWodOrThrow(wodId) {
  const wod = await wodModel.findById(wodId);
  if (!wod) {
    throw new ApiError(404, 'NOT_FOUND', 'Session not found');
  }
  if (!wod.wod) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'This session has no WOD block to score');
  }
  return wod;
}

function rankCategory(scores, ascending) {
  const sorted = [...scores].sort((a, b) => (ascending ? a.result_value - b.result_value : b.result_value - a.result_value));
  return sorted.map((score, index) => ({ rank: index + 1, ...score }));
}

async function getLeaderboard(wodId) {
  const wod = await getWodOrThrow(wodId);
  const scores = await scoreModel.listByWod(wodId);
  const ascending = isTimeBased(wod.wod.format);

  const rankings = {};
  for (const category of CATEGORIES) {
    rankings[category] = rankCategory(scores.filter((s) => s.category === category), ascending);
  }

  return { wod_id: Number(wodId), format: wod.wod.format, sort: ascending ? 'asc' : 'desc', rankings };
}

function assertValid(data) {
  if (!data.athlete_id) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'athlete_id is required');
  }
  if (!CATEGORIES.includes(data.category)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `category must be one of ${CATEGORIES.join(', ')}`);
  }
  if (data.result_value === undefined || data.result_value === null || Number.isNaN(Number(data.result_value))) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'result_value is required and must be a number');
  }
  if (Number(data.result_value) < 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'result_value cannot be negative');
  }
}

async function recordScore(wodId, data, userId) {
  await getWodOrThrow(wodId);
  assertValid(data);
  try {
    return await scoreModel.create(wodId, data, userId);
  } catch (err) {
    if (err.code === '23503') {
      throw new ApiError(400, 'VALIDATION_ERROR', 'athlete_id does not exist');
    }
    throw err;
  }
}

async function remove(id) {
  const deleted = await scoreModel.remove(id);
  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'Score not found');
  }
}

module.exports = { getLeaderboard, recordScore, remove, CATEGORIES };
