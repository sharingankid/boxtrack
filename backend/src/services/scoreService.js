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
// A whole class entered at once - generous for a box, small enough that a
// single request can't turn into a bulk import.
const MAX_BATCH = 60;

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

// "12:34" or "1:02:03" -> seconds. Coaches read times off the clock in this
// form, so the API accepts it directly instead of every client converting.
const TIME_RE = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/;
function parseTime(value) {
  const match = typeof value === 'string' ? TIME_RE.exec(value.trim()) : null;
  if (!match) return null;
  const [hours, minutes, seconds] = [Number(match[1] || 0), Number(match[2]), Number(match[3])];
  if (seconds > 59 || (match[1] !== undefined && minutes > 59)) return null;
  return hours * 3600 + minutes * 60 + seconds;
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

// Turns what the coach typed into the two stored numbers, according to the
// WOD's format (cahier des charges §4: the score's shape depends on it):
//   FOR_TIME / CHIPPER  time "MM:SS" or result_value in seconds
//   AMRAP               rounds + reps (8 rds + 12)
//   EMOM / TABATA       result_value (rounds, reps)
//   STRENGTH            result_value (kg)
function parseResult(format, data, label) {
  if (format === 'AMRAP') {
    if (!isNonNegativeInteger(data.rounds)) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        `${label}rounds is required for an AMRAP and must be a whole number (score = rounds + reps)`
      );
    }
    const reps = data.reps === undefined || data.reps === null ? 0 : data.reps;
    if (!isNonNegativeInteger(reps)) {
      throw new ApiError(400, 'VALIDATION_ERROR', `${label}reps must be a whole number`);
    }
    return { result_value: data.rounds, extra_reps: reps };
  }

  if (isTimeBased(format) && data.time !== undefined) {
    const seconds = parseTime(data.time);
    if (seconds === null) {
      throw new ApiError(400, 'VALIDATION_ERROR', `${label}time must look like MM:SS or H:MM:SS`);
    }
    return { result_value: seconds, extra_reps: null };
  }

  if (
    data.result_value === undefined ||
    data.result_value === null ||
    data.result_value === '' ||
    Number.isNaN(Number(data.result_value))
  ) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${label}result_value is required and must be a number`);
  }
  if (Number(data.result_value) < 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${label}result_value cannot be negative`);
  }
  return { result_value: Number(data.result_value), extra_reps: null };
}

function pad(number) {
  return String(number).padStart(2, '0');
}

// The same human-readable score everywhere (public page, TV, admin), so no
// client has to know how each format is stored.
function formatResult(format, resultValue, extraReps) {
  if (isTimeBased(format)) {
    const total = Math.round(resultValue);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
  }
  if (format === 'AMRAP') {
    // Scores entered before migration 002 are a total rep count.
    return extraReps === null || extraReps === undefined
      ? `${resultValue} reps`
      : `${resultValue} rds + ${extraReps}`;
  }
  if (format === 'STRENGTH') return `${resultValue} kg`;
  return String(resultValue);
}

// Standard competition ranking ("1, 1, 3"): athletes with the exact same
// result share a rank, and the next one skips accordingly - two people
// finishing in 12:34 are both 1st, not 1st and 2nd by insertion order. For
// an AMRAP, extra reps break a tie on rounds.
function rankCategory(scores, ascending) {
  const compare = (a, b) => {
    const primary = ascending ? a.result_value - b.result_value : b.result_value - a.result_value;
    if (primary !== 0) return primary;
    return (b.extra_reps || 0) - (a.extra_reps || 0);
  };
  const sorted = [...scores].sort(compare);
  let rank = 0;
  return sorted.map((score, index) => {
    if (index === 0 || compare(score, sorted[index - 1]) !== 0) rank = index + 1;
    return { rank, ...score };
  });
}

function withDisplay(format, score) {
  return { ...score, result_display: formatResult(format, score.result_value, score.extra_reps) };
}

async function getLeaderboard(wodId) {
  assertValidId(wodId);
  const wod = await getWodOrThrow(wodId);
  const { format } = wod.wod;
  const scores = (await scoreModel.listByWod(wodId)).map((score) => withDisplay(format, score));
  const ascending = isTimeBased(format);

  const rankings = {};
  for (const category of CATEGORIES) {
    rankings[category] = rankCategory(
      scores.filter((s) => s.category === category),
      ascending
    );
  }

  return { wod_id: Number(wodId), format, sort: ascending ? 'asc' : 'desc', rankings };
}

// Validates one entry and returns exactly what gets stored.
function toScoreRow(format, data, label = '') {
  if (!data || typeof data !== 'object') {
    throw new ApiError(400, 'VALIDATION_ERROR', `${label}score must be an object`);
  }
  if (data.athlete_id === undefined || data.athlete_id === null) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${label}athlete_id is required`);
  }
  assertValidId(data.athlete_id, `${label}athlete_id`);
  if (!CATEGORIES.includes(data.category)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${label}category must be one of ${CATEGORIES.join(', ')}`);
  }
  return {
    athlete_id: Number(data.athlete_id),
    category: data.category,
    ...parseResult(format, data, label),
  };
}

// A deactivated athlete keeps their past scores (soft delete, see
// schema.sql) but can't receive new ones - they've left the box.
function assertActiveAthlete(athlete, label = '') {
  if (!athlete) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${label}athlete_id does not exist`);
  }
  if (!athlete.active) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `${label}This athlete is deactivated and cannot receive new scores`
    );
  }
}

async function recordScore(wodId, data, userId) {
  assertValidId(wodId);
  const wod = await getWodOrThrow(wodId);
  const row = toScoreRow(wod.wod.format, data);
  assertActiveAthlete(await athleteModel.findById(row.athlete_id));
  return withDisplay(wod.wod.format, await scoreModel.create(wodId, row, userId));
}

// The end-of-class flow (cahier des charges §5: "saisie pour chaque athlète
// présent"): every score of the class in one request, all-or-nothing - the
// whole batch is validated before anything is written, and written in one
// transaction. Returns the resulting leaderboard, ready to display.
async function recordScores(wodId, data, userId) {
  assertValidId(wodId);
  const wod = await getWodOrThrow(wodId);
  const entries = data && data.scores;
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'scores must be a non-empty array');
  }
  if (entries.length > MAX_BATCH) {
    throw new ApiError(400, 'VALIDATION_ERROR', `scores cannot hold more than ${MAX_BATCH} entries`);
  }

  const rows = entries.map((entry, index) => toScoreRow(wod.wod.format, entry, `scores[${index}].`));
  const seen = new Set();
  rows.forEach((row, index) => {
    if (seen.has(row.athlete_id)) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        `scores[${index}].athlete_id appears more than once in this batch`
      );
    }
    seen.add(row.athlete_id);
  });

  const athletes = await athleteModel.findByIds([...seen]);
  const byId = new Map(athletes.map((athlete) => [athlete.id, athlete]));
  rows.forEach((row, index) => assertActiveAthlete(byId.get(row.athlete_id), `scores[${index}].`));

  await scoreModel.upsertMany(wodId, rows, userId);
  return getLeaderboard(wodId);
}

async function remove(id) {
  assertValidId(id);
  const deleted = await scoreModel.remove(id);
  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'Score not found');
  }
}

module.exports = {
  getLeaderboard,
  recordScore,
  recordScores,
  remove,
  parseTime,
  formatResult,
  CATEGORIES,
};
