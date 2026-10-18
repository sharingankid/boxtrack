const qrCodeModel = require('../models/qrCodeModel');
const ApiError = require('../utils/ApiError');

async function list() {
  return qrCodeModel.list();
}

function assertValid(data) {
  if (!data.label) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'label is required');
  }
  if (!data.url) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'url is required');
  }
  try {
    // eslint-disable-next-line no-new
    new URL(data.url);
  } catch {
    throw new ApiError(400, 'VALIDATION_ERROR', 'url must be a valid absolute URL');
  }
}

async function create(data, userId) {
  assertValid(data);
  return qrCodeModel.create(data, userId);
}

async function update(id, data) {
  if (data.label !== undefined && !data.label) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'label cannot be empty');
  }
  if (data.url !== undefined) {
    try {
      // eslint-disable-next-line no-new
      new URL(data.url);
    } catch {
      throw new ApiError(400, 'VALIDATION_ERROR', 'url must be a valid absolute URL');
    }
  }
  const updated = await qrCodeModel.update(id, data);
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'QR code not found');
  }
  return updated;
}

async function remove(id) {
  const deleted = await qrCodeModel.remove(id);
  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'QR code not found');
  }
}

module.exports = { list, create, update, remove };
