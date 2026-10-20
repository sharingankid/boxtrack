-- BoxTrack schema (PostgreSQL)
-- Matches the ER diagram in docs/03-technical-documentation.md §2.3 for the
-- tables that haven't changed shape; see backend/API_CONTRACT.md for the
-- current Session object. Core V1 tables first, Optional-tier tables
-- (athletes, scores, announcements, qr_codes) below - per the cahier des
-- charges §5/§6.
--
-- This is the canonical "fresh install" script - creates the schema in its
-- CURRENT, already-migrated shape. An existing V1 database (free-text
-- `time_slot`, Recipes tables present) must instead run
-- db/migrations/001_real_schedules_and_remove_recipes.sql, which converts
-- in place and documents exactly what happens to existing rows. Do not run
-- both against the same database.

BEGIN;

-- `role` covers every authenticated staff type the box has today: the
-- owner, coaches, and other staff who need admin access. All three get the
-- same route access for now (every admin route just requires `requireAuth`)
-- - the column exists and is enforced so a route can start requiring a
-- specific role later (see middleware/auth.js's requireRole) without a
-- schema change. Default stays 'coach' since that's who signs up most often.
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'coach' CHECK (role IN ('owner', 'coach', 'staff')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per issued login token. A real table (not a signed/stateless token)
-- so logout can actually revoke access immediately - see backend/README.md.
CREATE TABLE sessions (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- One row per calendar session (Warm-Up fields embedded directly - see
-- docs/03-technical-documentation.md §2.3 "Key design choices").
--
-- A box can run several distinct sessions on the same date (e.g. 6am/12pm/6pm
-- classes with different content), so the uniqueness key is
-- (date, start_time), not date alone.
--
-- `start_time`/`end_time` are real `TIME` values (not free text) so the
-- backend can compute "which session is happening right now" and "what's
-- next" reliably - see scoreService.js's sibling, wodService.js's
-- `getTvState()`. Both are wall-clock times in the box's own timezone
-- (Europe/Paris) - there is no UTC conversion anywhere for these, exactly
-- like `session_date` is a plain calendar date, not a timestamp.
CREATE TABLE wods (
    id               SERIAL PRIMARY KEY,
    session_date     DATE NOT NULL,
    start_time       TIME NOT NULL,
    end_time         TIME NOT NULL,
    title            TEXT,
    warmup_general   TEXT,
    warmup_specific  TEXT,
    created_by       INTEGER NOT NULL REFERENCES users(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (session_date, start_time),
    CHECK (end_time > start_time)
);

CREATE TABLE skill_strength_blocks (
    id           SERIAL PRIMARY KEY,
    wod_id       INTEGER NOT NULL UNIQUE REFERENCES wods(id) ON DELETE CASCADE,
    kind         TEXT NOT NULL CHECK (kind IN ('skill', 'strength')),
    instructions TEXT
);

CREATE TABLE wod_blocks (
    id                 SERIAL PRIMARY KEY,
    wod_id             INTEGER NOT NULL UNIQUE REFERENCES wods(id) ON DELETE CASCADE,
    format             TEXT NOT NULL CHECK (
                           format IN ('AMRAP', 'FOR_TIME', 'EMOM', 'TABATA', 'CHIPPER', 'STRENGTH')
                       ),
    duration_or_target TEXT,
    notes              TEXT
);

-- Shared by both the Skill/Strength and WOD phases (discriminated by `phase`),
-- see docs/03-technical-documentation.md §2.3 "Key design choices" for why
-- this is one table instead of two near-identical ones.
CREATE TABLE movements (
    id            SERIAL PRIMARY KEY,
    wod_id        INTEGER NOT NULL REFERENCES wods(id) ON DELETE CASCADE,
    phase         TEXT NOT NULL CHECK (phase IN ('skill_strength', 'wod')),
    movement_name TEXT NOT NULL,
    detail        TEXT,
    order_index   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_movements_wod_phase ON movements(wod_id, phase, order_index);

-- ============================================================
-- Optional tier (cahier des charges §6 "si le temps le permet")
-- ============================================================

-- Managed exclusively by the coach in V1 - no athlete self-registration
-- (cahier des charges §6). Soft-delete via `active` so historical scores
-- stay intact when a member leaves the box.
CREATE TABLE athletes (
    id         SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name  TEXT NOT NULL,
    photo_url  TEXT,
    active     BOOLEAN NOT NULL DEFAULT true,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One score per athlete per WOD. `result_value` is always numeric so the
-- leaderboard can `ORDER BY` it directly - the coach enters a time as
-- MM:SS client-side, converted to seconds before it reaches the API (see
-- scoreService.js); every other format is a plain number (reps, rounds,
-- kg). Which direction counts as "better" is derived from the WOD's own
-- format (ascending for time-based formats, descending otherwise), not
-- stored per-score, so it can never drift from the WOD it belongs to.
CREATE TABLE scores (
    id           SERIAL PRIMARY KEY,
    wod_id       INTEGER NOT NULL REFERENCES wods(id) ON DELETE CASCADE,
    athlete_id   INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    category     TEXT NOT NULL CHECK (category IN ('RX', 'Scaled', 'Modified')),
    result_value NUMERIC NOT NULL CHECK (result_value >= 0),
    recorded_by  INTEGER NOT NULL REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (wod_id, athlete_id)
);

CREATE INDEX idx_scores_wod_id ON scores(wod_id);

-- Owner-published announcements (events, closures, schedule changes...).
-- `active` lets the coach pull one down without deleting its history.
CREATE TABLE announcements (
    id         SERIAL PRIMARY KEY,
    title      TEXT NOT NULL,
    body       TEXT,
    active     BOOLEAN NOT NULL DEFAULT true,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Owner-configured QR codes (Google review link, Instagram, sign-up...),
-- generated dynamically client-side from `url` - nothing to store but the
-- destination and a label.
CREATE TABLE qr_codes (
    id          SERIAL PRIMARY KEY,
    label       TEXT NOT NULL,
    url         TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_by  INTEGER NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
