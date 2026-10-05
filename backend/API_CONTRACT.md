# BoxTrack API Contract (Core V1)

For Panaki (front-end/UX) - this is the precise, as-implemented contract for the back-end, Core V1
only. Scores, athletes, announcements, and QR codes are Optional-tier (CDC) and have no endpoints
yet. If anything here needs to change for the UI to work well, tell Kevin before building against
it - this file gets updated alongside the code, not after.

## Conventions

- Base URL: `/api`.
- All bodies are JSON (`Content-Type: application/json`).
- Admin (coach-only) routes require `Authorization: Bearer <token>`, where `<token>` is the value
  returned by `POST /api/auth/login`.
- Dates are `YYYY-MM-DD` strings (e.g. `"2026-10-12"`). Timestamps (`created_at`, `updated_at`) are
  ISO 8601 with timezone.
- Every error follows the same shape, regardless of endpoint:
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "session_date is required" } }
  ```

## Business rule: a date can have more than one session

**Clarified with the team on 2026-10-05**, overturning the original "one session per date"
assumption in `docs/03-technical-documentation.md`: a box can run several sessions on the same date
with different content (e.g. a 6am and a 6pm class). The real uniqueness key is
**`(session_date, time_slot)`**, not the date alone. `time_slot` is therefore **required** on
creation (free text, e.g. `"06:00"`, `"18:00"`, `"Midday"` - not validated as a time format, just a
label the coach controls).

Practical consequence: `GET /api/wods/today` and `GET /api/wods?from=&to=` both return **arrays**,
even when there's only one session that day.

## The Session object

Returned by `GET /wods/today`, `GET /wods/:id`, `POST /admin/wods`, `PUT /admin/wods/:id` (as the
`wod` field, or inside the `wods` array for `/today`):

```json
{
  "id": 8,
  "session_date": "2026-10-12",
  "time_slot": "18:00",
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
| `time_slot` | string | **Required on create** - free text, not a time-of-day validator. |
| `warmup.general` | string \| null | Free text. |
| `warmup.specific` | string \| null | Free text. |
| `skill_strength` | object \| null | Whole block is optional - `null` if the coach skipped it. |
| `skill_strength.kind` | `"skill"` \| `"strength"` | Required if `skill_strength` is sent. |
| `skill_strength.instructions` | string \| null | |
| `skill_strength.movements` | array of `{movement_name, detail}` | `movement_name` required, `detail` free text (charges/series, e.g. `"5x5 @ 80kg"`). |
| `wod` | object \| null | Optional block, same idea as `skill_strength`. |
| `wod.format` | `"AMRAP"` \| `"FOR_TIME"` \| `"EMOM"` \| `"TABATA"` \| `"CHIPPER"` \| `"STRENGTH"` | Required if `wod` is sent. |
| `wod.duration_or_target` | string \| null | Free text, e.g. `"20 min"`, `"21-15-9"`. |
| `wod.notes` | string \| null | Coach remarks. |
| `wod.movements` | array of `{movement_name, detail}` | Same shape as `skill_strength.movements`. |
| `created_by` | integer | Coach's user id. |
| `created_at`, `updated_at` | string (timestamp) | |

`movements` arrays are **ordered** (the order the coach entered them in) - the front-end should
display them in array order, not re-sort them.

---

## Endpoints

### `POST /api/auth/login` - public

**Request**
```json
{ "email": "coach@crossfitlab.fr", "password": "CoachDemo2026!" }
```

**200**
```json
{ "token": "80611427f6904b3d0c162374bccd73dca0a50c6eac3eac636ac0458d6d3b5532", "user": { "id": 1, "email": "coach@crossfitlab.fr" } }
```

**Errors:** `400 VALIDATION_ERROR` (missing email/password) · `401 INVALID_CREDENTIALS` (wrong
email or password - same message for both, on purpose, so the UI can't be used to enumerate valid
emails).

Store `token` however suits the front-end (memory, `sessionStorage`...); send it back as
`Authorization: Bearer <token>` on every admin call. There's no refresh endpoint - a session lasts
7 days from login, then the coach has to log in again.

### `POST /api/auth/logout` - coach

No body. **204** on success, and the token stops working immediately (it's deleted server-side, not
just expired). **401 UNAUTHENTICATED** if the token is missing/invalid/already logged out.

### `GET /api/wods/today` - public

No params. **200** always (never 404) - `wods` is an empty array if nothing's published for today.

```json
{ "wods": [ { "id": 7, "time_slot": "06:00", "...": "..." }, { "id": 8, "time_slot": "18:00", "...": "..." } ] }
```

Sorted by `time_slot` (lexical order on the raw string - fine for `"06:00"`/`"18:00"` style values;
flag if the UI needs something smarter, e.g. free-text slots like `"Midday"` mixed with times).

### `GET /api/wods?from=YYYY-MM-DD&to=YYYY-MM-DD` - public

Both query params optional (omit both for full history). **200**, summaries only (not the full
nested shape - fetch `/wods/:id` for detail):

```json
{ "wods": [ { "id": 8, "session_date": "2026-10-12", "time_slot": "18:00", "format": "AMRAP" } ] }
```

`format` is `null` if the coach hasn't filled in the WOD block yet. Sorted newest date first.

### `GET /api/wods/:id` - public

**200** `{ "wod": { ...full Session object... } }` · **404 NOT_FOUND** if the id doesn't exist.

### `POST /api/admin/wods` - coach

**Request** - `session_date` and `time_slot` required, `warmup`/`skill_strength`/`wod` all optional
(a coach can save a session with just the date/slot and fill in the rest via `PUT` later):

```json
{
  "session_date": "2026-10-12",
  "time_slot": "18:00",
  "warmup": { "general": "...", "specific": "..." },
  "skill_strength": { "kind": "skill", "instructions": "...", "movements": [{ "movement_name": "...", "detail": "..." }] },
  "wod": { "format": "EMOM", "duration_or_target": "10 min", "notes": "...", "movements": [{ "movement_name": "...", "detail": "..." }] }
}
```

**201** `{ "wod": { ...full Session object, with its new id... } }`

**Errors:**
- `400 VALIDATION_ERROR` - missing `session_date` or `time_slot`; invalid `skill_strength.kind`
  (must be `skill`/`strength`); invalid `wod.format` (must be one of the 6).
- `409 SLOT_ALREADY_HAS_SESSION` - a session already exists for that exact `(session_date, time_slot)`
  pair. **Not** returned just for reusing a date with a different slot.
- `401 UNAUTHENTICATED` - missing/invalid/expired token.

### `PUT /api/admin/wods/:id` - coach

Same body shape as `POST`, but every field is optional - only send what changed. Sending
`skill_strength` or `wod` **replaces the whole block** (including `movements` - it's not a merge,
the old movement list is deleted and the new one inserted). Omit the block entirely to leave it
untouched.

**200** `{ "wod": {...} }` · **404 NOT_FOUND** · **409 SLOT_ALREADY_HAS_SESSION** (if you change
`session_date`/`time_slot` onto a pair that's already taken) · **401 UNAUTHENTICATED**.

### `DELETE /api/admin/wods/:id` - coach

**204** on success (no body) · **404 NOT_FOUND** · **401 UNAUTHENTICATED**.

---

## What's deliberately not here yet

Per the CDC's Core/Optional split, nothing below exists - no routes, no tables:

- Scores, leaderboard (RX/Scaled/Modified)
- Athlete roster
- Announcements
- QR codes

These come after the Core WOD flow (login -> create/edit -> public view -> `/screen`) is fully
working end-to-end, not before.
