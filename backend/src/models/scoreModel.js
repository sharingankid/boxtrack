const pool = require('../config/db');

function assemble(row) {
  return {
    id: row.id,
    wod_id: row.wod_id,
    athlete: { id: row.athlete_id, first_name: row.first_name, last_name: row.last_name },
    category: row.category,
    result_value: Number(row.result_value),
    extra_reps: row.extra_reps,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const SELECT_WITH_ATHLETE = `
  SELECT scores.*, athletes.first_name, athletes.last_name
  FROM scores
  JOIN athletes ON athletes.id = scores.athlete_id
`;

// One score per athlete per WOD: a second entry replaces the first.
const UPSERT = `
  INSERT INTO scores (wod_id, athlete_id, category, result_value, extra_reps, recorded_by)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (wod_id, athlete_id)
  DO UPDATE SET category = EXCLUDED.category, result_value = EXCLUDED.result_value,
                extra_reps = EXCLUDED.extra_reps, recorded_by = EXCLUDED.recorded_by, updated_at = now()
  RETURNING id
`;

function upsertValues(wodId, row, userId) {
  return [wodId, row.athlete_id, row.category, row.result_value, row.extra_reps, userId];
}

async function listByWod(wodId) {
  const { rows } = await pool.query(`${SELECT_WITH_ATHLETE} WHERE scores.wod_id = $1`, [wodId]);
  return rows.map(assemble);
}

async function create(wodId, row, userId) {
  const { rows } = await pool.query(UPSERT, upsertValues(wodId, row, userId));
  const { rows: full } = await pool.query(`${SELECT_WITH_ATHLETE} WHERE scores.id = $1`, [rows[0].id]);
  return assemble(full[0]);
}

// A whole class at once, in one transaction: either every score lands or
// none does, so a half-saved class never shows up on the leaderboard.
async function upsertMany(wodId, rows, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      await client.query(UPSERT, upsertValues(wodId, row, userId));
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM scores WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { listByWod, create, upsertMany, remove };
