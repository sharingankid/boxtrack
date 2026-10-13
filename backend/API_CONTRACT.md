# BoxTrack API Contract (Core V1)

For Panaki (front-end/UX) - this is the precise, as-implemented contract for the back-end. Covers
Core V1 (WOD sessions, mobile coach interface, public TV interface). Scores, athletes,
announcements, and QR codes are the CDC's Optional-tier and have their own endpoints below, built
after the Core WOD flow. **Recipes/Spoonacular has been removed entirely** - see the changelog at
the bottom.

If anything here needs to change for the UI to work well, tell Kevin before building against it -
this file gets updated alongside the code, not after.

## Conventions

- Base URL: `/api`.
- All bodies are JSON (`Content-Type: application/json`).
- Admin (authenticated) routes require `Authorization: Bearer <token>`, where `<token>` is the
  value returned by `POST /api/auth/login`.
- `session_date` is a `YYYY-MM-DD` string. `start_time`/`end_time` are `HH:mm` strings (24h,
  zero-padded, e.g. `"06:00"`, `"18:00"`) - **wall-clock time in Europe/Paris**, not UTC, and not a
  timestamp. Timestamps (`created_at`, `updated_at`) are ISO 8601 with timezone.
- Every error follows the same shape, regardless of endpoint:
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "session_date is required" } }
  ```
  A malformed request or a business-rule conflict is always `400`/`409`/`404` - never `500`.

---

## Authentication & authorization

Email + password login, bcrypt-hashed passwords, a real session table (not a stateless JWT) so
`logout` revokes a token immediately instead of waiting for it to expire. See
`backend/src/services/authService.js`.

- **Login**: `POST /auth/login` with `{ email, password }` → `{ token, user }`. The token is valid
  **7 days** from login; there is no refresh endpoint, the user logs in again after that. Store it
  however suits the front-end (the current reference client uses `localStorage`, so the coach stays
  logged in across tab/browser restarts, not just for one tab session) and send it back as
  `Authorization: Bearer <token>` on every admin call.
- **Logout**: `POST /auth/logout` with the token in the header, `204` - the token is deleted
  server-side, it stops working immediately, not just "expired".
- **Roles**: `users.role` is one of `owner`, `coach`, `staff` (`coach` is the default for new
  accounts). **Every admin route today accepts all three roles equally** - there is no
  functionality currently restricted to a specific role. The mechanism to restrict one exists
  (`requireRole(...roles)` in `src/middleware/auth.js`, chained after `requireAuth`) and is unit
  tested, but nothing in the API uses it yet - documented here so the front-end doesn't need to
  guess if/when that changes. If a route is later locked to specific roles, an authenticated user
  of the wrong role gets `403 FORBIDDEN` (not `401` - `401` is reserved for missing/invalid/expired
  tokens).
- **Public routes are never authenticated** - `GET /wods/*` (including the TV view) work with no
  token, by design, regardless of device or screen size. Routes are never gated by
  device/screen-size detection - only by auth + role.

| Error | Meaning |
|---|---|
| `400 VALIDATION_ERROR` | Missing `email`/`password` on login. |
| `401 INVALID_CREDENTIALS` | Wrong email or password - same message for both, so the UI can't be used to enumerate valid emails. |
| `401 UNAUTHENTICATED` | Missing/malformed/invalid/expired token on an admin route. |
| `403 FORBIDDEN` | Valid token, but the user's role isn't allowed on this route (not used by any route yet - see above). |

---

## The Session object

Returned by `GET /wods/today`, `GET /wods/tv-now` (nested under `current`/`next`/`remaining`),
`GET /wods/:id`, `POST /admin/wods`, `PUT /admin/wods/:id` (as the `wod` field, or inside the
`wods`/`remaining` arrays for the list endpoints):

```json
{
  "id": 8,
  "session_date": "2026-10-12",
  "start_time": "18:00",
  "end_time": "19:00",
  "title": "Evening class",
  "warmup": {
    "general": "3 min row easy + dynamic mobility",
    "specific": "Empty-bar squats x10, light pull-up practice"
  },
  "skill_strength": {
    "kind": "skill",
    "instructions": "Kipping pull-up drills - focus on the hollow/arch swing.",
    "movements": [
      { "movement_name": "Kipping Pull-Up", "detail": "3 sets of 5" }
    ]
  },
  "wod": {
    "format": "AMRAP",
    "duration_or_target": "20 min",
    "notes": "Pace the pull-ups from round 1.",
    "movements": [
      { "movement_name": "Pull-Up", "detail": "5 reps" },
      { "movement_name": "Push-Up", "detail": "10 reps" },
      { "movement_name": "Air Squat", "detail": "15 reps" }
    ]
  },
  "created_by": 1,
  "created_at": "2026-10-05T09:35:19.717Z",
  "updated_at": "2026-10-05T09:35:19.717Z"
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | integer | |
| `session_date` | string (date) | Required on create. |
| `start_time` | string (`HH:mm`) | **Required on create.** Europe/Paris wall-clock time. |
| `end_time` | string (`HH:mm`) | **Required on create.** Must be strictly after `start_time` (same-day only - a session cannot cross midnight). |
| `title` | string \| null | Optional free-text label (e.g. `"Evening class"`, `"Open gym"`). |
| `warmup.general` | string \| null | Free text. The coach can set, edit, or clear it (send `null`/omit to leave unset). |
| `warmup.specific` | string \| null | Free text, same rules as `general`. |
| `skill_strength` | object \| null | Whole block is optional - `null` if the coach skipped it. |
| `skill_strength.kind` | `"skill"` \| `"strength"` | Required if `skill_strength` is sent. |
| `skill_strength.instructions` | string \| null | |
| `skill_strength.movements` | array of `{movement_name, detail}` | `movement_name` required, `detail` free text (charges/series, e.g. `"5x5 @ 80kg"`). |
| `wod` | object \| null | Optional block, same idea as `skill_strength`. |
| `wod.format` | `"AMRAP"` \| `"FOR_TIME"` \| `"EMOM"` \| `"TABATA"` \| `"CHIPPER"` \| `"STRENGTH"` | Required if `wod` is sent. |
| `wod.duration_or_target` | string \| null | Free text, e.g. `"20 min"`, `"21-15-9"`. |
| `wod.notes` | string \| null | Coach remarks. |
| `wod.movements` | array of `{movement_name, detail}` | Same shape as `skill_strength.movements`. |
| `created_by` | integer | User id of whoever created the session. |
| `created_at`, `updated_at` | string (timestamp) | |

`movements` arrays are **ordered** (the order the coach entered them in) - the front-end should
display them in array order, not re-sort them.

### Business rule: a date can have more than one session

A box can run several sessions on the same date with different content (e.g. a 6am and a 6pm
class). The real uniqueness key is **`(session_date, start_time)`**, not the date alone, and not
`(session_date, end_time)`. `start_time` and `end_time` are therefore both **required** on
creation.

Practical consequence: `GET /wods/today` and `GET /wods?from=&to=` both return **arrays**, even
when there's only one session that day, sorted by `start_time` ascending.

---

## Endpoints

### `POST /api/auth/login` - public

See "Authentication & authorization" above.

### `POST /api/auth/logout` - authenticated

See "Authentication & authorization" above.

### `GET /api/wods/today` - public

No params. **200** always (never 404) - `wods` is an empty array if nothing's published for today.

```json
{ "wods": [ { "id": 7, "start_time": "06:00", "...": "..." }, { "id": 8, "start_time": "18:00", "...": "..." } ] }
```

Sorted by `start_time` ascending.

### `GET /api/wods/tv-now` - public

**Backend-computed** "what should the TV show right now" - the chosen approach (over handing the
front-end a sorted list and a clock) so the Europe/Paris time comparison lives in exactly one
place. See `wodService.getTvState()`.

**200**
```json
{
  "reference_date": "2026-10-12",
  "reference_time": "18:30",
  "timezone": "Europe/Paris",
  "current": { "id": 8, "start_time": "18:00", "end_time": "19:00", "...": "full Session object" },
  "next": { "id": 9, "start_time": "20:00", "end_time": "21:00", "...": "..." },
  "remaining": [ { "id": 8, "...": "..." }, { "id": 9, "...": "..." } ]
}
```

| Field | Meaning |
|---|---|
| `reference_date` | Today's date in Europe/Paris, `YYYY-MM-DD`. |
| `reference_time` | The server's current wall-clock time in Europe/Paris, `HH:mm` - what "now" was compared against to compute the rest of this response. |
| `timezone` | Always the literal string `"Europe/Paris"` - included so the front-end never has to hardcode or guess it. |
| `current` | The session whose `start_time <= reference_time < end_time`, or `null` if no session is in progress right now (e.g. between classes). |
| `next` | The next session today with `start_time > reference_time`, or `null` if there isn't one (including on a day with no sessions at all). |
| `remaining` | Every session today with `end_time > reference_time` (includes `current` if there is one, plus every future session), sorted by `start_time`. Empty array on a day with no sessions, or once the last session has ended. |

This endpoint always returns `200` - an empty day is a normal state (`current: null, next: null,
remaining: []`), not an error.

### `GET /api/wods?from=YYYY-MM-DD&to=YYYY-MM-DD` - public

Both query params optional (omit both for full history). **200**, summaries only (not the full
nested shape - fetch `/wods/:id` for detail):

```json
{ "wods": [ { "id": 8, "session_date": "2026-10-12", "start_time": "18:00", "end_time": "19:00", "title": null, "format": "AMRAP" } ] }
```

`format` is `null` if the coach hasn't filled in the WOD block yet. Sorted newest date first, then
by `start_time`.

**Errors:** `400 VALIDATION_ERROR` if `from`/`to` are present but not valid `YYYY-MM-DD` dates.

### `GET /api/wods/:id` - public

**200** `{ "wod": { ...full Session object... } }` · **404 NOT_FOUND** if the id doesn't exist ·
**400 VALIDATION_ERROR** if `:id` isn't a valid integer (e.g. `/wods/abc`).

### `POST /api/admin/wods` - authenticated

**Request** - `session_date`, `start_time`, `end_time` required; `title`, `warmup`,
`skill_strength`, `wod` all optional (a coach can save a session with just the schedule and fill in
the rest via `PUT` later):

```json
{
  "session_date": "2026-10-12",
  "start_time": "18:00",
  "end_time": "19:00",
  "title": "Evening class",
  "warmup": { "general": "...", "specific": "..." },
  "skill_strength": { "kind": "skill", "instructions": "...", "movements": [{ "movement_name": "...", "detail": "..." }] },
  "wod": { "format": "EMOM", "duration_or_target": "10 min", "notes": "...", "movements": [{ "movement_name": "...", "detail": "..." }] }
}
```

**201** `{ "wod": { ...full Session object, with its new id... } }`

**Errors:**
- `400 VALIDATION_ERROR` - missing `session_date`/`start_time`/`end_time`; `session_date` not a
  valid `YYYY-MM-DD` date; `start_time`/`end_time` not a valid `HH:mm` time; `end_time` at or
  before `start_time`; invalid `skill_strength.kind` (must be `skill`/`strength`); invalid
  `wod.format` (must be one of the 6); a movement with no `movement_name`.
- `409 DUPLICATE_SESSION` - a session already exists for that exact `(session_date, start_time)`
  pair. **Not** returned just for reusing a date with a different `start_time`.
- `401 UNAUTHENTICATED` - missing/invalid/expired token.

### `PUT /api/admin/wods/:id` - authenticated

Same body shape as `POST`, but every field is optional - only send what changed. Sending
`skill_strength` or `wod` **replaces the whole block** (including `movements` - it's not a merge,
the old movement list is deleted and the new one inserted). Sending `skill_strength: null` removes
an existing Skill/Strength block entirely (a coach deciding this session doesn't have one). Omit a
field entirely to leave it untouched - including `warmup.general`/`warmup.specific`, which can each
be independently set, edited, or cleared (send `null`) without touching the other.

If you send only one of `start_time`/`end_time`, it's validated against the session's *existing*
value for the other one at the database level (same `end_time > start_time` rule) - a conflicting
combination still comes back as a clean `400`, not a `500`.

**200** `{ "wod": {...} }` · **404 NOT_FOUND** · **409 DUPLICATE_SESSION** (if you change
`session_date`/`start_time` onto a pair that's already taken) · **400 VALIDATION_ERROR** (same
cases as `POST`, applied to whichever fields were sent) · **401 UNAUTHENTICATED**.

### `DELETE /api/admin/wods/:id` - authenticated

**204** on success (no body) · **404 NOT_FOUND** · **400 VALIDATION_ERROR** (invalid `:id`) ·
**401 UNAUTHENTICATED**.

### `POST /api/admin/wods/:id/duplicate` - authenticated

Copies the source session's Warm-Up, Skill/Strength, and WOD content onto a new slot. **Chosen
approach** (over a separate "template" concept): a thin wrapper around the same create logic as
`POST /admin/wods`, so it gets the exact same validation and conflict handling for free.

**Request** - every field optional; anything omitted is copied from the source session as-is:
```json
{ "session_date": "2026-12-08", "start_time": "18:00", "end_time": "19:00", "title": "Evening class" }
```

Sending an **empty body** (`{}`) duplicates onto the exact same `(session_date, start_time)` as the
source, which therefore always `409`s - this is intentional, not a bug: the caller must provide at
least a new `session_date` or `start_time` for the duplicate to actually land somewhere.

**201** `{ "wod": { ...new Session object, with its own new id... } }`

**Errors:** `404 NOT_FOUND` (source session doesn't exist) · `400 VALIDATION_ERROR` (same schedule
rules as `POST`) · `409 DUPLICATE_SESSION` · `401 UNAUTHENTICATED`.

---

## Optional tier (cahier des charges §6)

Built after the Core WOD flow, per the CDC's Core-before-Optional ordering. Summarized here for
completeness - see `src/controllers/{athlete,score,announcement,qrCode}Controller.js` for the full
implementation if a field's exact shape isn't obvious below.

### Athletes - `GET/POST/PUT /admin/athletes[/:id]` (authenticated, no public route)

Coach-managed roster: `{ id, first_name, last_name, photo_url, active, created_at, updated_at }`.
No delete - `PUT` with `{ "active": false }` deactivates (soft-delete, keeps score history intact).

### Scores & leaderboard

- `POST /admin/wods/:id/scores` (authenticated) - `{ athlete_id, category, result_value }`,
  `category` one of `RX`/`Scaled`/`Modified`. `result_value` is always numeric: a time-based WOD
  (`FOR_TIME`, `CHIPPER`) is entered as total seconds (convert `MM:SS` client-side), everything
  else (`AMRAP`, `EMOM`, `TABATA`, `STRENGTH`) as a plain number (reps/rounds/kg). Upserts - a
  second score for the same athlete on the same WOD replaces the first.
- `DELETE /admin/scores/:id` (authenticated).
- `GET /wods/:id/leaderboard` (public) - ranked per category (RX ranked only against RX, etc.),
  ascending for time-based formats, descending otherwise - the direction is derived from the WOD's
  own `format`, never stored on the score itself.

### Announcements - `GET /announcements` (public, active only), `GET/POST/PUT/DELETE /admin/announcements[/:id]` (authenticated, all)

`{ id, title, body, active, created_at, updated_at }`. `active: false` unpublishes without
deleting.

### QR codes - `GET /qrcodes` (public), `POST/PUT/DELETE /admin/qrcodes[/:id]` (authenticated)

`{ id, label, url, order_index, created_at }`. Generated client-side from `url` - nothing image-like
is stored server-side.

---

## Changelog - breaking changes from the previous version of this contract

**Recipes/Spoonacular removed entirely.** Every `/recipes` and `/admin/recipes` route, the Recipe
object, and the `SPOONACULAR_API_KEY` env var are gone - this was a sponsor-approved side feature,
now reverted. Any front-end code calling these routes needs to be removed, not just updated.

**`time_slot` (free text) replaced by `start_time`/`end_time` (real `HH:mm` times) + optional
`title`.** Affects the Session object and every WOD endpoint:

| Before | Now |
|---|---|
| `"time_slot": "18:00"` (free text, unvalidated - could be `"Midday"` or anything) | `"start_time": "18:00", "end_time": "19:00"` (both required, validated `HH:mm`, `end_time` must be strictly after `start_time`) |
| No `title` field | Optional `"title"` string |
| Uniqueness key: `(session_date, time_slot)` | Uniqueness key: `(session_date, start_time)` |
| `409 SLOT_ALREADY_HAS_SESSION` | `409 DUPLICATE_SESSION` |
| `GET /wods?from=&to=` summaries had `time_slot` | Now have `start_time`, `end_time`, `title` |
| No equivalent | New: `GET /wods/tv-now` (current/next/remaining for the TV view) |
| No equivalent | New: `POST /admin/wods/:id/duplicate` |

Existing databases migrate via `backend/db/migrations/001_real_schedules_and_remove_recipes.sql` -
see that file's header comment for exactly how old `time_slot` values convert (and what happens to
ones that weren't actually a parseable time).

**Login response** now includes the user's `role`: `{ token, user: { id, email, role } }` (was
`{ id, email }`).
