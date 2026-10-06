const { extractToken } = require('../src/middleware/auth');

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
