const qrCodeModel = require('../models/qrCodeModel');
const ApiError = require('../utils/ApiError');
const { assertValidId, isHttpUrl } = require('../utils/validators');

async function list() {
  return qrCodeModel.list();
}

function assertValidUrl(url) {
  if (!isHttpUrl(url)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'url must be a valid http(s) URL');
  }
}

function assertValidOrderIndex(orderIndex) {
  if (orderIndex !== undefined && !Number.isInteger(orderIndex)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'order_index must be an integer');
  }
}

function assertValid(data) {
  if (!data.label) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'label is required');
  }
  if (!data.url) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'url is required');
  }
  assertValidUrl(data.url);
  assertValidOrderIndex(data.order_index);
}

async function create(data, userId) {
  assertValid(data);
  return qrCodeModel.create(data, userId);
}

async function update(id, data) {
  assertValidId(id);
  if (data.label !== undefined && !data.label) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'label cannot be empty');
  }
  if (data.url !== undefined) assertValidUrl(data.url);
  assertValidOrderIndex(data.order_index);

  const updated = await qrCodeModel.update(id, data);
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'QR code not found');
  }
  return updated;
}

async function remove(id) {
  assertValidId(id);
  const deleted = await qrCodeModel.remove(id);
  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'QR code not found');
  }
}

module.exports = { list, create, update, remove };
