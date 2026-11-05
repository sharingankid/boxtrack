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

- **Login**: `POST /auth/login` with `{ email, password }` →
  `{ token, user: { id, email, role }, expires_at }`. The token is valid **7 days** from login
  (`expires_at`, ISO 8601 - use it rather than recomputing the expiry client-side); there is no
  refresh endpoint, the user logs in again after that. Store it
  however suits the front-end (the current reference client uses `localStorage`, so the coach stays
  logged in across tab/browser restarts, not just for one tab session) and send it back as
  `Authorization: Bearer <token>` on every admin call.
- **Current session**: `GET /auth/me` with the token in the header →
  `{ user: { id, email, role }, expires_at }`, or `401 UNAUTHENTICATED` if the token was revoked
  (logout on another device, password reset) or has expired. Call it when the app restores a token
  from storage, so the coach isn't shown the admin until their first save fails.
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
| `400 VALIDATION_ERROR` | Missing `email`/`password` on login (or not strings). |
| `401 INVALID_CREDENTIALS` | Wrong email or password - same message **and same response time** for both, so neither the UI nor timing can be used to enumerate valid emails. |
| `429 TOO_MANY_REQUESTS` | More than 10 login attempts in 15 minutes from the same IP. |

The email is matched case-insensitively and trimmed (`" Coach@CrossfitLab.fr "` logs into
`coach@crossfitlab.fr`). Accounts are created with `npm run user:create` (see `backend/README.md`),
never through the API.
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
| `wod` | object \| null | Optional block, same idea as `skill_strength`. If sent, needs at least one movement **or** a `duration_or_target` - a format with neither is rejected (`400 VALIDATION_ERROR`), since that isn't a workout anyone could actually do. |
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

### `GET /api/wods?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=&offset=` - public

All four query params optional (omit `from`/`to` for full history). **200**, summaries only (not
the full nested shape - fetch `/wods/:id` for detail):

```json
{ "wods": [ { "id": 8, "session_date": "2026-10-12", "start_time": "18:00", "end_time": "19:00", "title": null, "format": "AMRAP" } ] }
```

`format` is `null` if the coach hasn't filled in the WOD block yet. Sorted newest date first, then
by `start_time`. **The response shape is unchanged by pagination** - `{ "wods": [...] }` only,
no `total`/`has_more` - fetch one page past the last to know if there's more.

**Pagination:** `limit` defaults to `50`, capped at `100` regardless of what's requested (a public,
unauthenticated endpoint can't be made to pull the whole history in one call). `offset` defaults to
`0`. Both must be non-negative integers if sent.

**Errors:** `400 VALIDATION_ERROR` if `from`/`to` are present but not real `YYYY-MM-DD` calendar
dates (`2026-02-31` is rejected), if `from` is after `to`, or if `limit`/`offset` aren't
non-negative integers (`limit=0` is also rejected - use a real page size).

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
  `wod.format` (must be one of the 6); a movement with no `movement_name`; a `wod` with a format
  but no movements and no `duration_or_target`.
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
implementation if a field's exact shape isn't obvious below. Every `:id` must be a positive integer
(`400 VALIDATION_ERROR` otherwise, never a `500`); a missing resource is `404 NOT_FOUND`.

### Athletes - `GET/POST/PUT /admin/athletes[/:id]` (authenticated)

Coach-managed roster:
`{ id, first_name, last_name, photo_url, has_uploaded_photo, active, created_at, updated_at }`.
No delete - `PUT` with `{ "active": false }` deactivates (soft-delete, keeps score history intact).
`GET /admin/athletes?active=true|false` filters (any other value is a `400`). `photo_url` is
optional but must be an `http(s)` URL when sent; `active` must be a real JSON boolean.

**Photos.** Either an external `photo_url`, or a photo uploaded from the coach's phone:

- `PUT /admin/athletes/:id/photo` (authenticated) - the **raw image** as the request body (not
  JSON, not multipart), `Content-Type: image/jpeg`, `image/png` or `image/webp`, **2 MB max**
  (resize client-side before upload). The real type is checked from the file's bytes, not the
  header. → `200 { athlete }`, `400` if it isn't one of those images, `413 PAYLOAD_TOO_LARGE` if
  over 2 MB. In the browser: `fetch(url, { method: 'PUT', headers: { Authorization, 'Content-Type': file.type }, body: file })`.
- `DELETE /admin/athletes/:id/photo` (authenticated) → `204`, `404` if there was none.
- `GET /athletes/:id/photo` (**public**, so the leaderboard on the TV can show it) → the image.

Once uploaded, the athlete's `photo_url` becomes `/api/athletes/:id/photo?v=<upload time>` and
`has_uploaded_photo` is `true` - use `photo_url` as-is in `<img src>`, it changes with every new
upload so it can be cached for good. Sending that same URL back in a `PUT /admin/athletes/:id` is
ignored (treated as "unchanged"), so a form can echo the athlete it read.

### Scores & leaderboard

What the coach types depends on the WOD's `format` (cahier des charges §4):

| WOD format | Send | Stored as | `result_display` |
|---|---|---|---|
| `FOR_TIME`, `CHIPPER` | `time: "12:34"` (or `"1:02:03"`), or `result_value` in seconds | seconds | `"12:34"` |
| `AMRAP` | `rounds` (whole number, required) + `reps` (whole number, default 0) | `result_value` = rounds, `extra_reps` = reps | `"8 rds + 12"` |
| `EMOM`, `TABATA` | `result_value` (rounds or reps) | as sent | `"84"` |
| `STRENGTH` | `result_value` (kg) | as sent | `"92.5 kg"` |

An AMRAP sent with only `result_value` is a `400` - rounds and extra reps can't be mixed with a
total rep count on the same leaderboard.

- `POST /admin/wods/:id/scores` (authenticated) - one score:
  `{ athlete_id, category, ...result as above }`, `category` one of `RX`/`Scaled`/`Modified`.
  Upserts - a second score for the same athlete on the same WOD replaces the first. `400` if the
  athlete doesn't exist **or is deactivated** (a member who left keeps past scores but gets no new
  ones), or if the session has no WOD block. → `201 { score }`.
- `PUT /admin/wods/:id/scores` (authenticated) - **the whole class at once**:
  `{ "scores": [ { athlete_id, category, ...result }, ... ] }`, 1 to 60 entries, each athlete at
  most once. All-or-nothing: every entry is validated before anything is written, then all are
  upserted in one transaction. A `400` names the faulty entry (`scores[3].rounds is required...`).
  → `200` with the same body as the leaderboard below. Athletes not in the batch keep their scores.
- `DELETE /admin/scores/:id` (authenticated).
- `GET /wods/:id/leaderboard` (public) - ranked per category (RX ranked only against RX, etc.),
  ascending for time-based formats, descending otherwise - the direction is derived from the WOD's
  own `format`, never stored on the score itself. An AMRAP ranks on rounds, then extra reps.
  **Ties share a rank** (standard competition ranking: two athletes on `754` s are both
  `rank: 1`, the next one is `rank: 3`).

```json
{
  "wod_id": 7, "format": "FOR_TIME", "sort": "asc",
  "rankings": {
    "RX": [ { "rank": 1, "id": 3, "wod_id": 7, "athlete": { "id": 2, "first_name": "Léa", "last_name": "Martin" }, "category": "RX", "result_value": 754, "extra_reps": null, "result_display": "12:34", "created_at": "...", "updated_at": "..." } ],
    "Scaled": [],
    "Modified": []
  }
}
```

### Announcements - `GET /announcements` (public, visible only), `GET/POST/PUT/DELETE /admin/announcements[/:id]` (authenticated, all)

`{ id, title, body, active, ends_on, created_at, updated_at }`, newest first. `title` required;
`active: false` (a JSON boolean) unpublishes without deleting. `ends_on` is optional: a
`YYYY-MM-DD` date (Europe/Paris) after which the announcement disappears from the public views by
itself - shown through that whole day, hidden from the next. `null` (or omitted) = no end date;
send `null` in a `PUT` to remove one. The admin list always returns everything, expired included.

`GET /announcements/:id` (public) is the shareable link to one announcement
(`{ "announcement": {...} }`). An unpublished or expired announcement is `404 NOT_FOUND`, exactly
like one that doesn't exist, so a link shared earlier stops showing it.

### QR codes - `GET /qrcodes` (public), `POST/PUT/DELETE /admin/qrcodes[/:id]` (authenticated)

`{ id, label, url, order_index, created_at }`, sorted by `order_index`. Generated client-side from
`url` - nothing image-like is stored server-side. `label` and `url` required; `url` must be an
`http(s)` URL (`javascript:`/`data:` links are refused, since the front renders it as a link);
`order_index` an integer. The public `GET /qrcodes` is also what the admin screen lists.

### Members - `/members/*` (sign-up from the TV's QR code)

A member account is an athlete (same roster as the coach's, `created_by` NULL) with an email,
a bcrypt password and the pixel `avatar` they picked (`manA`, `manB`, `womanA`, `womanB`). Member
tokens work like the staff ones (random, stored hashed, 7 days, revoked on logout) but live in
`member_sessions`: **a member token is `401` on every `/admin/*` route, and a staff token is `401`
on `/members/me*`.**

- `POST /members/register` (public, rate-limited like the login) -
  `{ first_name, last_name, email, password, avatar? }` → **201**
  `{ token, member: { id, first_name, last_name, email, avatar }, expires_at }`. `400` if a name is
  empty or over 60 characters, the email is invalid, the password isn't 8-128 characters or the
  avatar unknown; `409 EMAIL_TAKEN` if the email (case-insensitive) already has an account.
- `POST /members/login` (public, rate-limited) - `{ email, password }` → **200**, same body.
  `401 INVALID_CREDENTIALS` for a wrong password, an unknown email or a deactivated athlete alike.
- `POST /members/logout` (member) → **204**. `GET /members/me` (member) → `{ member, expires_at }`.
- `GET /members/me/scores` (member) → `{ "scores": [...] }`, newest session first (100 max):
  `{ id, wod_id, session_date, start_time, title, format, category, result_value, extra_reps,
  result_display, rank, participants }` - `rank` among `participants` scores of the same WOD and
  category, computed like the leaderboard (ties share a rank).
- `POST /members/me/scores` (member) - `{ wod_id, category, ...result }` with the result shaped as
  in the Scores table above (`time` for FOR_TIME/CHIPPER, `rounds` + `reps` for AMRAP...). Always
  scores the member's own athlete (an `athlete_id` in the body is ignored), replaces their previous
  score on that WOD, and is refused (`400`) for a session dated after today (Europe/Paris).
  → **201** `{ score, leaderboard }`, the leaderboard ready to display. `recorded_by` is NULL.

---

## Changelog - breaking changes from the previous version of this contract

**Score shapes, whole-class entry, photos, announcement end date (October 2026).**
- **Breaking:** an `AMRAP` score is now `rounds` + `reps` (`result_value` alone is a `400`).
  Other formats are unchanged; `FOR_TIME`/`CHIPPER` additionally accept `time: "MM:SS"`.
- Every score now carries `extra_reps` and `result_display`.
- New `PUT /admin/wods/:id/scores` (whole class, one transaction).
- New photo upload: `PUT`/`DELETE /admin/athletes/:id/photo`, public `GET /athletes/:id/photo`;
  athletes gain `has_uploaded_photo`.
- Announcements gain an optional `ends_on`.
- A request body over the size limit is now `413 PAYLOAD_TOO_LARGE` (was a `500`).

**Deployment and session additions (October 2026).** Additive only, nothing existing changed shape:
- `POST /auth/login` also returns `expires_at`.
- New `GET /auth/me` (validate a stored token).
- New public `GET /announcements/:id` (shareable link).

**Validation hardening (October 2026).** Front-end impact, if any, is a `400` where the previous
version accepted bad data:
- Impossible dates (`2026-02-31`) and `from` after `to` on `GET /wods` → `400`.
- QR code `url` and athlete `photo_url` must be `http(s)`.
- `active` (athletes, announcements) must be a JSON boolean, not `"false"`.
- New scores for a deactivated athlete → `400`.

**Content requirement and pagination on `GET /wods` (November 2026).** Front-end impact, if any,
is a `400` where the previous version accepted an empty `wod` block:
- A `wod` block with a `format` but no movements and no `duration_or_target` → `400
  VALIDATION_ERROR`, on both `POST` and `PUT /admin/wods/:id`.
- `GET /wods` accepts `limit`/`offset`; without them it now returns at most `50` sessions instead
  of the whole table. Response shape unchanged (`{ "wods": [...] }`).
- Leaderboard ties now share a rank (was: different ranks by insertion order).

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
