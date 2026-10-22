const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, seedCoach, closePool } = require('./helpers/testDb');
const { loginToken } = require('./helpers/auth');

const FOR_TIME_SESSION = {
  session_date: '2026-11-03',
  start_time: '18:00',
  end_time: '19:00',
  wod: { format: 'FOR_TIME', duration_or_target: '5 rounds', movements: [{ movement_name: 'Thruster' }] },
};

describe('Optional tier (cahier des charges §5-6)', () => {
  let token;
  const auth = () => ({ Authorization: `Bearer ${token}` });

  beforeEach(async () => {
    await resetDatabase();
    await seedCoach();
    token = await loginToken();
  });

  afterAll(async () => {
    await closePool();
  });

  describe('admin routes are protected', () => {
    it.each([
      ['get', '/api/admin/athletes'],
      ['post', '/api/admin/athletes'],
      ['post', '/api/admin/announcements'],
      ['post', '/api/admin/qrcodes'],
      ['post', '/api/admin/wods/1/scores'],
      ['delete', '/api/admin/scores/1'],
    ])('%s %s without a token returns 401', async (method, path) => {
      const res = await request(app)[method](path).send({});
      expect(res.status).toBe(401);
    });
  });

  describe('athletes', () => {
    it('creates, lists, and soft-deactivates an athlete', async () => {
      const created = await request(app)
        .post('/api/admin/athletes')
        .set(auth())
        .send({ first_name: 'Léa', last_name: 'Martin' });
      expect(created.status).toBe(201);
      const { id } = created.body.athlete;

      const deactivated = await request(app)
        .put(`/api/admin/athletes/${id}`)
        .set(auth())
        .send({ active: false });
      expect(deactivated.status).toBe(200);
      expect(deactivated.body.athlete.active).toBe(false);

      const activeOnly = await request(app).get('/api/admin/athletes?active=true').set(auth());
      expect(activeOnly.body.athletes).toHaveLength(0);
      const all = await request(app).get('/api/admin/athletes').set(auth());
      expect(all.body.athletes).toHaveLength(1);
    });

    it('rejects a non-http photo_url', async () => {
      const res = await request(app)
        .post('/api/admin/athletes')
        .set(auth())
        .send({ first_name: 'A', last_name: 'B', photo_url: 'javascript:alert(1)' });
      expect(res.status).toBe(400);
    });

    it('returns 400 (not 500) for a non-numeric id', async () => {
      const res = await request(app).put('/api/admin/athletes/abc').set(auth()).send({ first_name: 'X' });
      expect(res.status).toBe(400);
    });
  });

  describe('scores and leaderboard', () => {
    async function createAthlete(firstName) {
      const res = await request(app)
        .post('/api/admin/athletes')
        .set(auth())
        .send({ first_name: firstName, last_name: 'Test' });
      return res.body.athlete.id;
    }

    it('ranks a For Time WOD fastest-first, per category, with shared ranks on ties', async () => {
      const wodId = (await request(app).post('/api/admin/wods').set(auth()).send(FOR_TIME_SESSION)).body.wod
        .id;
      const [a, b, c, d] = [
        await createAthlete('A'),
        await createAthlete('B'),
        await createAthlete('C'),
        await createAthlete('D'),
      ];

      const post = (athleteId, category, value) =>
        request(app)
          .post(`/api/admin/wods/${wodId}/scores`)
          .set(auth())
          .send({ athlete_id: athleteId, category, result_value: value });
      expect((await post(a, 'RX', 600)).status).toBe(201);
      await post(b, 'RX', 540);
      await post(c, 'RX', 540);
      await post(d, 'Scaled', 400);

      const board = await request(app).get(`/api/wods/${wodId}/leaderboard`);
      expect(board.status).toBe(200);
      expect(board.body.sort).toBe('asc');
      expect(board.body.rankings.RX.map((r) => r.rank)).toEqual([1, 1, 3]);
      expect(board.body.rankings.RX[2].athlete.id).toBe(a);
      expect(board.body.rankings.Scaled).toHaveLength(1);
    });

    it('updates the existing score instead of duplicating it (one score per athlete per WOD)', async () => {
      const wodId = (await request(app).post('/api/admin/wods').set(auth()).send(FOR_TIME_SESSION)).body.wod
        .id;
      const athleteId = await createAthlete('A');
      const send = (value) =>
        request(app)
          .post(`/api/admin/wods/${wodId}/scores`)
          .set(auth())
          .send({ athlete_id: athleteId, category: 'RX', result_value: value });

      await send(700);
      await send(650);

      const board = await request(app).get(`/api/wods/${wodId}/leaderboard`);
      expect(board.body.rankings.RX).toHaveLength(1);
      expect(board.body.rankings.RX[0].result_value).toBe(650);
    });

    it('refuses a new score for a deactivated athlete', async () => {
      const wodId = (await request(app).post('/api/admin/wods').set(auth()).send(FOR_TIME_SESSION)).body.wod
        .id;
      const athleteId = await createAthlete('A');
      await request(app).put(`/api/admin/athletes/${athleteId}`).set(auth()).send({ active: false });

      const res = await request(app)
        .post(`/api/admin/wods/${wodId}/scores`)
        .set(auth())
        .send({ athlete_id: athleteId, category: 'RX', result_value: 600 });
      expect(res.status).toBe(400);
    });

    it('deletes a score', async () => {
      const wodId = (await request(app).post('/api/admin/wods').set(auth()).send(FOR_TIME_SESSION)).body.wod
        .id;
      const athleteId = await createAthlete('A');
      const scoreId = (
        await request(app)
          .post(`/api/admin/wods/${wodId}/scores`)
          .set(auth())
          .send({ athlete_id: athleteId, category: 'RX', result_value: 600 })
      ).body.score.id;

      expect((await request(app).delete(`/api/admin/scores/${scoreId}`).set(auth())).status).toBe(204);
      expect((await request(app).delete(`/api/admin/scores/${scoreId}`).set(auth())).status).toBe(404);
    });
  });

  describe('announcements', () => {
    it('only shows active announcements publicly, all of them to the coach', async () => {
      const created = await request(app)
        .post('/api/admin/announcements')
        .set(auth())
        .send({ title: 'Open Day samedi 14 novembre', body: 'Séance découverte gratuite.' });
      expect(created.status).toBe(201);
      await request(app)
        .put(`/api/admin/announcements/${created.body.announcement.id}`)
        .set(auth())
        .send({ active: false });

      expect((await request(app).get('/api/announcements')).body.announcements).toHaveLength(0);
      expect(
        (await request(app).get('/api/admin/announcements').set(auth())).body.announcements
      ).toHaveLength(1);
    });

    it('requires a title', async () => {
      const res = await request(app).post('/api/admin/announcements').set(auth()).send({ body: 'no title' });
      expect(res.status).toBe(400);
    });
  });

  describe('QR codes', () => {
    it('lists QR codes publicly in order_index order', async () => {
      await request(app)
        .post('/api/admin/qrcodes')
        .set(auth())
        .send({ label: 'Instagram', url: 'https://instagram.com/crossfitlab', order_index: 2 });
      await request(app)
        .post('/api/admin/qrcodes')
        .set(auth())
        .send({ label: 'Avis Google', url: 'https://g.page/crossfitlab', order_index: 1 });

      const res = await request(app).get('/api/qrcodes');
      expect(res.status).toBe(200);
      expect(res.body.qr_codes.map((q) => q.label)).toEqual(['Avis Google', 'Instagram']);
    });

    it('rejects a javascript: URL', async () => {
      const res = await request(app)
        .post('/api/admin/qrcodes')
        .set(auth())
        .send({ label: 'Piège', url: 'javascript:alert(1)' });
      expect(res.status).toBe(400);
    });
  });
});
