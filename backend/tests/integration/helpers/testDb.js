const bcrypt = require('bcrypt');
const pool = require('../../../src/config/db');

const TEST_PASSWORD = 'TestPassword123!';
const TEST_COACH_EMAIL = 'coach@crossfitlab.fr';

// Deliberately low cost factor - these are test-only hashes, speed matters
// more than security here. bcrypt.compare() works the same regardless of
// the cost factor used when the hash was created.
async function testPasswordHash() {
  return bcrypt.hash(TEST_PASSWORD, 4);
}

async function resetDatabase() {
  await pool.query(
    'TRUNCATE TABLE movements, wod_blocks, skill_strength_blocks, wods, sessions, users RESTART IDENTITY CASCADE'
  );
}

async function seedCoach() {
  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
    [TEST_COACH_EMAIL, await testPasswordHash(), 'coach']
  );
  return rows[0].id;
}

async function closePool() {
  await pool.end();
}

module.exports = { TEST_PASSWORD, TEST_COACH_EMAIL, resetDatabase, seedCoach, closePool };
