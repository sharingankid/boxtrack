const { Pool, types } = require('pg');

// pg's default DATE parser builds a JS Date from local-timezone components,
// which then serializes to a UTC ISO string shifted by the server's UTC
// offset - "2026-10-05" can come back as "2026-10-04T22:00:00.000Z". Keep
// DATE columns (OID 1082) as the raw "YYYY-MM-DD" string Postgres already
// returns instead, since that's what session_date actually is.
types.setTypeParser(1082, (value) => value);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
