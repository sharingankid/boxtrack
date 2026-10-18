const pool = require('../config/db');

function assemble(row) {
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    photo_url: row.photo_url,
    active: row.active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function list({ active } = {}) {
  const conditions = [];
  const values = [];
  if (active !== undefined) {
    values.push(active);
    conditions.push(`active = $${values.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(`SELECT * FROM athletes ${where} ORDER BY last_name, first_name`, values);
  return rows.map(assemble);
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM athletes WHERE id = $1', [id]);
  return rows[0] ? assemble(rows[0]) : null;
}

async function create(data, userId) {
  const { rows } = await pool.query(
    `INSERT INTO athletes (first_name, last_name, photo_url, created_by)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.first_name, data.last_name, data.photo_url || null, userId]
  );
  return assemble(rows[0]);
}

async function update(id, data) {
  const fields = [];
  const values = [];
  if (data.first_name !== undefined) {
    values.push(data.first_name);
    fields.push(`first_name = $${values.length}`);
  }
  if (data.last_name !== undefined) {
    values.push(data.last_name);
    fields.push(`last_name = $${values.length}`);
  }
  if (data.photo_url !== undefined) {
    values.push(data.photo_url);
    fields.push(`photo_url = $${values.length}`);
  }
  if (data.active !== undefined) {
    values.push(data.active);
    fields.push(`active = $${values.length}`);
  }

  values.push(id);
  const setClause = fields.length ? `${fields.join(', ')}, updated_at = now()` : 'updated_at = now()';
  const { rows } = await pool.query(
    `UPDATE athletes SET ${setClause} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return rows[0] ? assemble(rows[0]) : null;
}

module.exports = { list, findById, create, update };
