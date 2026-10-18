const pool = require('../config/db');

function assemble(row) {
  return {
    id: row.id,
    wod_id: row.wod_id,
    athlete: { id: row.athlete_id, first_name: row.first_name, last_name: row.last_name },
    category: row.category,
    result_value: Number(row.result_value),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const SELECT_WITH_ATHLETE = `
  SELECT scores.*, athletes.first_name, athletes.last_name
  FROM scores
  JOIN athletes ON athletes.id = scores.athlete_id
`;

async function listByWod(wodId) {
  const { rows } = await pool.query(`${SELECT_WITH_ATHLETE} WHERE scores.wod_id = $1`, [wodId]);
  return rows.map(assemble);
}

async function create(wodId, data, userId) {
  const { rows } = await pool.query(
    `INSERT INTO scores (wod_id, athlete_id, category, result_value, recorded_by)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (wod_id, athlete_id)
     DO UPDATE SET category = EXCLUDED.category, result_value = EXCLUDED.result_value, updated_at = now()
     RETURNING id`,
    [wodId, data.athlete_id, data.category, data.result_value, userId]
  );

  const { rows: full } = await pool.query(`${SELECT_WITH_ATHLETE} WHERE scores.id = $1`, [rows[0].id]);
  return assemble(full[0]);
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM scores WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { listByWod, create, remove };
