// Creates the schema on an EMPTY database, optionally followed by the demo
// seed - the same thing as `psql -f db/schema.sql` (and `-f db/seed.sql`),
// but runnable wherever Node is, e.g. a hosting provider's shell where psql
// isn't installed. Usage:
//
//   npm run db:setup              # schema only (production)
//   npm run db:setup -- --seed    # schema + demo data (dev / soutenance)
//   npm run db:setup -- --if-empty  # same, but a no-op if already set up
//
// Refuses to run if the tables already exist: an existing database is
// upgraded with db/migrations/, never recreated. --if-empty turns that
// refusal into a silent success, so the command can run before every start
// on a host without shell access (Render's free plan, see render.yaml) -
// it creates the schema on the very first deploy and does nothing after.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

const DB_DIR = path.join(__dirname, '..', 'db');

async function main() {
  const withSeed = process.argv.includes('--seed');
  const ifEmpty = process.argv.includes('--if-empty');

  const { rows } = await pool.query("SELECT to_regclass('public.wods') AS existing");
  if (rows[0].existing && ifEmpty) {
    console.log('Schema already present - nothing to do.');
    return;
  }
  if (rows[0].existing) {
    throw new Error(
      'The schema already exists on this database - nothing done. Use db/migrations/ to upgrade it.'
    );
  }

  await pool.query(fs.readFileSync(path.join(DB_DIR, 'schema.sql'), 'utf8'));
  console.log('Schema created.');

  if (withSeed) {
    await pool.query(fs.readFileSync(path.join(DB_DIR, 'seed.sql'), 'utf8'));
    console.log('Demo data loaded (see backend/README.md for the demo login).');
  }
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
