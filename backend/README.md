# BoxTrack API

REST API for BoxTrack (CrossFit LAB). Core V1: authentication (coach/staff/owner) and full session
management (Warm-Up / Skill-Strength / WOD, 6 formats, real `start_time`/`end_time` schedules).
Scores, athletes, announcements, and QR codes are the CDC's own Optional-tier, built after Core -
see `API_CONTRACT.md` for their endpoints. The Recipes/Spoonacular feature has been removed
entirely (it was a sponsor-approved side track, since reverted).

Architecture, data model and design rationale:
[docs/03-technical-documentation.md](../docs/03-technical-documentation.md). Precise, up-to-date
request/response contract (shared with Panaki for the front-end): [API_CONTRACT.md](./API_CONTRACT.md)
- the source of truth for the API shape. Importable Postman collection:
[docs/postman/BoxTrack.postman_collection.json](../docs/postman/BoxTrack.postman_collection.json)
(login first - it saves the token for the rest of the collection automatically).

A date can have **more than one session** (e.g. a 6am and a 6pm class with different content) - the
uniqueness key is `(session_date, start_time)`, not the date alone. `start_time` and `end_time` are
both required, real `HH:mm` times (`end_time` must be strictly after `start_time`).

`GET /wods/today` and `GET /wods/tv-now` resolve "today"/"now" in the **Europe/Paris** timezone (the
box is in Toulouse), not UTC - otherwise the previous day's session would still show, or the wrong
session would be picked as "current", for part of the night. `tv-now` is the dedicated endpoint for
the TV interface - see `API_CONTRACT.md` for its exact `current`/`next`/`remaining` shape (the
backend computes this, the front-end doesn't need to re-sort/compare times itself).

`POST /auth/login` is rate-limited (10 attempts / 15 min / IP) against password guessing, matches
the email case-insensitively, and takes the same time to reject an unknown email as a wrong
password (no account enumeration). Passwords are bcrypt-hashed; login tokens are random 256-bit
values stored only as SHA-256 hashes, revoked on logout. Security headers come from `helmet`.

## Requirements

- Node.js 18+
- PostgreSQL 14+ (or Docker, see below)

## Setup

```bash
cd backend
npm install

cp .env.example .env
# edit .env: set DATABASE_URL to your local Postgres connection string
```

No local Postgres? One Docker command gives you one (then use
`DATABASE_URL=postgres://boxtrack:boxtrack@localhost:5432/boxtrack`):

```bash
docker run -d --name boxtrack-pg -e POSTGRES_USER=boxtrack -e POSTGRES_PASSWORD=boxtrack \
  -e POSTGRES_DB=boxtrack -p 5432:5432 postgres:16-alpine
```

Create the tables, with or without the demo data:

```bash
npm run db:setup -- --seed   # schema + demo coach + 8 realistic sessions (incl. 2 same-day slots)
npm run db:setup             # schema only - what production uses
```

`db:setup` refuses to run on a database that already has the tables (it never drops anything).
With `psql` installed, `psql "$DATABASE_URL" -f db/schema.sql` (then `-f db/seed.sql`) does the
same thing.

`db/schema.sql` is the canonical fresh-install script - it always reflects the current schema.
**An existing database** (created from an older version of this schema) is brought up to date
with:

```bash
npm run db:migrate
```

It applies every file in `db/migrations/` the database hasn't seen yet, in order, each in its own
transaction, and records it in the `schema_migrations` table - so it is safe to run any number of
times (production runs it on every start, see `render.yaml`). A database created before
`schema_migrations` existed is detected and baselined automatically. Each migration's header
comment says exactly what it does to existing rows (001 converts `time_slot` to
`start_time`/`end_time` and drops the Recipes tables; 002 is purely additive).

Adding a migration: create `db/migrations/NNN_description.sql` (no `BEGIN`/`COMMIT`, the runner
wraps it), apply the same change to `db/schema.sql`, and add the file name to the
`schema_migrations` insert at the end of `schema.sql`.

Demo coach login (only if you ran the seed): `coach@crossfitlab.fr` / `CoachDemo2026!`. This
password is public (it's in this file) - **never load the seed on the production database.**

## Admin accounts

There is no sign-up route (cahier des charges: no self-registration). Accounts are created from
the command line, so no password ever lands in the repository:

```bash
npm run user:create -- --email timothe@crossfitlab.fr --role owner
# prompts for the password (12 characters minimum, not echoed)
```

`--role` is `owner`, `coach` (default) or `staff`. Running it again for an existing email
**resets that account's password** and logs it out everywhere. In a non-interactive shell (a
hosting provider's console), pass the password through the environment instead:
`BOXTRACK_PASSWORD='...' npm run user:create -- --email ...`.

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgres://user:pass@localhost:5432/boxtrack`. |
| `PORT` | Port the API listens on (defaults to `3000`). Hosting providers set it themselves. |
| `DATABASE_SSL` | `true` for a hosted database that requires TLS (Render, Railway, Neon...). Leave empty locally. |
| `FRONTEND_URL` | Production: the deployed front-end origin(s), comma-separated, to lock CORS. Leave unset in dev to allow any origin. |
| `TRUST_PROXY` | Production behind a reverse proxy: number of proxy hops (`1` on Render/Railway), so the login rate limiter sees real client IPs instead of the proxy's. |
| `SERVE_FRONTEND` | `true` to also serve the built React app (`frontend/dist`) from this server - one URL for the public view, `/coach`, `/screen` and `/api`. Requires `npm run build` in `frontend/` first (the server refuses to start otherwise). Leave unset in dev (Vite serves the front). |
| `FRONTEND_DIST` | Optional override of the build folder served by `SERVE_FRONTEND` (defaults to `../frontend/dist`). |

## Running

```bash
npm run dev     # development, auto-restarts on file changes (nodemon)
npm start       # production
```

`GET /health` returns `{ "status": "ok" }` once the server is up (no database query, safe for
uptime checks). Every request is logged (`METHOD path status Nms`) to stdout, except under
`NODE_ENV=test`. On `SIGTERM` (every redeploy) the server finishes in-flight requests and closes
the database pool before exiting.

### Production checklist

1. Create an empty Postgres database, set `DATABASE_URL` (+ `DATABASE_SSL=true` if hosted).
2. `npm ci --omit=dev && npm run db:setup` (schema only - no seed).
3. `npm run user:create -- --email <owner email> --role owner` for Timothé's account.
4. Set `FRONTEND_URL` and `TRUST_PROXY`, start with `npm start`, check `GET /health`.

### Deploying on Render (recommended)

The repository root has a [`render.yaml`](../render.yaml) Blueprint: **one** web service that
builds the front-end (against a relative `/api`, so no CORS and no URL to configure) and serves it
together with the API (`SERVE_FRONTEND=true`), plus one PostgreSQL database. HTTPS is provided by
Render on the `*.onrender.com` URL (and on a custom domain such as `boxtrack.crossfit-lab.fr` if
one is added).

1. Render dashboard → **New → Blueprint** → select the GitHub repository. It deploys `main`.
2. The start command runs `npm run db:setup -- --if-empty` then `npm run db:migrate`: the schema
   is created on the first deploy, and every later deploy only applies new migrations (if any).
3. Create Timothé's account from your own machine, using the database's **External Database URL**
   (Render dashboard → `boxtrack-db` → Connections) - the free plan has no shell:

   ```bash
   cd backend
   DATABASE_URL='<External Database URL>' DATABASE_SSL=true \
     npm run user:create -- --email timothe@crossfitlab.fr --role owner
   ```

   For a soutenance/demo database only, the same `DATABASE_URL=... DATABASE_SSL=true` prefix works
   with `npm run db:setup -- --seed` **on a fresh, separate database** (it refuses to run on one
   that already has the schema).
4. Open `https://<service>.onrender.com/health` (`{"status":"ok"}`), then `/`, `/screen`, `/login`.

Free-plan limits to know before the box relies on it: the service sleeps after 15 minutes without
traffic (the first request then takes ~1 minute - the `/screen` TV polls every 30 s, so it stays
awake while the TV is on), and a free Render database expires after 30 days. For real daily use,
switch the web service to the Starter plan and/or point `DATABASE_URL` at a durable database
(Render paid Postgres, or Neon's free tier with `DATABASE_SSL=true`).

## Lint & format

```bash
npm run lint          # ESLint, zero warnings expected
npm run lint:fix      # auto-fix what ESLint can
npm run format        # Prettier, writes in place (JS only - doesn't touch the Markdown docs)
npm run format:check  # what CI runs - fails if a file isn't formatted
```

`lint`/`lint:fix` set `ESLINT_USE_FLAT_CONFIG=false` - without it, ESLint 8.57 walks up from
`backend/` and picks up the **front-end's** flat-config `eslint.config.js` at the repo root (a
Node/ESLint interop quirk, not a backend bug), which then fails to load `.eslintrc.json` at all.

## Tests

```bash
npm test               # unit tests - pure functions, no database needed
npm run test:integration   # protected access, validation, persistence - needs a real database
```

Unit tests (`tests/*.test.js`, 75 tests) cover pure logic: session assembly, schedule/role
validation, the `/wods/tv-now` current/next/remaining selection (including Europe/Paris DST
correctness), leaderboard ranking (including ties and the AMRAP extra-reps tie-break), score
parsing/formatting per WOD format and whole-class validation, photo type detection, input validators (calendar
dates, http(s)-only URLs, ids), token extraction, error formatting, and the single-service
front-end serving (SPA fallback, cache headers, `/api` left alone).

Integration tests (`tests/integration/`, 67 tests) run the real Express app with Supertest against
a real Postgres database - they `TRUNCATE` every table before each test, so **never point them at
your dev database**:

```bash
createdb boxtrack_test   # or a second database in the Docker container above
cp .env.test.example .env.test
# edit .env.test: set DATABASE_URL to the boxtrack_test database
DATABASE_URL=<the boxtrack_test URL> npm run db:setup   # no seed - tests create their own fixtures
npm run test:integration
```

They cover what the CDC's Core V1 needs proven: admin routes reject missing/bad tokens and accept
valid ones (`auth.test.js`, `wodProtection.test.js`), every schedule/payload validation rule and
the `(session_date, start_time)` conflict (`wodValidation.test.js`), and that a full nested session
round-trips correctly through create/read/update/duplicate/delete, including `/wods/today` across
multiple same-day sessions (`wodPersistence.test.js`). `optionalFeatures.test.js` covers the
Optional tier end to end: athlete soft-delete, photo upload/serving/size and type limits, score
upsert and leaderboard ordering/ties, AMRAP rounds + reps, whole-class entry (including the
all-or-nothing rollback), announcement visibility, expiry and shareable link, QR code ordering
and URL safety, and `401` on every optional admin route.

**CI**: `.github/workflows/backend.yml` runs lint, format check, unit tests, then the integration
tests against a Postgres service container, on every push and pull request touching `backend/`.

## API summary

Base URL: `/api`. Full request/response shapes, JSON examples, and error codes, including the
Optional-tier (athletes/scores/announcements/QR codes) endpoints not listed here:
**[API_CONTRACT.md](./API_CONTRACT.md)**.

| Method | Path | Auth | Returns |
|---|---|---|---|
| POST | `/api/auth/login` | Public | `{ token, user, expires_at }` |
| GET | `/api/auth/me` | Authenticated | `{ user, expires_at }` - is a stored token still valid? |
| POST | `/api/auth/logout` | Authenticated | `204` |
| GET | `/api/wods/today` | Public | `{ wods: [...] }` - zero, one, or more, sorted by `start_time` |
| GET | `/api/wods/tv-now` | Public | `{ reference_date, reference_time, timezone, current, next, remaining }` |
| GET | `/api/wods?from=&to=` | Public | `{ wods: [...] }` (summaries, for history) |
| GET | `/api/wods/:id` | Public | `{ wod: {...} }` (full nested session) |
| POST | `/api/admin/wods` | Authenticated | `201 { wod }` / `409` if `(session_date, start_time)` already taken |
| PUT | `/api/admin/wods/:id` | Authenticated | `{ wod }` |
| POST | `/api/admin/wods/:id/duplicate` | Authenticated | `201 { wod }` - copies Warm-Up/Skill-Strength/WOD onto a new slot |
| DELETE | `/api/admin/wods/:id` | Authenticated | `204` |

"Authenticated" = any valid token regardless of role (`owner`/`coach`/`staff`) - see
`API_CONTRACT.md`'s Authentication & authorization section. Send
`Authorization: Bearer <token>` (the `token` returned by `POST /api/auth/login`).
