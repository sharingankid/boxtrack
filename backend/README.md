# BoxTrack API

REST API for BoxTrack (CrossFit LAB). Core V1 only: coach authentication and full session
management (Warm-Up / Skill-Strength / WOD, 6 formats). Scores, athletes, announcements, and QR
codes are Optional-tier and not implemented yet - see
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
# edit .env: set DATABASE_URL to your local Postgres connection string

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

## Running

```bash
npm run dev     # development, auto-restarts on file changes (nodemon)
npm start       # production
```

`GET /health` returns `{ "status": "ok" }` once the server is up (no database query, safe for
uptime checks).

## Tests

```bash
npm test
```

Unit tests only for now (no live database required) - see `tests/`. Integration tests against a
real Postgres instance are the next step (see `docs/03-technical-documentation.md §5.2`).

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

Admin routes require `Authorization: Bearer <token>` (the `token` returned by `POST /api/auth/login`).
