jest.mock('../src/models/wodModel');

const wodModel = require('../src/models/wodModel');
const wodService = require('../src/services/wodService');

const VALID_SCHEDULE = { session_date: '2026-11-01', start_time: '18:00', end_time: '19:00' };

describe('wodService.create - validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wodModel.create.mockResolvedValue({ id: 1 });
  });

  it('rejects a malformed session_date instead of letting Postgres blow up', async () => {
    await expect(
      wodService.create({ session_date: 'cacahuete', start_time: '18:00', end_time: '19:00' }, 1)
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    expect(wodModel.create).not.toHaveBeenCalled();
  });

  it('rejects a missing start_time', async () => {
    await expect(
      wodService.create({ session_date: '2026-11-01', end_time: '19:00' }, 1)
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });

  it('rejects a malformed start_time (not HH:mm)', async () => {
    await expect(
      wodService.create({ session_date: '2026-11-01', start_time: '6pm', end_time: '19:00' }, 1)
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });

  it('rejects an out-of-range time (25:00)', async () => {
    await expect(
      wodService.create({ session_date: '2026-11-01', start_time: '25:00', end_time: '19:00' }, 1)
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });

  it('rejects end_time equal to start_time', async () => {
    await expect(
      wodService.create({ session_date: '2026-11-01', start_time: '18:00', end_time: '18:00' }, 1)
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    expect(wodModel.create).not.toHaveBeenCalled();
  });

  it('rejects end_time before start_time', async () => {
    await expect(
      wodService.create({ session_date: '2026-11-01', start_time: '18:00', end_time: '17:00' }, 1)
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });

  it('maps a (session_date, start_time) unique violation to 409 DUPLICATE_SESSION', async () => {
    const pgError = new Error('duplicate key value');
    pgError.code = '23505';
    wodModel.create.mockRejectedValueOnce(pgError);

    await expect(wodService.create(VALID_SCHEDULE, 1)).rejects.toMatchObject({
      status: 409,
      code: 'DUPLICATE_SESSION',
    });
  });

  it('rejects an empty wod block instead of a NOT NULL crash on wod_blocks.format', async () => {
    await expect(
      wodService.create({ ...VALID_SCHEDULE, wod: {} }, 1)
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    expect(wodModel.create).not.toHaveBeenCalled();
  });

  it('rejects a movement with no movement_name instead of a NOT NULL crash on movements', async () => {
    await expect(
      wodService.create(
        { ...VALID_SCHEDULE, wod: { format: 'AMRAP', movements: [{ detail: '21-15-9' }] } },
        1
      )
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    expect(wodModel.create).not.toHaveBeenCalled();
  });

  it('accepts a well-formed payload', async () => {
    await expect(
      wodService.create(
        { ...VALID_SCHEDULE, wod: { format: 'AMRAP', movements: [{ movement_name: 'Burpees' }] } },
        1
      )
    ).resolves.toEqual({ id: 1 });
    expect(wodModel.create).toHaveBeenCalledTimes(1);
  });
});

describe('wodService.update - validation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects an invalid id', async () => {
    await expect(wodService.update('not-a-number', {}, 1)).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    });
    expect(wodModel.update).not.toHaveBeenCalled();
  });

  it('rejects start_time/end_time sent together with end before start', async () => {
    await expect(
      wodService.update(1, { start_time: '10:00', end_time: '09:00' })
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    expect(wodModel.update).not.toHaveBeenCalled();
  });

  it('propagates NOT_FOUND when the model finds nothing to update', async () => {
    wodModel.update.mockResolvedValue(null);
    await expect(wodService.update(999, { title: 'x' })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
  });
});

describe('wodService.remove', () => {
  it('rejects an invalid id before touching the model', async () => {
    await expect(wodService.remove('abc')).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });

  it('throws NOT_FOUND when nothing was deleted', async () => {
    wodModel.remove.mockResolvedValue(false);
    await expect(wodService.remove(1)).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });
});

describe('wodService.duplicate', () => {
  beforeEach(() => jest.clearAllMocks());

  const source = {
    id: 5,
    session_date: '2026-11-01',
    start_time: '18:00',
    end_time: '19:00',
    title: 'Evening class',
    warmup: { general: 'row', specific: 'squats' },
    skill_strength: null,
    wod: { format: 'AMRAP', duration_or_target: '15 min', notes: null, movements: [] },
  };

  it('copies the source session onto a new slot when overrides are given', async () => {
    wodModel.findById.mockResolvedValue(source);
    wodModel.create.mockResolvedValue({ id: 6 });

    await wodService.duplicate(5, { session_date: '2026-11-08' }, 1);

    expect(wodModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ session_date: '2026-11-08', start_time: '18:00', end_time: '19:00' }),
      1
    );
  });

  it('409s when duplicating onto the exact same slot (no overrides)', async () => {
    wodModel.findById.mockResolvedValue(source);
    const pgError = new Error('duplicate key value');
    pgError.code = '23505';
    wodModel.create.mockRejectedValueOnce(pgError);

    await expect(wodService.duplicate(5, {}, 1)).rejects.toMatchObject({ status: 409, code: 'DUPLICATE_SESSION' });
  });

  it('404s when the source session does not exist', async () => {
    wodModel.findById.mockResolvedValue(null);
    await expect(wodService.duplicate(999, {}, 1)).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });
});

describe('wodService.getToday', () => {
  it('queries using the Europe/Paris calendar date, not the UTC one', async () => {
    jest.clearAllMocks();
    wodModel.findAllBySessionDate.mockResolvedValue([]);

    // 2026-01-01 00:30 Europe/Paris == 2025-12-31 23:30 UTC - a naive
    // toISOString().slice(0, 10) would wrongly report "2025-12-31".
    jest.useFakeTimers().setSystemTime(new Date('2025-12-31T23:30:00Z'));

    await wodService.getToday();

    expect(wodModel.findAllBySessionDate).toHaveBeenCalledWith('2026-01-01');
    jest.useRealTimers();
  });
});

describe('wodService.getTvState', () => {
  afterEach(() => jest.useRealTimers());

  it('picks the session covering the current Europe/Paris time as "current"', async () => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T16:30:00Z')); // 18:30 in Paris (summer, UTC+2)
    wodModel.findAllBySessionDate.mockResolvedValue([
      { id: 1, start_time: '06:00', end_time: '07:00' },
      { id: 2, start_time: '18:00', end_time: '19:00' },
      { id: 3, start_time: '20:00', end_time: '21:00' },
    ]);

    const state = await wodService.getTvState();

    expect(state.timezone).toBe('Europe/Paris');
    expect(state.reference_time).toBe('18:30');
    expect(state.current.id).toBe(2);
    expect(state.next.id).toBe(3);
    expect(state.remaining.map((s) => s.id)).toEqual([2, 3]);
  });

  it('has no current session between classes, but still finds the next one', async () => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T15:30:00Z')); // 17:30 Paris, between 07:00-class and 18:00-class
    wodModel.findAllBySessionDate.mockResolvedValue([
      { id: 1, start_time: '06:00', end_time: '07:00' },
      { id: 2, start_time: '18:00', end_time: '19:00' },
    ]);

    const state = await wodService.getTvState();

    expect(state.current).toBeNull();
    expect(state.next.id).toBe(2);
    expect(state.remaining.map((s) => s.id)).toEqual([2]);
  });

  it('returns nulls and an empty list on a day with no sessions', async () => {
    jest.clearAllMocks();
    wodModel.findAllBySessionDate.mockResolvedValue([]);

    const state = await wodService.getTvState();

    expect(state.current).toBeNull();
    expect(state.next).toBeNull();
    expect(state.remaining).toEqual([]);
  });
});
