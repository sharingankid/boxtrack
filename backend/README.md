# BoxTrack API

REST API for BoxTrack (CrossFit LAB). Core V1: authentication (coach/staff/owner) and full session
management (Warm-Up / Skill-Strength / WOD, 6 formats, real `start_time`/`end_time` schedules).
Scores, athletes, announcements, and QR codes are the CDC's own Optional-tier, built after Core -
see `API_CONTRACT.md` for their endpoints. The Recipes/Spoonacular feature has been removed
entirely (it was a sponsor-approved side track, since reverted).

Architecture: [docs/03-technical-documentation.md](../docs/03-technical-documentation.md) (not yet
updated for the schedule refactor or the Optional-tier endpoints - `API_CONTRACT.md` is the
source of truth for the API shape). Precise, up-to-date request/response contract (shared with
Panaki for the front-end): [API_CONTRACT.md](./API_CONTRACT.md). Importable Postman collection:
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

`POST /auth/login` is rate-limited (10 attempts / 15 min / IP) against password guessing.

## Requirements

- Node.js 18+
- PostgreSQL 14+

## Setup

```bash
cd backend
npm install

cp .env.example .env
# edit .env: set DATABASE_URL to your local Postgres connection string

createdb boxtrack   # or: psql -c "CREATE DATABASE boxtrack;"
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql   # optional - demo coach + 8 realistic sessions (incl. 2 same-day slots)
```

`db/schema.sql` is the canonical fresh-install script - it already reflects the current schema
(real schedules, no Recipes tables). **If you have an existing database created from an older
version of this schema** (free-text `time_slot`, Recipes tables present), run the migration
instead of `schema.sql`:

```bash
psql "$DATABASE_URL" -f db/migrations/001_real_schedules_and_remove_recipes.sql
```

See that file's header comment for exactly what it does to existing rows (nothing is silently
deleted - full explanation of the `time_slot` → `start_time`/`end_time` conversion, the default
duration used, and what happens to Recipes data).

Demo coach login (only if you ran `seed.sql`): `coach@crossfitlab.fr` / `CoachDemo2026!`

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgres://user:pass@localhost:5432/boxtrack`. |
| `PORT` | Port the API listens on (defaults to `3000`). |
| `FRONTEND_URL` | Set in production to lock CORS to the deployed frontend origin. Leave unset in dev to allow any origin. |

## Running

```bash
npm run dev     # development, auto-restarts on file changes (nodemon)
npm start       # production
```

`GET /health` returns `{ "status": "ok" }` once the server is up (no database query, safe for
uptime checks). Every request is logged (`METHOD path status Nms`) to stdout.

## Lint & format

```bash
npm run lint        # ESLint, zero warnings expected
npm run lint:fix     # auto-fix what ESLint can
npm run format       # Prettier, writes in place (JS only - doesn't touch the Markdown docs)
```

`lint`/`lint:fix` set `ESLINT_USE_FLAT_CONFIG=false` - without it, ESLint 8.57 walks up from
`backend/` and picks up the **front-end's** flat-config `eslint.config.js` at the repo root (a
Node/ESLint interop quirk, not a backend bug), which then fails to load `.eslintrc.json` at all.

## Tests

```bash
npm test               # unit tests - pure functions, no database needed
npm run test:integration   # protected access, validation, persistence - needs a real database
```

Unit tests (`tests/*.test.js`) cover pure logic: session assembly, schedule/role validation, the
`/wods/tv-now` current/next/remaining selection (including Europe/Paris DST correctness), leaderboard
ranking, token extraction, error formatting.

Integration tests (`tests/integration/`) run the real Express app with Supertest against a real
Postgres database - they `TRUNCATE` every table before each test, so **never point them at your dev
database**:

```bash
createdb boxtrack_test
cp .env.test.example .env.test
# edit .env.test: set DATABASE_URL to the boxtrack_test database
psql "$DATABASE_URL" -f db/schema.sql   # no seed - tests create their own fixtures
npm run test:integration
```

They cover what the CDC's Core V1 needs proven: admin routes reject missing/bad tokens and accept
valid ones (`auth.test.js`, `wodProtection.test.js`), every schedule/payload validation rule and
the `(session_date, start_time)` conflict (`wodValidation.test.js`), and that a full nested session
round-trips correctly through create/read/update/duplicate/delete, including `/wods/today` across
multiple same-day sessions (`wodPersistence.test.js`).

## API summary

Base URL: `/api`. Full request/response shapes, JSON examples, and error codes, including the
Optional-tier (athletes/scores/announcements/QR codes) endpoints not listed here:
**[API_CONTRACT.md](./API_CONTRACT.md)**.

| Method | Path | Auth | Returns |
|---|---|---|---|
| POST | `/api/auth/login` | Public | `{ token, user }` |
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
