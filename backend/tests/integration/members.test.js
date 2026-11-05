const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, seedCoach, closePool } = require('./helpers/testDb');
const { loginToken } = require('./helpers/auth');
const { todayIsoDate } = require('../../src/utils/boxTime');

const MEMBER = {
  first_name: 'Léa',
  last_name: 'Martin',
  email: 'lea@example.fr',
  password: 'motdepasse',
  avatar: 'womanA',
};

describe('Member accounts (QR code sign-up) and self-entered scores', () => {
  let coachToken;
  let wodId;

  beforeEach(async () => {
    await resetDatabase();
    await seedCoach();
    coachToken = await loginToken();
    const created = await request(app)
      .post('/api/admin/wods')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({
        session_date: todayIsoDate(),
        start_time: '06:00',
        end_time: '07:00',
        wod: { format: 'FOR_TIME', duration_or_target: '3 rounds', movements: [{ movement_name: 'Burpee' }] },
      });
    wodId = created.body.wod.id;
  });

  afterAll(async () => {
    await closePool();
  });

  async function register(data = MEMBER) {
    const res = await request(app).post('/api/members/register').send(data);
    return res;
  }

  it('signs up, reads its profile, and logs out (the token stops working)', async () => {
    const signed = await register();
    expect(signed.status).toBe(201);
    expect(signed.body.member).toMatchObject({
      first_name: 'Léa',
      email: 'lea@example.fr',
      avatar: 'womanA',
    });
    const auth = { Authorization: `Bearer ${signed.body.token}` };

    const me = await request(app).get('/api/members/me').set(auth);
    expect(me.status).toBe(200);
    expect(me.body.member.id).toBe(signed.body.member.id);

    expect((await request(app).post('/api/members/logout').set(auth)).status).toBe(204);
    expect((await request(app).get('/api/members/me').set(auth)).status).toBe(401);
  });

  it('refuses a second account on the same email (409) and logs in with the password', async () => {
    await register();
    expect((await register({ ...MEMBER, email: 'LEA@example.fr' })).status).toBe(409);
    const login = await request(app)
      .post('/api/members/login')
      .send({ email: 'lea@example.fr', password: 'motdepasse' });
    expect(login.status).toBe(200);
    const wrong = await request(app)
      .post('/api/members/login')
      .send({ email: 'lea@example.fr', password: 'nope-nope' });
    expect(wrong.status).toBe(401);
  });

  it('shows the member in the coach roster', async () => {
    const signed = await register();
    const roster = await request(app).get('/api/admin/athletes').set('Authorization', `Bearer ${coachToken}`);
    expect(roster.body.athletes.map((a) => a.id)).toContain(signed.body.member.id);
  });

  it('records its own score into the public leaderboard and lists it with its rank', async () => {
    const signed = await register();
    const auth = { Authorization: `Bearer ${signed.body.token}` };
    const sent = await request(app)
      .post('/api/members/me/scores')
      .set(auth)
      .send({ wod_id: wodId, category: 'RX', time: '12:34' });
    expect(sent.status).toBe(201);
    expect(sent.body.score.result_display).toBe('12:34');
    expect(sent.body.leaderboard.rankings.RX[0].athlete.first_name).toBe('Léa');

    const board = await request(app).get(`/api/wods/${wodId}/leaderboard`);
    expect(board.body.rankings.RX).toHaveLength(1);

    const mine = await request(app).get('/api/members/me/scores').set(auth);
    expect(mine.status).toBe(200);
    expect(mine.body.scores[0]).toMatchObject({
      wod_id: wodId,
      rank: 1,
      participants: 1,
      result_display: '12:34',
    });
  });

  it('keeps member and staff tokens apart', async () => {
    const signed = await register();
    const asMember = { Authorization: `Bearer ${signed.body.token}` };
    expect((await request(app).get('/api/admin/athletes').set(asMember)).status).toBe(401);
    const asCoach = { Authorization: `Bearer ${coachToken}` };
    expect((await request(app).get('/api/members/me').set(asCoach)).status).toBe(401);
    expect((await request(app).post('/api/members/me/scores').send({ wod_id: wodId })).status).toBe(401);
  });
});
