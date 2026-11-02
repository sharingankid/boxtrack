// Brings an existing database up to the current schema by applying every
// db/migrations/*.sql file it hasn't seen yet, in file-name order, and
// recording each one in schema_migrations. Usage:
//
//   npm run db:migrate
//
// Safe to run on every start (render.yaml does): already-applied files are
// skipped, so it's a no-op on an up-to-date database. Each file runs in its
// own transaction together with its schema_migrations row - a failing
// migration leaves the database exactly as it was before that file.
//
// Databases created before schema_migrations existed are baselined first:
// migration 001 is recorded as applied if its end state (wods.start_time)
// is already there, so it is never replayed.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'db', 'migrations');

async function baseline(client) {
  const { rows } = await client.query("SELECT to_regclass('public.schema_migrations') AS existing");
  if (rows[0].existing) return;

  await client.query(`CREATE TABLE schema_migrations (
    name       TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  const { rows: startTime } = await client.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = 'wods' AND column_name = 'start_time'`
  );
  if (startTime.length) {
    await client.query(
      "INSERT INTO schema_migrations (name) VALUES ('001_real_schedules_and_remove_recipes.sql')"
    );
  }
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows: schema } = await client.query("SELECT to_regclass('public.wods') AS existing");
    if (!schema[0].existing) {
      throw new Error('No schema on this database - run `npm run db:setup` first.');
    }

    await baseline(client);
    const { rows } = await client.query('SELECT name FROM schema_migrations');
    const applied = new Set(rows.map((row) => row.name));
    const pending = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql') && !applied.has(file))
      .sort();

    if (!pending.length) {
      console.log('Database is up to date.');
      return;
    }

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      // 001 predates this runner and manages its own transaction; newer
      // files don't, and get wrapped here with their bookkeeping row.
      const ownTransaction = /^\s*BEGIN\s*;/im.test(sql);
      if (ownTransaction) {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      } else {
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          throw new Error(`${file}: ${err.message}`);
        }
      }
      console.log(`Applied ${file}`);
    }
  } finally {
    client.release();
  }
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
