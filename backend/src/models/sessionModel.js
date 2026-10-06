const pool = require('../config/db');

async function create({ userId, tokenHash, expiresAt }) {
  const { rows } = await pool.query(
    'INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id',
    [userId, tokenHash, expiresAt]
  );
  return rows[0];
}

async function findValidByTokenHash(tokenHash) {
  const { rows } = await pool.query(
    `SELECT sessions.user_id AS user_id, users.email AS email, users.role AS role
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = $1 AND sessions.expires_at > now()`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function deleteByTokenHash(tokenHash) {
  await pool.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
}

module.exports = { create, findValidByTokenHash, deleteByTokenHash };
