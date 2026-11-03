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
        wod: { format, duration_or_target: '15 min' },
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

  it('rejects a wod with a format but no movements and no duration_or_target', async () => {
    const res = await post({
      session_date: '2026-11-01',
      start_time: '18:00',
      end_time: '19:00',
      wod: { format: 'AMRAP' },
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('accepts a wod with only a duration_or_target (no movements)', async () => {
    const res = await post({
      session_date: '2026-11-01',
      start_time: '18:00',
      end_time: '19:00',
      wod: { format: 'STRENGTH', duration_or_target: 'Max Clean & Jerk' },
    });
    expect(res.status).toBe(201);
  });

  it('rejects a JSON body over the 100kb limit with a clean 413, not a 500', async () => {
    const res = await post({
      session_date: '2026-11-01',
      start_time: '18:00',
      end_time: '19:00',
      wod: { format: 'AMRAP', notes: 'x'.repeat(200 * 1024) },
    });
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });
});

describe('GET /wods - pagination', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedCoach();
  });

  afterAll(async () => {
    await closePool();
  });

  async function seedSessions(count) {
    const token = await loginToken();
    for (let i = 0; i < count; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await request(app)
        .post('/api/admin/wods')
        .set('Authorization', `Bearer ${token}`)
        .send({
          session_date: `2026-01-${String(i + 1).padStart(2, '0')}`,
          start_time: '18:00',
          end_time: '19:00',
        });
    }
  }

  it('does not require authentication', async () => {
    const res = await request(app).get('/api/wods').query({ limit: 5 });
    expect(res.status).toBe(200);
  });

  it('defaults to at most 50 results with no limit given', async () => {
    await seedSessions(3);
    const res = await request(app).get('/api/wods');
    expect(res.status).toBe(200);
    expect(res.body.wods.length).toBeLessThanOrEqual(50);
  });

  it('honours a smaller limit and offset', async () => {
    await seedSessions(5);
    const page1 = await request(app).get('/api/wods').query({ limit: 2, offset: 0 });
    const page2 = await request(app).get('/api/wods').query({ limit: 2, offset: 2 });
    expect(page1.body.wods).toHaveLength(2);
    expect(page2.body.wods).toHaveLength(2);
    expect(page1.body.wods[0].id).not.toBe(page2.body.wods[0].id);
  });

  it('caps an excessive limit at 100 instead of erroring', async () => {
    const res = await request(app).get('/api/wods').query({ limit: 10000 });
    expect(res.status).toBe(200);
  });

  it('rejects a non-numeric limit with 400, not 500', async () => {
    const res = await request(app).get('/api/wods').query({ limit: 'all' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('does not change the existing response shape ({ wods: [...] })', async () => {
    const res = await request(app).get('/api/wods').query({ limit: 1 });
    expect(Object.keys(res.body)).toEqual(['wods']);
  });
});
