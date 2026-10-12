const wodModel = require('../models/wodModel');
const ApiError = require('../utils/ApiError');

const VALID_FORMATS = ['AMRAP', 'FOR_TIME', 'EMOM', 'TABATA', 'CHIPPER', 'STRENGTH'];
const VALID_KINDS = ['skill', 'strength'];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function assertValidSessionDate(sessionDate) {
  if (!ISO_DATE_RE.test(sessionDate) || Number.isNaN(Date.parse(sessionDate))) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'session_date must be a valid YYYY-MM-DD date');
  }
}

function assertValidTimeSlot(timeSlot) {
  if (typeof timeSlot !== 'string' || !timeSlot.trim()) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'time_slot must be a non-empty string');
  }
}

function assertValidSkillStrength(skillStrength) {
  if (skillStrength && !VALID_KINDS.includes(skillStrength.kind)) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `skill_strength.kind must be one of ${VALID_KINDS.join(', ')}`
    );
  }
}

// `wod` is the WOD block itself (wod_blocks.format is NOT NULL in the
// schema) - as soon as the caller sends a `wod` object at all, its format
// is mandatory, not just "mandatory if required". Previously `wod: {}`
// slipped past this check and crashed the DB insert with a 500 instead of
// a clean 400 (format column is NOT NULL).
function assertValidFormat(wod) {
  if (!wod) return;
  if (!wod.format || !VALID_FORMATS.includes(wod.format)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `wod.format must be one of ${VALID_FORMATS.join(', ')}`);
  }
}

function assertValidMovements(movements, label) {
  if (movements === undefined) return;
  if (!Array.isArray(movements)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${label}.movements must be an array`);
  }
  movements.forEach((movement, index) => {
    if (!movement || typeof movement.movement_name !== 'string' || !movement.movement_name.trim()) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        `${label}.movements[${index}].movement_name is required`
      );
    }
  });
}

// BoxTrack only runs for CrossFit LAB (Toulouse), so "today" must follow
// Europe/Paris wall-clock time, not UTC - otherwise /wods/today shows
// yesterday's session for part of the night (UTC lags Paris by 1-2h).
const TODAY_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function todayIsoDate() {
  return TODAY_FORMATTER.format(new Date());
}

// A date can have more than one session (different time slots) - always
// returns an array, empty if nothing is published yet, never a 404.
async function getToday() {
  return wodModel.findAllBySessionDate(todayIsoDate());
}

async function getById(id) {
  const wod = await wodModel.findById(id);
  if (!wod) {
    throw new ApiError(404, 'NOT_FOUND', 'Session not found');
  }
  return wod;
}

async function list({ from, to }) {
  return wodModel.listSummaries({ from, to });
}

async function create(data, userId) {
  if (!data.session_date) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'session_date is required');
  }
  assertValidSessionDate(data.session_date);
  if (!data.time_slot) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'time_slot is required - a date can have more than one session'
    );
  }
  assertValidTimeSlot(data.time_slot);
  assertValidSkillStrength(data.skill_strength);
  assertValidMovements(data.skill_strength?.movements, 'skill_strength');
  assertValidFormat(data.wod);
  assertValidMovements(data.wod?.movements, 'wod');

  try {
    return await wodModel.create(data, userId);
  } catch (err) {
    if (err.code === '23505') {
      throw new ApiError(
        409,
        'SLOT_ALREADY_HAS_SESSION',
        'A session already exists for this date and time slot'
      );
    }
    throw err;
  }
}

async function update(id, data) {
  if (data.session_date !== undefined) assertValidSessionDate(data.session_date);
  if (data.time_slot !== undefined) assertValidTimeSlot(data.time_slot);
  assertValidSkillStrength(data.skill_strength);
  assertValidMovements(data.skill_strength?.movements, 'skill_strength');
  assertValidFormat(data.wod);
  assertValidMovements(data.wod?.movements, 'wod');

  try {
    const updated = await wodModel.update(id, data);
    if (!updated) {
      throw new ApiError(404, 'NOT_FOUND', 'Session not found');
    }
    return updated;
  } catch (err) {
    if (err.code === '23505') {
      throw new ApiError(
        409,
        'SLOT_ALREADY_HAS_SESSION',
        'A session already exists for this date and time slot'
      );
    }
    throw err;
  }
}

async function remove(id) {
  const deleted = await wodModel.remove(id);
  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'Session not found');
  }
}

module.exports = { getToday, getById, list, create, update, remove };
