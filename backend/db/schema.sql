-- BoxTrack - Core V1 schema (PostgreSQL)
-- Matches the ER diagram in docs/03-technical-documentation.md §2.3.
-- Optional-tier tables (scores, athletes, announcements, qr_codes) are
-- deliberately NOT created here yet - Core V1 only, per the cahier des charges
-- and docs/01-idea-development.md §3.7 (Core before Optional).

BEGIN;

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'coach' CHECK (role = 'coach'),
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
CREATE TABLE wods (
    id               SERIAL PRIMARY KEY,
    session_date     DATE NOT NULL UNIQUE,
    time_slot        TEXT,
    warmup_general   TEXT,
    warmup_specific  TEXT,
    created_by       INTEGER NOT NULL REFERENCES users(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
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

COMMIT;
