-- Migration 001: real session schedules, extended roles, Recipes removal
--
-- Run this ONCE against an existing V1 database (the one created by the
-- previous version of db/schema.sql: free-text `wods.time_slot`,
-- `users.role` locked to 'coach', Recipes tables present). A brand-new
-- database should use the current db/schema.sql directly instead - it
-- already reflects the end state this migration produces.
--
-- How to apply:
--   psql "$DATABASE_URL" -f backend/db/migrations/001_real_schedules_and_remove_recipes.sql
--
-- This migration does NOT delete any wods/scores/movements rows. It only
-- removes the Recipes feature's own tables (recipes, recipe_categories,
-- recipe_ingredients) and their rows, per the explicit decision to drop
-- Recipes from the product entirely - see backend/API_CONTRACT.md.
--
-- Take a backup first regardless (`pg_dump`) - standard practice for any
-- migration that drops columns/tables, not specific to this one.

BEGIN;

-- ------------------------------------------------------------------
-- 1. Real schedules: wods.time_slot (free text) -> start_time/end_time
--    (real TIME values) + an optional title.
-- ------------------------------------------------------------------

ALTER TABLE wods ADD COLUMN start_time TIME;
ALTER TABLE wods ADD COLUMN end_time   TIME;
ALTER TABLE wods ADD COLUMN title      TEXT;

-- Backfill start_time:
--   - time_slot already looks like "H:MM" or "HH:MM" (e.g. "06:00",
--     "18:00") -> cast directly, losslessly. This covers every row the
--     seeded demo data and the admin form have ever actually produced.
--   - anything else (free text the old API technically allowed, e.g. a
--     label like "Midday") -> start_time defaults to 00:00 and the
--     original value is preserved verbatim in `title` (prefixed, so it's
--     obviously not a real session name) rather than silently discarded.
--     These rows need a human to open them in the admin and set a real
--     time - the app will treat them as midnight sessions until then.
UPDATE wods
SET start_time = time_slot::TIME
WHERE time_slot ~ '^[0-9]{1,2}:[0-9]{2}$';

UPDATE wods
SET start_time = '00:00',
    title = 'Former time_slot: ' || time_slot
WHERE start_time IS NULL;

-- Backfill end_time: the old schema never recorded a duration, so there is
-- no "real" value to recover. One hour is the documented default class
-- length for CrossFit LAB (see cahier des charges §4, Warm-Up + Skill +
-- WOD adds up to roughly that). Every migrated row ends up with this
-- default - edit individually afterwards for sessions that actually ran
-- longer or shorter.
UPDATE wods SET end_time = start_time + INTERVAL '1 hour' WHERE end_time IS NULL;

ALTER TABLE wods ALTER COLUMN start_time SET NOT NULL;
ALTER TABLE wods ALTER COLUMN end_time SET NOT NULL;
ALTER TABLE wods ADD CONSTRAINT wods_end_after_start CHECK (end_time > start_time);

-- Old uniqueness key was (session_date, time_slot). If two distinct
-- time_slot values collapsed onto the same start_time during backfill
-- (e.g. two unparseable labels on the same date, both defaulted to
-- 00:00), this next statement fails loudly with a Postgres unique
-- violation instead of silently merging them - resolve by hand (edit one
-- row's start_time) and re-run from this line.
ALTER TABLE wods DROP CONSTRAINT wods_session_date_time_slot_key;
ALTER TABLE wods ADD CONSTRAINT wods_session_date_start_time_key UNIQUE (session_date, start_time);
ALTER TABLE wods DROP COLUMN time_slot;

-- ------------------------------------------------------------------
-- 2. Extend users.role beyond the single hardcoded 'coach' value, so
--    owner/staff accounts can be created with the same auth model.
--    Existing rows are untouched - 'coach' is still valid and remains
--    the default for new signups.
-- ------------------------------------------------------------------

ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('owner', 'coach', 'staff'));

-- ------------------------------------------------------------------
-- 3. Remove the Recipes feature entirely, per the explicit decision to
--    drop it from the product. CASCADE takes recipe_categories and
--    recipe_ingredients with it (both only ever reference recipes).
-- ------------------------------------------------------------------

DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipe_categories;
DROP TABLE IF EXISTS recipes CASCADE;

COMMIT;
