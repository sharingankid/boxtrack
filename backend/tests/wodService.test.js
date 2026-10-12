jest.mock('../src/models/wodModel');

const wodModel = require('../src/models/wodModel');
const wodService = require('../src/services/wodService');

describe('wodService.create - validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wodModel.create.mockResolvedValue({ id: 1 });
  });

  it('rejects a malformed session_date instead of letting Postgres blow up', async () => {
    await expect(wodService.create({ session_date: 'cacahuete', time_slot: '18:00' }, 1)).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    });
    expect(wodModel.create).not.toHaveBeenCalled();
  });

  it('rejects an empty wod block instead of a NOT NULL crash on wod_blocks.format', async () => {
    await expect(
      wodService.create({ session_date: '2026-11-01', time_slot: '18:00', wod: {} }, 1)
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    expect(wodModel.create).not.toHaveBeenCalled();
  });

  it('rejects a movement with no movement_name instead of a NOT NULL crash on movements', async () => {
    await expect(
      wodService.create(
        {
          session_date: '2026-11-01',
          time_slot: '18:00',
          wod: { format: 'AMRAP', movements: [{ detail: '21-15-9' }] },
        },
        1
      )
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    expect(wodModel.create).not.toHaveBeenCalled();
  });

  it('accepts a well-formed payload', async () => {
    await expect(
      wodService.create(
        {
          session_date: '2026-11-01',
          time_slot: '18:00',
          wod: { format: 'AMRAP', movements: [{ movement_name: 'Burpees' }] },
        },
        1
      )
    ).resolves.toEqual({ id: 1 });
    expect(wodModel.create).toHaveBeenCalledTimes(1);
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
