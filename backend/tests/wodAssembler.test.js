const { assemble, movementsForPhase } = require('../src/models/wodAssembler');

describe('movementsForPhase', () => {
  const movements = [
    { phase: 'wod', movement_name: 'Burpee', detail: '10 reps', order_index: 1 },
    { phase: 'skill_strength', movement_name: 'Back Squat', detail: '5x5', order_index: 0 },
    { phase: 'wod', movement_name: 'Deadlift', detail: '10 reps', order_index: 0 },
  ];

  it('filters by phase and sorts by order_index', () => {
    expect(movementsForPhase(movements, 'wod')).toEqual([
      { movement_name: 'Deadlift', detail: '10 reps' },
      { movement_name: 'Burpee', detail: '10 reps' },
    ]);
  });

  it('returns an empty array when no movement matches the phase', () => {
    expect(movementsForPhase(movements, 'wod'.concat('_other'))).toEqual([]);
  });
});

describe('assemble', () => {
  const wodRow = {
    id: 1,
    session_date: '2026-10-05',
    time_slot: '18:00',
    warmup_general: 'row easy',
    warmup_specific: 'empty bar squats',
    created_by: 7,
    created_at: '2026-10-01T10:00:00.000Z',
    updated_at: '2026-10-01T10:00:00.000Z',
  };

  it('nests warmup, skill_strength, and wod with their respective movements', () => {
    const skillStrengthRow = { kind: 'strength', instructions: 'build to a heavy 5' };
    const wodBlockRow = { format: 'AMRAP', duration_or_target: '15 min', notes: 'pace yourself' };
    const movementRows = [
      { phase: 'skill_strength', movement_name: 'Back Squat', detail: '5x5', order_index: 0 },
      { phase: 'wod', movement_name: 'Burpee', detail: '10 reps', order_index: 0 },
    ];

    const result = assemble(wodRow, skillStrengthRow, wodBlockRow, movementRows);

    expect(result).toEqual({
      id: 1,
      session_date: '2026-10-05',
      time_slot: '18:00',
      warmup: { general: 'row easy', specific: 'empty bar squats' },
      skill_strength: {
        kind: 'strength',
        instructions: 'build to a heavy 5',
        movements: [{ movement_name: 'Back Squat', detail: '5x5' }],
      },
      wod: {
        format: 'AMRAP',
        duration_or_target: '15 min',
        notes: 'pace yourself',
        movements: [{ movement_name: 'Burpee', detail: '10 reps' }],
      },
      created_by: 7,
      created_at: '2026-10-01T10:00:00.000Z',
      updated_at: '2026-10-01T10:00:00.000Z',
    });
  });

  it('nulls out skill_strength and wod when their rows are absent', () => {
    const result = assemble(wodRow, null, null, []);

    expect(result.skill_strength).toBeNull();
    expect(result.wod).toBeNull();
    expect(result.warmup).toEqual({ general: 'row easy', specific: 'empty bar squats' });
  });
});
