const pool = require('../config/db');

// An uploaded photo (athlete_photos) wins over an external photo_url. Its
// URL carries the upload time, so a new photo is a new URL and the old one
// can be cached for good by browsers and the TV.
function assemble(row) {
  const uploaded = row.photo_updated_at
    ? `/api/athletes/${row.id}/photo?v=${new Date(row.photo_updated_at).getTime()}`
    : null;
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    photo_url: uploaded || row.photo_url,
    has_uploaded_photo: Boolean(uploaded),
    active: row.active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const SELECT_WITH_PHOTO = `
  SELECT athletes.*, athlete_photos.updated_at AS photo_updated_at
  FROM athletes
  LEFT JOIN athlete_photos ON athlete_photos.athlete_id = athletes.id
`;

async function list({ active } = {}) {
  const conditions = [];
  const values = [];
  if (active !== undefined) {
    values.push(active);
    conditions.push(`athletes.active = $${values.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(`${SELECT_WITH_PHOTO} ${where} ORDER BY last_name, first_name`, values);
  return rows.map(assemble);
}

async function findById(id) {
  const { rows } = await pool.query(`${SELECT_WITH_PHOTO} WHERE athletes.id = $1`, [id]);
  return rows[0] ? assemble(rows[0]) : null;
}

async function findByIds(ids) {
  const { rows } = await pool.query(`${SELECT_WITH_PHOTO} WHERE athletes.id = ANY($1::int[])`, [ids]);
  return rows.map(assemble);
}

async function create(data, userId) {
  const { rows } = await pool.query(
    `INSERT INTO athletes (first_name, last_name, photo_url, created_by)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [data.first_name, data.last_name, data.photo_url || null, userId]
  );
  return findById(rows[0].id);
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
    `UPDATE athletes SET ${setClause} WHERE id = $${values.length} RETURNING id`,
    values
  );
  return rows[0] ? findById(rows[0].id) : null;
}

async function findPhoto(athleteId) {
  const { rows } = await pool.query(
    'SELECT content_type, data, updated_at FROM athlete_photos WHERE athlete_id = $1',
    [athleteId]
  );
  return rows[0] || null;
}

async function savePhoto(athleteId, contentType, data) {
  await pool.query(
    `INSERT INTO athlete_photos (athlete_id, content_type, data) VALUES ($1, $2, $3)
     ON CONFLICT (athlete_id)
     DO UPDATE SET content_type = EXCLUDED.content_type, data = EXCLUDED.data, updated_at = now()`,
    [athleteId, contentType, data]
  );
}

async function deletePhoto(athleteId) {
  const { rowCount } = await pool.query('DELETE FROM athlete_photos WHERE athlete_id = $1', [athleteId]);
  return rowCount > 0;
}

module.exports = { list, findById, findByIds, create, update, findPhoto, savePhoto, deletePhoto };
