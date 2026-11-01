const announcementModel = require('../models/announcementModel');
const ApiError = require('../utils/ApiError');
const { assertValidId, assertOptionalBoolean } = require('../utils/validators');

async function listPublic() {
  return announcementModel.list({ activeOnly: true });
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

module.exports = { listPublic, listAll, create, update, remove };
