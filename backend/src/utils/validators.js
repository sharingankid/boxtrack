const ApiError = require('./ApiError');

const ID_RE = /^\d+$/;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

// Route params arrive as strings - anything that isn't a plain positive
// integer would otherwise reach Postgres and fail there (22P02).
function assertValidId(id, label = 'id') {
  if (!ID_RE.test(String(id)) || Number(id) < 1) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${label} must be a valid integer`);
  }
}

// Date.parse('2026-02-31') happily returns March 3rd, so the regex alone
// isn't enough: rebuild the date and check nothing rolled over.
function isValidIsoDate(value) {
  if (typeof value !== 'string') return false;
  const match = ISO_DATE_RE.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

// QR codes and athlete photos end up as links/images in the front-end, so
// only http(s) is accepted - `new URL('javascript:alert(1)')` is a perfectly
// valid URL and would otherwise be stored as-is.
function isHttpUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function assertOptionalBoolean(value, label) {
  if (value !== undefined && typeof value !== 'boolean') {
    throw new ApiError(400, 'VALIDATION_ERROR', `${label} must be a boolean`);
  }
}

module.exports = { assertValidId, isValidIsoDate, isHttpUrl, assertOptionalBoolean };
