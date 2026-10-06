const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, seedCoach, closePool } = require('./helpers/testDb');
const { loginToken } = require('./helpers/auth');

describe('Admin WOD routes - validation', () => {
  let token;

  beforeEach(async () => {
    await resetDatabase();
    await seedCoach();
    token = await loginToken();
  });

  afterAll(async () => {
    await closePool();
  });

  function post(body) {
    return request(app).post('/api/admin/wods').set('Authorization', `Bearer ${token}`).send(body);
  }

  it('rejects a missing session_date', async () => {
    const res = await post({ time_slot: '18:00' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a missing time_slot', async () => {
    const res = await post({ session_date: '2026-11-01' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an invalid skill_strength.kind', async () => {
    const res = await post({
      session_date: '2026-11-01',
      time_slot: '18:00',
      skill_strength: { kind: 'cardio' },
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an invalid wod.format', async () => {
    const res = await post({
      session_date: '2026-11-01',
      time_slot: '18:00',
      wod: { format: 'HYROX' },
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('accepts every one of the 6 supported WOD formats', async () => {
    const formats = ['AMRAP', 'FOR_TIME', 'EMOM', 'TABATA', 'CHIPPER', 'STRENGTH'];
    for (const [index, format] of formats.entries()) {
      // eslint-disable-next-line no-await-in-loop
      const res = await post({
        session_date: '2026-11-01',
        time_slot: `slot-${index}`,
        wod: { format },
      });
      expect(res.status).toBe(201);
      expect(res.body.wod.wod.format).toBe(format);
    }
  });

  it('rejects a duplicate (session_date, time_slot) with 409 SLOT_ALREADY_HAS_SESSION', async () => {
    const first = await post({ session_date: '2026-11-01', time_slot: '18:00' });
    expect(first.status).toBe(201);

    const duplicate = await post({ session_date: '2026-11-01', time_slot: '18:00' });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('SLOT_ALREADY_HAS_SESSION');
  });

  it('allows the same date with a different time_slot', async () => {
    const first = await post({ session_date: '2026-11-01', time_slot: '06:00' });
    expect(first.status).toBe(201);

    const second = await post({ session_date: '2026-11-01', time_slot: '18:00' });
    expect(second.status).toBe(201);
  });
});
