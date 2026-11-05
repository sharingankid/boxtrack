-- Migration 003: member accounts (sign-up from the TV's QR code) and scores
-- entered by the members themselves.
--
-- Applied by `npm run db:migrate` (which wraps it in a transaction and
-- records it in schema_migrations) - no BEGIN/COMMIT here for that reason.
-- Additive for existing data: two NOT NULL constraints are relaxed (NULL now
-- means "done by the member, not by a staff user") and two tables are added.
--
-- A member account is an athlete row plus credentials, so a member's own
-- scores land in the same leaderboard as the ones the coach enters. Member
-- tokens live in their own table: requireAuth only reads `sessions`, so a
-- member token can never open an admin route.

ALTER TABLE athletes ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE scores ALTER COLUMN recorded_by DROP NOT NULL;

CREATE TABLE member_accounts (
    athlete_id    INTEGER PRIMARY KEY REFERENCES athletes(id) ON DELETE CASCADE,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar        TEXT NOT NULL DEFAULT 'manA'
                  CHECK (avatar IN ('manA', 'manB', 'womanA', 'womanB')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE member_sessions (
    id         SERIAL PRIMARY KEY,
    athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_member_sessions_athlete_id ON member_sessions(athlete_id);
CREATE INDEX idx_scores_athlete_id ON scores(athlete_id);
