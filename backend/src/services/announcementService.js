const announcementModel = require('../models/announcementModel');
const ApiError = require('../utils/ApiError');
const { assertValidId, assertOptionalBoolean } = require('../utils/validators');

async function listPublic() {
  return announcementModel.list({ activeOnly: true });
}

// The shareable link to one announcement (cahier des charges §6: "partagé
// en lien"). An unpublished one is a 404 - same as one that never existed,
// so a link shared before it was pulled down doesn't keep showing it.
async function getPublic(id) {
  assertValidId(id);
  const announcement = await announcementModel.findById(id);
  if (!announcement || !announcement.active) {
    throw new ApiError(404, 'NOT_FOUND', 'Announcement not found');
  }
  return announcement;
}

async function listAll() {
  return announcementModel.list({ activeOnly: false });
}

function assertValid(data) {
  if (!data.title) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'title is required');
  }
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
