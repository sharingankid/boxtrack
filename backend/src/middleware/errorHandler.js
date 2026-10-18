const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }

  // express.json() throws this for a malformed request body - that's a
  // client mistake (400), not a server failure (500).
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON body' } });
  }

  // Safety net: a handful of Postgres error codes are always the client's
  // fault (missing required field, malformed date/number) - surface them as
  // a clean 400 instead of leaking a 500, even if a future field slips past
  // application-level validation. See docs/03-technical-documentation.md.
  const CLIENT_FAULT_PG_CODES = {
    23502: 'A required field is missing',
    22007: 'A date/time value is invalid',
    22008: 'A date/time value is invalid',
    '22P02': 'A field has an invalid format',
    23514: 'A field violates a business rule (e.g. end_time must be after start_time)',
  };
  if (err.code in CLIENT_FAULT_PG_CODES) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: CLIENT_FAULT_PG_CODES[err.code] } });
  }

  console.error(err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
  });
}

module.exports = errorHandler;
