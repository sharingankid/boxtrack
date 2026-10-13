// Pure functions, no DB access - kept separate from wodModel.js so the
// session assembly/disassembly logic is unit-testable without a database
// (see docs/03-technical-documentation.md §5.2).

function movementsForPhase(movementRows, phase) {
  return movementRows
    .filter((m) => m.phase === phase)
    .sort((a, b) => a.order_index - b.order_index)
    .map((m) => ({ movement_name: m.movement_name, detail: m.detail }));
}

function assemble(wodRow, skillStrengthRow, wodBlockRow, movementRows) {
  return {
    id: wodRow.id,
    session_date: wodRow.session_date,
    time_slot: wodRow.time_slot,
    warmup: {
      general: wodRow.warmup_general,
      specific: wodRow.warmup_specific,
    },
    skill_strength: skillStrengthRow
      ? {
          kind: skillStrengthRow.kind,
          instructions: skillStrengthRow.instructions,
          movements: movementsForPhase(movementRows, 'skill_strength'),
        }
      : null,
    wod: wodBlockRow
      ? {
          format: wodBlockRow.format,
          duration_or_target: wodBlockRow.duration_or_target,
          notes: wodBlockRow.notes,
          movements: movementsForPhase(movementRows, 'wod'),
        }
      : null,
    created_by: wodRow.created_by,
    created_at: wodRow.created_at,
    updated_at: wodRow.updated_at,
  };
}

module.exports = { assemble, movementsForPhase };
