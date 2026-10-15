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
    scoreModel.listByWod.mockResolvedValue([
      athleteScore(1, 'RX', 120),
      athleteScore(2, 'RX', 180),
    ]);

    const { rankings, sort } = await scoreService.getLeaderboard(1);

    expect(sort).toBe('desc');
    expect(rankings.RX.map((r) => r.athlete.id)).toEqual([2, 1]);
  });

  it('keeps RX/Scaled/Modified ranked separately from each other', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'AMRAP' } });
    scoreModel.listByWod.mockResolvedValue([
      athleteScore(1, 'RX', 100),
      athleteScore(2, 'Scaled', 999),
    ]);

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
    wodModel.findById.mockResolvedValue({ wod: { format: 'AMRAP' } });
    await expect(
      scoreService.recordScore(1, { athlete_id: 1, category: 'RX', result_value: -5 }, 1)
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });

  it('rejects a score for a deactivated athlete without writing it', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'AMRAP' } });
    athleteModel.findById.mockResolvedValue({ id: 1, active: false });
    await expect(
      scoreService.recordScore(1, { athlete_id: 1, category: 'RX', result_value: 10 }, 1)
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    expect(scoreModel.create).not.toHaveBeenCalled();
  });

  it('rejects an athlete_id that does not exist', async () => {
    wodModel.findById.mockResolvedValue({ wod: { format: 'AMRAP' } });
    athleteModel.findById.mockResolvedValue(null);
    await expect(
      scoreService.recordScore(1, { athlete_id: 99, category: 'RX', result_value: 10 }, 1)
    ).rejects.toMatchObject({ status: 400 });
  });
});
