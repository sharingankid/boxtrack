const { extractToken, requireRole } = require('../src/middleware/auth');

describe('extractToken', () => {
  it('reads the token out of a well-formed Bearer header', () => {
    const req = { headers: { authorization: 'Bearer abc123' } };
    expect(extractToken(req)).toBe('abc123');
  });

  it('returns null when the header is missing', () => {
    expect(extractToken({ headers: {} })).toBeNull();
  });

  it('returns null when the scheme is not Bearer', () => {
    const req = { headers: { authorization: 'Basic abc123' } };
    expect(extractToken(req)).toBeNull();
  });

  it('returns null when the header has no token', () => {
    const req = { headers: { authorization: 'Bearer' } };
    expect(extractToken(req)).toBeNull();
  });
});

describe('requireRole', () => {
  function run(req, allowedRoles) {
    let error;
    requireRole(...allowedRoles)(req, {}, (err) => {
      error = err;
    });
    return error;
  }

  it('calls next() with no error when the user has an allowed role', () => {
    expect(run({ user: { role: 'owner' } }, ['owner', 'coach'])).toBeUndefined();
  });

  it('calls next(err) with a 403 FORBIDDEN when the role is not allowed', () => {
    const err = run({ user: { role: 'staff' } }, ['owner']);
    expect(err).toMatchObject({ status: 403, code: 'FORBIDDEN' });
  });

  it('denies a missing user/role the same way (never crashes)', () => {
    const err = run({}, ['coach']);
    expect(err).toMatchObject({ status: 403, code: 'FORBIDDEN' });
  });
});
