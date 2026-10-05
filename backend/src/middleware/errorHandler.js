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

  console.error(err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
  });
}

module.exports = errorHandler;
