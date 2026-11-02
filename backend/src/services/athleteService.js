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
  // A client re-sending the athlete it just read gets back the uploaded
  // photo's own /api URL - that's "unchanged", not a new external URL.
  const changes = { ...data };
  if (typeof changes.photo_url === 'string' && changes.photo_url.startsWith(`/api/athletes/${id}/photo`)) {
    delete changes.photo_url;
  }
  assertValidPhotoUrl(changes.photo_url);
  assertOptionalBoolean(changes.active, 'active');

  const updated = await athleteModel.update(id, changes);
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Athlete not found');
  }
  return updated;
}

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

// Identify the image from its first bytes rather than trusting the
// Content-Type header - only these three formats are ever stored or served.
function sniffImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'image/png';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

async function getExistingOrThrow(id) {
  assertValidId(id);
  const athlete = await athleteModel.findById(id);
  if (!athlete) {
    throw new ApiError(404, 'NOT_FOUND', 'Athlete not found');
  }
  return athlete;
}

async function setPhoto(id, body) {
  await getExistingOrThrow(id);
  if (!Buffer.isBuffer(body) || body.length === 0) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Send the image itself as the request body, with Content-Type image/jpeg, image/png or image/webp'
    );
  }
  const contentType = sniffImageType(body);
  if (!contentType) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'The photo must be a JPEG, PNG or WebP image');
  }
  await athleteModel.savePhoto(Number(id), contentType, body);
  return athleteModel.findById(id);
}

async function removePhoto(id) {
  await getExistingOrThrow(id);
  if (!(await athleteModel.deletePhoto(id))) {
    throw new ApiError(404, 'NOT_FOUND', 'This athlete has no uploaded photo');
  }
}

async function getPhoto(id) {
  assertValidId(id);
  const photo = await athleteModel.findPhoto(id);
  if (!photo) {
    throw new ApiError(404, 'NOT_FOUND', 'Photo not found');
  }
  return photo;
}

module.exports = { list, create, update, setPhoto, removePhoto, getPhoto, sniffImageType, MAX_PHOTO_BYTES };
