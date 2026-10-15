const scoreModel = require('../models/scoreModel');
const wodModel = require('../models/wodModel');
const athleteModel = require('../models/athleteModel');
const ApiError = require('../utils/ApiError');
const { assertValidId } = require('../utils/validators');

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

// Standard competition ranking ("1, 1, 3"): athletes with the exact same
// result share a rank, and the next one skips accordingly - two people
// finishing in 12:34 are both 1st, not 1st and 2nd by insertion order.
function rankCategory(scores, ascending) {
  const sorted = [...scores].sort((a, b) =>
    ascending ? a.result_value - b.result_value : b.result_value - a.result_value
  );
  let rank = 0;
  return sorted.map((score, index) => {
    if (index === 0 || score.result_value !== sorted[index - 1].result_value) rank = index + 1;
    return { rank, ...score };
  });
}

async function getLeaderboard(wodId) {
  assertValidId(wodId);
  const wod = await getWodOrThrow(wodId);
  const scores = await scoreModel.listByWod(wodId);
  const ascending = isTimeBased(wod.wod.format);

  const rankings = {};
  for (const category of CATEGORIES) {
    rankings[category] = rankCategory(
      scores.filter((s) => s.category === category),
      ascending
    );
  }

  return { wod_id: Number(wodId), format: wod.wod.format, sort: ascending ? 'asc' : 'desc', rankings };
}

function assertValid(data) {
  if (data.athlete_id === undefined || data.athlete_id === null) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'athlete_id is required');
  }
  assertValidId(data.athlete_id, 'athlete_id');
  if (!CATEGORIES.includes(data.category)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `category must be one of ${CATEGORIES.join(', ')}`);
  }
  if (
    data.result_value === undefined ||
    data.result_value === null ||
    Number.isNaN(Number(data.result_value))
  ) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'result_value is required and must be a number');
  }
  if (Number(data.result_value) < 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'result_value cannot be negative');
  }
}

// A deactivated athlete keeps their past scores (soft delete, see
// schema.sql) but can't receive new ones - they've left the box.
async function assertActiveAthlete(athleteId) {
  const athlete = await athleteModel.findById(athleteId);
  if (!athlete) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'athlete_id does not exist');
  }
  if (!athlete.active) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'This athlete is deactivated and cannot receive new scores');
  }
}

async function recordScore(wodId, data, userId) {
  assertValidId(wodId);
  await getWodOrThrow(wodId);
  assertValid(data);
  await assertActiveAthlete(data.athlete_id);
  return scoreModel.create(wodId, data, userId);
}

async function remove(id) {
  assertValidId(id);
  const deleted = await scoreModel.remove(id);
  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'Score not found');
  }
}

module.exports = { getLeaderboard, recordScore, remove, CATEGORIES };
