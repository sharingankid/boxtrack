const pool = require('../config/db');

// Emails are matched case-insensitively ("Coach@CrossfitLab.fr" is the same
// account) - callers pass an already-normalized (trimmed, lowercased) value.
async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
  return rows[0] || null;
}

async function create({ email, passwordHash, role }) {
  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
    [email, passwordHash, role]
  );
  return rows[0];
}

async function updatePassword(id, passwordHash) {
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
  // A password change must log every existing device out.
  await pool.query('DELETE FROM sessions WHERE user_id = $1', [id]);
}

module.exports = { findByEmail, create, updatePassword };
