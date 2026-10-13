const wodModel = require('../models/wodModel');
const ApiError = require('../utils/ApiError');

const VALID_FORMATS = ['AMRAP', 'FOR_TIME', 'EMOM', 'TABATA', 'CHIPPER', 'STRENGTH'];
const VALID_KINDS = ['skill', 'strength'];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const ID_RE = /^\d+$/;

function assertValidId(id) {
  if (!ID_RE.test(String(id))) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'id must be a valid integer');
  }
}

function assertValidSessionDate(sessionDate) {
  if (!ISO_DATE_RE.test(sessionDate) || Number.isNaN(Date.parse(sessionDate))) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'session_date must be a valid YYYY-MM-DD date');
  }
}

function assertValidTime(value, label) {
  if (typeof value !== 'string' || !HHMM_RE.test(value)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${label} must be a valid HH:mm time`);
  }
}

// Only checked when both ends of the pair are actually present - a PUT that
// only changes one of start_time/end_time still gets a correctness check,
// just enforced at the DB level (CHECK end_time > start_time, mapped to a
// clean 400 by errorHandler.js's 23514 handling) since the other value isn't
// known here without an extra read.
function assertEndAfterStart(startTime, endTime) {
  if (startTime !== undefined && endTime !== undefined && endTime <= startTime) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'end_time must be after start_time');
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

// BoxTrack only runs for CrossFit LAB (Toulouse), so "today" and "now" must
// follow Europe/Paris wall-clock time, not UTC or the server's local time -
// otherwise /wods/today and the TV "current session" logic drift by 1-2h.
const TODAY_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Paris',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function todayIsoDate() {
  return TODAY_FORMATTER.format(new Date());
}

function nowHoursMinutes() {
  return TIME_FORMATTER.format(new Date());
}

// A date can have more than one session (different schedules) - always
// returns an array, empty if nothing is published yet, never a 404.
async function getToday() {
  return wodModel.findAllBySessionDate(todayIsoDate());
}

// Everything the TV view needs to pick "what's on screen right now" without
// the front-end having to reimplement timezone-aware time comparison -
// see backend/API_CONTRACT.md "TV view data" for the exact contract this
// implements (the backend-computed approach, chosen over handing the
// front-end a sorted list and a clock).
async function getTvState() {
  const referenceDate = todayIsoDate();
  const referenceTime = nowHoursMinutes();
  const sessions = await wodModel.findAllBySessionDate(referenceDate);

  const current = sessions.find((s) => s.start_time <= referenceTime && referenceTime < s.end_time) || null;
  const next = sessions.find((s) => s.start_time > referenceTime) || null;
  const remaining = sessions.filter((s) => s.end_time > referenceTime);

  return {
    reference_date: referenceDate,
    reference_time: referenceTime,
    timezone: 'Europe/Paris',
    current,
    next,
    remaining,
  };
}

async function getById(id) {
  assertValidId(id);
  const wod = await wodModel.findById(id);
  if (!wod) {
    throw new ApiError(404, 'NOT_FOUND', 'Session not found');
  }
  return wod;
}

async function list({ from, to }) {
  if (from !== undefined) assertValidSessionDate(from);
  if (to !== undefined) assertValidSessionDate(to);
  return wodModel.listSummaries({ from, to });
}

function assertCompleteSchedule(data) {
  if (!data.session_date) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'session_date is required');
  }
  assertValidSessionDate(data.session_date);
  if (!data.start_time) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'start_time is required');
  }
  if (!data.end_time) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'end_time is required');
  }
  assertValidTime(data.start_time, 'start_time');
  assertValidTime(data.end_time, 'end_time');
  assertEndAfterStart(data.start_time, data.end_time);
}

function assertRestOfPayload(data) {
  assertValidSkillStrength(data.skill_strength);
  assertValidMovements(data.skill_strength?.movements, 'skill_strength');
  assertValidFormat(data.wod);
  assertValidMovements(data.wod?.movements, 'wod');
}

// Both the exact-duplicate-slot conflict (23505, from the
// (session_date, start_time) unique constraint) and the end<=start
// conflict (23514, the wods_end_after_start CHECK - only reachable here via
// a PUT that only sends one of the two fields, see assertEndAfterStart)
// surface as clean business errors, never a 500.
function mapScheduleConflict(err) {
  if (err.code === '23505') {
    return new ApiError(409, 'DUPLICATE_SESSION', 'A session already exists for this exact date and start_time');
  }
  if (err.code === '23514') {
    return new ApiError(400, 'VALIDATION_ERROR', 'end_time must be after start_time');
  }
  return err;
}

async function create(data, userId) {
  assertCompleteSchedule(data);
  assertRestOfPayload(data);

  try {
    return await wodModel.create(data, userId);
  } catch (err) {
    throw mapScheduleConflict(err);
  }
}

async function update(id, data) {
  assertValidId(id);
  if (data.session_date !== undefined) assertValidSessionDate(data.session_date);
  if (data.start_time !== undefined) assertValidTime(data.start_time, 'start_time');
  if (data.end_time !== undefined) assertValidTime(data.end_time, 'end_time');
  assertEndAfterStart(data.start_time, data.end_time);
  assertRestOfPayload(data);

  try {
    const updated = await wodModel.update(id, data);
    if (!updated) {
      throw new ApiError(404, 'NOT_FOUND', 'Session not found');
    }
    return updated;
  } catch (err) {
    throw mapScheduleConflict(err);
  }
}

async function remove(id) {
  assertValidId(id);
  const deleted = await wodModel.remove(id);
  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'Session not found');
  }
}

// Copies a session's full content (Warm-Up, Skill/Strength, WOD) onto a new
// date/time. `overrides` is whatever subset of {session_date, start_time,
// end_time, title} the caller wants different from the source - anything
// omitted is copied as-is, which means duplicating onto the exact same slot
// (no overrides at all) correctly 409s, same as any other exact-duplicate
// attempt. See backend/API_CONTRACT.md "Duplicating a session".
async function duplicate(id, overrides, userId) {
  assertValidId(id);
  const source = await getById(id);

  const payload = {
    session_date: overrides.session_date ?? source.session_date,
    start_time: overrides.start_time ?? source.start_time,
    end_time: overrides.end_time ?? source.end_time,
    title: overrides.title !== undefined ? overrides.title : source.title,
    warmup: source.warmup,
    skill_strength: source.skill_strength,
    wod: source.wod,
  };
  assertCompleteSchedule(payload);

  try {
    return await wodModel.create(payload, userId);
  } catch (err) {
    throw mapScheduleConflict(err);
  }
}

module.exports = { getToday, getTvState, getById, list, create, update, remove, duplicate };
