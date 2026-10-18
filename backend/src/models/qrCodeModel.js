const pool = require('../config/db');

function assemble(row) {
  return { id: row.id, label: row.label, url: row.url, order_index: row.order_index, created_at: row.created_at };
}

async function list() {
  const { rows } = await pool.query('SELECT * FROM qr_codes ORDER BY order_index, id');
  return rows.map(assemble);
}

async function create(data, userId) {
  const { rows } = await pool.query(
    `INSERT INTO qr_codes (label, url, order_index, created_by) VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.label, data.url, data.order_index ?? 0, userId]
  );
  return assemble(rows[0]);
}

async function update(id, data) {
  const fields = [];
  const values = [];
  if (data.label !== undefined) {
    values.push(data.label);
    fields.push(`label = $${values.length}`);
  }
  if (data.url !== undefined) {
    values.push(data.url);
    fields.push(`url = $${values.length}`);
  }
  if (data.order_index !== undefined) {
    values.push(data.order_index);
    fields.push(`order_index = $${values.length}`);
  }
  if (!fields.length) return findById(id);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE qr_codes SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return rows[0] ? assemble(rows[0]) : null;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM qr_codes WHERE id = $1', [id]);
  return rows[0] ? assemble(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM qr_codes WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { list, create, update, remove };
