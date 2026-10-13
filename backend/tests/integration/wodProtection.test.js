const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, seedCoach, closePool } = require('./helpers/testDb');
const { loginToken } = require('./helpers/auth');

describe('Admin WOD routes - protected access', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedCoach();
  });

  afterAll(async () => {
    await closePool();
  });

  it('rejects POST /admin/wods with no Authorization header', async () => {
    const res = await request(app)
      .post('/api/admin/wods')
      .send({ session_date: '2026-11-01', time_slot: '18:00' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects POST /admin/wods with a malformed Authorization header', async () => {
    const res = await request(app)
      .post('/api/admin/wods')
      .set('Authorization', 'NotBearer something')
      .send({ session_date: '2026-11-01', time_slot: '18:00' });
    expect(res.status).toBe(401);
  });

  it('rejects POST /admin/wods with a garbage token', async () => {
    const res = await request(app)
      .post('/api/admin/wods')
      .set('Authorization', 'Bearer not-a-real-token')
      .send({ session_date: '2026-11-01', time_slot: '18:00' });
    expect(res.status).toBe(401);
  });

  it('rejects PUT and DELETE on admin routes without a token', async () => {
    const putRes = await request(app).put('/api/admin/wods/1').send({ time_slot: '19:00' });
    expect(putRes.status).toBe(401);

    const deleteRes = await request(app).delete('/api/admin/wods/1');
    expect(deleteRes.status).toBe(401);
  });

  it('accepts POST /admin/wods with a valid token', async () => {
    const token = await loginToken();
    const res = await request(app)
      .post('/api/admin/wods')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_date: '2026-11-01', time_slot: '18:00' });
    expect(res.status).toBe(201);
  });

  it('leaves public read routes accessible without any token', async () => {
    const today = await request(app).get('/api/wods/today');
    expect(today.status).toBe(200);

    const history = await request(app).get('/api/wods');
    expect(history.status).toBe(200);
  });
});
