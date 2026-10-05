const pool = require('../config/db');
const { assemble } = require('./wodAssembler');

async function fetchFullWod(client, wodId) {
  const wodResult = await client.query('SELECT * FROM wods WHERE id = $1', [wodId]);
  const wodRow = wodResult.rows[0];
  if (!wodRow) return null;

  const skillStrengthResult = await client.query('SELECT * FROM skill_strength_blocks WHERE wod_id = $1', [wodId]);
  const wodBlockResult = await client.query('SELECT * FROM wod_blocks WHERE wod_id = $1', [wodId]);
  const movementsResult = await client.query(
    'SELECT * FROM movements WHERE wod_id = $1 ORDER BY phase, order_index',
    [wodId]
  );

  return assemble(wodRow, skillStrengthResult.rows[0] || null, wodBlockResult.rows[0] || null, movementsResult.rows);
}

// A date can have more than one session (different time slots), so this
// returns an array - possibly empty, never null.
async function findAllBySessionDate(sessionDate) {
  const { rows } = await pool.query(
    'SELECT id FROM wods WHERE session_date = $1 ORDER BY time_slot',
    [sessionDate]
  );
  const wods = [];
  for (const row of rows) {
    wods.push(await fetchFullWod(pool, row.id));
  }
  return wods;
}

async function findById(id) {
  return fetchFullWod(pool, id);
}

async function listSummaries({ from, to }) {
  const conditions = [];
  const values = [];
  if (from) {
    values.push(from);
    conditions.push(`session_date >= $${values.length}`);
  }
  if (to) {
    values.push(to);
    conditions.push(`session_date <= $${values.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT wods.id, wods.session_date, wods.time_slot, wod_blocks.format
     FROM wods
     LEFT JOIN wod_blocks ON wod_blocks.wod_id = wods.id
     ${where}
     ORDER BY wods.session_date DESC`,
    values
  );
  return rows;
}

async function insertMovements(client, wodId, phase, movements = []) {
  let index = 0;
  for (const movement of movements) {
    await client.query(
      'INSERT INTO movements (wod_id, phase, movement_name, detail, order_index) VALUES ($1, $2, $3, $4, $5)',
      [wodId, phase, movement.movement_name, movement.detail || null, index]
    );
    index += 1;
  }
}

async function create(data, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const wodInsert = await client.query(
      `INSERT INTO wods (session_date, time_slot, warmup_general, warmup_specific, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        data.session_date,
        data.time_slot || null,
        data.warmup?.general || null,
        data.warmup?.specific || null,
        userId,
      ]
    );
    const wodId = wodInsert.rows[0].id;

    if (data.skill_strength) {
      await client.query(
        'INSERT INTO skill_strength_blocks (wod_id, kind, instructions) VALUES ($1, $2, $3)',
        [wodId, data.skill_strength.kind, data.skill_strength.instructions || null]
      );
      await insertMovements(client, wodId, 'skill_strength', data.skill_strength.movements);
    }

    if (data.wod) {
      await client.query(
        'INSERT INTO wod_blocks (wod_id, format, duration_or_target, notes) VALUES ($1, $2, $3, $4)',
        [wodId, data.wod.format, data.wod.duration_or_target || null, data.wod.notes || null]
      );
      await insertMovements(client, wodId, 'wod', data.wod.movements);
    }

    const created = await fetchFullWod(client, wodId);
    await client.query('COMMIT');
    return created;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function update(id, data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM wods WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }

    const fields = [];
    const values = [];
    if (data.session_date !== undefined) {
      values.push(data.session_date);
      fields.push(`session_date = $${values.length}`);
    }
    if (data.time_slot !== undefined) {
      values.push(data.time_slot);
      fields.push(`time_slot = $${values.length}`);
    }
    if (data.warmup?.general !== undefined) {
      values.push(data.warmup.general);
      fields.push(`warmup_general = $${values.length}`);
    }
    if (data.warmup?.specific !== undefined) {
      values.push(data.warmup.specific);
      fields.push(`warmup_specific = $${values.length}`);
    }

    values.push(id);
    const setClause = fields.length ? `${fields.join(', ')}, updated_at = now()` : 'updated_at = now()';
    await client.query(`UPDATE wods SET ${setClause} WHERE id = $${values.length}`, values);

    if (data.skill_strength) {
      await client.query(
        `INSERT INTO skill_strength_blocks (wod_id, kind, instructions) VALUES ($1, $2, $3)
         ON CONFLICT (wod_id) DO UPDATE SET kind = EXCLUDED.kind, instructions = EXCLUDED.instructions`,
        [id, data.skill_strength.kind, data.skill_strength.instructions || null]
      );
      if (data.skill_strength.movements !== undefined) {
        await client.query("DELETE FROM movements WHERE wod_id = $1 AND phase = 'skill_strength'", [id]);
        await insertMovements(client, id, 'skill_strength', data.skill_strength.movements);
      }
    }

    if (data.wod) {
      await client.query(
        `INSERT INTO wod_blocks (wod_id, format, duration_or_target, notes) VALUES ($1, $2, $3, $4)
         ON CONFLICT (wod_id) DO UPDATE SET format = EXCLUDED.format, duration_or_target = EXCLUDED.duration_or_target, notes = EXCLUDED.notes`,
        [id, data.wod.format, data.wod.duration_or_target || null, data.wod.notes || null]
      );
      if (data.wod.movements !== undefined) {
        await client.query("DELETE FROM movements WHERE wod_id = $1 AND phase = 'wod'", [id]);
        await insertMovements(client, id, 'wod', data.wod.movements);
      }
    }

    const updated = await fetchFullWod(client, id);
    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM wods WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAllBySessionDate, findById, listSummaries, create, update, remove };
