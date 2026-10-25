jest.mock('../src/models/scoreModel');
jest.mock('../src/models/wodModel');
jest.mock('../src/models/athleteModel');

const scoreModel = require('../src/models/scoreModel');
const wodModel = require('../src/models/wodModel');
const athleteModel = require('../src/models/athleteModel');
const scoreService = require('../src/services/scoreService');

function athleteScore(id, category, result_value) {
  return { id, athlete: { id, first_name: 'A', last_name: String(id) }, category, result_value };
}

describe('scoreService.getLeaderboard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('ranks a FOR_TIME WOD ascending - the fastest time wins', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'FOR_TIME' } });
    scoreModel.listByWod.mockResolvedValue([
      athleteScore(1, 'RX', 600),
      athleteScore(2, 'RX', 300),
      athleteScore(3, 'RX', 450),
    ]);

    const { rankings, sort } = await scoreService.getLeaderboard(1);

    expect(sort).toBe('asc');
    expect(rankings.RX.map((r) => r.athlete.id)).toEqual([2, 3, 1]);
    expect(rankings.RX[0].rank).toBe(1);
  });

  it('ranks an AMRAP WOD descending - more reps wins', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'AMRAP' } });
    scoreModel.listByWod.mockResolvedValue([athleteScore(1, 'RX', 120), athleteScore(2, 'RX', 180)]);

    const { rankings, sort } = await scoreService.getLeaderboard(1);

    expect(sort).toBe('desc');
    expect(rankings.RX.map((r) => r.athlete.id)).toEqual([2, 1]);
  });

  it('keeps RX/Scaled/Modified ranked separately from each other', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'AMRAP' } });
    scoreModel.listByWod.mockResolvedValue([athleteScore(1, 'RX', 100), athleteScore(2, 'Scaled', 999)]);

    const { rankings } = await scoreService.getLeaderboard(1);

    expect(rankings.RX).toHaveLength(1);
    expect(rankings.Scaled).toHaveLength(1);
    expect(rankings.RX[0].rank).toBe(1);
    expect(rankings.Scaled[0].rank).toBe(1);
  });

  it('gives tied results the same rank and skips the next one (1, 1, 3)', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'FOR_TIME' } });
    scoreModel.listByWod.mockResolvedValue([
      athleteScore(1, 'RX', 754),
      athleteScore(2, 'RX', 754),
      athleteScore(3, 'RX', 800),
    ]);

    const { rankings } = await scoreService.getLeaderboard(1);

    expect(rankings.RX.map((r) => r.rank)).toEqual([1, 1, 3]);
  });

  it('rejects scoring a session that has no WOD block', async () => {
    wodModel.findById.mockResolvedValue({ wod: null });
    await expect(scoreService.getLeaderboard(1)).rejects.toMatchObject({ status: 400 });
  });
});

describe('scoreService.recordScore - validation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects a category outside RX/Scaled/Modified', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'AMRAP' } });
    await expect(
      scoreService.recordScore(1, { athlete_id: 1, category: 'Intermediate', result_value: 10 }, 1)
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });

  it('rejects a negative result_value', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'EMOM' } });
    await expect(
      scoreService.recordScore(1, { athlete_id: 1, category: 'RX', result_value: -5 }, 1)
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });

  it('rejects a score for a deactivated athlete without writing it', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'EMOM' } });
    athleteModel.findById.mockResolvedValue({ id: 1, active: false });
    await expect(
      scoreService.recordScore(1, { athlete_id: 1, category: 'RX', result_value: 10 }, 1)
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    expect(scoreModel.create).not.toHaveBeenCalled();
  });

  it('rejects an athlete_id that does not exist', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'EMOM' } });
    athleteModel.findById.mockResolvedValue(null);
    await expect(
      scoreService.recordScore(1, { athlete_id: 99, category: 'RX', result_value: 10 }, 1)
    ).rejects.toMatchObject({ status: 400 });
  });
});

describe('scoreService - result shape per WOD format', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    athleteModel.findById.mockResolvedValue({ id: 1, active: true });
    scoreModel.create.mockImplementation(async (wodId, row) => ({ id: 1, ...row }));
  });

  it('stores an AMRAP as rounds + extra reps and displays it that way', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'AMRAP' } });
    const score = await scoreService.recordScore(
      1,
      { athlete_id: 1, category: 'RX', rounds: 8, reps: 12 },
      1
    );
    expect(scoreModel.create).toHaveBeenCalledWith(
      1,
      { athlete_id: 1, category: 'RX', result_value: 8, extra_reps: 12 },
      1
    );
    expect(score.result_display).toBe('8 rds + 12');
  });

  it('requires whole-number rounds for an AMRAP', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'AMRAP' } });
    for (const data of [{ result_value: 187 }, { rounds: 7.5 }, { rounds: 7, reps: -1 }]) {
      await expect(
        scoreService.recordScore(1, { athlete_id: 1, category: 'RX', ...data }, 1)
      ).rejects.toMatchObject({ status: 400 });
    }
  });

  it('accepts a For Time result as "MM:SS" and stores seconds', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'FOR_TIME' } });
    const score = await scoreService.recordScore(1, { athlete_id: 1, category: 'RX', time: '12:34' }, 1);
    expect(score.result_value).toBe(754);
    expect(score.result_display).toBe('12:34');
  });

  it('rejects a malformed time', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'CHIPPER' } });
    for (const time of ['12:60', '1:75:00', 'abc', '12']) {
      await expect(
        scoreService.recordScore(1, { athlete_id: 1, category: 'RX', time }, 1)
      ).rejects.toMatchObject({ status: 400 });
    }
  });

  it('parses and formats times', () => {
    expect(scoreService.parseTime('0:45')).toBe(45);
    expect(scoreService.parseTime('1:02:03')).toBe(3723);
    expect(scoreService.formatResult('CHIPPER', 3723, null)).toBe('1:02:03');
    expect(scoreService.formatResult('STRENGTH', 92.5, null)).toBe('92.5 kg');
    expect(scoreService.formatResult('TABATA', 84, null)).toBe('84');
    expect(scoreService.formatResult('AMRAP', 187, null)).toBe('187 reps');
  });
});

describe('scoreService.getLeaderboard - AMRAP tie-break', () => {
  beforeEach(() => jest.clearAllMocks());

  it('breaks a tie on rounds with extra reps, and keeps real ties shared', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'AMRAP' } });
    scoreModel.listByWod.mockResolvedValue([
      { ...athleteScore(1, 'RX', 6), extra_reps: 7 },
      { ...athleteScore(2, 'RX', 6), extra_reps: 21 },
      { ...athleteScore(3, 'RX', 6), extra_reps: 7 },
      { ...athleteScore(4, 'RX', 7), extra_reps: 0 },
    ]);

    const { rankings } = await scoreService.getLeaderboard(1);

    expect(rankings.RX.map((r) => r.athlete.id)).toEqual([4, 2, 1, 3]);
    expect(rankings.RX.map((r) => r.rank)).toEqual([1, 2, 3, 3]);
    expect(rankings.RX[1].result_display).toBe('6 rds + 21');
  });
});

describe('scoreService.recordScores (whole class)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wodModel.findById.mockResolvedValue({ wod: { format: 'FOR_TIME' } });
    scoreModel.listByWod.mockResolvedValue([]);
  });

  it('validates the whole batch before writing anything', async () => {
    athleteModel.findByIds.mockResolvedValue([
      { id: 1, active: true },
      { id: 2, active: false },
    ]);
    await expect(
      scoreService.recordScores(
        1,
        {
          scores: [
            { athlete_id: 1, category: 'RX', time: '10:00' },
            { athlete_id: 2, category: 'RX', time: '11:00' },
          ],
        },
        1
      )
    ).rejects.toMatchObject({ status: 400, message: expect.stringContaining('scores[1].') });
    expect(scoreModel.upsertMany).not.toHaveBeenCalled();
  });

  it('rejects the same athlete twice and an empty batch', async () => {
    const twice = { athlete_id: 1, category: 'RX', time: '10:00' };
    await expect(scoreService.recordScores(1, { scores: [twice, twice] }, 1)).rejects.toMatchObject({
      status: 400,
    });
    await expect(scoreService.recordScores(1, { scores: [] }, 1)).rejects.toMatchObject({ status: 400 });
    expect(scoreModel.upsertMany).not.toHaveBeenCalled();
  });

  it('writes every row and returns the leaderboard', async () => {
    athleteModel.findByIds.mockResolvedValue([
      { id: 1, active: true },
      { id: 2, active: true },
    ]);
    const board = await scoreService.recordScores(
      1,
      {
        scores: [
          { athlete_id: 1, category: 'RX', time: '10:00' },
          { athlete_id: 2, category: 'Scaled', result_value: 700 },
        ],
      },
      9
    );
    expect(scoreModel.upsertMany).toHaveBeenCalledWith(
      1,
      [
        { athlete_id: 1, category: 'RX', result_value: 600, extra_reps: null },
        { athlete_id: 2, category: 'Scaled', result_value: 700, extra_reps: null },
      ],
      9
    );
    expect(board.sort).toBe('asc');
  });
});
