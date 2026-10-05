# BoxTrack API

REST API for BoxTrack (CrossFit LAB). Core V1: coach authentication and full session management
(Warm-Up / Skill-Strength / WOD, 6 formats). Plus a Recipes ("cuisine") section - a sponsor-approved
addition (2026-10-05), not in the original cahier des charges: the coach curates healthy/fit recipes
via Spoonacular, members browse them. Scores, athletes, announcements, and QR codes are the CDC's
own Optional-tier and still not implemented - see
[docs/01-idea-development.md §3.7](../docs/01-idea-development.md#37-scope).

Architecture: [docs/03-technical-documentation.md](../docs/03-technical-documentation.md). Precise,
up-to-date request/response contract (the one actually implemented - shared with Panaki for the
front-end): [API_CONTRACT.md](./API_CONTRACT.md).

A date can have **more than one session** (e.g. a 6am and a 6pm class with different content) - the
uniqueness key is `(session_date, time_slot)`, not the date alone. `time_slot` is required.

## Requirements

- Node.js 18+
- PostgreSQL 14+

## Setup

```bash
cd backend
npm install

cp .env.example .env
# edit .env: set DATABASE_URL to your local Postgres connection string, and
# SPOONACULAR_API_KEY (free key at https://spoonacular.com/food-api/console#Dashboard)
# if you want the recipe search to work - everything else runs fine without it

createdb boxtrack   # or: psql -c "CREATE DATABASE boxtrack;"
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql   # optional - demo coach + 8 realistic sessions (incl. 2 same-day slots)
```

Demo coach login (only if you ran `seed.sql`): `coach@crossfitlab.fr` / `CoachDemo2026!`

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgres://user:pass@localhost:5432/boxtrack`. |
| `PORT` | Port the API listens on (defaults to `3000`). |
| `SPOONACULAR_API_KEY` | Needed only for `GET /admin/recipes/search`. Everything else works without it. |

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

## Tests

```bash
npm test               # unit tests - pure functions, no database needed
npm run test:integration   # protected access, validation, persistence - needs a real database
```

Unit tests (`tests/*.test.js`) cover pure logic: session assembly, token extraction, error
formatting.

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

They cover exactly the three things the CDC's Core V1 needs proven: admin routes reject missing/bad
tokens and accept valid ones (`auth.test.js`, `wodProtection.test.js`), every validation rule and
the `(session_date, time_slot)` conflict (`wodValidation.test.js`), and that a full nested session
round-trips correctly through create/read/update/delete, including `/wods/today` across multiple
same-day sessions (`wodPersistence.test.js`). Same coverage for recipes
(`recipeProtection.test.js`, `recipeValidation.test.js`, `recipePersistence.test.js`) - the live
Spoonacular search itself isn't exercised by the integration suite (no API key needed to run
`npm run test:integration`), only its auth protection and the save/read/update/delete flow once a
result has been picked; `spoonacularMapper.test.js` (a unit test) covers the Spoonacular ->
Recipe field mapping offline.

## API summary

Base URL: `/api`. Full request/response shapes, JSON examples, and error codes:
**[API_CONTRACT.md](./API_CONTRACT.md)**.

| Method | Path | Auth | Returns |
|---|---|---|---|
| POST | `/api/auth/login` | Public | `{ token, user }` |
| POST | `/api/auth/logout` | Coach | `204` |
| GET | `/api/wods/today` | Public | `{ wods: [...] }` - zero, one, or more (one per time slot) |
| GET | `/api/wods?from=&to=` | Public | `{ wods: [...] }` (summaries, for history) |
| GET | `/api/wods/:id` | Public | `{ wod: {...} }` (full nested session) |
| POST | `/api/admin/wods` | Coach | `201 { wod }` / `409` if `(session_date, time_slot)` already taken |
| PUT | `/api/admin/wods/:id` | Coach | `{ wod }` |
| DELETE | `/api/admin/wods/:id` | Coach | `204` |
| GET | `/api/recipes` | Public | `{ recipes: [...] }` |
| GET | `/api/recipes/:id` | Public | `{ recipe: {...} }` |
| GET | `/api/admin/recipes/search?query=` | Coach | `{ results: [...] }` - Spoonacular, not yet saved |
| POST | `/api/admin/recipes` | Coach | `201 { recipe }` |
| PUT | `/api/admin/recipes/:id` | Coach | `{ recipe }` |
| DELETE | `/api/admin/recipes/:id` | Coach | `204` |

Admin routes require `Authorization: Bearer <token>` (the `token` returned by `POST /api/auth/login`).
