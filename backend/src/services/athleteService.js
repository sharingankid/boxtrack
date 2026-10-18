const athleteModel = require('../models/athleteModel');
const ApiError = require('../utils/ApiError');

async function list({ active }) {
  const filter = active === undefined ? undefined : active === 'true';
  return athleteModel.list({ active: filter });
}

function assertValid(data) {
  if (!data.first_name) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'first_name is required');
  }
  if (!data.last_name) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'last_name is required');
  }
}

async function create(data, userId) {
  assertValid(data);
  return athleteModel.create(data, userId);
}

async function update(id, data) {
  if (data.first_name !== undefined && !data.first_name) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'first_name cannot be empty');
  }
  if (data.last_name !== undefined && !data.last_name) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'last_name cannot be empty');
  }

  const updated = await athleteModel.update(id, data);
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Athlete not found');
  }
  return updated;
}

module.exports = { list, create, update };
