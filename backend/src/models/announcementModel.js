const pool = require('../config/db');

function assemble(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    active: row.active,
    ends_on: row.ends_on,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// `visibleOn` (YYYY-MM-DD, the box's today): active, and not past its
// ends_on. Without it, every announcement - the coach's admin list.
async function list({ visibleOn } = {}) {
  const where = visibleOn ? 'WHERE active = true AND (ends_on IS NULL OR ends_on >= $1)' : '';
  const { rows } = await pool.query(
    `SELECT * FROM announcements ${where} ORDER BY created_at DESC`,
    visibleOn ? [visibleOn] : []
  );
  return rows.map(assemble);
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM announcements WHERE id = $1', [id]);
  return rows[0] ? assemble(rows[0]) : null;
}

async function create(data, userId) {
  const { rows } = await pool.query(
    `INSERT INTO announcements (title, body, ends_on, created_by) VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.title, data.body || null, data.ends_on || null, userId]
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
  if (data.ends_on !== undefined) {
    values.push(data.ends_on || null);
    fields.push(`ends_on = $${values.length}`);
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

module.exports = { list, findById, create, update, remove };
