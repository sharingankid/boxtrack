const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, seedCoach, closePool, TEST_COACH_EMAIL, TEST_PASSWORD } = require('./helpers/testDb');

describe('Auth', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedCoach();
  });

  afterAll(async () => {
    await closePool();
  });

  it('rejects a missing email/password with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a wrong password with 401 INVALID_CREDENTIALS', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_COACH_EMAIL, password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects an unknown email with the same 401 INVALID_CREDENTIALS (not enumerable)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@crossfitlab.fr', password: TEST_PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('logs in with correct credentials and returns a usable token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_COACH_EMAIL, password: TEST_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: expect.any(Number), email: TEST_COACH_EMAIL });
  });

  it('revokes the token on logout - it stops working immediately', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_COACH_EMAIL, password: TEST_PASSWORD });
    const token = loginRes.body.token;

    const logoutRes = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);
    expect(logoutRes.status).toBe(204);

    const reuseRes = await request(app)
      .post('/api/admin/wods')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_date: '2026-11-01', time_slot: '18:00' });
    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects logout without a token', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });
});
