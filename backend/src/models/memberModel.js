const pool = require('../config/db');

function assemble(row) {
  return {
    id: row.athlete_id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    avatar: row.avatar,
    active: row.active,
  };
}

const SELECT_ACCOUNT = `
  SELECT member_accounts.*, athletes.first_name, athletes.last_name, athletes.active
  FROM member_accounts
  JOIN athletes ON athletes.id = member_accounts.athlete_id
`;

async function findByEmail(email) {
  const { rows } = await pool.query(`${SELECT_ACCOUNT} WHERE member_accounts.email = $1`, [email]);
  return rows[0] ? { ...assemble(rows[0]), password_hash: rows[0].password_hash } : null;
}

async function findById(athleteId) {
  const { rows } = await pool.query(`${SELECT_ACCOUNT} WHERE member_accounts.athlete_id = $1`, [athleteId]);
  return rows[0] ? assemble(rows[0]) : null;
}

// The athlete row and its credentials together: a half-created member
// (an athlete without an account) never shows up in the coach's roster.
async function create({ firstName, lastName, email, passwordHash, avatar }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'INSERT INTO athletes (first_name, last_name, created_by) VALUES ($1, $2, NULL) RETURNING id',
      [firstName, lastName]
    );
    await client.query(
      `INSERT INTO member_accounts (athlete_id, email, password_hash, avatar)
       VALUES ($1, $2, $3, $4)`,
      [rows[0].id, email, passwordHash, avatar]
    );
    await client.query('COMMIT');
    return findById(rows[0].id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function createSession({ athleteId, tokenHash, expiresAt }) {
  await pool.query('INSERT INTO member_sessions (athlete_id, token_hash, expires_at) VALUES ($1, $2, $3)', [
    athleteId,
    tokenHash,
    expiresAt,
  ]);
}

// A deactivated athlete (left the box) is signed out everywhere at once.
async function findSession(tokenHash) {
  const { rows } = await pool.query(
    `${SELECT_ACCOUNT}
     JOIN member_sessions ON member_sessions.athlete_id = member_accounts.athlete_id
     WHERE member_sessions.token_hash = $1 AND member_sessions.expires_at > now()
       AND athletes.active`,
    [tokenHash]
  );
  return rows[0] ? { ...assemble(rows[0]), expires_at: rows[0].expires_at } : null;
}

async function deleteSession(tokenHash) {
  await pool.query('DELETE FROM member_sessions WHERE token_hash = $1', [tokenHash]);
}

async function deleteExpiredSessions(athleteId) {
  await pool.query('DELETE FROM member_sessions WHERE athlete_id = $1 AND expires_at <= now()', [athleteId]);
}

// The member's scores, newest session first, each with its rank among the
// same WOD and category. Same ordering as scoreService.rankCategory: lower is
// better for FOR_TIME / CHIPPER, higher otherwise, extra reps break a tie,
// equal results share a rank (RANK()).
async function listScores(athleteId, limit = 100) {
  const { rows } = await pool.query(
    `SELECT * FROM (
       SELECT scores.id, scores.wod_id, scores.athlete_id, scores.category,
              scores.result_value, scores.extra_reps, scores.created_at, scores.updated_at,
              wods.session_date, wods.start_time, wods.title, wod_blocks.format,
              RANK() OVER (
                PARTITION BY scores.wod_id, scores.category
                ORDER BY
                  CASE WHEN wod_blocks.format IN ('FOR_TIME', 'CHIPPER') THEN scores.result_value END ASC,
                  CASE WHEN wod_blocks.format IN ('FOR_TIME', 'CHIPPER') THEN NULL ELSE scores.result_value END DESC,
                  COALESCE(scores.extra_reps, 0) DESC
              ) AS rank,
              COUNT(*) OVER (PARTITION BY scores.wod_id, scores.category) AS participants
       FROM scores
       JOIN wods ON wods.id = scores.wod_id
       JOIN wod_blocks ON wod_blocks.wod_id = scores.wod_id
       WHERE scores.wod_id IN (SELECT wod_id FROM scores WHERE athlete_id = $1)
     ) ranked
     WHERE athlete_id = $1
     ORDER BY session_date DESC, start_time DESC
     LIMIT $2`,
    [athleteId, limit]
  );
  return rows.map((row) => ({
    id: row.id,
    wod_id: row.wod_id,
    session_date: row.session_date,
    start_time: String(row.start_time).slice(0, 5),
    title: row.title,
    format: row.format,
    category: row.category,
    result_value: Number(row.result_value),
    extra_reps: row.extra_reps,
    rank: Number(row.rank),
    participants: Number(row.participants),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

module.exports = {
  findByEmail,
  findById,
  create,
  createSession,
  findSession,
  deleteSession,
  deleteExpiredSessions,
  listScores,
};
