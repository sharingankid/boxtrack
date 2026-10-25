const announcementModel = require('../models/announcementModel');
const ApiError = require('../utils/ApiError');
const { assertValidId, assertOptionalBoolean, isValidIsoDate } = require('../utils/validators');
const { todayIsoDate } = require('../utils/boxTime');

async function listPublic() {
  return announcementModel.list({ visibleOn: todayIsoDate() });
}

function isVisible(announcement) {
  return announcement.active && (!announcement.ends_on || announcement.ends_on >= todayIsoDate());
}

// The shareable link to one announcement (cahier des charges §6: "partagé
// en lien"). An unpublished or expired one is a 404 - same as one that
// never existed, so a link shared earlier doesn't keep showing it.
async function getPublic(id) {
  assertValidId(id);
  const announcement = await announcementModel.findById(id);
  if (!announcement || !isVisible(announcement)) {
    throw new ApiError(404, 'NOT_FOUND', 'Announcement not found');
  }
  return announcement;
}

async function listAll() {
  return announcementModel.list();
}

// ends_on is optional: a real YYYY-MM-DD date, or null/"" to clear it.
function assertValidEndsOn(endsOn) {
  if (endsOn !== undefined && endsOn !== null && endsOn !== '' && !isValidIsoDate(endsOn)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'ends_on must be a valid YYYY-MM-DD date');
  }
}

function assertValid(data) {
  if (!data.title) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'title is required');
  }
  assertValidEndsOn(data.ends_on);
}

async function create(data, userId) {
  assertValid(data);
  return announcementModel.create(data, userId);
}

async function update(id, data) {
  assertValidId(id);
  if (data.title !== undefined && !data.title) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'title cannot be empty');
  }
  assertOptionalBoolean(data.active, 'active');
  assertValidEndsOn(data.ends_on);
  const updated = await announcementModel.update(id, data);
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Announcement not found');
  }
  return updated;
}

async function remove(id) {
  assertValidId(id);
  const deleted = await announcementModel.remove(id);
  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'Announcement not found');
  }
}

module.exports = { listPublic, getPublic, listAll, create, update, remove };
