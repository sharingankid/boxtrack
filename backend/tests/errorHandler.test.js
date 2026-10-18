const errorHandler = require('../src/middleware/errorHandler');
const ApiError = require('../src/utils/ApiError');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  it('formats an ApiError with its own status/code/message', () => {
    const res = mockRes();
    const err = new ApiError(404, 'NOT_FOUND', 'Session not found');

    errorHandler(err, {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: { code: 'NOT_FOUND', message: 'Session not found' } });
  });

  it('falls back to a generic 500 for unexpected errors', () => {
    const res = mockRes();
    const originalError = console.error;
    console.error = jest.fn();

    errorHandler(new Error('boom'), {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
    });

    console.error = originalError;
  });

  it('turns a predictable Postgres NOT NULL violation into a 400, not a 500', () => {
    const res = mockRes();
    const pgErr = new Error('null value in column "format" violates not-null constraint');
    pgErr.code = '23502';

    errorHandler(pgErr, {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: 'A required field is missing' },
    });
  });

  it('turns a predictable Postgres invalid-date-format error into a 400, not a 500', () => {
    const res = mockRes();
    const pgErr = new Error('date/time field value out of range: "cacahuete"');
    pgErr.code = '22007';

    errorHandler(pgErr, {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: 'A date/time value is invalid' },
    });
  });
});
