const pool = require('../config/db');

function assemble(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    active: row.active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function list({ activeOnly } = {}) {
  const where = activeOnly ? 'WHERE active = true' : '';
  const { rows } = await pool.query(`SELECT * FROM announcements ${where} ORDER BY created_at DESC`);
  return rows.map(assemble);
}

async function create(data, userId) {
  const { rows } = await pool.query(
    `INSERT INTO announcements (title, body, created_by) VALUES ($1, $2, $3) RETURNING *`,
    [data.title, data.body || null, userId]
  );
  return assemble(rows[0]);
}

async function update(id, data) {
  const fields = [];
  const values = [];
  if (data.title !== undefined) {
    values.push(data.title);
    fields.push(`title = $${values.length}`);
  }
  if (data.body !== undefined) {
    values.push(data.body);
    fields.push(`body = $${values.length}`);
  }
  if (data.active !== undefined) {
    values.push(data.active);
    fields.push(`active = $${values.length}`);
  }

  values.push(id);
  const setClause = fields.length ? `${fields.join(', ')}, updated_at = now()` : 'updated_at = now()';
  const { rows } = await pool.query(
    `UPDATE announcements SET ${setClause} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return rows[0] ? assemble(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { list, create, update, remove };
