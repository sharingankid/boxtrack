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
    const res = await post({ start_time: '18:00', end_time: '19:00' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an incomplete request (no start_time/end_time at all)', async () => {
    const res = await post({ session_date: '2026-11-01' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a missing end_time', async () => {
    const res = await post({ session_date: '2026-11-01', start_time: '18:00' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a malformed start_time', async () => {
    const res = await post({ session_date: '2026-11-01', start_time: '6pm', end_time: '19:00' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an end_time at or before start_time', async () => {
    const res = await post({ session_date: '2026-11-01', start_time: '18:00', end_time: '18:00' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an incorrect session_date', async () => {
    const res = await post({ session_date: '2026-13-40', start_time: '18:00', end_time: '19:00' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an invalid skill_strength.kind', async () => {
    const res = await post({
      session_date: '2026-11-01',
      start_time: '18:00',
      end_time: '19:00',
      skill_strength: { kind: 'cardio' },
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an invalid wod.format', async () => {
    const res = await post({
      session_date: '2026-11-01',
      start_time: '18:00',
      end_time: '19:00',
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
        start_time: `0${index}:00`,
        end_time: `0${index}:45`,
        wod: { format },
      });
      expect(res.status).toBe(201);
      expect(res.body.wod.wod.format).toBe(format);
    }
  });

  it('rejects an exact duplicate (session_date, start_time) with 409 DUPLICATE_SESSION', async () => {
    const first = await post({ session_date: '2026-11-01', start_time: '18:00', end_time: '19:00' });
    expect(first.status).toBe(201);

    const duplicate = await post({ session_date: '2026-11-01', start_time: '18:00', end_time: '19:30' });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('DUPLICATE_SESSION');
  });

  it('allows the same date with a different start_time', async () => {
    const first = await post({ session_date: '2026-11-01', start_time: '06:00', end_time: '07:00' });
    expect(first.status).toBe(201);

    const second = await post({ session_date: '2026-11-01', start_time: '18:00', end_time: '19:00' });
    expect(second.status).toBe(201);
  });

  it('accepts an optional title', async () => {
    const res = await post({
      session_date: '2026-11-01',
      start_time: '18:00',
      end_time: '19:00',
      title: 'Evening class',
    });
    expect(res.status).toBe(201);
    expect(res.body.wod.title).toBe('Evening class');
  });

  it('rejects an invalid id on GET', async () => {
    const res = await request(app).get('/api/wods/not-an-id');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an invalid id on PUT', async () => {
    const res = await request(app)
      .put('/api/admin/wods/not-an-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an invalid id on DELETE', async () => {
    const res = await request(app)
      .delete('/api/admin/wods/not-an-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
