const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, seedCoach, closePool } = require('./helpers/testDb');
const { loginToken } = require('./helpers/auth');

const FULL_SESSION = {
  session_date: '2026-11-02',
  time_slot: '18:00',
  warmup: { general: '3 min row easy', specific: 'empty bar squats x10' },
  skill_strength: {
    kind: 'skill',
    instructions: 'Kipping pull-up drills',
    movements: [{ movement_name: 'Kipping Pull-Up', detail: '3x5' }],
  },
  wod: {
    format: 'AMRAP',
    duration_or_target: '20 min',
    notes: 'pace yourself',
    movements: [
      { movement_name: 'Pull-Up', detail: '5 reps' },
      { movement_name: 'Push-Up', detail: '10 reps' },
      { movement_name: 'Air Squat', detail: '15 reps' },
    ],
  },
};

describe('WOD persistence', () => {
  let token;

  beforeEach(async () => {
    await resetDatabase();
    await seedCoach();
    token = await loginToken();
  });

  afterAll(async () => {
    await closePool();
  });

  it('persists a full nested session and reassembles it identically on read', async () => {
    const createRes = await request(app)
      .post('/api/admin/wods')
      .set('Authorization', `Bearer ${token}`)
      .send(FULL_SESSION);
    expect(createRes.status).toBe(201);
    const id = createRes.body.wod.id;

    const getRes = await request(app).get(`/api/wods/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.wod.warmup).toEqual(FULL_SESSION.warmup);
    expect(getRes.body.wod.skill_strength).toEqual(FULL_SESSION.skill_strength);
    expect(getRes.body.wod.wod).toEqual(FULL_SESSION.wod);
  });

  it('keeps movement order on read-back', async () => {
    const createRes = await request(app)
      .post('/api/admin/wods')
      .set('Authorization', `Bearer ${token}`)
      .send(FULL_SESSION);

    const names = createRes.body.wod.wod.movements.map((m) => m.movement_name);
    expect(names).toEqual(['Pull-Up', 'Push-Up', 'Air Squat']);
  });

  it('PUT replaces only the block that was sent, leaving the others untouched', async () => {
    const createRes = await request(app)
      .post('/api/admin/wods')
      .set('Authorization', `Bearer ${token}`)
      .send(FULL_SESSION);
    const id = createRes.body.wod.id;

    const putRes = await request(app)
      .put(`/api/admin/wods/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        wod: {
          format: 'FOR_TIME',
          duration_or_target: '21-15-9',
          movements: [{ movement_name: 'Thruster', detail: '30kg' }],
        },
      });

    expect(putRes.status).toBe(200);
    expect(putRes.body.wod.wod.format).toBe('FOR_TIME');
    expect(putRes.body.wod.wod.movements).toEqual([{ movement_name: 'Thruster', detail: '30kg' }]);
    // skill_strength was not sent - must be untouched
    expect(putRes.body.wod.skill_strength).toEqual(FULL_SESSION.skill_strength);
    // warmup was not sent - must be untouched
    expect(putRes.body.wod.warmup).toEqual(FULL_SESSION.warmup);
  });

  it('DELETE removes the session - a later GET 404s', async () => {
    const createRes = await request(app)
      .post('/api/admin/wods')
      .set('Authorization', `Bearer ${token}`)
      .send(FULL_SESSION);
    const id = createRes.body.wod.id;

    const deleteRes = await request(app)
      .delete(`/api/admin/wods/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app).get(`/api/wods/${id}`);
    expect(getRes.status).toBe(404);
  });

  it('GET /wods/today returns every session for today, sorted by time_slot', async () => {
    const todayIso = new Date().toISOString().slice(0, 10);

    await request(app)
      .post('/api/admin/wods')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_date: todayIso, time_slot: '18:00', wod: { format: 'AMRAP' } });
    await request(app)
      .post('/api/admin/wods')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_date: todayIso, time_slot: '06:00', wod: { format: 'EMOM' } });

    const res = await request(app).get('/api/wods/today');
    expect(res.status).toBe(200);
    expect(res.body.wods).toHaveLength(2);
    expect(res.body.wods.map((w) => w.time_slot)).toEqual(['06:00', '18:00']);
  });

  it('GET /wods/today returns an empty array (200, not 404) when nothing is published', async () => {
    const res = await request(app).get('/api/wods/today');
    expect(res.status).toBe(200);
    expect(res.body.wods).toEqual([]);
  });

  it('GET /wods?from=&to= filters the history by date range', async () => {
    await request(app)
      .post('/api/admin/wods')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_date: '2026-01-01', time_slot: '18:00' });
    await request(app)
      .post('/api/admin/wods')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_date: '2026-06-01', time_slot: '18:00' });

    const res = await request(app).get('/api/wods').query({ from: '2026-05-01', to: '2026-12-31' });
    expect(res.status).toBe(200);
    expect(res.body.wods).toHaveLength(1);
    expect(res.body.wods[0].session_date).toBe('2026-06-01');
  });
});
