-- Migration 002: AMRAP "rounds + reps" scores, uploaded athlete photos,
-- announcement end date.
--
-- Applied by `npm run db:migrate` (which wraps it in a transaction and
-- records it in schema_migrations) - no BEGIN/COMMIT here for that reason.
-- Purely additive: two nullable columns and one new table, no existing row
-- is modified or deleted.
--
-- Existing AMRAP scores were entered as a single number (total reps) and
-- keep that value with extra_reps NULL. The API now records an AMRAP as
-- rounds + reps, so re-enter those scores if they need to be ranked
-- alongside new ones.

ALTER TABLE scores ADD COLUMN extra_reps INTEGER CHECK (extra_reps >= 0);

CREATE TABLE athlete_photos (
    athlete_id   INTEGER PRIMARY KEY REFERENCES athletes(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp')),
    data         BYTEA NOT NULL,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE announcements ADD COLUMN ends_on DATE;
