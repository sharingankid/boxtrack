const { Pool, types } = require('pg');

// pg's default DATE parser builds a JS Date from local-timezone components,
// which then serializes to a UTC ISO string shifted by the server's UTC
// offset - "2026-10-05" can come back as "2026-10-04T22:00:00.000Z". Keep
// DATE columns (OID 1082) as the raw "YYYY-MM-DD" string Postgres already
// returns instead, since that's what session_date actually is.
types.setTypeParser(1082, (value) => value);

// Hosted Postgres (Render, Railway, Neon...) requires TLS; a local Docker
// or Homebrew Postgres doesn't speak it. DATABASE_SSL=true turns it on.
// rejectUnauthorized stays false because these providers use certificates
// Node doesn't ship the CA for - the connection is still encrypted.
const ssl = process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

// An idle client losing its connection (database restart, network blip)
// emits 'error' on the pool - unhandled, that would crash the whole API
// mid-class. The next query simply gets a fresh connection.
pool.on('error', (err) => {
  console.error('Idle database client error:', err.message);
});

module.exports = pool;
