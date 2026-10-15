const { assertValidId, isValidIsoDate, isHttpUrl, assertOptionalBoolean } = require('../src/utils/validators');

describe('isValidIsoDate', () => {
  it('accepts a real calendar date', () => {
    expect(isValidIsoDate('2026-10-15')).toBe(true);
    expect(isValidIsoDate('2028-02-29')).toBe(true);
  });

  it('rejects dates that only look valid', () => {
    expect(isValidIsoDate('2026-02-31')).toBe(false);
    expect(isValidIsoDate('2026-02-29')).toBe(false);
    expect(isValidIsoDate('2026-13-01')).toBe(false);
  });

  it('rejects other formats and non-strings', () => {
    expect(isValidIsoDate('15/10/2026')).toBe(false);
    expect(isValidIsoDate('2026-10-15T18:00')).toBe(false);
    expect(isValidIsoDate(undefined)).toBe(false);
  });
});

describe('isHttpUrl', () => {
  it('accepts http and https links', () => {
    expect(isHttpUrl('https://instagram.com/crossfitlab')).toBe(true);
    expect(isHttpUrl('http://example.com')).toBe(true);
  });

  it('rejects script and data URLs', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('rejects relative or malformed values', () => {
    expect(isHttpUrl('/admin')).toBe(false);
    expect(isHttpUrl('not a url')).toBe(false);
    expect(isHttpUrl(42)).toBe(false);
  });
});

describe('assertValidId', () => {
  it('accepts positive integers, as numbers or route-param strings', () => {
    expect(() => assertValidId(3)).not.toThrow();
    expect(() => assertValidId('12')).not.toThrow();
  });

  it('rejects anything else with a 400', () => {
    for (const bad of ['abc', '1.5', '-1', '0', '', '1; DROP TABLE wods']) {
      expect(() => assertValidId(bad)).toThrow(expect.objectContaining({ status: 400 }));
    }
  });
});

describe('assertOptionalBoolean', () => {
  it('lets undefined and real booleans through', () => {
    expect(() => assertOptionalBoolean(undefined, 'active')).not.toThrow();
    expect(() => assertOptionalBoolean(false, 'active')).not.toThrow();
  });

  it('rejects boolean-looking strings', () => {
    expect(() => assertOptionalBoolean('false', 'active')).toThrow(expect.objectContaining({ status: 400 }));
  });
});
