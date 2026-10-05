const wodModel = require('../models/wodModel');
const ApiError = require('../utils/ApiError');

const VALID_FORMATS = ['AMRAP', 'FOR_TIME', 'EMOM', 'TABATA', 'CHIPPER', 'STRENGTH'];
const VALID_KINDS = ['skill', 'strength'];

function assertValidSkillStrength(skillStrength) {
  if (skillStrength && !VALID_KINDS.includes(skillStrength.kind)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `skill_strength.kind must be one of ${VALID_KINDS.join(', ')}`);
  }
}

function assertValidFormat(wod, { required }) {
  if (!wod) return;
  if (!wod.format && !required) return;
  if (!VALID_FORMATS.includes(wod.format)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `wod.format must be one of ${VALID_FORMATS.join(', ')}`);
  }
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function getToday() {
  const wod = await wodModel.findBySessionDate(todayIsoDate());
  if (!wod) {
    throw new ApiError(404, 'NOT_FOUND', 'No session published for today yet');
  }
  return wod;
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
  assertValidSkillStrength(data.skill_strength);
  assertValidFormat(data.wod, { required: false });

  try {
    return await wodModel.create(data, userId);
  } catch (err) {
    if (err.code === '23505') {
      throw new ApiError(409, 'DATE_ALREADY_HAS_SESSION', 'A session already exists for this date');
    }
    throw err;
  }
}

async function update(id, data) {
  assertValidSkillStrength(data.skill_strength);
  assertValidFormat(data.wod, { required: false });

  try {
    const updated = await wodModel.update(id, data);
    if (!updated) {
      throw new ApiError(404, 'NOT_FOUND', 'Session not found');
    }
    return updated;
  } catch (err) {
    if (err.code === '23505') {
      throw new ApiError(409, 'DATE_ALREADY_HAS_SESSION', 'A session already exists for this date');
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
