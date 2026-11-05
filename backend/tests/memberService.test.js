jest.mock('../src/models/memberModel');
jest.mock('../src/models/wodModel');
jest.mock('../src/services/scoreService', () => ({
  ...jest.requireActual('../src/services/scoreService'),
  recordScore: jest.fn(),
  getLeaderboard: jest.fn(),
}));
jest.mock('../src/utils/boxTime', () => ({ todayIsoDate: () => '2026-11-03' }));

const bcrypt = require('bcrypt');
const memberModel = require('../src/models/memberModel');
const wodModel = require('../src/models/wodModel');
const scoreService = require('../src/services/scoreService');
const memberService = require('../src/services/memberService');

const VALID = {
  first_name: ' Léa ',
  last_name: 'Martin',
  email: ' Lea@Example.FR ',
  password: 'motdepasse',
  avatar: 'womanA',
};
const MEMBER = { id: 7, first_name: 'Léa', last_name: 'Martin', email: 'lea@example.fr', avatar: 'womanA' };

describe('memberService.register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    memberModel.create.mockResolvedValue({ ...MEMBER, active: true });
  });

  it('creates the account with a normalized email and a bcrypt hash, then opens a session', async () => {
    const result = await memberService.register(VALID);
    const created = memberModel.create.mock.calls[0][0];
    expect(created).toMatchObject({
      firstName: 'Léa',
      lastName: 'Martin',
      email: 'lea@example.fr',
      avatar: 'womanA',
    });
    expect(created.passwordHash).not.toBe('motdepasse');
    expect(await bcrypt.compare('motdepasse', created.passwordHash)).toBe(true);
    expect(result.token).toMatch(/^[0-9a-f]{64}$/);
    expect(result.member).toEqual(MEMBER);
    // Only the token's hash is stored, never the token itself.
    const stored = memberModel.createSession.mock.calls[0][0];
    expect(stored.athleteId).toBe(7);
    expect(stored.tokenHash).not.toBe(result.token);
  });

  it.each([
    [{ first_name: '' }, /first_name/],
    [{ last_name: '   ' }, /last_name/],
    [{ email: 'not-an-email' }, /email/],
    [{ password: 'short' }, /password/],
    [{ avatar: 'robot' }, /avatar/],
  ])('rejects %o with a 400', async (override, message) => {
    await expect(memberService.register({ ...VALID, ...override })).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(message),
    });
    expect(memberModel.create).not.toHaveBeenCalled();
  });

  it('turns a duplicate email into a 409', async () => {
    memberModel.create.mockRejectedValue(Object.assign(new Error('duplicate'), { code: '23505' }));
    await expect(memberService.register(VALID)).rejects.toMatchObject({ status: 409, code: 'EMAIL_TAKEN' });
  });
});

describe('memberService.login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('logs in with the right password, whatever the email case', async () => {
    memberModel.findByEmail.mockResolvedValue({
      ...MEMBER,
      active: true,
      password_hash: await bcrypt.hash('motdepasse', 4),
    });
    const result = await memberService.login('LEA@example.fr ', 'motdepasse');
    expect(memberModel.findByEmail).toHaveBeenCalledWith('lea@example.fr');
    expect(result.member).toEqual(MEMBER);
  });

  it('gives the same 401 for a wrong password, an unknown email and a deactivated member', async () => {
    const hash = await bcrypt.hash('motdepasse', 4);
    memberModel.findByEmail.mockResolvedValueOnce({ ...MEMBER, active: true, password_hash: hash });
    await expect(memberService.login('lea@example.fr', 'wrong')).rejects.toMatchObject({ status: 401 });
    memberModel.findByEmail.mockResolvedValueOnce(null);
    await expect(memberService.login('nobody@example.fr', 'motdepasse')).rejects.toMatchObject({
      status: 401,
    });
    memberModel.findByEmail.mockResolvedValueOnce({ ...MEMBER, active: false, password_hash: hash });
    await expect(memberService.login('lea@example.fr', 'motdepasse')).rejects.toMatchObject({ status: 401 });
    expect(memberModel.createSession).not.toHaveBeenCalled();
  });
});

describe('memberService.verifyToken', () => {
  it('rejects an unknown or expired token with a 401', async () => {
    memberModel.findSession.mockResolvedValue(null);
    await expect(memberService.verifyToken('abc')).rejects.toMatchObject({ status: 401 });
  });
});

describe('memberService.submitScore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    scoreService.recordScore.mockResolvedValue({ id: 1 });
    scoreService.getLeaderboard.mockResolvedValue({ rankings: {} });
  });

  it("records the score for the member's own athlete, with no staff recorder", async () => {
    wodModel.findById.mockResolvedValue({ id: 4, session_date: '2026-11-03', wod: { format: 'FOR_TIME' } });
    const result = await memberService.submitScore(7, {
      wod_id: 4,
      athlete_id: 99,
      category: 'RX',
      time: '12:34',
    });
    expect(scoreService.recordScore).toHaveBeenCalledWith(
      4,
      { wod_id: 4, athlete_id: 7, category: 'RX', time: '12:34' },
      null
    );
    expect(result).toEqual({ score: { id: 1 }, leaderboard: { rankings: {} } });
  });

  it('refuses a session that has not happened yet, and an unknown one', async () => {
    wodModel.findById.mockResolvedValueOnce({ id: 4, session_date: '2026-11-04', wod: {} });
    await expect(memberService.submitScore(7, { wod_id: 4 })).rejects.toMatchObject({ status: 400 });
    wodModel.findById.mockResolvedValueOnce(null);
    await expect(memberService.submitScore(7, { wod_id: 4 })).rejects.toMatchObject({ status: 404 });
    await expect(memberService.submitScore(7, { wod_id: 'x' })).rejects.toMatchObject({ status: 400 });
    expect(scoreService.recordScore).not.toHaveBeenCalled();
  });
});

describe('memberService.listScores', () => {
  it('adds the same human-readable result as the leaderboard', async () => {
    memberModel.listScores.mockResolvedValue([
      { wod_id: 4, format: 'FOR_TIME', result_value: 754, extra_reps: null, rank: 2, participants: 5 },
      { wod_id: 5, format: 'AMRAP', result_value: 8, extra_reps: 12, rank: 1, participants: 3 },
    ]);
    const scores = await memberService.listScores(7);
    expect(scores.map((s) => s.result_display)).toEqual(['12:34', '8 rds + 12']);
  });
});
