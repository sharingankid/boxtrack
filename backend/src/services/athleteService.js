const athleteModel = require('../models/athleteModel');
const ApiError = require('../utils/ApiError');
const { assertValidId, isHttpUrl, assertOptionalBoolean } = require('../utils/validators');

async function list({ active }) {
  if (active !== undefined && active !== 'true' && active !== 'false') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'active must be true or false');
  }
  const filter = active === undefined ? undefined : active === 'true';
  return athleteModel.list({ active: filter });
}

// photo_url is optional (cahier des charges §6: "photo optionnelle") but,
// when present, it ends up in an <img src> - http(s) only.
function assertValidPhotoUrl(photoUrl) {
  if (photoUrl !== undefined && photoUrl !== null && photoUrl !== '' && !isHttpUrl(photoUrl)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'photo_url must be a valid http(s) URL');
  }
}

function assertValid(data) {
  if (!data.first_name) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'first_name is required');
  }
  if (!data.last_name) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'last_name is required');
  }
  assertValidPhotoUrl(data.photo_url);
}

async function create(data, userId) {
  assertValid(data);
  return athleteModel.create(data, userId);
}

async function update(id, data) {
  assertValidId(id);
  if (data.first_name !== undefined && !data.first_name) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'first_name cannot be empty');
  }
  if (data.last_name !== undefined && !data.last_name) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'last_name cannot be empty');
  }
  assertValidPhotoUrl(data.photo_url);
  assertOptionalBoolean(data.active, 'active');

  const updated = await athleteModel.update(id, data);
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Athlete not found');
  }
  return updated;
}

module.exports = { list, create, update };
